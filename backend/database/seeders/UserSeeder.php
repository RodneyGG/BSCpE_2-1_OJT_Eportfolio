<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password123'),
        ]);

        for ($i = 1; $i <= 5; $i++) {
            User::create([
                'name' => 'Test User ' . $i,
                'email' => 'test' . $i . '@example.com',
                'password' => Hash::make('password123'),
            ]);
        }
    }
}
