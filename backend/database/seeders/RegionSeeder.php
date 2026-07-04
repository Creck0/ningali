<?php

namespace Database\Seeders;

use App\Models\Region;
use Illuminate\Database\Seeder;

class RegionSeeder extends Seeder
{
    public function run(): void
    {
        $regions = [
            ['name' => 'Kantor Pusat', 'type' => 'head_office'],
            ['name' => 'Kantor Cabang', 'type' => 'branch'],
            ['name' => 'Tambang Site A', 'type' => 'mine_site'],
            ['name' => 'Tambang Site B', 'type' => 'mine_site'],
            ['name' => 'Tambang Site C', 'type' => 'mine_site'],
            ['name' => 'Tambang Site D', 'type' => 'mine_site'],
            ['name' => 'Tambang Site E', 'type' => 'mine_site'],
            ['name' => 'Tambang Site F', 'type' => 'mine_site'],
        ];

        foreach ($regions as $region) {
            Region::create($region);
        }
    }
}
