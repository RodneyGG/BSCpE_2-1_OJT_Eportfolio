<?php

namespace App\Services;

use App\Models\Document;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class DriveReconciliationService
{
    protected GoogleDriveService $driveService;

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
     * Reconstructed records are set to status = 'pending' so teachers
     * can re-review them. This is safe to run multiple times — files
     * that already have a DB record are skipped.
     *
     * @param bool $dryRun  If true, reports what would be created without touching the DB.
     * @return array  Summary of the reconciliation run.
     */
    public function reconcile(bool $dryRun = false): array
    {
        $rootFolderId = config('services.google_drive.folder_id');

        if (!$rootFolderId) {
            Log::error('DriveReconciliation: GOOGLE_DRIVE_FOLDER_ID is not set.');
            return ['error' => 'GOOGLE_DRIVE_FOLDER_ID is not configured.'];
        }

        // List all items in the root folder — student folders live here.
        $rootContents = $this->driveService->listFiles($rootFolderId);

        $summary = [
            'dry_run' => $dryRun,
            'folders_scanned' => 0,
            'folders_matched' => 0,
            'folders_unmatched' => [],
            'files_found' => 0,
            'files_already_tracked' => 0,
            'files_reconstructed' => 0,
            'files_unparseable' => [],
            'details' => [],
        ];

        foreach ($rootContents as $item) {
            // Only process folders (student folders).
            if ($item->mimeType !== 'application/vnd.google-apps.folder') {
                continue;
            }

            $summary['folders_scanned']++;
            $folderName = $item->name;

            // Parse folder name: "{email} - {name}"
            $user = $this->matchFolderToUser($folderName);
            if (!$user) {
                $summary['folders_unmatched'][] = $folderName;
                Log::info("DriveReconciliation: No matching user for folder '{$folderName}', skipping.");
                continue;
            }

            $summary['folders_matched']++;

            // List all files inside this student's folder.
            $files = $this->driveService->listFiles($item->id);

            foreach ($files as $file) {
                // Skip subfolders inside student folders.
                if ($file->mimeType === 'application/vnd.google-apps.folder') {
                    continue;
                }

                $summary['files_found']++;

                // Check if this file is already tracked in the DB.
                $existingDoc = Document::where('file_id', $file->id)->first();
                if ($existingDoc) {
                    $summary['files_already_tracked']++;
                    continue;
                }

                // Parse the filename to extract document metadata.
                $parsed = $this->parseFilename($file->name);
                if (!$parsed) {
                    $summary['files_unparseable'][] = [
                        'folder' => $folderName,
                        'filename' => $file->name,
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
                    'submitted_date' => $parsed['submitted_at']?->toDateString(),
                ];

                $summary['details'][] = [
                    'action' => $dryRun ? 'would_create' : 'created',
                    'user' => $user->name,
                    'email' => $user->email,
                    'document_type' => $parsed['document_type'],
                    'week' => $parsed['week'],
                    'filename' => $file->name,
                    'drive_file_id' => $file->id,
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
     * Match a Drive folder name ("{email} - {name}") to a User record.
     *
     * Tries to extract the email from the folder name prefix and
     * match it against the users table. Falls back to name-only
     * matching if email extraction fails.
     */
    private function matchFolderToUser(string $folderName): ?User
    {
        // Folder format: "{email} - {name}"
        $parts = explode(' - ', $folderName, 2);

        if (count($parts) === 2) {
            $email = trim($parts[0]);
            $user = User::where('email', $email)->first();
            if ($user) {
                return $user;
            }
        }

        // Fallback: try matching by name (less reliable, but covers
        // edge cases where the folder format might differ).
        $name = count($parts) === 2 ? trim($parts[1]) : trim($folderName);
        return User::where('name', $name)->first();
    }

    /**
     * Parse a Drive filename into document metadata.
     *
     * Expected format: {document_type}[-week-{N}]-{YmdHis}.{ext}
     * Examples:
     *   "dtr-20260815143022.pdf"
     *   "weekly-report-week-3-20260816120000.pdf"
     *   "letter-of-intent-20260817090000.pdf"
     *
     * @return array{document_type: string, week: ?int, submitted_at: ?\Carbon\Carbon}|null
     */
    private function parseFilename(string $filename): ?array
    {
        // Remove extension first, then match the pattern.
        // Pattern: everything before the final 14-digit timestamp block.
        if (!preg_match('/^(.+?)(?:-week-(\d+))?-(\d{14})\.\w+$/', $filename, $matches)) {
            return null;
        }

        $documentType = $matches[1];
        $week = isset($matches[2]) && $matches[2] !== '' ? (int) $matches[2] : null;
        $timestampStr = $matches[3];

        try {
            $submittedAt = \Carbon\Carbon::createFromFormat('YmdHis', $timestampStr);
        } catch (\Throwable) {
            $submittedAt = null;
        }

        return [
            'document_type' => $documentType,
            'week' => $week,
            'submitted_at' => $submittedAt,
        ];
    }
}
