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
        $companies = Company::has('users')->with('users:id,name,role,email,company_id')->orderBy('name')->get();

        $formatted = $companies->map(function ($company) {
            return [
                'id' => $company->id,
                'name' => $company->name,
                'location' => $company->address ?: 'Location pending...',
                'studentCount' => $company->users->count(),
                'students' => $company->users->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => 'IT Intern', // Dummy
                        'program' => 'BSCpE 2-1', // Dummy
                        'hours' => 0,
                        'totalHours' => 300,
                        'status' => 'Active',
                        'dtrProofs' => []
                    ];
                })->values()
            ];
        });

        return response()->json($formatted);
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

    /**
     * Delete a company (Admin only).
     */
    public function destroy(Company $company): JsonResponse
    {
        $company->delete();
        return response()->json([
            'message' => 'Company deleted successfully'
        ]);
    }
}
