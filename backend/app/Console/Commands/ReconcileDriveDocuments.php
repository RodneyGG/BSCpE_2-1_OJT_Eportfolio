<?php

namespace App\Console\Commands;

use App\Services\DriveReconciliationService;
use Illuminate\Console\Command;

class ReconcileDriveDocuments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'drive:reconcile {--dry-run : Preview what would be reconstructed without creating any DB rows}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reconstruct documents table records from files already in Google Drive. Useful after a database wipe to recover submission history.';

    public function handle(DriveReconciliationService $service): int
    {
        $dryRun = $this->option('dry-run');

        if ($dryRun) {
            $this->info('🔍 DRY RUN — no database records will be created.');
            $this->newLine();
        } else {
            $this->info('🔄 Reconciling Google Drive with documents table...');
            $this->newLine();
        }

        try {
            $result = $service->reconcile($dryRun);
        } catch (\Exception $e) {
            $this->error('❌ Reconciliation failed: ' . $e->getMessage());
            $this->newLine();
            $this->line($e->getTraceAsString());
            return Command::FAILURE;
        }

        if (isset($result['error'])) {
            $this->error('❌ ' . $result['error']);
            return Command::FAILURE;
        }

        // --- Summary ---
        $this->info('📊 Summary:');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Student folders scanned', $result['folders_scanned']],
                ['Folders matched to users', $result['folders_matched']],
                ['Users recreated from folders', $result['users_recreated'] ?? 0],
                ['Unmatched folders', count($result['folders_unmatched'])],
                ['Drive files found', $result['files_found']],
                ['Already tracked in DB', $result['files_already_tracked']],
                [$dryRun ? 'Would reconstruct' : 'Reconstructed', $result['files_reconstructed']],
                ['Unparseable filenames', count($result['files_unparseable'])],
            ]
        );

        // --- Unmatched folders ---
        if (!empty($result['folders_unmatched'])) {
            $this->newLine();
            $this->warn('⚠️  Unmatched folders (no user account found):');
            foreach ($result['folders_unmatched'] as $folder) {
                $this->line("   • {$folder}");
            }
        }

        // --- Unparseable files ---
        if (!empty($result['files_unparseable'])) {
            $this->newLine();
            $this->warn('⚠️  Unparseable filenames (could not extract document type):');
            foreach ($result['files_unparseable'] as $file) {
                $this->line("   • {$file['folder']}/{$file['filename']}");
            }
        }

        // --- Reconstruction details ---
        if (!empty($result['details'])) {
            $this->newLine();
            $label = $dryRun ? '📋 Records that WOULD be created:' : '✅ Records created:';
            $this->info($label);
            $this->table(
                ['User', 'Email', 'Document Type', 'Week', 'Filename'],
                array_map(fn($d) => [
                    $d['user'],
                    $d['email'],
                    $d['document_type'],
                    $d['week'] ?? '—',
                    $d['filename'],
                ], $result['details'])
            );
        }

        if ($dryRun && $result['files_reconstructed'] > 0) {
            $this->newLine();
            $this->info("💡 Run without --dry-run to create these records:");
            $this->line("   php artisan drive:reconcile");
        }

        if (!$dryRun && $result['files_reconstructed'] > 0) {
            $this->newLine();
            $this->info("✅ Done. {$result['files_reconstructed']} document(s) are now in the pending review queue for teachers to re-approve.");
        }

        if ($result['files_reconstructed'] === 0 && $result['files_found'] > 0) {
            $this->newLine();
            $this->info('ℹ️  All Drive files are already tracked in the database. Nothing to reconstruct.');
        }

        if ($result['files_found'] === 0) {
            $this->newLine();
            $this->warn('⚠️  No files found in any student folder. The Drive root folder may be empty or the API credentials may not have access.');
        }

        return Command::SUCCESS;
    }
}
