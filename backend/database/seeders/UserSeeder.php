<?php

namespace Database\Seeders;

use App\Models\Region;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $headOffice = Region::where('name', 'Kantor Pusat')->first();
        $siteA = Region::where('name', 'Tambang Site A')->first();

        User::create([
            'name' => 'Admin Pesanan',
            'email' => 'admin@mail.co',
            'password' => Hash::make('Admin#12345'),
            'role' => 'admin',
            'region_id' => $headOffice?->id,
        ]);

        User::create([
            'name' => 'Approval',
            'email' => 'admin_approv@mail.com',
            'password' => Hash::make('Approve#123'),
            'role' => 'approver',
            'approval_level' => 1,
            'region_id' => $siteA?->id,
        ]);

        User::create([
            'name' => 'Approval Manager',
            'email' => 'manager@mail.com',
            'password' => Hash::make('Approve#456'),
            'role' => 'approver',
            'approval_level' => 2,
            'region_id' => $headOffice?->id,
        ]);
    }
}
