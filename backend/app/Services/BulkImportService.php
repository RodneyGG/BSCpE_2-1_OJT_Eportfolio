<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BulkImportService
{
    /**
     * Preview endpoint logic: accepts dynamic sheet URL, parses, validates,
     * and returns structured valid/error lists without mutating DB state.
     */
    public function preview(?string $sheetUrl = null): array
    {
        return $this->parseAndValidate($sheetUrl);
    }

    /**
     * Commit endpoint logic: accepts dynamic sheet URL or provided students array.
     */
    public function commit(int $actorId, ?string $sheetUrl = null): array
    {
        $analysis = $this->parseAndValidate($sheetUrl);
        $userService = new UserService();

        $created = [];
        $skipped = $analysis['errors'];

        foreach ($analysis['valid'] as $row) {
            try {
                $user = $userService->createStudentAccount($row['name'], $row['email'], $actorId);
                $created[] = [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'row' => $row['row_num'],
                ];
            } catch (\Throwable $e) {
                Log::error('Bulk import account creation failed for row', [
                    'row' => $row['row_num'],
                    'email' => $row['email'],
                    'error' => $e->getMessage(),
                ]);

                $skipped[] = [
                    'row_num' => $row['row_num'],
                    'name' => $row['name'],
                    'email' => $row['email'],
                    'reason' => 'Database error: ' . $e->getMessage(),
                ];
            }
        }

        return [
            'created' => $created,
            'skipped' => $skipped,
            'summary' => [
                'total_processed' => count($analysis['valid']) + count($analysis['errors']),
                'created_count' => count($created),
                'skipped_count' => count($skipped),
            ],
        ];
    }

    /**
     * Single source of truth for row parsing and validation.
     */
    private function parseAndValidate(?string $sheetUrl = null): array
    {
        $rows = $this->fetchRows($sheetUrl);
        $existingEmails = User::pluck('email')->map(fn($e) => mb_strtolower($e))->toArray();

        $valid = [];
        $errors = [];
        $seenSheetEmails = [];

        foreach ($rows as $index => $row) {
            $rowNum = $index + 2; // Line 1 is header row

            // Flexible header matching (supports EMAIL, EMAIL ADDRESS, NAME, FULL NAME)
            $emailKey = $this->findHeaderKey($row, ['EMAIL', 'EMAIL ADDRESS']);
            $nameKey = $this->findHeaderKey($row, ['NAME', 'FULL NAME', 'FULL NAME (SURNAME, FIRST NAME M.I.)']);

            $email = mb_strtolower(trim($row[$emailKey] ?? ''));
            $name = trim($row[$nameKey] ?? '');

            if ($name === '' && $email === '') {
                continue; // Ignore trailing empty rows
            }

            if ($name === '') {
                $errors[] = [
                    'row_num' => $rowNum,
                    'name' => $name,
                    'email' => $email,
                    'reason' => 'Missing student full name',
                ];
                continue;
            }

            if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
                $errors[] = [
                    'row_num' => $rowNum,
                    'name' => $name,
                    'email' => $email,
                    'reason' => 'Invalid or missing email address',
                ];
                continue;
            }

            if (in_array($email, $existingEmails, true)) {
                $errors[] = [
                    'row_num' => $rowNum,
                    'name' => $name,
                    'email' => $email,
                    'reason' => 'Account with this email already exists',
                ];
                continue;
            }

            if (in_array($email, $seenSheetEmails, true)) {
                $errors[] = [
                    'row_num' => $rowNum,
                    'name' => $name,
                    'email' => $email,
                    'reason' => 'Duplicate email found within this Google Sheet',
                ];
                continue;
            }

            $seenSheetEmails[] = $email;
            $valid[] = [
                'row_num' => $rowNum,
                'name' => $name,
                'email' => $email,
            ];
        }

        return [
            'valid' => $valid,
            'errors' => $errors,
            'summary' => [
                'total_rows' => count($valid) + count($errors),
                'valid_count' => count($valid),
                'error_count' => count($errors),
            ],
        ];
    }

    /**
     * Converts any Google Sheet share link into a direct CSV export link
     * and fetches the stream.
     */
    private function fetchRows(?string $sheetUrl = null): array
    {
        if (empty($sheetUrl)) {
            throw new \InvalidArgumentException('Google Sheet URL must be provided.');
        }

        // Convert view/edit URL to CSV export format
        if (str_contains($sheetUrl, '/edit')) {
            $csvUrl = preg_replace('/\/edit.*$/', '/export?format=csv', $sheetUrl);
        } elseif (!str_contains($sheetUrl, '/export?format=csv')) {
            $csvUrl = rtrim($sheetUrl, '/') . '/export?format=csv';
        } else {
            $csvUrl = $sheetUrl;
        }

        $response = Http::timeout(30)->get($csvUrl);
        $response->throw();

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
     * Helper to search row array keys for matching header options
     */
    private function findHeaderKey(array $row, array $possibleHeaders): string
    {
        foreach ($possibleHeaders as $possible) {
            foreach (array_keys($row) as $key) {
                if (str_contains($key, $possible)) {
                    return $key;
                }
            }
        }
        return $possibleHeaders[0];
    }
}