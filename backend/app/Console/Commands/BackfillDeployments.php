<?php

namespace App\Console\Commands;

use App\Models\Deployment;
use App\Models\User;
use Illuminate\Console\Command;

class BackfillDeployments extends Command
{
    protected $signature = 'deployments:backfill {--dry-run}';

    protected $description = 'One-time backfill: create confirmed Deployment rows from legacy users.company_id/ojt_role/ojt_supervisor for users who have no Deployment row yet.';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        if ($dryRun) {
            $this->info('Dry run — no changes will be saved.');
        }

        $candidates = User::query()
            ->whereNotNull('company_id')
            ->whereDoesntHave('deployments')
            ->get();

        $created = 0;

        foreach ($candidates as $user) {
            $this->line("Backfilling: {$user->name} -> company_id {$user->company_id}");

            if (!$dryRun) {
                Deployment::create([
                    'user_id' => $user->id,
                    'company_id' => $user->company_id,
                    'role' => $user->ojt_role,
                    'supervisor_name' => $user->ojt_supervisor,
                    'supervisor_contact' => null,
                    'start_date' => null,
                    'end_date' => null,
                    'source' => 'legacy_backfill',
                    'status' => 'confirmed',
                    'detected_at' => null,
                    'confirmed_at' => now(),
                    'confirmed_by' => null,
                ]);
            }

            $created++;
        }

        $skippedCount = User::query()
            ->whereNotNull('company_id')
            ->whereHas('deployments')
            ->count();

        $this->newLine();
        $this->info("Users with company_id: " . ($created + $skippedCount));
        $this->info("Backfilled: {$created}");
        $this->info("Skipped (already had a deployment row): {$skippedCount}");

        return self::SUCCESS;
    }
}