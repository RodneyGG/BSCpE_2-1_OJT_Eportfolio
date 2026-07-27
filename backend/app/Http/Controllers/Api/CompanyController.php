<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    /**
     * List all companies.
     */
    public function index(): JsonResponse
    {
        $companies = Company::withCount('users')->orderBy('name')->get();

        return response()->json($companies);
    }

    /**
     * Show a single company with its assigned students.
     */
    public function show(Company $company): JsonResponse
    {
        $company->load('users:id,name,email,company_id');
        $company->loadCount('users');

        return response()->json($company);
    }

    /**
     * Update a company's address.
     * Only students belonging to this company can update the address.
     */
    public function updateAddress(Request $request, Company $company): JsonResponse
    {
        $user = $request->user();

        // Admin and professors can update any company's address
        if (! $user->isAdmin() && ! $user->isProfessor()) {
            // Students can only update their own company's address
            if ($user->company_id !== $company->id) {
                return response()->json([
                    'message' => 'You can only update the address of your own company.',
                ], 403);
            }
        }

        $request->validate([
            'address' => 'required|string|max:500',
        ]);

        $company->update(['address' => $request->address]);

        return response()->json([
            'message' => 'Address updated successfully',
            'company' => $company->fresh(),
        ]);
    }
}
