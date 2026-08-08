<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    /**
     * Login and return a Sanctum token.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->input('email'),
            $request->input('password')
        );

        return response()->json([
            'message' => 'Login successful',
            'token' => $result['token'],
            'user' => [
                'id' => $result['user']->id,
                'name' => $result['user']->name,
                'email' => $result['user']->email,
                'role' => $result['user']->role,
                'company_id' => $result['user']->company_id,
                'company' => $result['user']->company?->name,
                'must_change_password' => $result['user']->must_change_password,
            ],
        ]);
    }

    /**
     * Logout (revoke current token).
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get the authenticated user's profile.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('company');

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'profile_picture' => $user->profile_picture,
            'role' => $user->role,
            'company_id' => $user->company_id,
            'company' => $user->company,
            'must_change_password' => $user->must_change_password,
            'ojt_role' => $user->ojt_role,
            'ojt_supervisor' => $user->ojt_supervisor,
            'emergency_contact_name' => $user->emergency_contact_name,
            'emergency_contact_number' => $user->emergency_contact_number,
            'phone' => $user->phone,
            'program' => $user->program,
            'hours_rendered' => $user->hours_rendered,
        ]);
    }

    /**
     * Update the authenticated user's own profile fields.
     *
     * Allows name/email (with uniqueness check against other users),
     * phone/program, OJT deployment details (company, role, supervisor,
     * start/end dates), and emergency contact info.
     * Still does NOT allow touching role, password, hours_rendered,
     * or any admin-only fields here.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'phone' => ['nullable', 'string', 'max:30'],
            'program' => ['nullable', 'string', 'max:255'],
            'company_id' => ['nullable', 'integer', 'exists:companies,id'],
            'ojt_role' => ['nullable', 'string', 'max:255'],
            'ojt_supervisor' => ['nullable', 'string', 'max:255'],
            'ojt_start_date' => ['nullable', 'date'],
            'ojt_end_date' => ['nullable', 'date'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_number' => ['nullable', 'string', 'max:30'],
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh()->load('company'),
        ]);
    }

    /**
     * Change password (used on first login or voluntarily).
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->authService->changePassword(
            $request->user(),
            $request->input('current_password'),
            $request->input('new_password')
        );

        return response()->json(['message' => 'Password changed successfully']);
    }

    /**
     * Upload a profile picture.
     */
    public function uploadProfilePicture(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'], // 5MB max
        ]);

        $user = $request->user();

        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($user->profile_picture) {
                // Determine if we are storing in public or a specific disk
                $oldPath = str_replace(asset('storage/'), '', $user->profile_picture);
                \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            }

            $path = $request->file('photo')->store('profile_pictures', 'public');
            $user->profile_picture = asset('storage/' . $path);
            $user->save();
        }

        return response()->json([
            'message' => 'Profile picture uploaded successfully',
            'profile_picture' => $user->profile_picture
        ]);
    }

    /**
     * Delete profile picture.
     */
    public function deleteProfilePicture(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->profile_picture) {
            $oldPath = str_replace(asset('storage/'), '', $user->profile_picture);
            \Illuminate\Support\Facades\Storage::disk('public')->delete($oldPath);
            $user->profile_picture = null;
            $user->save();
        }

        return response()->json([
            'message' => 'Profile picture removed successfully'
        ]);
    }

}