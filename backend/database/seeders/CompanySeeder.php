<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Company;

class CompanySeeder extends Seeder
{
    public function run(): void
    {
        $companies = [
            ['name' => 'AA2000 Security and Technology Solutions Inc.', 'address' => '', 'sector' => null],
            ['name' => 'Amsteel Structures INC.', 'address' => '', 'sector' => null],
            ['name' => 'Barangay Hall Concepcion Uno', 'address' => '', 'sector' => null],
            ['name' => 'Comfac IT', 'address' => '', 'sector' => null],
            ['name' => 'Denso Ten Solutions Philippines Corporation', 'address' => '', 'sector' => null],
            ['name' => 'ESCO Pte. Ltd.', 'address' => '', 'sector' => null],
            ['name' => 'Espiritu Santo Parochial School, Inc.', 'address' => '', 'sector' => null],
            ['name' => 'F.F. International Manufacturing Corporation', 'address' => '', 'sector' => null],
            ['name' => 'Filinvest Business Services Corporation', 'address' => '', 'sector' => null],
            ['name' => 'LBC Express, Inc.', 'address' => '', 'sector' => null],
            ['name' => 'Marvill Web Development', 'address' => '', 'sector' => null],
            ['name' => 'NASERIA Construction, OPC', 'address' => '', 'sector' => null],
            ['name' => 'NDAS PHILS INC.', 'address' => '', 'sector' => null],
            ['name' => 'One Point Contact Inc.', 'address' => '', 'sector' => null],
            ['name' => 'People\'s Television Network Inc.', 'address' => '', 'sector' => null],
            ['name' => 'Philippine Fiber Industry Development Authority (PHILFIDA)', 'address' => '', 'sector' => null],
            ['name' => 'Seda Vertis North', 'address' => '', 'sector' => null],
            ['name' => 'Tão Corporate Center', 'address' => '', 'sector' => null],
            ['name' => 'Tão Foods Company Inc.', 'address' => '', 'sector' => null],
            ['name' => 'Technavy Philippines', 'address' => '', 'sector' => null],
            ['name' => 'Ten X Development', 'address' => '', 'sector' => null],
            ['name' => 'Transnational E-Business Solutions, Inc. (TESI)', 'address' => '', 'sector' => null],
            ['name' => 'World Citi Colleges Antipolo Inc.', 'address' => '', 'sector' => null],
            ['name' => 'Yek Yeu Merchandising, Inc.', 'address' => '', 'sector' => null],
            ['name' => 'BSCpE 2-1', 'address' => 'Test Address - Development Only', 'sector' => 'Education / Testing'],
        ];

        foreach ($companies as $company) {
            Company::create([
                'name' => $company['name'],
                'address' => $company['address'],
                'sector' => $company['sector'] ?? null,
                'has_moa' => false,
            ]);
        }
    }
}
