<?php

namespace Database\Seeders;

use App\Models\Region;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $regionId = fn (string $name) => Region::where('name', $name)->value('id');

        $vehicles = [
            ['code' => 'VH-001', 'plate_number' => 'DR 1234 EA', 'type' => 'passenger', 'ownership' => 'owned', 'region_id' => $regionId('Tambang Site A'), 'status' => 'available'],
            ['code' => 'VH-002', 'plate_number' => 'DR 5566 EB', 'type' => 'goods', 'ownership' => 'rented', 'rental_company' => 'PT Trans Jaya', 'region_id' => $regionId('Tambang Site B'), 'status' => 'in_use'],
            ['code' => 'VH-003', 'plate_number' => 'DR 7788 EC', 'type' => 'passenger', 'ownership' => 'owned', 'region_id' => $regionId('Kantor Pusat'), 'status' => 'maintenance'],
            ['code' => 'VH-004', 'plate_number' => 'DR 9900 ED', 'type' => 'goods', 'ownership' => 'owned', 'region_id' => $regionId('Tambang Site C'), 'status' => 'available'],
            ['code' => 'VH-005', 'plate_number' => 'DR 2211 EE', 'type' => 'passenger', 'ownership' => 'rented', 'rental_company' => 'PT Armada Prima', 'region_id' => $regionId('Kantor Cabang'), 'status' => 'available'],
        ];

        foreach ($vehicles as $vehicle) {
            Vehicle::create($vehicle);
        }
    }
}
