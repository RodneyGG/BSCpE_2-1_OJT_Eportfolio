<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GoogleDriveService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    protected GoogleDriveService $driveService;

    public function __construct(GoogleDriveService $driveService)
    {
        $this->driveService = $driveService;
    }

    /**
     * Upload a document to Google Drive.
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'document' => 'required|file|mimes:pdf|max:10240', // Max 10MB PDF
            'document_type' => 'required|string',
        ]);

        $file = $request->file('document');
        $user = $request->user();

        try {
            // First, ensure a folder for this student exists
            // We'll create a folder named after the user's email or ID
            $folderName = $user->email . ' - ' . $user->name;
            
            // Check if folder exists (we'd ideally store folder ID in DB, but for now we list)
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

            // Prefix file name with document type
            $originalName = $file->getClientOriginalName();
            // Optional: override name $file->getClientOriginalName() ...
            
            $uploadedFile = $this->driveService->upload($file, $userFolder->id);

            return response()->json([
                'message' => 'Document uploaded successfully',
                'file_id' => $uploadedFile->id,
                'file_link' => $uploadedFile->webViewLink,
                'document_type' => $request->document_type
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to upload document to Google Drive',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
