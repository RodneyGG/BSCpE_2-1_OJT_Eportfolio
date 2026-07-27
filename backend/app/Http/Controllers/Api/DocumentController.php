<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadDocumentRequest;
use App\Services\DocumentService;
use Illuminate\Http\JsonResponse;

class DocumentController extends Controller
{
    protected DocumentService $documentService;

    public function __construct(DocumentService $documentService)
    {
        $this->documentService = $documentService;
    }

    /**
     * Upload a document using the DocumentService.
     */
    public function upload(UploadDocumentRequest $request): JsonResponse
    {
        try {
            $result = $this->documentService->uploadDocument(
                $request->file('document'),
                $request->user(),
                $request->input('document_type')
            );

            return response()->json(array_merge([
                'message' => 'Document uploaded successfully',
            ], $result));
            
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Document Upload Failed: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Failed to upload document',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
