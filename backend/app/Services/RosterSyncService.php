<?php

namespace App\Services;

use App\Models\Company;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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

    public function sync(bool $dryRun = false): array
    {
        $rows = $this->fetchRows();
        $students = User::where('role', 'normal')->get(['id', 'name', 'company_id']);

        $matched = [];
        $needsReview = [];
        $unmatched = [];
        $malformed = [];

        foreach ($rows as $row) {
            $sheetName = trim($row['NAME'] ?? '');
            $companyName = trim($row['COMPANY'] ?? '');
            $address = trim($row['ADDRESS'] ?? '');
            $contactPerson = trim($row['CONTACT PERSON'] ?? '');
            $contactNumber = trim($row['CONTACT DETAILS'] ?? '');

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
                if (!$dryRun) {
                    $company = $this->upsertCompany($companyName, $address, $contactPerson, $contactNumber);
                    $best->update(['company_id' => $company->id]);
                }
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
            'details' => compact('matched', 'needsReview', 'unmatched', 'malformed'),
        ];

        Log::info('Roster sync completed', $summary);

        return $summary;
    }

    private function fetchRows(): array
    {
        $response = Http::timeout(30)->get(self::SHEET_CSV_URL);
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
        $clean = preg_replace('/[^\p{L}\s]/u', ' ', $name);
        $clean = mb_strtolower(trim($clean));
        $tokens = preg_split('/\s+/', $clean, -1, PREG_SPLIT_NO_EMPTY);
        sort($tokens);
        return array_values(array_unique($tokens));
    }

    /**
     * Jaccard-style overlap: intersection size / union size.
     * 1.0 = identical token sets. 0.0 = no shared tokens.
     */
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
    private function upsertCompany(string $name, string $address, string $contactPerson, string $contactNumber): Company
    {
        $normalized = mb_strtolower(trim($name));
        $company = Company::whereRaw('LOWER(TRIM(name)) = ?', [$normalized])->first();

        if ($company) {
            $company->update([
                'address' => $address ?: $company->address,
                'contact_person' => $contactPerson ?: $company->contact_person,
                'contact_number' => $contactNumber ?: $company->contact_number,
            ]);
            return $company;
        }

        return Company::create([
            'name' => trim($name),
            'address' => $address,
            'contact_person' => $contactPerson,
            'contact_number' => $contactNumber,
        ]);
    }
}