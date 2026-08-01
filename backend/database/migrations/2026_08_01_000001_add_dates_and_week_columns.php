<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->date('ojt_start_date')->nullable()->after('hours_rendered');
            $table->date('ojt_end_date')->nullable()->after('ojt_start_date');
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->integer('week')->nullable()->after('document_type');
            $table->date('submitted_date')->nullable()->after('week');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['ojt_start_date', 'ojt_end_date']);
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['week', 'submitted_date']);
        });
    }
};
