<?php

namespace App\Services;

use App\Models\Document;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class DriveReconciliationService
{
    protected GoogleDriveService $driveService;

    // Canonical map of keywords to document_type slugs
    protected const DOC_KEYWORDS = [
        'resume' => 'resume',
        'internship-agreement' => 'internship-agreement',
        'internship' => 'internship-agreement',
        'endorsement-letter' => 'endorsement-letter',
        'letter-of-endorsement' => 'endorsement-letter',
        'endorsement' => 'endorsement-letter',
        'letter-of-intent' => 'letter-of-intent',
        'intent' => 'letter-of-intent',
        'moa' => 'moa',
        'memorandum' => 'moa',
        'overtime-agreement' => 'overtime-agreement',
        'overtime' => 'overtime-agreement',
        'pup-consent-form' => 'pup-consent-form',
        'consent' => 'pup-consent-form',
        'student-waiver' => 'student-waiver',
        'waiver' => 'student-waiver',
        'daily-attendance-report' => 'daily-attendance-report',
        'attendance' => 'daily-attendance-report',
        'daily-time-record' => 'daily-attendance-report',
        'dtr' => 'daily-attendance-report',
        'weekly-photo-documentation' => 'weekly-photo-documentation',
        'photo-documentation' => 'weekly-photo-documentation',
        'weekly-photo' => 'weekly-photo-documentation',
        'photo' => 'weekly-photo-documentation',
        'weekly-report' => 'weekly-report',
        'evaluation-hte' => 'evaluation-hte',
        'hte' => 'evaluation-hte',
        'evaluation-student-intern' => 'evaluation-student-intern',
        'evaluation-training-supervisor' => 'evaluation-training-supervisor',
        'ojt-adviser-evaluation' => 'ojt-adviser-evaluation',
        'adviser' => 'ojt-adviser-evaluation',
        'trainee-performance-evaluation' => 'trainee-performance-evaluation',
        'trainee' => 'trainee-performance-evaluation',
        'completion-cert' => 'completion-cert',
        'completion' => 'completion-cert',
        'narrative-report' => 'narrative-report',
        'portfolio' => 'narrative-report',
    ];

    public function __construct(GoogleDriveService $driveService)
    {
        $this->driveService = $driveService;
    }

    /**
     * Reconcile Google Drive contents with the documents table.
     *
     * Scans all student folders under the root Drive folder, parses
     * filenames to extract document metadata, and creates `documents`
     * rows for any Drive files that don't already have a matching
     * record (keyed by `file_id`).
     *
     * If a student folder exists in Drive but the student account was
     * wiped from the DB, this automatically recreates their student account
     * so their files are recovered and linked.
     *
     * Reconstructed records are set to status = 'pending' and
     * is_resubmission = true so teachers can review and approve them.
     */
    public function reconcile(bool $dryRun = false, bool $autoCreateUsers = true): array
    {
        $rootFolderId = config('services.google_drive.folder_id');

        if (!$rootFolderId) {
            Log::error('DriveReconciliation: GOOGLE_DRIVE_FOLDER_ID is not set.');
            return ['error' => 'GOOGLE_DRIVE_FOLDER_ID is not configured.'];
        }

        try {
            $rootContents = $this->driveService->listFiles($rootFolderId);
        } catch (\Throwable $e) {
            Log::error('DriveReconciliation: Failed to list root folder: ' . $e->getMessage());
            return ['error' => 'Failed to access Google Drive: ' . $e->getMessage()];
        }

        $summary = [
            'dry_run' => $dryRun,
            'folders_scanned' => 0,
            'folders_matched' => 0,
            'users_recreated' => 0,
            'folders_unmatched' => [],
            'files_found' => 0,
            'files_already_tracked' => 0,
            'files_reconstructed' => 0,
            'files_unparseable' => [],
            'details' => [],
        ];

        foreach ($rootContents as $item) {
            if ($item->mimeType !== 'application/vnd.google-apps.folder') {
                continue;
            }

            $summary['folders_scanned']++;
            $folderName = $item->name;

            // Match or recreate user
            $userResult = $this->matchFolderToUser($folderName, $autoCreateUsers && !$dryRun);
            $user = $userResult['user'] ?? null;
            if (!empty($userResult['created'])) {
                $summary['users_recreated']++;
            }

            if (!$user) {
                $summary['folders_unmatched'][] = $folderName;
                Log::info("DriveReconciliation: No matching user for folder '{$folderName}', skipping.");
                continue;
            }

            $summary['folders_matched']++;

            // List all files inside this student's folder
            try {
                $files = $this->driveService->listFiles($item->id);
            } catch (\Throwable $e) {
                Log::warning("DriveReconciliation: Failed to list files in folder '{$folderName}': " . $e->getMessage());
                continue;
            }

            foreach ($files as $file) {
                if ($file->mimeType === 'application/vnd.google-apps.folder') {
                    continue;
                }

                $summary['files_found']++;

                // Check if already tracked
                $existingDoc = Document::where('file_id', $file->id)->first();
                if ($existingDoc) {
                    $summary['files_already_tracked']++;
                    continue;
                }

                // Parse filename
                $parsed = $this->parseFilename($file->name, $file->createdTime ?? null);
                if (!$parsed) {
                    $summary['files_unparseable'][] = [
                        'folder' => $folderName,
                        'filename' => $file->name,
                        'file_id' => $file->id,
                    ];
                    Log::warning("DriveReconciliation: Could not parse filename '{$file->name}' in folder '{$folderName}'.");
                    continue;
                }

                $documentData = [
                    'user_id' => $user->id,
                    'document_type' => $parsed['document_type'],
                    'week' => $parsed['week'],
                    'file_id' => $file->id,
                    'file_link' => $file->webViewLink,
                    'original_filename' => $file->name,
                    'status' => 'pending',
                    'is_resubmission' => true,
                    'is_duplicate' => false,
                    'submission_note' => 'Recovered from Google Drive (Pending Re-review)',
                    'submitted_date' => $parsed['submitted_at']?->toDateString(),
                    'created_at' => $parsed['submitted_at'] ?? now(),
                ];

                $summary['details'][] = [
                    'action' => $dryRun ? 'would_create' : 'created',
                    'user' => $user->name,
                    'email' => $user->email,
                    'document_type' => $parsed['document_type'],
                    'week' => $parsed['week'],
                    'filename' => $file->name,
                    'drive_file_id' => $file->id,
                    'file_link' => $file->webViewLink,
                    'status' => 'pending',
                ];

                if (!$dryRun) {
                    Document::create($documentData);
                    Log::info("DriveReconciliation: Created document record for '{$file->name}' (user: {$user->email}, type: {$parsed['document_type']}).");
                }

                $summary['files_reconstructed']++;
            }
        }

        Log::info('DriveReconciliation: Run completed.', $summary);

        return $summary;
    }

    /**
     * Targeted reconciliation for a single user.
     * Useful when a student views /documents/mine and has no DB records yet.
     */
    public function reconcileForUser(User $user): array
    {
        $rootFolderId = config('services.google_drive.folder_id');
        if (!$rootFolderId) {
            return [];
        }

        try {
            $rootContents = $this->driveService->listFiles($rootFolderId);
        } catch (\Throwable $e) {
            Log::warning("DriveReconciliation: Could not list root for single user: " . $e->getMessage());
            return [];
        }

        $userFolder = null;
        $expectedPrefix = strtolower($user->email);

        foreach ($rootContents as $item) {
            if ($item->mimeType !== 'application/vnd.google-apps.folder') {
                continue;
            }
            $itemName = strtolower($item->name);
            if (str_contains($itemName, $expectedPrefix)) {
                $userFolder = $item;
                break;
            }
        }

        if (!$userFolder) {
            return [];
        }

        try {
            $files = $this->driveService->listFiles($userFolder->id);
        } catch (\Throwable $e) {
            return [];
        }

        $createdDocs = [];
        foreach ($files as $file) {
            if ($file->mimeType === 'application/vnd.google-apps.folder') {
                continue;
            }

            if (Document::where('file_id', $file->id)->exists()) {
                continue;
            }

            $parsed = $this->parseFilename($file->name, $file->createdTime ?? null);
            if (!$parsed) {
                continue;
            }

            $doc = Document::create([
                'user_id' => $user->id,
                'document_type' => $parsed['document_type'],
                'week' => $parsed['week'],
                'file_id' => $file->id,
                'file_link' => $file->webViewLink,
                'original_filename' => $file->name,
                'status' => 'pending',
                'is_resubmission' => true,
                'is_duplicate' => false,
                'submission_note' => 'Recovered from Google Drive (Pending Re-review)',
                'submitted_date' => $parsed['submitted_at']?->toDateString(),
                'created_at' => $parsed['submitted_at'] ?? now(),
            ]);

            $createdDocs[] = $doc;
        }

        return $createdDocs;
    }

    /**
     * Perform a read-only audit of Google Drive contents.
     * Returns full metadata of all folders and files found.
     */
    public function audit(): array
    {
        $rootFolderId = config('services.google_drive.folder_id');
        if (!$rootFolderId) {
            return ['error' => 'GOOGLE_DRIVE_FOLDER_ID is not configured.'];
        }

        try {
            $rootContents = $this->driveService->listFiles($rootFolderId);
        } catch (\Throwable $e) {
            return ['error' => 'Google Drive API error: ' . $e->getMessage()];
        }

        $folders = [];
        $totalFiles = 0;
        $trackedCount = 0;
        $untrackedCount = 0;
        $unparseableCount = 0;

        foreach ($rootContents as $item) {
            if ($item->mimeType !== 'application/vnd.google-apps.folder') {
                continue;
            }

            $userResult = $this->matchFolderToUser($item->name, false);
            $user = $userResult['user'] ?? null;

            $folderInfo = [
                'folder_id' => $item->id,
                'folder_name' => $item->name,
                'matched_user' => $user ? [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ] : null,
                'files' => [],
            ];

            try {
                $files = $this->driveService->listFiles($item->id);
                foreach ($files as $f) {
                    if ($f->mimeType === 'application/vnd.google-apps.folder') {
                        continue;
                    }

                    $totalFiles++;
                    $isTracked = Document::where('file_id', $f->id)->exists();
                    if ($isTracked) {
                        $trackedCount++;
                    } else {
                        $untrackedCount++;
                    }

                    $parsed = $this->parseFilename($f->name, $f->createdTime ?? null);
                    if (!$parsed) {
                        $unparseableCount++;
                    }

                    $folderInfo['files'][] = [
                        'file_id' => $f->id,
                        'name' => $f->name,
                        'size' => $f->size ?? null,
                        'created_time' => $f->createdTime ?? null,
                        'web_view_link' => $f->webViewLink ?? null,
                        'parsed_document_type' => $parsed['document_type'] ?? null,
                        'parsed_week' => $parsed['week'] ?? null,
                        'already_tracked' => $isTracked,
                    ];
                }
            } catch (\Throwable $e) {
                $folderInfo['error'] = $e->getMessage();
            }

            $folders[] = $folderInfo;
        }

        return [
            'root_folder_id' => $rootFolderId,
            'summary' => [
                'total_folders' => count($folders),
                'matched_folders' => count(array_filter($folders, fn($f) => $f['matched_user'] !== null)),
                'unmatched_folders' => count(array_filter($folders, fn($f) => $f['matched_user'] === null)),
                'total_files' => $totalFiles,
                'tracked_files' => $trackedCount,
                'untracked_files' => $untrackedCount,
                'unparseable_files' => $unparseableCount,
            ],
            'folders' => $folders,
        ];
    }

    /**
     * Match a Drive folder name to a User record, recreating the user if needed.
     */
    protected function matchFolderToUser(string $folderName, bool $autoCreate = false): array
    {
        $parts = explode(' - ', $folderName, 2);
        $email = null;
        $name = null;

        if (count($parts) === 2) {
            $emailCandidate = trim($parts[0]);
            if (filter_var($emailCandidate, FILTER_VALIDATE_EMAIL)) {
                $email = $emailCandidate;
                $name = trim($parts[1]);
            }
        }

        // If no clean split, search folderName for an email pattern
        if (!$email && preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $folderName, $matches)) {
            $email = $matches[0];
            $name = trim(str_replace($email, '', str_replace('-', '', $folderName))) ?: 'Student';
        }

        if ($email) {
            $user = User::where('email', $email)->first();
            if ($user) {
                return ['user' => $user, 'created' => false];
            }

            if ($autoCreate) {
                $user = User::create([
                    'name' => $name ?: 'Student',
                    'email' => $email,
                    'role' => 'normal',
                    'password' => Hash::make('bscpe2-1'),
                    'must_change_password' => true,
                    'is_active' => true,
                ]);
                Log::info("DriveReconciliation: Recreated student user account '{$email}' ({$name}) from Drive folder.");
                return ['user' => $user, 'created' => true];
            }
        }

        // Fallback: match by name
        $nameCandidate = count($parts) === 2 ? trim($parts[1]) : trim($folderName);
        $user = User::where('name', $nameCandidate)->first();
        if ($user) {
            return ['user' => $user, 'created' => false];
        }

        return ['user' => null, 'created' => false];
    }

    /**
     * Resiliently parse a Drive filename into document metadata.
     */
    public function parseFilename(string $filename, ?string $createdTime = null): ?array
    {
        // Check standard pattern: {document_type}[-week-{N}]-{YmdHis}.{ext}
        if (preg_match('/^(.+?)(?:-week-(\d+))?-(\d{14})\.\w+$/i', $filename, $matches)) {
            $rawType = strtolower($matches[1]);
            $week = isset($matches[2]) && $matches[2] !== '' ? (int) $matches[2] : null;
            $timestampStr = $matches[3];

            try {
                $submittedAt = Carbon::createFromFormat('YmdHis', $timestampStr);
            } catch (\Throwable) {
                $submittedAt = null;
            }

            $documentType = $this->resolveDocumentType($rawType);
            if ($documentType) {
                return [
                    'document_type' => $documentType,
                    'week' => $week,
                    'submitted_at' => $submittedAt ?? ($createdTime ? Carbon::parse($createdTime) : now()),
                ];
            }
        }

        // Resilient fallback: parse arbitrary filenames (e.g. "Resume.pdf", "Week 1 Report.pdf", etc.)
        $nameWithoutExt = strtolower(pathinfo($filename, PATHINFO_FILENAME));
        $cleanName = str_replace(['_', ' '], '-', $nameWithoutExt);

        // Check for week number in filename (e.g. "-week-2-", "week-2", "w2", "week 2")
        $week = null;
        if (preg_match('/(?:week|w)[ -_]?(\d+)/i', $filename, $wMatches)) {
            $week = (int) $wMatches[1];
        }

        // Resolve document type from keywords
        $documentType = $this->resolveDocumentType($cleanName);
        if (!$documentType) {
            return null;
        }

        $submittedAt = $createdTime ? Carbon::parse($createdTime) : now();

        return [
            'document_type' => $documentType,
            'week' => $week,
            'submitted_at' => $submittedAt,
        ];
    }

    /**
     * Map a raw string or slug to a canonical document_type.
     */
    protected function resolveDocumentType(string $raw): ?string
    {
        $raw = strtolower(trim($raw));

        // Exact match in keywords map
        if (isset(self::DOC_KEYWORDS[$raw])) {
            return self::DOC_KEYWORDS[$raw];
        }

        // Substring / keyword match (longest key first)
        foreach (self::DOC_KEYWORDS as $keyword => $canonical) {
            if (str_contains($raw, $keyword)) {
                return $canonical;
            }
        }

        return null;
    }
}
