<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE users MODIFY hours_rendered DECIMAL(6,2) NOT NULL DEFAULT 0');
        DB::statement('ALTER TABLE documents MODIFY claimed_hours DECIMAL(6,2) NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE users MODIFY hours_rendered INT UNSIGNED NOT NULL DEFAULT 0');
        DB::statement('ALTER TABLE documents MODIFY claimed_hours INT UNSIGNED NULL');
    }
};