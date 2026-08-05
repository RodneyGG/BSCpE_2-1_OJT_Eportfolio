<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use App\Services\RosterSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    /**
     * List all companies.
     *
     * Only active students (role=normal, is_active=true) are included in
     * per-company counts and student lists.  A top-level `totalStudents`
     * field gives the global count of ALL active students (including those
     * not yet assigned to any company) so the dashboard stat tile matches
     * the checklist page exactly.
     */
    public function index(): JsonResponse
    {
        // Scope the eager-load to active students only so counts are consistent
        // with the checklist endpoint (UserController@checklist).
        $companies = Company::with(['users' => function ($q) {
                $q->where('role', 'normal')
                  ->where('is_active', true)
                  ->select('id', 'name', 'role', 'email', 'company_id');
            }])
            ->orderBy('name')
            ->get()
            // Drop companies that have zero active students after filtering
            ->filter(fn ($company) => $company->users->isNotEmpty());

        $formatted = $companies->values()->map(function ($company) {
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

        // Global count of ALL active students — single source of truth shared
        // with the checklist endpoint so the dashboard tile is always accurate.
        $totalStudents = User::where('role', 'normal')
            ->where('is_active', true)
            ->count();

        return response()->json([
            'companies' => $formatted,
            'totalStudents' => $totalStudents,
        ]);
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
     * Trigger a roster sync from the Google Sheet (Admin only).
     */
    public function sync(RosterSyncService $rosterSync): JsonResponse
    {
        $summary = $rosterSync->sync(false);

        return response()->json([
            'matched' => $summary['matched'],
            'needs_review' => $summary['needs_review'],
            'unmatched' => $summary['unmatched'],
            'malformed' => $summary['malformed'],
        ]);
    }

    /**
     * Delete a company (Admin only).
     */
    public function destroy(Company $company): JsonResponse
    {
        $company->delete();

        return response()->json([
            'message' => 'Company deleted successfully',
        ]);
    }
}
