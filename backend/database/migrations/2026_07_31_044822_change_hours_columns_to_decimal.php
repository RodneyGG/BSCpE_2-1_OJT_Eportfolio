<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->decimal('hours_rendered', 6, 2)->default(0)->change();
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->decimal('claimed_hours', 6, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('hours_rendered')->default(0)->change();
        });

        Schema::table('documents', function (Blueprint $table) {
            $table->unsignedInteger('claimed_hours')->nullable()->change();
        });
    }
};