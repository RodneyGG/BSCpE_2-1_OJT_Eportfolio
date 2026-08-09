<?php
namespace App\Support;
use InvalidArgumentException;
class RosterSheetUrl
{
    /**
     * Normalize any Google Sheets URL (edit link, share link, or an
     * already-correct export link) into the canonical CSV export form.
     * Accepts a gid from the input URL if present (query string ?gid=
     * or fragment #gid=), defaulting to gid=0 (first tab) otherwise.
     * Throws if the string doesn't look like a Google Sheets URL at all.
     */
    public static function normalize(string $url): string
    {
        if (!preg_match('#docs\.google\.com/spreadsheets/d/([a-zA-Z0-9_-]+)#', $url, $idMatch)) {
            throw new InvalidArgumentException(
                'That doesn\'t look like a Google Sheets URL. Paste the link from the address bar or the Share dialog.'
            );
        }
        $sheetId = $idMatch[1];
        $gid = '0';
        if (preg_match('#[?&#]gid=(\d+)#', $url, $gidMatch)) {
            $gid = $gidMatch[1];
        }
        return "https://docs.google.com/spreadsheets/d/{$sheetId}/export?format=csv&gid={$gid}";
    }
}