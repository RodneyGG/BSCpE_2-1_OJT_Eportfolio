<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->boolean('is_resubmission')->default(false)->after('status');
            $table->boolean('is_duplicate')->default(false)->after('is_resubmission');
            $table->string('submission_note')->nullable()->after('is_duplicate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            $table->dropColumn(['is_resubmission', 'is_duplicate', 'submission_note']);
        });
    }
};
