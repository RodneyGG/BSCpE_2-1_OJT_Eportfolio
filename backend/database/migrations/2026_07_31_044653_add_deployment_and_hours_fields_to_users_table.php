<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('ojt_role')->nullable()->after('company_id');
            $table->string('ojt_supervisor')->nullable()->after('ojt_role');
            $table->string('emergency_contact_name')->nullable()->after('ojt_supervisor');
            $table->string('emergency_contact_number')->nullable()->after('emergency_contact_name');
            $table->unsignedInteger('hours_rendered')->default(0)->after('emergency_contact_number');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'ojt_role',
                'ojt_supervisor',
                'emergency_contact_name',
                'emergency_contact_number',
                'hours_rendered',
            ]);
        });
    }
};