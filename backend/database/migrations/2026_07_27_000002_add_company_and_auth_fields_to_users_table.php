<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('student')->after('password'); // student, prof, admin
            $table->foreignId('company_id')->nullable()->after('role')->constrained('companies')->nullOnDelete();
            $table->boolean('must_change_password')->default(true)->after('company_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['company_id']);
            $table->dropColumn(['role', 'company_id', 'must_change_password']);
        });
    }
};
