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
        User::create([
            'name' => 'Admin',
            'email' => 'admin@ojt.dev',
            'password' => Hash::make('Admin@2026'),
            'role' => 'admin',
            'must_change_password' => false,
        ]);

        User::create([
            'name' => 'Engr. Jake A. Binuya',
            'email' => 'prof@ojt.dev',
            'password' => Hash::make('Prof@2026'),
            'role' => 'prof',
            'must_change_password' => false,
        ]);

        $testCompany = Company::where('name', 'BSCpE 2-1')->first();

        User::create([
            'name' => 'Test Student',
            'email' => 'student@ojt.dev',
            'password' => Hash::make('Student@2026'),
            'role' => 'student',
            'must_change_password' => false,
            'company_id' => $testCompany ? $testCompany->id : null,
        ]);
    }
}
