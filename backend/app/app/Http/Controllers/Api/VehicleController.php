<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicle;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VehicleController extends Controller
{
    public function index()
    {
        $vehicles = Vehicle::with('region')->orderBy('code')->get()->map(fn ($v) => $this->format($v));

        return response()->json(['data' => $vehicles]);
    }

    public function updateStatus(Request $request, Vehicle $vehicle)
    {
        $request->validate([
            'status' => ['required', Rule::in(['available', 'in_use', 'maintenance'])],
        ]);

        $vehicle->update(['status' => $request->status]);

        ActivityLogger::log(
            $request->user(),
            'vehicle_updated',
            'Kendaraan',
            "Update status {$vehicle->code} menjadi {$request->status}"
        );

        return response()->json(['data' => $this->format($vehicle->fresh('region'))]);
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
        ];
    }
}
