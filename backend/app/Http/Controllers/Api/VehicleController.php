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

        // Only touch the acknowledgement when the admin sets the vehicle back
        // to "available":
        //  - still overdue  -> remember this exact overdue instance as acknowledged
        //  - no longer overdue -> nothing to acknowledge, clear any stale flag
        // Manually switching to "in_use" or "maintenance" afterwards does NOT
        // wipe the acknowledgement — otherwise flipping it to maintenance to
        // test something (or genuinely doing maintenance) would make the
        // "Servis lewat X hari" notice reappear even though it was already
        // dealt with. It only comes back for a genuinely new overdue service log.
        if ($request->status === 'available') {
            $overdueKey = $this->overdueKey($vehicle);
            $vehicle->maintenance_override_key = $overdueKey;
        }

        $vehicle->status = $request->status;
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

        $vehicle->status = 'maintenance';
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
        // Walk every service log with a due date, earliest first. Return the
        // first one that's actually overdue AND hasn't already been
        // acknowledged. This way, acknowledging one overdue schedule doesn't
        // permanently hide a *different* overdue schedule that comes after it.
        $ackKey = $vehicle->maintenance_override_key?->format('Y-m-d');

        $logs = ServiceLog::where('vehicle_id', $vehicle->id)
            ->whereNotNull('next_service_due')
            ->orderBy('next_service_due')
            ->get();

        foreach ($logs as $log) {
            $due = Carbon::parse($log->next_service_due);

            // Explicit check: has THIS service's due date actually arrived yet?
            // If not, leave it alone for now and move on to check the next
            // scheduled service date — don't act on anything that isn't due yet.
            if (! $this->isServiceDue($due)) {
                continue;
            }

            $dueKey = $due->format('Y-m-d');
            if ($dueKey === $ackKey) {
                continue;
            }

            return $dueKey;
        }

        return null;
    }

    private function isServiceDue(Carbon $due): bool
    {
        return $due->isPast() || $due->isToday();
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
