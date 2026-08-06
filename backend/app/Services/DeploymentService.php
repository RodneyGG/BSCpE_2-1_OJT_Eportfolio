<?php

namespace App\Services;

use App\Models\Deployment;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class DeploymentService
{
    /**
     * Get the authenticated user's own deployment row, if any.
     * Prefers a confirmed row over a pending one if both exist.
     */
    public function getForUser(User $user): ?Deployment
    {
        return Deployment::where('user_id', $user->id)
            ->with('company')
            ->orderByRaw("status = 'confirmed' desc")
            ->latest('id')
            ->first();
    }

    /**
     * Confirm a pending deployment, optionally overriding fields the
     * student wants to correct before confirming (e.g. sheet had the
     * wrong supervisor name).
     */
    public function confirm(Deployment $deployment, User $user, array $overrides): Deployment
    {
        if ($deployment->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'deployment' => 'You may only confirm your own deployment.',
            ]);
        }

        if ($deployment->status === 'confirmed') {
            throw ValidationException::withMessages([
                'deployment' => 'This deployment is already confirmed.',
            ]);
        }

        $deployment->fill(array_filter($overrides, fn ($v) => $v !== null));
        $deployment->status = 'confirmed';
        $deployment->confirmed_at = now();
        $deployment->confirmed_by = $user->id;
        $deployment->save();

        return $deployment->fresh('company');
    }
}