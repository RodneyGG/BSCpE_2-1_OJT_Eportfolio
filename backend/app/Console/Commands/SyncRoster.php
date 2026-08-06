<?php

namespace App\Console\Commands;

use App\Services\RosterSyncService;
use Illuminate\Console\Command;


class SyncRoster extends Command
{
    protected $signature = 'roster:sync {--dry-run : Preview matches without writing to the database}';
    protected $description = 'Sync the OJT roster Google Sheet into companies and student assignments';

    public function handle(RosterSyncService $service): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $this->info($dryRun ? 'Dry run — no changes will be saved.' : 'Syncing roster from Google Sheet...');

        $summary = $service->sync($dryRun);
        $this->info("Matched: {$summary['matched']}");
        $this->warn("Needs review: {$summary['needs_review']}");
        $this->warn("Unmatched: {$summary['unmatched']}");
        $this->comment("Malformed/skipped rows: {$summary['malformed']}");
        $this->info("Deployments proposed: {$summary['deployments_proposed']}");
        $this->info("Deployments updated: {$summary['deployments_updated']}");
        $this->warn("Deployments mismatched (see ActivityLog): {$summary['deployments_mismatched']}");

        foreach ($summary['details']['needsReview'] as $item) {
            $this->line("  - Sheet: \"{$item['sheet_name']}\" ~ closest account: \"{$item['closest_match']}\" (score {$item['score']}) for company \"{$item['company']}\"");
        }
        foreach ($summary['details']['unmatched'] as $item) {
            $this->line("  - Sheet: \"{$item['sheet_name']}\" — no matching account found (company \"{$item['company']}\")");
        }
        foreach ($summary['details']['malformed'] as $item) {
            $this->line("  - Skipped malformed row: name=\"{$item['sheet_name']}\" company=\"{$item['company']}\"");
        }
        foreach ($summary['details']['deploymentsProposed'] as $item) {
            $this->line("  - Proposed deployment: {$item['student']} -> {$item['company']}");
        }
        foreach ($summary['details']['deploymentsMismatched'] as $item) {
            $fields = implode(', ', $item['fields']);
            $this->line("  - MISMATCH vs confirmed deployment: {$item['student']} (fields: {$fields})");
        }
        return self::SUCCESS;
    }
}

use App\Console\Commands\SyncRoster;
use Illuminate\Support\Facades\Schedule;

Schedule::command('roster:sync')->dailyAt('02:00');