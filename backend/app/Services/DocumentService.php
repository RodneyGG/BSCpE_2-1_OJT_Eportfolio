<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use App\Models\User;

class DocumentService
{
    protected GoogleDriveService $driveService;

    public function __construct(GoogleDriveService $driveService)
    {
        $this->driveService = $driveService;
    }

    /**
     * Upload a document to Google Drive on behalf of the Admin via OAuth.
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

        return [
            'file_id' => $uploadedFile->id,
            'file_link' => $uploadedFile->webViewLink,
            'document_type' => $documentType,
        ];
    }
}
