<?php

namespace App\Services;

use App\Mail\AccountSetupMail;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class UserService
{
    /**
     * Create a student ('normal' role) account and send the setup-link email.
     *
     * Mirrors the account-creation shape used by the manual "Create Account"
     * admin flow, so both manual and bulk-import paths produce identical
     * accounts and activity-log entries.
     */
    public function createStudentAccount(string $name, string $email, int $actorId): User
    {
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'role' => 'normal',
            'password' => Hash::make('bscpe2-1'),
            'must_change_password' => true,
            'is_active' => true,
        ]);

        ActivityLog::create([
            'actor_id' => $actorId,
            'action' => 'account_created',
            'target_id' => $user->id,
            'metadata' => ['created_role' => $user->role, 'setup_method' => 'default_password'],
        ]);

        return $user;
    }
}