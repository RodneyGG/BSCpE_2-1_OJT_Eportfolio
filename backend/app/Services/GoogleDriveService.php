<?php

namespace App\Services;

use Google\Client;
use Google\Service\Drive;
use Google\Service\Drive\DriveFile;
use Illuminate\Http\UploadedFile;

class GoogleDriveService
{
    protected Client $client;
    protected Drive $driveService;
    protected ?string $folderId;

    public function __construct()
    {
        $this->client = new Client();
        $this->client->setAuthConfig(storage_path('app/google/service-account.json'));
        $this->client->addScope(Drive::DRIVE);

        $this->driveService = new Drive($this->client);
        $this->folderId = config('services.google_drive.folder_id');
    }

    /**
     * Upload a file to Google Drive.
     */
    public function upload(UploadedFile $file, string $folder = ''): DriveFile
    {
        $folderId = $folder ?: $this->folderId;

        $driveFile = new DriveFile([
            'name' => $file->getClientOriginalName(),
            'parents' => [$folderId],
        ]);

        return $this->driveService->files->create($driveFile, [
            'data' => file_get_contents($file->getRealPath()),
            'mimeType' => $file->getMimeType(),
            'uploadType' => 'multipart',
            'fields' => 'id, name, mimeType, webViewLink, webContentLink',
        ]);
    }

    /**
     * Create a subfolder inside the root Drive folder.
     */
    public function createFolder(string $name, string $parentId = ''): DriveFile
    {
        $parentId = $parentId ?: $this->folderId;

        $folder = new DriveFile([
            'name' => $name,
            'mimeType' => 'application/vnd.google-apps.folder',
            'parents' => [$parentId],
        ]);

        return $this->driveService->files->create($folder, [
            'fields' => 'id, name',
        ]);
    }

    /**
     * List files in a folder.
     */
    public function listFiles(string $folderId = ''): array
    {
        $folderId = $folderId ?: $this->folderId;

        $results = $this->driveService->files->listFiles([
            'q' => "'{$folderId}' in parents and trashed = false",
            'fields' => 'files(id, name, mimeType, webViewLink, webContentLink, size, createdTime)',
            'orderBy' => 'name',
        ]);

        return $results->getFiles();
    }

    /**
     * Delete a file from Google Drive.
     */
    public function delete(string $fileId): void
    {
        $this->driveService->files->delete($fileId);
    }

    /**
     * Get a file's metadata.
     */
    public function getFile(string $fileId): DriveFile
    {
        return $this->driveService->files->get($fileId, [
            'fields' => 'id, name, mimeType, webViewLink, webContentLink, size, createdTime',
        ]);
    }
}
