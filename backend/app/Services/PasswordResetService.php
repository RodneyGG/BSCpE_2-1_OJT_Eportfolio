<?php
namespace App\Services;

use App\Models\PasswordResetToken;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PasswordResetService
{
    /**
     * Generate a fresh reset token for the given email.
     * Returns the plaintext token (only ever exposed here, for the email link).
     */
    public function generate(string $email): string
    {
        $plainToken = Str::random(64);
        PasswordResetToken::updateOrCreate(
            ['email' => $email],
            [
                'token' => Hash::make($plainToken),
                'created_at' => now(),
            ]
        );
        return $plainToken;
    }

    /**
     * Verify a submitted token and set the user's new password.
     * Password is hashed automatically by the User model's 'hashed' cast.
     */
    public function verifyAndConsume(User $user, string $plainToken, string $newPassword): void
    {
        $record = PasswordResetToken::where('email', $user->email)->first();
        if (!$record || !Hash::check($plainToken, $record->token)) {
            throw ValidationException::withMessages([
                'token' => ['This reset link is invalid.'],
            ]);
        }
        if ($record->isExpired()) {
            throw ValidationException::withMessages([
                'token' => ['This reset link has expired. Please request a new one.'],
            ]);
        }
        $user->update([
            'password' => $newPassword,
        ]);
        $record->delete();
    }
}