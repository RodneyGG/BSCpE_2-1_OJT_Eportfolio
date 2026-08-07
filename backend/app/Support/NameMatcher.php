<?php

namespace App\Support;

class NameMatcher
{
    /**
     * Normalize a name into a sorted, deduplicated set of lowercase word
     * tokens, so "Almanza, Juan Rafael S." and "Juan Rafael Almanza" compare
     * equal. Shared by RosterSyncService (subset-containment matching) and
     * DeploymentService (exact-equality matching) so both stay consistent
     * if normalization rules ever change.
     */
    public static function tokenize(string $name): array
    {
        $clean = preg_replace('/[^\p{L}\s]/u', ' ', $name);
        $clean = mb_strtolower(trim($clean));
        $tokens = preg_split('/\s+/', $clean, -1, PREG_SPLIT_NO_EMPTY);
        sort($tokens);
        return array_values(array_unique($tokens));
    }
}