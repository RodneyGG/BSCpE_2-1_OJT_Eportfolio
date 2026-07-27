<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use Illuminate\Support\Str;

class DocumentService
{
    /**
     * Upload a document for a user.
     * Uses Laravel's Storage facade which is the industry standard approach
     * allowing seamless swapping between local, S3, or other filesystems.
     *
     * @param UploadedFile $file
     * @param User $user
     * @param string $documentType
     * @return array
     */
    public function uploadDocument(UploadedFile $file, User $user, string $documentType): array
    {
        $folderName = Str::slug($user->name);
        $fileName = time() . '_' . Str::slug($file->getClientOriginalName()) . '.' . $file->getClientOriginalExtension();
        
        // Use the 'public' disk so files are accessible via URL
        $path = $file->storeAs(
            "documents/{$folderName}",
            $fileName,
            'public'
        );

        return [
            'file_id' => uniqid('doc_'),
            'file_link' => url("storage/{$path}"),
            'document_type' => $documentType,
        ];
    }
}
