<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Authenticate a user and return a token.
     */
    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();
        if (!$user || !Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }
        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['This account has been deactivated. Contact your administrator.'],
            ]);
        }

        // Revoke all existing tokens for this user
        $user->tokens()->delete();

        $token = $user->createToken('api-token')->plainTextToken;

        return [
            'token' => $token,
            'user' => $user->load('company'),
        ];
    }

    /**
     * Logout a user by revoking their current token.
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    /**
     * Change a user's password.
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): void
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => $newPassword,
            'must_change_password' => false,
        ]);
    }

}
