<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Company;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Creates a superadmin using environment variables (defaults if not provided)
        User::create([
            'name' => env('ADMIN_NAME', 'Super Admin'),
            'email' => env('ADMIN_EMAIL', 'admin@example.com'),
            'password' => Hash::make(env('ADMIN_PASSWORD', 'SecurePassword123!')),
            'role' => 'admin',
            'must_change_password' => false,
        ]);
    }
}
