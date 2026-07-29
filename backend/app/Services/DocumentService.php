<?php
namespace App\Services;
use Illuminate\Http\UploadedFile;
use App\Models\User;
use App\Models\Document;

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
     */
    public function uploadDocument(UploadedFile $file, User $user, string $documentType): array
    {
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
        $uploadedFile = $this->driveService->upload($file, $userFolder->id);

        $document = Document::create([
            'user_id' => $user->id,
            'document_type' => $documentType,
            'file_id' => $uploadedFile->id,
            'file_link' => $uploadedFile->webViewLink,
            'status' => 'pending',
        ]);

        return [
            'document' => $document,
        ];
    }

    /**
     * Get all pending documents for review, with submitter info.
     */
    public function getPendingDocuments()
    {
        return Document::with('user')
            ->where('status', 'pending')
            ->orderBy('created_at', 'asc')
            ->get();
    }

    /**
     * Approve or reject a document.
     */
    public function reviewDocument(Document $document, User $reviewer, string $status, ?string $reason = null): Document
    {
        $document->update([
            'status' => $status,
            'reviewed_by' => $reviewer->id,
            'reviewed_at' => now(),
            'rejection_reason' => $status === 'rejected' ? $reason : null,
        ]);

        return $document->fresh(['user', 'reviewer']);
    }
}