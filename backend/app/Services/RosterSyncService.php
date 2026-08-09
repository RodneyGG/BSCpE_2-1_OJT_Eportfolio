<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\AppSetting;
use App\Models\Company;
use App\Models\Deployment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Support\NameMatcher;

class RosterSyncService
{
    private const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1HBMBB_iiSiafg0cdC9FdX7fbWuOlF-H1/export?format=csv&gid=1689766637';

    /**
     * Overlap score >= this is treated as an auto-match. 1.0 means every token
     * in the SMALLER of the two names (usually the account, "First Last") is
     * present in the sheet's fuller "Last, First Middle Initial" name.
     */
    private const AUTO_MATCH_THRESHOLD = 1.0;

    /**
     * Overlap score >= this (but below auto-match) is surfaced as "needs review"
     * rather than silently skipped.
     */
    private const REVIEW_THRESHOLD = 0.5;

    /** Account name must contribute at least this many tokens to count as a match. */
    private const MIN_TOKENS_FOR_MATCH = 2;

    /**
     * $actorId is the admin who triggered this run (from the "Sync Companies"
     * button). Left null for CLI/cron runs, which have no authenticated user —
     * activity_logs.actor_id is nullable specifically to allow this, and the
     * frontend renders a null actor as "System".
     */
    public function sync(bool $dryRun = false, ?int $actorId = null): array
    {
        $rows = $this->fetchRows();
        $students = User::where('role', 'normal')->get(['id', 'name', 'company_id']);

        $matched = [];
        $needsReview = [];
        $unmatched = [];
        $malformed = [];
        $deploymentsProposed = [];
        $deploymentsUpdated = [];
        $deploymentsMismatched = [];

        foreach ($rows as $row) {
            $sheetName = trim($row['NAME'] ?? '');
            $companyName = trim($row['COMPANY'] ?? '');
            $address = trim($row['ADDRESS'] ?? '');
            $contactPerson = trim($row['CONTACT PERSON'] ?? '');
            $contactNumber = trim($row['CONTACT DETAILS'] ?? '');
            $startDateRaw = trim($row['DATE STARTED'] ?? '');
            $endDateRaw = trim($row['EXPECTED DATE TO END'] ?? '');

            if ($sheetName === '' || $companyName === '') {
                continue;
            }

            $sheetTokens = $this->tokenize($sheetName);

            if (count($sheetTokens) < self::MIN_TOKENS_FOR_MATCH || $this->looksLikeJunkRow($companyName)) {
                $malformed[] = ['sheet_name' => $sheetName, 'company' => $companyName];
                continue;
            }

            $best = null;
            $bestScore = 0.0;
            foreach ($students as $student) {
                $score = $this->tokenOverlapScore($sheetTokens, $this->tokenize($student->name));
                if ($score > $bestScore) {
                    $bestScore = $score;
                    $best = $student;
                }
            }

            if ($best && $bestScore >= self::AUTO_MATCH_THRESHOLD) {
                $company = $this->upsertCompany($companyName, $address, $contactPerson, $contactNumber, $dryRun);

                // Dual-write: keep the old flat column working until the rest
                // of the app (CompanySection, ManageUsersSection) is migrated
                // onto the deployments table. Skipped once the student has
                // confirmed/overridden their deployment — same immunity
                // reconcileDeployment() already grants the deployment record
                // itself, extended here so the flat column can't silently
                // drift back out from under a confirmed choice.
                $existingDeployment = Deployment::where('user_id', $best->id)->orderByDesc('id')->first();
                $isConfirmed = $existingDeployment && $existingDeployment->status === 'confirmed';
                if (!$dryRun && !$isConfirmed) {
                    $best->update(['company_id' => $company?->id]);
                }

                $startDate = $this->parseSheetDate($startDateRaw);
                $endDate = $this->parseSheetDate($endDateRaw);

                $deploymentResult = $this->reconcileDeployment(
                    student: $best,
                    company: $company,
                    supervisorName: $contactPerson,
                    supervisorContact: $contactNumber,
                    startDate: $startDate,
                    endDate: $endDate,
                    dryRun: $dryRun,
                    actorId: $actorId,
                );

                match ($deploymentResult['outcome']) {
                    'proposed' => $deploymentsProposed[] = $deploymentResult,
                    'updated' => $deploymentsUpdated[] = $deploymentResult,
                    'mismatch' => $deploymentsMismatched[] = $deploymentResult,
                    default => null,
                };

                $matched[] = [
                    'sheet_name' => $sheetName,
                    'matched_user' => $best->name,
                    'company' => $companyName,
                ];
            } elseif ($best && $bestScore >= self::REVIEW_THRESHOLD) {
                $needsReview[] = [
                    'sheet_name' => $sheetName,
                    'closest_match' => $best->name,
                    'score' => round($bestScore, 2),
                    'company' => $companyName,
                ];
            } else {
                $company = $this->upsertCompany($companyName, $address, $contactPerson, $contactNumber, $dryRun);
                $startDate = $this->parseSheetDate($startDateRaw);
                $endDate = $this->parseSheetDate($endDateRaw);
                $this->reconcileUnlinkedDeployment(
                    sheetName: $sheetName,
                    company: $company,
                    supervisorName: $contactPerson,
                    supervisorContact: $contactNumber,
                    startDate: $startDate,
                    endDate: $endDate,
                    dryRun: $dryRun,
                );
                $unmatched[] = [
                    'sheet_name' => $sheetName,
                    'company' => $companyName,
                ];
            }
        }

        $summary = [
            'dry_run' => $dryRun,
            'matched' => count($matched),
            'needs_review' => count($needsReview),
            'unmatched' => count($unmatched),
            'malformed' => count($malformed),
            'deployments_proposed' => count($deploymentsProposed),
            'deployments_updated' => count($deploymentsUpdated),
            'deployments_mismatched' => count($deploymentsMismatched),
            'details' => compact(
                'matched',
                'needsReview',
                'unmatched',
                'malformed',
                'deploymentsProposed',
                'deploymentsUpdated',
                'deploymentsMismatched',
            ),
        ];

        Log::info('Roster sync completed', $summary);

        return $summary;
    }

    /**
     * Decides what to do with a matched student's deployment record and
     * (outside dry-run) does it. Never overwrites a confirmed deployment —
     * disagreements against a confirmed row are reported via ActivityLog
     * instead, so a human resolves them deliberately.
     */
    private function reconcileDeployment(
        User $student,
        ?Company $company,
        string $supervisorName,
        string $supervisorContact,
        ?Carbon $startDate,
        ?Carbon $endDate,
        bool $dryRun,
        ?int $actorId,
    ): array {
        $existing = Deployment::where('user_id', $student->id)->orderByDesc('id')->first();

        $proposedAttributes = [
            'user_id' => $student->id,
            'company_id' => $company?->id,
            'supervisor_name' => $supervisorName ?: null,
            'supervisor_contact' => $supervisorContact ?: null,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'source' => 'roster_sync_detected',
            'status' => 'pending_confirmation',
            'detected_at' => now(),
        ];

        if (!$existing) {
            if (!$dryRun) {
                Deployment::create($proposedAttributes);
            }

            return [
                'outcome' => 'proposed',
                'student' => $student->name,
                'company' => $company?->name,
            ];
        }

        if ($existing->status === 'pending_confirmation' && $existing->source === 'roster_sync_detected') {
            if (!$dryRun) {
                $existing->update($proposedAttributes);
            }

            return [
                'outcome' => 'updated',
                'student' => $student->name,
                'company' => $company?->name,
            ];
        }

        if ($existing->status === 'pending_confirmation' && $existing->source === 'manual') {
            // A student/admin is already mid-entry on a manual deployment —
            // don't clobber it with a sheet guess.
            return [
                'outcome' => 'left_manual_pending_untouched',
                'student' => $student->name,
            ];
        }

        // status === 'confirmed': never overwrite. Flag disagreements instead.
        $diffs = $this->diffAgainstConfirmed($existing, $company, $supervisorName, $supervisorContact, $startDate, $endDate);

        if (empty($diffs)) {
            return [
                'outcome' => 'confirmed_matches',
                'student' => $student->name,
            ];
        }

        if (!$dryRun) {
            ActivityLog::create([
                'actor_id' => $actorId,
                'action' => 'deployment_sheet_mismatch',
                'target_id' => $student->id,
                'metadata' => [
                    'deployment_id' => $existing->id,
                    'fields' => $diffs,
                ],
            ]);
        }

        return [
            'outcome' => 'mismatch',
            'student' => $student->name,
            'fields' => array_keys($diffs),
        ];
    }
    /**
     * Mirrors reconcileDeployment() but for sheet rows with no confident
     * account match. Persists (or refreshes) an unlinked (`user_id = null`)
     * deployment row keyed by `sheet_name`, so login-time auto-detection has
     * something to match against later. Idempotent across re-syncs, and
     * never overwrites a confirmed row or a manual pending row — mirrors the
     * same protections reconcileDeployment() applies to matched students.
     */
    private function reconcileUnlinkedDeployment(
        string $sheetName,
        ?Company $company,
        string $supervisorName,
        string $supervisorContact,
        ?Carbon $startDate,
        ?Carbon $endDate,
        bool $dryRun,
    ): void {
        $existing = Deployment::where('sheet_name', $sheetName)->orderByDesc('id')->first();
        $proposedAttributes = [
            'user_id' => null,
            'company_id' => $company?->id,
            'sheet_name' => $sheetName,
            'supervisor_name' => $supervisorName ?: null,
            'supervisor_contact' => $supervisorContact ?: null,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'source' => 'roster_sync_detected',
            'status' => 'pending_confirmation',
            'detected_at' => now(),
        ];
        if (!$existing) {
            if (!$dryRun) {
                Deployment::create($proposedAttributes);
            }
            return;
        }
        if ($existing->status === 'pending_confirmation' && $existing->source === 'roster_sync_detected') {
            if (!$dryRun) {
                $existing->update($proposedAttributes);
            }
            return;
        }
        // status === 'confirmed', or pending_confirmation with source === 'manual':
        // a human already claimed/locked this record — leave it untouched.
    }
    /**
     * Compares a confirmed deployment's stored values against what the sheet
     * currently says. Returns only the fields that actually differ, each as
     * ['old' => ..., 'new' => ...], keyed by field name.
     */
    private function diffAgainstConfirmed(
        Deployment $existing,
        ?Company $company,
        string $supervisorName,
        string $supervisorContact,
        ?Carbon $startDate,
        ?Carbon $endDate,
    ): array {
        $diffs = [];

        if ($existing->company_id !== null && $company?->id !== null && $existing->company_id !== $company?->id) {
            $diffs['company_id'] = ['old' => $existing->company_id, 'new' => $company?->id];
        }

        $normalizedSupervisorName = $supervisorName ?: null;
        if ($existing->supervisor_name !== null && $normalizedSupervisorName !== null && $existing->supervisor_name !== $normalizedSupervisorName) {
            $diffs['supervisor_name'] = ['old' => $existing->supervisor_name, 'new' => $normalizedSupervisorName];
        }

        $normalizedSupervisorContact = $supervisorContact ?: null;
        if ($existing->supervisor_contact !== null && $normalizedSupervisorContact !== null && $existing->supervisor_contact !== $normalizedSupervisorContact) {
            $diffs['supervisor_contact'] = ['old' => $existing->supervisor_contact, 'new' => $normalizedSupervisorContact];
        }

        $existingStart = $existing->start_date?->toDateString();
        $newStart = $startDate?->toDateString();
        if ($existingStart !== null && $newStart !== null && $existingStart !== $newStart) {
            $diffs['start_date'] = ['old' => $existingStart, 'new' => $newStart];
        }

        $existingEnd = $existing->end_date?->toDateString();
        $newEnd = $endDate?->toDateString();
        if ($existingEnd !== null && $newEnd !== null && $existingEnd !== $newEnd) {
            $diffs['end_date'] = ['old' => $existingEnd, 'new' => $newEnd];
        }

        return $diffs;
    }

    /**
     * The sheet's date columns are free-text and inconsistently formatted.
     * Unparseable values become null rather than throwing — a bad date
     * shouldn't block the rest of the row from syncing.
     */
    private function parseSheetDate(string $value): ?Carbon
    {
        if ($value === '') {
            return null;
        }

        try {
            return Carbon::parse($value);
        } catch (\Throwable) {
            return null;
        }
    }

    private function fetchRows(): array
    {
        $sheetUrl = AppSetting::get('roster_sheet_url', self::SHEET_CSV_URL);

        $response = Http::timeout(30)->get($sheetUrl);
        $response->throw();

        // Use a real CSV stream reader (fgetcsv) rather than splitting on
        // newlines first — quoted fields (e.g. multi-line addresses) can
        // legitimately contain embedded newlines, and splitting the raw body
        // by line before parsing corrupts those rows and shifts every
        // column after them.
        $stream = fopen('php://temp', 'r+');
        fwrite($stream, $response->body());
        rewind($stream);

        $header = null;
        $rows = [];
        while (($cols = fgetcsv($stream)) !== false) {
            if ($cols === [null] || $cols === false) {
                continue;
            }
            if ($header === null) {
                $header = array_map(fn($h) => strtoupper(trim((string) $h)), $cols);
                continue;
            }
            if (count(array_filter($cols, fn($c) => trim((string) $c) !== '')) === 0) {
                continue;
            }
            $row = [];
            foreach ($header as $i => $key) {
                $row[$key] = trim((string) ($cols[$i] ?? ''));
            }
            $rows[] = $row;
        }

        fclose($stream);

        return $rows;
    }

    /**
     * Normalize a name into a sorted, deduplicated set of lowercase word tokens,
     * so "Almanza, Juan Rafael S." and "Juan Rafael Almanza" compare equal.
     */
    private function tokenize(string $name): array
    {
        return NameMatcher::tokenize($name);
    }

    /**
     * Overlap coefficient: intersection size / size of the SMALLER set.
     * Unlike Jaccard, this doesn't penalize the sheet name for having extra
     * middle-name tokens the account doesn't store — if every token an account
     * has is present in the sheet name, that's a full match.
     */
    private function tokenOverlapScore(array $a, array $b): float
    {
        if (count($a) < self::MIN_TOKENS_FOR_MATCH || count($b) < self::MIN_TOKENS_FOR_MATCH) {
            return 0.0;
        }
        $intersection = array_intersect($a, $b);
        $smaller = min(count($a), count($b));
        return $smaller === 0 ? 0.0 : count($intersection) / $smaller;
    }

    /**
     * Rejects rows where the "company" cell is clearly not a company name —
     * a bare phone number, a lone floor/building fragment, or a year — which
     * happens when merged cells or stray annotation rows get misaligned on export.
     */
    private function looksLikeJunkRow(string $companyName): bool
    {
        $stripped = preg_replace('/[^\p{L}\p{N}]/u', '', $companyName);
        if ($stripped === '') {
            return true;
        }
        // Mostly digits (phone numbers, bare years) -> junk.
        if (preg_match('/^\d+$/', $stripped) && strlen($stripped) >= 3) {
            return true;
        }
        // Very short, no letters -> junk (e.g. "5F" as a company name context).
        if (mb_strlen($companyName) <= 3 && !preg_match('/\p{L}{3,}/u', $companyName)) {
            return true;
        }
        return false;
    }

    /**
     * In dry-run mode, returns an unsaved (unpersisted) Company instance so
     * downstream code can still read its ->name for reporting purposes,
     * without touching the database.
     */
    private function upsertCompany(string $name, string $address, string $contactPerson, string $contactNumber, bool $dryRun): ?Company
    {
        $normalized = mb_strtolower(trim($name));
        $company = Company::whereRaw('LOWER(TRIM(name)) = ?', [$normalized])->first();

        if ($company) {
            if (!$dryRun) {
                $company->update([
                    'address' => $address ?: $company->address,
                    'contact_person' => $contactPerson ?: $company->contact_person,
                    'contact_number' => $contactNumber ?: $company->contact_number,
                ]);
            }
            return $company;
        }

        if ($dryRun) {
            return new Company(['name' => trim($name)]);
        }

        return Company::create([
            'name' => trim($name),
            'address' => $address,
            'contact_person' => $contactPerson,
            'contact_number' => $contactNumber,
        ]);
    }
}