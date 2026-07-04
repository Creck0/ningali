<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RegionSeeder::class,
            UserSeeder::class,
            VehicleSeeder::class,
            DriverSeeder::class,
            BookingSeeder::class,
        ]);
    }
}
