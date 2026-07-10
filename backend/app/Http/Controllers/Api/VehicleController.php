<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceLog;
use App\Models\Vehicle;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Rule;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $vehicles = Vehicle::with('region')->orderBy('code')->get();

        foreach ($vehicles as $vehicle) {
            $this->applyAutoMaintenance($vehicle, $request);
        }

        return response()->json(['data' => $vehicles->map(fn ($v) => $this->format($v))]);
    }

    public function updateStatus(Request $request, Vehicle $vehicle)
    {
        $request->validate([
            'status' => ['required', Rule::in(['available', 'in_use', 'maintenance'])],
        ]);

        $overdueKey = $this->overdueKey($vehicle);

        // If the admin is explicitly setting this vehicle back to "available"
        // while it's still overdue for service, remember that specific overdue
        // instance was acknowledged, so the auto-maintenance check below won't
        // immediately flip it back. Any other status clears the acknowledgement.
        $vehicle->status = $request->status;
        $vehicle->maintenance_override_key = ($request->status === 'available' && $overdueKey) ? $overdueKey : null;
        $vehicle->save();

        ActivityLogger::log(
            $request->user(),
            'vehicle_updated',
            'Kendaraan',
            "Update status {$vehicle->code} menjadi {$request->status}"
        );

        return response()->json(['data' => $this->format($vehicle->fresh('region'))]);
    }

    /**
     * If a vehicle is marked "available" but is overdue for service — and that
     * specific overdue instance hasn't already been acknowledged by an admin —
     * automatically flip it to "maintenance" and log it. Persisted in the
     * database, so it holds across sessions/devices/logouts.
     */
    private function applyAutoMaintenance(Vehicle $vehicle, Request $request): void
    {
        if ($vehicle->status !== 'available') {
            return;
        }

        $overdueKey = $this->overdueKey($vehicle);
        if (! $overdueKey) {
            return;
        }

        $ackKey = $vehicle->maintenance_override_key?->format('Y-m-d');
        if ($ackKey === $overdueKey) {
            return; // this exact overdue instance was already acknowledged
        }

        $vehicle->status = 'maintenance';
        $vehicle->maintenance_override_key = null;
        $vehicle->save();

        ActivityLogger::log(
            null,
            'vehicle_updated',
            'Kendaraan',
            "Sistem otomatis mengubah status {$vehicle->code} menjadi maintenance (jadwal servis lewat tempo)"
        );
    }

    private function overdueKey(Vehicle $vehicle): ?string
    {
        $soonest = ServiceLog::where('vehicle_id', $vehicle->id)
            ->whereNotNull('next_service_due')
            ->orderBy('next_service_due')
            ->value('next_service_due');

        if (! $soonest) {
            return null;
        }

        $due = Carbon::parse($soonest);

        return $due->isPast() || $due->isToday() ? $due->format('Y-m-d') : null;
    }

    private function format(Vehicle $v): array
    {
        return [
            'id' => $v->id,
            'code' => $v->code,
            'plate' => $v->plate_number,
            'type' => $v->type === 'passenger' ? 'Angkutan Orang' : 'Angkutan Barang',
            'ownership' => $v->ownership === 'owned' ? 'Milik Sendiri' : "Sewa - {$v->rental_company}",
            'region' => $v->region?->name,
            'status' => $v->status,
            'maintenanceOverrideKey' => $v->maintenance_override_key?->format('Y-m-d'),
        ];
    }
}
