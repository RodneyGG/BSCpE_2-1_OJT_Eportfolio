<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\AccountSetupMail;
use App\Models\Deployment;
use App\Models\User;
use App\Models\ActivityLog;
use App\Services\AccountSetupService;
use App\Services\DeploymentService;
use App\Services\UserService;
use App\Services\BulkImportService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * List user accounts.
     *
     * Optional ?role=normal filters to students only (used by the /students roster page).
     * Response shape depends on the REQUESTER's role, not the target user's:
     *   - admin/prof requesters get full detail plus hours + document-status counts,
     *     needed for the review grid's status badges.
     *   - student requesters get a stripped-down, safe-for-classmates subset only.
     */
    public function index(Request $request)
    {
        $requester = $request->user();
        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if (in_array($requester->role, ['admin', 'prof'])) {
            $users = $query
                ->select('id', 'name', 'email', 'role', 'company_id', 'hours_rendered', 'required_hours', 'must_change_password', 'can_review', 'is_active', 'created_at')
                ->with('company:id,name')
                ->withCount([
                    'documents as approved_documents_count' => fn ($q) => $q->where('status', 'approved')->where('document_type', '!=', 'dtr'),
                    'documents as pending_documents_count' => fn ($q) => $q->where('status', 'pending')->where('document_type', '!=', 'dtr'),
                    'documents as rejected_documents_count' => fn ($q) => $q->where('status', 'rejected')->where('document_type', '!=', 'dtr'),
                ])
                ->orderBy('created_at', 'desc')
                ->get();
        } else {
            $users = $query
                ->select('id', 'name', 'company_id', 'hours_rendered', 'required_hours')
                ->with('company:id,name')
                ->orderBy('name')
                ->get();
        }

        return response()->json($users);
    }

    /**
     * OJT Submission Checklist — returns every active student with their
     * company and documents so professors can track document completion.
     * Admin/prof only (route middleware).
     */
    public function checklist(Request $request)
    {
        $students = User::where('role', 'normal')
            ->where('is_active', true)
            ->with([
                'company:id,name',
                'documents:id,user_id,document_type,status,week',
            ])
            ->select('id', 'name', 'email', 'company_id')
            ->orderBy('name')
            ->get();

        return response()->json(['students' => $students]);
    }

    /**
     * Full detail for a single student, including their documents —
     * powers the admin/prof review side panel. Admin/prof only (route middleware).
     */
    public function show(Request $request, User $user, DeploymentService $deploymentService)
    {
        $user->load('company');
        $user->load(['documents' => fn ($q) => $q->orderBy('created_at', 'desc')]);
        $user->setAttribute('deployment', $deploymentService->getForUser($user));
        return response()->json($user);
    }

    /**
     * Create a new account (student or admin). Prof and admin can both call this.
     *
     * Students: created inactive with an unusable random password; a setup-link
     * email is sent immediately so the student sets their own password.
     * Admins: unchanged — created active with a temp password shown to the creator.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::in(['normal', 'admin', 'prof'])],
        ]);

        if ($validated['role'] === 'prof' && User::where('role', 'prof')->exists()) {
            return response()->json([
                'message' => 'A professor account already exists. Only one active professor account is allowed at a time.',
            ], 422);
        }

        if ($validated['role'] === 'normal') {
            $user = (new UserService())->createStudentAccount(
                $validated['name'],
                $validated['email'],
                $request->user()->id
            );

            return response()->json([
                'user' => $user,
                'message' => 'Account created. A setup email has been sent to the student.',
            ], 201);
        }

        $tempPassword = Str::random(10);
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
            'password' => Hash::make($tempPassword),
            'must_change_password' => true,
        ]);

        ActivityLog::create([
            'actor_id' => $request->user()->id,
            'action' => 'account_created',
            'target_id' => $user->id,
            'metadata' => ['created_role' => $user->role, 'setup_method' => 'temp_password'],
        ]);

        return response()->json([
            'user' => $user,
            'temp_password' => $tempPassword,
        ], 201);
    }

    /**
     * Resend the account-setup email to a student who hasn't activated yet.
     * Enforces the 1/minute cooldown via AccountSetupService (throws ValidationException).
     */
    public function resendSetup(Request $request, User $user)
    {
        if ($user->role !== 'normal') {
            return response()->json([
                'message' => 'Setup emails only apply to student accounts.',
            ], 422);
        }

        if ($user->is_active) {
            return response()->json([
                'message' => 'This account is already active.',
            ], 422);
        }

        $plainToken = (new AccountSetupService())->resend($user);
        Mail::to($user->email)->send(new AccountSetupMail($user, $plainToken));

        ActivityLog::create([
            'actor_id' => $request->user()->id,
            'action' => 'account_setup_resent',
            'target_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Setup email resent.',
        ]);
    }

    /**
     * Reset a user's password to a new random temp password.
     */
    public function resetPassword(Request $request, User $user)
    {
        $tempPassword = Str::random(10);
        $user->update([
            'password' => Hash::make($tempPassword),
            'must_change_password' => true,
        ]);
        ActivityLog::create([
            'actor_id' => $request->user()->id,
            'action' => 'password_reset',
            'target_id' => $user->id,
        ]);
        return response()->json([
            'message' => 'Password reset successfully.',
            'temp_password' => $tempPassword,
        ]);
    }

    /**
     * Toggle an admin's fallback review permission. Prof only (enforced via route middleware).
     */
    public function toggleReview(Request $request, User $user)
    {
        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Review permission only applies to admin accounts.',
            ], 422);
        }
        $user->update(['can_review' => !$user->can_review]);
        ActivityLog::create([
            'actor_id' => $request->user()->id,
            'action' => 'review_permission_toggled',
            'target_id' => $user->id,
            'metadata' => ['can_review' => $user->can_review],
        ]);
        return response()->json([
            'message' => 'Review permission updated.',
            'can_review' => $user->can_review,
        ]);
    }

    /**
     * Deactivate (soft-disable) a user account. Preserves document history.
     */
    public function deactivate(Request $request, User $user)
    {
        $user->update(['is_active' => false]);
        ActivityLog::create([
            'actor_id' => $request->user()->id,
            'action' => 'account_deactivated',
            'target_id' => $user->id,
        ]);
        return response()->json([
            'message' => 'Account deactivated.',
            'is_active' => $user->is_active,
        ]);
    }

    public function updateCompany(Request $request, User $user)
    {
        if ($user->role !== 'normal') {
            return response()->json([
                'message' => 'Only student accounts can be assigned a company.',
            ], 422);
        }

        $request->validate([
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
        ]);

        $previousCompanyId = $user->company_id;
        $newCompanyId = $request->company_id;

        // 1. Update legacy user table column
        $user->update(['company_id' => $newCompanyId]);
        $user->load('company:id,name');

        // 2. Sync/upsert active deployment record
        if ($newCompanyId) {
            $deployment = Deployment::where('user_id', $user->id)
                ->orderByRaw("status = 'confirmed' desc")
                ->latest('id')
                ->first();

            if ($deployment) {
                $deployment->update(['company_id' => $newCompanyId]);
            } else {
                Deployment::create([
                    'user_id' => $user->id,
                    'company_id' => $newCompanyId,
                    'status' => 'pending_confirmation',
                ]);
            }
        }

        // 3. Log activity
        ActivityLog::create([
            'actor_id' => $request->user()->id,
            'action' => 'company_reassigned',
            'target_id' => $user->id,
            'metadata' => [
                'previous_company_id' => $previousCompanyId,
                'new_company_id' => $user->company_id,
            ],
        ]);

        return response()->json([
            'message' => 'Company assignment updated.',
            'company' => $user->company,
        ]);
    }

    /**
     * Reactivate a previously deactivated user account.
     */
    public function reactivate(Request $request, User $user)
    {
        $user->update(['is_active' => true]);
        ActivityLog::create([
            'actor_id' => $request->user()->id,
            'action' => 'account_reactivated',
            'target_id' => $user->id,
        ]);
        return response()->json([
            'message' => 'Account reactivated.',
            'is_active' => $user->is_active,
        ]);
    }

    /**
     * Permanently delete a user account. No longer blocks on existing
     * documents — the frontend warns with a document count and requires
     * explicit confirmation before calling this. Cascades documents/DTRs
     * and setup tokens at the DB level (see migrations).
     */
    public function destroy(Request $request, User $user)
    {
        if ($user->id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot delete your own account.',
            ], 422);
        }

        $documentCount = $user->documents()->count();

        ActivityLog::create([
            'actor_id' => $request->user()->id,
            'action' => 'account_deleted',
            'target_id' => $user->id,
            'metadata' => [
                'deleted_name' => $user->name,
                'deleted_email' => $user->email,
                'deleted_role' => $user->role,
                'documents_deleted' => $documentCount,
            ],
        ]);

        $user->delete();

        return response()->json([
            'message' => 'Account permanently deleted.',
            'documents_deleted' => $documentCount,
        ]);
    }

    /**
     * Preview bulk import from Google Sheet URL.
     */
    public function previewBulkImport(Request $request, BulkImportService $bulkImportService)
    {
        $sheetUrl = $request->query('url');

        if (!$sheetUrl) {
            return response()->json([
                'message' => 'A valid Google Sheet URL is required.'
            ], 400);
        }

        try {
            $previewData = $bulkImportService->preview($sheetUrl);
            return response()->json($previewData);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch sheet preview: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Commit bulk import from Google Sheet URL.
     */
    public function commitBulkImport(Request $request, BulkImportService $bulkImportService)
    {
        $sheetUrl = $request->input('url');
        $actorId = $request->user()->id;

        try {
            $result = $bulkImportService->commit($actorId, $sheetUrl);
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to commit bulk import: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Preview bulk import from a directly-uploaded CSV file.
     */
    public function previewBulkImportFile(Request $request, BulkImportService $bulkImportService)
    {
        $request->validate([
            'csv' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        try {
            $previewData = $bulkImportService->previewFile($request->file('csv'));
            return response()->json($previewData);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to parse CSV file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Commit bulk import from a directly-uploaded CSV file.
     */
    public function commitBulkImportFile(Request $request, BulkImportService $bulkImportService)
    {
        $request->validate([
            'csv' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
        ]);

        $actorId = $request->user()->id;

        try {
            $result = $bulkImportService->commitFile($actorId, $request->file('csv'));
            return response()->json($result);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to commit bulk import: ' . $e->getMessage()
            ], 500);
        }
    }
}