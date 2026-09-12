<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use App\Models\User;
use App\Models\Document;
use App\Models\Notification;

class DocumentService
{
    protected GoogleDriveService $driveService;
    protected WeeklyReportExtractor $reportExtractor;
    protected DriveReconciliationService $reconciliationService;

    public function __construct(
        GoogleDriveService $driveService,
        WeeklyReportExtractor $reportExtractor,
        DriveReconciliationService $reconciliationService
    ) {
        $this->driveService = $driveService;
        $this->reportExtractor = $reportExtractor;
        $this->reconciliationService = $reconciliationService;
    }

    /**
     * Upload a document to Google Drive on behalf of the Admin via OAuth,
     * and persist a record of it for review tracking.
     *
     * DTR documents are cumulative: uploading a new one supersedes
     * (deletes) any previous DTR record the student had, so there is
     * never more than one DTR document in the review queue per student.
     */
    public function uploadDocument(UploadedFile $file, User $user, string $documentType, ?float $claimedHours = null, ?int $week = null, ?string $submittedDate = null, ?float $requiredHours = null): array
    {
        // For DTR or other weekly documents, we might not want to delete the old one if they are for a different week,

        $folderName = $user->email . ' - ' . $user->name;
        $existingFolders = $this->driveService->listFiles();
        $userFolder = null;

        foreach ($existingFolders as $f) {
            if ($f->name === $folderName && $f->mimeType === 'application/vnd.google-apps.folder') {
                $userFolder = $f;
                break;
            }
        }

        if (!$userFolder) {
            $userFolder = $this->driveService->createFolder($folderName);
        }

        $originalFilename = $file->getClientOriginalName();
        $extension = $file->getClientOriginalExtension();
        $baseName = $documentType;
        if ($week) {
            $baseName .= "-week-{$week}";
        }
        $timestamp = now()->format('YmdHis');
        $customFileName = "{$baseName}-{$timestamp}.{$extension}";

        $weeklyActivities = null;
        $extractionStatus = null;
        $weekMismatch = false;
        $parsedWeekNumber = null;
        if ($documentType === 'weekly-report') {
            $extraction = $this->reportExtractor->extract($file->getRealPath());
            $extractionStatus = $extraction['status'];
            if ($extraction['status'] === 'success') {
                $weeklyActivities = $extraction['days'];
                $parsedWeekNumber = $extraction['week_number'];
                if ($week !== null && $parsedWeekNumber !== null && $parsedWeekNumber !== $week) {
                    $weekMismatch = true;
                }
            }
        }

        // Check if there is an existing file for this documentType (and week) in Drive or DB
        $isDuplicate = false;
        $isResubmission = false;
        $submissionNote = null;

        $existingDbDoc = Document::where('user_id', $user->id)
            ->where('document_type', $documentType)
            ->when($week !== null, fn($q) => $q->where('week', $week))
            ->first();

        $existingDriveFile = null;
        if ($userFolder) {
            try {
                $folderFiles = $this->driveService->listFiles($userFolder->id);
                foreach ($folderFiles as $f) {
                    if ($f->mimeType === 'application/vnd.google-apps.folder') {
                        continue;
                    }
                    $parsed = $this->reconciliationService->parseFilename($f->name);
                    if ($parsed && $parsed['document_type'] === $documentType && ($week === null || $parsed['week'] === $week)) {
                        $existingDriveFile = $f;
                        break;
                    }
                }
            } catch (\Throwable $e) {
                // Continue gracefully if listing folder fails
            }
        }

        if ($existingDbDoc || $existingDriveFile) {
            $isDuplicate = true;
            $isResubmission = true;
            $submissionNote = 'Re-upload / Duplicate: Previous file exists in Drive';
        }

        $uploadedFile = $this->driveService->upload($file, $userFolder->id, $customFileName);
        $document = Document::create([
            'user_id' => $user->id,
            'document_type' => $documentType,
            'claimed_hours' => $documentType === 'dtr' ? $claimedHours : null,
            'week' => $week,
            'submitted_date' => $submittedDate,
            'file_id' => $uploadedFile->id,
            'file_link' => $uploadedFile->webViewLink,
            'original_filename' => $originalFilename,
            'weekly_activities' => $weeklyActivities,
            'extraction_status' => $extractionStatus,
            'status' => 'pending',
            'is_resubmission' => $isResubmission,
            'is_duplicate' => $isDuplicate,
            'submission_note' => $submissionNote,
        ]);

        if ($documentType === 'dtr') {
            $user->update([
                'hours_rendered' => $claimedHours ?? $user->hours_rendered,
                'required_hours' => $requiredHours ?? $user->required_hours,
            ]);
        }

        // Notify profs/admins
        $reviewers = User::whereIn('role', ['admin', 'prof'])->get();
        $notificationTitle = $isDuplicate
            ? 'Document Resubmission / Duplicate'
            : ($weekMismatch ? 'Weekly Report Week Mismatch' : 'New Document Submission');
        $notificationMessage = $isDuplicate
            ? "{$user->name} re-uploaded a {$documentType}" . ($week ? " (Week {$week})" : "") . ". A previous file exists in Drive. Please review."
            : ($weekMismatch
                ? "{$user->name} submitted a weekly report whose content says Week {$parsedWeekNumber}, but it was uploaded to the Week {$week} slot. Please review."
                : "{$user->name} has submitted a {$documentType} document for review.");

        foreach ($reviewers as $reviewer) {
            Notification::create([
                'user_id' => $reviewer->id,
                'title' => $notificationTitle,
                'message' => $notificationMessage,
            ]);
        }
        return [
            'document' => $document,
        ];
    }
    /**
     * Get all pending documents for review, with submitter info.
     */
    public function getPendingDocuments()
    {
        return Document::with('user.company')
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Get all documents belonging to a single user (student's own uploads),
     * with reviewer info attached so rejection/approval context is visible.
     * Ordered newest-first so the student sees their latest submission at a glance.
     */
    public function getMyDocuments(int $userId)
    {
        $docs = Document::with('reviewer')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        // If user has no documents in DB (e.g. after database reset),
        // try a targeted Drive recovery for this user
        if ($docs->isEmpty()) {
            $user = User::find($userId);
            if ($user) {
                $this->reconciliationService->reconcileForUser($user);
                $docs = Document::with('reviewer')
                    ->where('user_id', $userId)
                    ->orderBy('created_at', 'desc')
                    ->get();
            }
        }

        return $docs;
    }

    /**
     * Approve or reject a document.
     *
     * When approving a DTR document, the student's claimed_hours becomes
     * their official hours_rendered on the user record.
     */
    public function reviewDocument(Document $document, User $reviewer, string $status, ?string $reason = null): Document
    {
        $document->update([
            'status' => $status,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'rejection_reason' => $status === 'rejected' ? $reason : null,
        ]);

        if ($document->document_type === 'dtr' && $status === 'rejected') {
            $document->user->update([
                'hours_rendered' => 0,
            ]);
        }

        Notification::create([
            'user_id' => $document->user_id,
            'title' => 'Document ' . ucfirst($status),
            'message' => "Your {$document->document_type} document was {$status}." . ($reason ? " Reason: {$reason}" : ""),
        ]);

        return $document->fresh(['user', 'reviewer']);
    }

    /**
     * Delete a document from Google Drive and the database.
     */
    public function deleteDocument(Document $document): void
    {
        if ($document->file_id) {
            try {
                $this->driveService->delete($document->file_id);
            } catch (\Exception $e) {
                // If the file is already deleted on Drive or there's an API error, log it but proceed to delete the record
                \Illuminate\Support\Facades\Log::warning('Failed to delete file from Google Drive: ' . $e->getMessage());
            }
        }

        $document->delete();
    }
}