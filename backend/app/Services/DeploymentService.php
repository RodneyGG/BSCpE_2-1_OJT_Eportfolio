<?php
namespace App\Services;
use App\Models\ActivityLog;
use App\Models\Deployment;
use App\Models\DeploymentMatchConflict;
use App\Models\User;
use App\Support\NameMatcher;
use Illuminate\Validation\ValidationException;
class DeploymentService
{
    /**
     * Retrieve the user's deployment record.
     *
     * Auto-detection fallback: if the user has no deployment yet, look for
     * unlinked roster-sync rows (created by RosterSyncService for sheet rows
     * it couldn't confidently match to an account) whose sheet_name is an
     * EXACT token-set match against the user's name — stricter than the
     * subset-containment matching RosterSyncService itself uses, since this
     * runs unsupervised on every login with no admin reviewing it in the
     * moment. If more than one unlinked row matches, link NONE of them —
     * ambiguity is flagged for admin review instead of guessed at.
     */
    public function getForUser(User $user): ?Deployment
    {
        $deployment = Deployment::where('user_id', $user->id)
            ->with('company')
            ->orderByRaw("status = 'confirmed' desc")
            ->latest('id')
            ->first();
        if ($deployment) {
            return $deployment;
        }
        if (!$user->name) {
            return null;
        }
        $userTokens = NameMatcher::tokenize($user->name);
        $candidates = Deployment::whereNull('user_id')
            ->whereNotNull('sheet_name')
            ->get();
        $matches = $candidates->filter(
            fn (Deployment $candidate) => NameMatcher::tokenize($candidate->sheet_name) === $userTokens
        );
        if ($matches->count() === 1) {
            $unlinked = $matches->first();
            $unlinked->user_id = $user->id;
            $unlinked->save();
            return $unlinked->load('company');
        }
        if ($matches->count() > 1) {
            $this->flagMatchConflict($user, $matches->pluck('id')->all());
        }
        return null;
    }
    /**
     * Records (or refreshes) an unresolved ambiguous-match conflict for an
     * admin to resolve manually. Idempotent per user — re-running login
     * matching while a conflict is still unresolved updates the candidate
     * list rather than creating duplicate conflict rows.
     */
    private function flagMatchConflict(User $user, array $deploymentIds): void
    {
        $existing = DeploymentMatchConflict::where('user_id', $user->id)
            ->whereNull('resolved_at')
            ->first();
        if ($existing) {
            $existing->update(['candidate_deployment_ids' => $deploymentIds]);
            return;
        }
        DeploymentMatchConflict::create([
            'user_id' => $user->id,
            'candidate_deployment_ids' => $deploymentIds,
        ]);
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

        // Dual-write: mirror the resolved company onto the flat user column
        // so consumers still reading it directly (landing page company list,
        // updateAddress authorization, admin user views) see the same
        // company a student just confirmed, without waiting on a roster sync.
        $user->update(['company_id' => $deployment->company_id]);

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
     * Student override: like adminOverride(), but ownership-scoped to the
     * student's own deployment, and additionally resolves a free-text
     * company_name into a company_id (find-or-create, case-insensitive)
     * since students correct their company by typing it rather than
     * picking an ID directly. Once a student overrides, the record is
     * locked (is_manually_overridden = true, status = confirmed) against
     * all future roster-sync writes — same protection adminOverride()
     * already relies on.
     */
    public function studentOverride(Deployment $deployment, User $user, array $data): Deployment
    {
        if ($deployment->user_id !== $user->id) {
            throw ValidationException::withMessages([
                'deployment' => 'You may only override your own deployment.',
            ]);
        }
        // A picked company_id (exact DB match from the dropdown) always wins
        // over free-text company_name (the "not listed, add new" path) —
        // avoids re-resolving a name that's already a known record.
        $companyId = $data['company_id'] ?? null;
        $companyName = trim($data['company_name'] ?? '');
        unset($data['company_id'], $data['company_name']);
        $fillable = array_filter($data, fn ($v) => $v !== null && $v !== '');
        if ($companyId) {
            $fillable['company_id'] = $companyId;
        } elseif ($companyName !== '') {
            $fillable['company_id'] = $this->resolveCompanyByName($companyName)->id;
        }
        $changedFields = $this->diffChangedFields($deployment, $fillable);
        $deployment->fill($fillable);
        $deployment->is_manually_overridden = true;
        $deployment->status = 'confirmed';
        $deployment->confirmed_at = now();
        $deployment->confirmed_by = $user->id;
        $deployment->save();

        // Dual-write: same mirroring as confirm() — keep the flat column
        // in step with whatever the student just picked or typed in.
        $user->update(['company_id' => $deployment->company_id]);

        if (!empty($changedFields)) {
            ActivityLog::create([
                'actor_id' => $user->id,
                'action' => 'deployment_manual_override',
                'target_id' => $user->id,
                'metadata' => [
                    'deployment_id' => $deployment->id,
                    'fields' => $changedFields,
                ],
            ]);
        }
        return $deployment->fresh('company');
    }
    /**
     * Compares each field about to be written against the deployment's
     * current value, so ActivityLog only records fields that actually
     * changed — re-saving identical values (e.g. re-confirming an
     * already-correct record) shouldn't produce a log entry.
     */
    private function diffChangedFields(Deployment $deployment, array $fillable): array
    {
        $changed = [];
        foreach ($fillable as $field => $newValue) {
            $oldValue = $deployment->{$field};
            if ($oldValue instanceof \Carbon\Carbon) {
                $oldValue = $oldValue->toDateString();
            }
            $oldComparable = $oldValue === null ? null : (string) $oldValue;
            $newComparable = (string) $newValue;
            if ($oldComparable !== $newComparable) {
                $changed[] = $field;
            }
        }
        return $changed;
    }
    /**
     * Case-insensitive find-or-create lookup for a company by name, used
     * when a student types in a company correction rather than picking
     * from an existing record. Mirrors RosterSyncService::upsertCompany()'s
     * lookup logic, but only sets the name on creation — a student
     * shouldn't be able to set address/contact fields via free text here.
     */
    private function resolveCompanyByName(string $name): \App\Models\Company
    {
        $normalized = mb_strtolower(trim($name));
        $company = \App\Models\Company::whereRaw('LOWER(TRIM(name)) = ?', [$normalized])->first();
        return $company ?? \App\Models\Company::create(['name' => trim($name)]);
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
            $companyName = $d->company?->name ?? 'N/A';

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