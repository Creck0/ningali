<?php

namespace Database\Seeders;

use App\Models\Driver;
use Illuminate\Database\Seeder;

class DriverSeeder extends Seeder
{
    public function run(): void
    {
        foreach (['Slamet Riyadi', 'Ahmad Fauzi', 'Joko Prasetyo', 'Dedi Kurniawan'] as $name) {
            Driver::create(['name' => $name]);
        }
    }
}
