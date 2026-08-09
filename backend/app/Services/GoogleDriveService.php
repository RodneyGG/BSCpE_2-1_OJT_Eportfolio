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
        $this->client->setClientId(config('services.google_drive.client_id'));
        $this->client->setClientSecret(config('services.google_drive.client_secret'));
        $this->client->addScope(Drive::DRIVE);
        $this->client->setAccessType('offline');

        $token = \App\Models\GoogleOAuthToken::first();
        if ($token) {
            $this->client->setAccessToken([
                'access_token' => $token->access_token,
                'refresh_token' => $token->refresh_token,
                'expires_in' => $token->expires_in,
                'created' => $token->created,
            ]);

            if ($this->client->isAccessTokenExpired()) {
                $this->client->fetchAccessTokenWithRefreshToken($this->client->getRefreshToken());
                $newToken = $this->client->getAccessToken();
                if (isset($newToken['access_token'])) {
                    $token->update([
                        'access_token' => $newToken['access_token'],
                        'expires_in' => $newToken['expires_in'],
                        'created' => $newToken['created'],
                    ]);
                }
            }
        }

        $this->driveService = new Drive($this->client);
        $this->folderId = config('services.google_drive.folder_id');
    }

    /**
     * Upload a file to Google Drive.
     */
    public function upload(UploadedFile $file, string $folder = '', ?string $customFileName = null): DriveFile
    {
        $folderId = $folder ?: $this->folderId;
        $driveFile = new DriveFile([
            'name' => $customFileName ?: $file->getClientOriginalName(),
            'parents' => [$folderId],
        ]);
        $created = $this->driveService->files->create($driveFile, [
            'data' => file_get_contents($file->getRealPath()),
            'mimeType' => $file->getMimeType(),
            'uploadType' => 'multipart',
            'fields' => 'id, name, mimeType, webViewLink, webContentLink',
        ]);
        // Grant link-based view access so the embedded preview iframe works
        // for anyone who has the document URL, without requiring each
        // viewer to be individually shared on the file.
        $this->driveService->permissions->create($created->id, new \Google\Service\Drive\Permission([
            'type' => 'anyone',
            'role' => 'reader',
        ]));
        return $created;
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
