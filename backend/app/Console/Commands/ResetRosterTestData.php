<?php
namespace App\Console\Commands;
use App\Models\Company;
use App\Models\Deployment;
use Illuminate\Console\Command;
class ResetRosterTestData extends Command
{
    protected $signature = 'roster:reset-test-data {--dry-run} {--companies}';
    protected $description = 'Clean up unlinked roster-sync deployment rows (and optionally zero-student companies) before dropping in a new test roster. Never touches linked/confirmed deployments.';
    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $includeCompanies = (bool) $this->option('companies');
        $unlinked = Deployment::whereNull('user_id')->get();
        $this->info("Unlinked deployment rows: {$unlinked->count()}");
        foreach ($unlinked as $row) {
            $this->line("  - [{$row->id}] {$row->sheet_name}");
        }
        if (!$dryRun && $unlinked->count() > 0) {
            Deployment::whereNull('user_id')->delete();
            $this->info('Deleted.');
        }
        if ($includeCompanies) {
            $linkedCompanyIds = Deployment::whereNotNull('user_id')
                ->whereNotNull('company_id')
                ->distinct()
                ->pluck('company_id');
            $emptyCompanies = Company::whereNotIn('id', $linkedCompanyIds)->get();
            $this->info("Companies with zero linked students: {$emptyCompanies->count()}");
            foreach ($emptyCompanies as $c) {
                $this->line("  - [{$c->id}] {$c->name}");
            }
            if (!$dryRun && $emptyCompanies->count() > 0) {
                Company::whereNotIn('id', $linkedCompanyIds)->delete();
                $this->info('Deleted.');
            }
        }
        if ($dryRun) {
            $this->comment('Dry run — nothing was deleted.');
        }
        return self::SUCCESS;
    }
}