<?php

namespace App\Services;

use Spatie\PdfToText\Pdf;

class WeeklyReportExtractor
{
    /**
     * Extract week number + day-by-day activities from a student's
     * Weekly Report PDF, based on the official docx template layout:
     * a "Week N" heading, then a Day | Activities table (one row per
     * day), ending at a signature block.
     *
     * @return array{status: string, week_number: int|null, days: array<array{date: string, activities: string}>}
     */
    public function extract(string $pdfPath): array
    {
        try {
            $text = (new Pdf())
                ->setPdf($pdfPath)
                ->setOptions(['layout'])
                ->text();
        } catch (\Throwable $e) {
            return [
                'status' => 'failed',
                'week_number' => null,
                'days' => [],
            ];
        }

        if (trim($text) === '') {
            return [
                'status' => 'failed',
                'week_number' => null,
                'days' => [],
            ];
        }

        // Week number: literal "Week 3" (or "Week: 3", "Week - 3") heading.
        $weekNumber = null;
        if (preg_match('/Week\s*[:\-]?\s*(\d+)/i', $text, $weekMatch)) {
            $weekNumber = (int) $weekMatch[1];
        }

        $lines = preg_split('/\r\n|\r|\n/', $text);

        // Signature block markers — adjust this list once we confirm the
        // template's actual wording against a real filled-in PDF.
        $stopPattern = '/^\s*(Prepared\s+by|Noted\s+by|Submitted\s+by|Approved\s+by|Signature)/i';

        // Date at the start of a row, e.g. "Aug 10, 2026" or "August 10, 2026".
        $datePattern = '/^\s*([A-Za-z]+\.?\s+\d{1,2},?\s+\d{4})\s*(.*)$/';

        $days = [];
        $currentDate = null;
        $currentActivity = '';

        $flush = function () use (&$days, &$currentDate, &$currentActivity) {
            if ($currentDate !== null) {
                $activity = trim(preg_replace('/\s+/', ' ', $currentActivity));
                if ($activity !== '') {
                    $days[] = [
                        'date' => $currentDate,
                        'activities' => $activity,
                    ];
                }
            }
        };

        foreach ($lines as $line) {
            if (trim($line) === '') {
                continue;
            }

            if (preg_match($stopPattern, $line)) {
                break;
            }

            if (preg_match($datePattern, $line, $rowMatch)) {
                // New day row found — flush the previous day first.
                $flush();
                $currentDate = trim($rowMatch[1]);
                $currentActivity = $this->stripBullet($rowMatch[2]);
                continue;
            }

            // Continuation line for the current day's activities (wrapped text).
            if ($currentDate !== null) {
                $currentActivity .= ' ' . $this->stripBullet($line);
            }
        }
        $flush();

        if (empty($days)) {
            return [
                'status' => 'failed',
                'week_number' => $weekNumber,
                'days' => [],
            ];
        }

        return [
            'status' => 'success',
            'week_number' => $weekNumber,
            'days' => $days,
        ];
    }

    /**
     * Strip a leading bullet character (•, -, *) and surrounding whitespace
     * from a line, since activities may be written as bulleted or plain text.
     */
    private function stripBullet(string $line): string
    {
        return preg_replace('/^[\s\x{2022}\-\*]+/u', '', $line) ?? $line;
    }
}