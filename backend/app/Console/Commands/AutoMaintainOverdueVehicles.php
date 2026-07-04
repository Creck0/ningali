<?php

namespace App\Console\Commands;

use App\Models\ServiceLog;
use App\Models\Vehicle;
use App\Services\ActivityLogger;
use Illuminate\Console\Command;

class AutoMaintainOverdueVehicles extends Command
{
    protected $signature = 'vehicles:auto-maintain';

    protected $description = 'Flip available vehicles with an overdue service schedule to maintenance status';

    public function handle(): int
    {
        $today = now()->toDateString();

        $overdueVehicleIds = ServiceLog::where('next_service_due', '<', $today)
            ->distinct()
            ->pluck('vehicle_id');

        $vehicles = Vehicle::whereIn('id', $overdueVehicleIds)
            ->where('status', 'available')
            ->get();

        foreach ($vehicles as $vehicle) {
            $vehicle->update(['status' => 'maintenance']);

            ActivityLogger::log(
                null,
                'vehicle_updated',
                'Kendaraan',
                "Auto-maintain: {$vehicle->code} otomatis diubah ke maintenance (jadwal service lewat tempo)"
            );

            $this->info("{$vehicle->code} -> maintenance (jadwal service lewat tempo)");
        }

        if ($vehicles->isEmpty()) {
            $this->info('Tidak ada kendaraan yang perlu diubah.');
        }

        return self::SUCCESS;
    }
}
