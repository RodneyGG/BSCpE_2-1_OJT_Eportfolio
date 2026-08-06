<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use App\Models\User;
use App\Models\Document;
use App\Models\Notification;

class DocumentService
{
    protected GoogleDriveService $driveService;

    public function __construct(GoogleDriveService $driveService)
    {
        $this->driveService = $driveService;
    }

    /**
     * Upload a document to Google Drive on behalf of the Admin via OAuth,
     * and persist a record of it for review tracking.
     *
     * DTR documents are cumulative: uploading a new one supersedes
     * (deletes) any previous DTR record the student had, so there is
     * never more than one DTR document in the review queue per student.
     */
    public function uploadDocument(UploadedFile $file, User $user, string $documentType, ?float $claimedHours = null, ?int $week = null, ?string $submittedDate = null): array
    {
        // For DTR or other weekly documents, we might not want to delete the old one if they are for a different week,
        // but if no week is provided, assume legacy behavior.
        if ($documentType === 'dtr' && !$week) {
            Document::where('user_id', $user->id)
                ->where('document_type', 'dtr')
                ->delete();
        }

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

        $extension = $file->getClientOriginalExtension();
        $baseName = $documentType;
        if ($week) {
            $baseName .= "-week-{$week}";
        }
        $timestamp = now()->format('YmdHis');
        $customFileName = "{$baseName}-{$timestamp}.{$extension}";

        $uploadedFile = $this->driveService->upload($file, $userFolder->id, $customFileName);

        $document = Document::create([
            'user_id' => $user->id,
            'document_type' => $documentType,
            'claimed_hours' => $documentType === 'dtr' ? $claimedHours : null,
            'week' => $week,
            'submitted_date' => $submittedDate,
            'file_id' => $uploadedFile->id,
            'file_link' => $uploadedFile->webViewLink,
            'status' => 'pending',
        ]);

        // Notify profs/admins (assuming anyone who can review is notified, or just all profs)
        $reviewers = User::whereIn('role', ['admin', 'prof'])->get();
        foreach ($reviewers as $reviewer) {
            Notification::create([
                'user_id' => $reviewer->id,
                'title' => 'New Document Submission',
                'message' => "{$user->name} has submitted a {$documentType} document for review.",
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
        return Document::with('reviewer')
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
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

        if ($document->document_type === 'dtr' && $status === 'approved' && $document->claimed_hours !== null) {
            $document->user->update([
                'hours_rendered' => $document->user->hours_rendered + $document->claimed_hours,
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