<?php

namespace App\Services;

use App\Models\Deployment;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class DeploymentService
{
    /**
     * Retrieve the user's deployment record.
     * Auto-detects and links unassigned Google Sheet sync records matching student email.
     */
    public function getForUser(User $user): ?Deployment
    {
        $deployment = Deployment::where('user_id', $user->id)
            ->with('company')
            ->orderByRaw("status = 'confirmed' desc")
            ->latest('id')
            ->first();

        // Auto-detection fallback: Link unassigned sync record by email if user has no deployment assigned yet
        if (!$deployment && $user->email) {
            $unlinked = Deployment::whereNull('user_id')
                ->where('student_email', $user->email)
                ->latest('id')
                ->first();

            if ($unlinked) {
                $unlinked->user_id = $user->id;
                $unlinked->save();

                $deployment = $unlinked->load('company');
            }
        }

        return $deployment;
    }

    /**
     * Confirm deployment record with optional user overrides.
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

        // Apply provided overrides (filter out nulls and empty strings so existing values are preserved)
        $fillable = array_filter($overrides, fn ($v) => $v !== null && $v !== '');
        $deployment->fill($fillable);

        // Mark as manually overridden if custom fields were modified during confirmation
        if (!empty($fillable)) {
            $deployment->is_manually_overridden = true;
        }

        $deployment->status = 'confirmed';
        $deployment->confirmed_at = now();
        $deployment->confirmed_by = $user->id;
        $deployment->save();

        return $deployment->fresh('company');
    }

    /**
     * Update an already confirmed deployment record.
     */
    public function update(Deployment $deployment, User $user, array $data): Deployment
    {
        if ($deployment->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'deployment' => 'You may only update your own deployment.',
            ]);
        }

        if ($deployment->status !== 'confirmed') {
            throw ValidationException::withMessages([
                'deployment' => 'Pending deployments must be confirmed first.',
            ]);
        }

        $fillable = array_filter($data, fn ($v) => $v !== null && $v !== '');
        $deployment->fill($fillable);
        $deployment->is_manually_overridden = true;
        $deployment->save();

        return $deployment->fresh('company');
    }

    /**
     * Admin override: update any deployment record regardless of ownership.
     * Always marks the record as manually overridden, and auto-confirms
     * pending deployments since an admin editing the record implies intent
     * to finalize it.
     */
    public function adminOverride(Deployment $deployment, array $data): Deployment
    {
        $fillable = array_filter($data, fn ($v) => $v !== null && $v !== '');
        $deployment->fill($fillable);
        $deployment->is_manually_overridden = true;

        if ($deployment->status !== 'confirmed') {
            $deployment->status = 'confirmed';
            $deployment->confirmed_at = now();
        }

        $deployment->save();

        return $deployment->fresh('company');
    }

    /**
     * Export all confirmed deployments to CSV string.
     */
    public function exportConfirmedCsv(): string
    {
        $deployments = Deployment::with(['user', 'company'])
            ->where('status', 'confirmed')
            ->orderBy('confirmed_at', 'desc')
            ->get();

        $output = fopen('php://temp', 'r+');

        fputcsv($output, [
            'Student ID',
            'Student Name',
            'Student Email',
            'Company Name',
            'Supervisor Name',
            'Supervisor Contact',
            'Start Date',
            'End Date',
            'Confirmed At',
        ], ',', '"', '\\');

        foreach ($deployments as $d) {
            $companyName = $d->company?->name ?? $d->company_name ?? 'N/A';

            fputcsv($output, [
                $d->user_id,
                $d->user?->name ?? 'N/A',
                $d->user?->email ?? 'N/A',
                $companyName,
                $d->supervisor_name ?? 'N/A',
                $d->supervisor_contact ?? 'N/A',
                $d->start_date ? $d->start_date->format('Y-m-d') : 'N/A',
                $d->end_date ? $d->end_date->format('Y-m-d') : 'N/A',
                $d->confirmed_at ? $d->confirmed_at->format('Y-m-d H:i:s') : 'N/A',
            ], ',', '"', '\\');
        }

        rewind($output);
        $csvContent = stream_get_contents($output);
        fclose($output);

        return $csvContent;
    }
}