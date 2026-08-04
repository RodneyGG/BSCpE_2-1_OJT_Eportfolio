<?php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Mail\PasswordResetMail;
use App\Models\User;
use App\Services\PasswordResetService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\PasswordResetUnavailableMail;
class PasswordResetController extends Controller
{
    /**
     * Handle a forgot-password request. Public route — no auth yet.
     *
     * Always returns the same generic response regardless of outcome,
     * so this endpoint can't be used to enumerate registered emails or
     * distinguish account roles. 'normal' (student) accounts receive a
     * functional reset link. admin/prof accounts receive a notice email
     * instructing them to contact their system administrator instead —
     * no reset token is generated for them.
     */
    public function request(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);
        $user = User::where('email', $validated['email'])->first();
        if ($user && $user->role === 'normal') {
            $plainToken = (new PasswordResetService())->generate($user->email);
            Mail::to($user->email)->send(new PasswordResetMail($user, $plainToken));
        } elseif ($user && in_array($user->role, ['admin', 'prof'], true)) {
            Mail::to($user->email)->send(new PasswordResetUnavailableMail($user));
        }
        return response()->json([
            'message' => 'If an account exists for that email, a password reset link has been sent.',
        ]);
    }
    /**
     * Complete a password reset: verify the emailed token and set a new password.
     * Public route — the user is not authenticated at this point.
     */
    public function complete(Request $request)
    {
        $validated = $request->validate([
            'uid' => ['required', 'integer', 'exists:users,id'],
            'token' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);
        $user = User::findOrFail($validated['uid']);
        (new PasswordResetService())->verifyAndConsume(
            $user,
            $validated['token'],
            $validated['password'],
        );
        return response()->json([
            'message' => 'Password reset successfully. You can now log in.',
        ]);
    }
}