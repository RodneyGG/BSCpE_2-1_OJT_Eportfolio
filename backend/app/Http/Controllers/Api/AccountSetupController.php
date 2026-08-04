<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AccountSetupService;
use Illuminate\Http\Request;

class AccountSetupController extends Controller
{
    /**
     * Complete account setup: verify the emailed token and set the student's real password.
     * Public route — the student is not authenticated yet at this point.
     */
    public function complete(Request $request)
    {
        $validated = $request->validate([
            'uid' => ['required', 'integer', 'exists:users,id'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::findOrFail($validated['uid']);

        (new AccountSetupService())->verifyAndConsume(
            $user,
            $validated['token'],
            $validated['password'],
        );

        return response()->json([
            'message' => 'Account activated. You can now log in.',
        ]);
    }
}