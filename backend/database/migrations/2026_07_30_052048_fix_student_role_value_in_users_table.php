<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')->where('role', 'student')->update(['role' => 'normal']);
    }

    public function down(): void
    {
        DB::table('users')->where('role', 'normal')->update(['role' => 'student']);
    }
};