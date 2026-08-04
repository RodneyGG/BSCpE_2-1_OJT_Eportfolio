<?php

namespace App\Services;

use App\Models\AccountSetupToken;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AccountSetupService
{
    /**
     * Generate a fresh setup token for a newly created user.
     * Returns the plaintext token (only ever exposed here, for the email link).
     */
    public function generate(User $user): string
    {
        $plainToken = Str::random(64);

        AccountSetupToken::updateOrCreate(
            ['user_id' => $user->id],
            [
                'token' => Hash::make($plainToken),
                'created_at' => now(),
            ]
        );

        return $plainToken;
    }

    /**
     * Regenerate a token for resend, enforcing a 1/minute cooldown.
     */
    public function resend(User $user): string
    {
        $existing = AccountSetupToken::where('user_id', $user->id)->first();

        if ($existing && $existing->created_at->gt(now()->subMinute())) {
            throw ValidationException::withMessages([
                'email' => ['Please wait a moment before resending the setup email.'],
            ]);
        }

        return $this->generate($user);
    }

    /**
     * Verify a submitted token and activate the account with a new password.
     */
    public function verifyAndConsume(User $user, string $plainToken, string $newPassword): void
    {
        $record = AccountSetupToken::where('user_id', $user->id)->first();

        if (!$record || !Hash::check($plainToken, $record->token)) {
            throw ValidationException::withMessages([
                'token' => ['This setup link is invalid.'],
            ]);
        }

        if ($record->isExpired()) {
            throw ValidationException::withMessages([
                'token' => ['This setup link has expired. Please request a new one.'],
            ]);
        }

        $user->update([
            'password' => $newPassword,
            'is_active' => true,
        ]);

        $record->delete();
    }
}