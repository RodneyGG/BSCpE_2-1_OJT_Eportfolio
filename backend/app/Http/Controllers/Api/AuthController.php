<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Login and return a Sanctum token.
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Revoke all existing tokens for this user
        $user->tokens()->delete();

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'company_id' => $user->company_id,
                'company' => $user->company?->name,
                'must_change_password' => $user->must_change_password,
            ],
        ]);
    }

    /**
     * Logout (revoke current token).
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

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
            'role' => $user->role,
            'company_id' => $user->company_id,
            'company' => $user->company,
            'must_change_password' => $user->must_change_password,
        ]);
    }

    /**
     * Change password (used on first login or voluntarily).
     */
    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (! Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => $request->new_password,
            'must_change_password' => false,
        ]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    /**
     * Select/change the user's company assignment.
     */
    public function selectCompany(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|exists:companies,id',
        ]);

        $user = $request->user();
        $company = Company::findOrFail($request->company_id);

        $user->update(['company_id' => $company->id]);

        return response()->json([
            'message' => 'Company selected successfully',
            'company' => $company,
        ]);
    }
}
