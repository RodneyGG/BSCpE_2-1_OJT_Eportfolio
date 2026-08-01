<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Block;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlockController extends Controller
{
    /**
     * Return the single block record. There is only ever one row;
     * if none exists yet, return null so the frontend can show an
     * empty/"not set up yet" state instead of erroring.
     */
    public function show(): JsonResponse
    {
        $block = Block::first();

        return response()->json([
            'block' => $block,
        ]);
    }

    /**
     * Create or update the single block record (admin only, via route middleware).
     * Since there's only ever one row, this always updates the first record
     * or creates it if it doesn't exist yet.
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'block_code' => 'required|string|max:255',
            'block_name' => 'nullable|string|max:255',
            'adviser_name' => 'required|string|max:255',
            'adviser_document_file_id' => 'nullable|string|max:255',
            'adviser_document_link' => 'nullable|string|max:255',
        ]);

        $block = Block::first();

        if ($block) {
            $block->update($validated);
        } else {
            $block = Block::create($validated);
        }

        return response()->json([
            'message' => 'Block updated successfully',
            'block' => $block,
        ]);
    }
}