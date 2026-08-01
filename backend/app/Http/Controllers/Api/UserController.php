<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
class UserController extends Controller
{
    /**
     * List all user accounts.
     */
    public function index(Request $request)
    {
        $users = User::select('id', 'name', 'email', 'role', 'company_id', 'must_change_password', 'can_review', 'is_active', 'created_at')            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($users);
    }
    /**
     * Create a new account (student or admin). Prof and admin can both call this.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::in(['normal', 'admin'])],
        ]);
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
            'metadata' => ['created_role' => $user->role],
        ]);
        return response()->json([
            'user' => $user,
            'temp_password' => $tempPassword,
        ], 201);
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
}
