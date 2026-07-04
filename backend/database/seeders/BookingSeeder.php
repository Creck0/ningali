<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Driver;
use App\Models\FuelLog;
use App\Models\Region;
use App\Models\ServiceLog;
use App\Models\User;
use App\Models\Vehicle;
use App\Services\ActivityLogger;
use Illuminate\Database\Seeder;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first();
        $approver1 = User::where('approval_level', 1)->first();
        $approver2 = User::where('approval_level', 2)->first();

        $vehicle = fn (string $code) => Vehicle::where('code', $code)->first();
        $driver = fn (string $name) => Driver::where('name', $name)->first();
        $region = fn (string $name) => Region::where('name', $name)->value('id');

        $bookings = [
            [
                'booking_no' => 'BK-2607-001', 'vehicle' => 'VH-001', 'driver' => 'Slamet Riyadi',
                'purpose' => 'Antar tim survey ke Site A', 'region' => 'Tambang Site A',
                'start_date' => '2026-07-04', 'end_date' => '2026-07-05', 'status' => 'pending_l1',
                'odometer_start' => 18420,
                'approvals' => [1 => 'pending', 2 => 'pending'],
            ],
            [
                'booking_no' => 'BK-2607-002', 'vehicle' => 'VH-002', 'driver' => 'Ahmad Fauzi',
                'purpose' => 'Distribusi logistik ke Site B', 'region' => 'Tambang Site B',
                'start_date' => '2026-07-03', 'end_date' => '2026-07-03', 'status' => 'pending_l2',
                'odometer_start' => 45210,
                'approvals' => [1 => 'approved', 2 => 'pending'],
            ],
            [
                'booking_no' => 'BK-2607-003', 'vehicle' => 'VH-004', 'driver' => 'Joko Prasetyo',
                'purpose' => 'Kunjungan kerja Manager Ops', 'region' => 'Tambang Site C',
                'start_date' => '2026-07-02', 'end_date' => '2026-07-02', 'status' => 'approved',
                'odometer_start' => 9870,
                'approvals' => [1 => 'approved', 2 => 'approved'],
            ],
            [
                'booking_no' => 'BK-2607-004', 'vehicle' => 'VH-005', 'driver' => 'Dedi Kurniawan',
                'purpose' => 'Jemput tamu dari bandara', 'region' => 'Kantor Cabang',
                'start_date' => '2026-07-01', 'end_date' => '2026-07-01', 'status' => 'rejected',
                'odometer_start' => null,
                'approvals' => [1 => 'rejected', 2 => 'pending'],
                'reject_note' => 'Kendaraan sedang dijadwalkan service',
            ],
            [
                'booking_no' => 'BK-2606-098', 'vehicle' => 'VH-003', 'driver' => 'Slamet Riyadi',
                'purpose' => 'Operasional harian kantor pusat', 'region' => 'Kantor Pusat',
                'start_date' => '2026-06-28', 'end_date' => '2026-06-28', 'status' => 'completed',
                'odometer_start' => 17960, 'odometer_end' => 18120,
                'approvals' => [1 => 'approved', 2 => 'approved'],
            ],
        ];

        foreach ($bookings as $b) {
            $booking = Booking::create([
                'booking_no' => $b['booking_no'],
                'vehicle_id' => $vehicle($b['vehicle'])->id,
                'driver_id' => $driver($b['driver'])->id,
                'requested_by' => $admin->id,
                'purpose' => $b['purpose'],
                'region_id' => $region($b['region']),
                'start_date' => $b['start_date'],
                'end_date' => $b['end_date'],
                'status' => $b['status'],
                'odometer_start' => $b['odometer_start'],
                'odometer_end' => $b['odometer_end'] ?? null,
            ]);

            $booking->approvals()->create([
                'approver_id' => $approver1->id,
                'level' => 1,
                'status' => $b['approvals'][1],
                'note' => $b['approvals'][1] === 'rejected' ? ($b['reject_note'] ?? null) : null,
            ]);
            $booking->approvals()->create([
                'approver_id' => $approver2->id,
                'level' => 2,
                'status' => $b['approvals'][2],
            ]);

            ActivityLogger::log($admin, 'booking_created', 'Pemesanan', "Membuat pemesanan {$b['booking_no']}");
        }

        // Closing fuel fill-up + a couple of standalone fuel/service records, matching the original mock data.
        FuelLog::create(['vehicle_id' => $vehicle('VH-001')->id, 'liters' => 45, 'cost' => 720000, 'odometer' => 18420, 'filled_at' => '2026-07-01']);
        FuelLog::create(['vehicle_id' => $vehicle('VH-002')->id, 'liters' => 60, 'cost' => 960000, 'odometer' => 45210, 'filled_at' => '2026-06-29']);
        FuelLog::create(['vehicle_id' => $vehicle('VH-004')->id, 'liters' => 38, 'cost' => 608000, 'odometer' => 9870, 'filled_at' => '2026-06-27']);
        FuelLog::create(['vehicle_id' => $vehicle('VH-005')->id, 'liters' => 50, 'cost' => 800000, 'odometer' => 22110, 'filled_at' => '2026-06-25']);

        ServiceLog::create(['vehicle_id' => $vehicle('VH-003')->id, 'service_type' => 'Servis Berkala 20.000 KM', 'cost' => 1250000, 'service_date' => '2026-07-02', 'next_service_due' => '2026-10-02']);
        ServiceLog::create(['vehicle_id' => $vehicle('VH-001')->id, 'service_type' => 'Ganti Oli & Filter', 'cost' => 450000, 'service_date' => '2026-06-15', 'next_service_due' => '2026-09-15']);
        ServiceLog::create(['vehicle_id' => $vehicle('VH-002')->id, 'service_type' => 'Servis Rem', 'cost' => 680000, 'service_date' => '2026-06-10', 'next_service_due' => '2026-07-10']);

        ActivityLogger::log($approver1, 'approved_l1', 'Approval', 'Menyetujui BK-2607-002 (Level 1)');
        ActivityLogger::log($approver1, 'rejected_l1', 'Approval', 'Menolak BK-2607-004 (Level 1)');
        ActivityLogger::log($approver2, 'approved_l2', 'Approval', 'Menyetujui BK-2607-003 (Level 2)');
        ActivityLogger::log($admin, 'vehicle_updated', 'Kendaraan', 'Update status VH-003 menjadi maintenance');
    }
}
