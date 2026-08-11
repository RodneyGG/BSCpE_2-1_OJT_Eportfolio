<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Http\Requests\UploadDocumentRequest;
use App\Http\Requests\ReviewDocumentRequest;
use App\Models\Document;
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
                $request->input('document_type'),
                $request->input('claimed_hours'),
                $request->input('week'),
                $request->input('submitted_date'),
                $request->input('required_hours')
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
    /**
     * List all pending documents for review (Prof only, via route middleware).
     */
    public function pending(): JsonResponse
    {
        $documents = $this->documentService->getPendingDocuments();
        return response()->json([
            'documents' => $documents,
        ]);
    }
    /**
     * List all documents belonging to the currently authenticated user
     * (student's own uploads, any role can hit this — it's always self-scoped).
     */
    public function mine(): JsonResponse
    {
        $documents = $this->documentService->getMyDocuments(auth()->id());
        return response()->json([
            'documents' => $documents,
        ]);
    }
    /**
     * Approve or reject a document (Prof only, via route middleware).
     */
    public function review(ReviewDocumentRequest $request, Document $document): JsonResponse
    {
        $updated = $this->documentService->reviewDocument(
            $document,
            $request->user(),
            $request->input('status'),
            $request->input('reason')
        );
        return response()->json([
            'message' => 'Document reviewed successfully',
            'document' => $updated,
        ]);
    }

    /**
     * Delete an uploaded document.
     */
    public function destroy(Document $document): JsonResponse
    {
        $user = auth()->user();

        // Check permission: only the owner or admin can delete
        if ($document->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized to delete this document'], 403);
        }

        try {
            $this->documentService->deleteDocument($document);
            return response()->json(['message' => 'Document deleted successfully']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Document Deletion Failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete document',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}