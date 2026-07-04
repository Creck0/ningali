<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FuelLog;
use App\Models\Vehicle;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class FuelLogController extends Controller
{
    public function index()
    {
        $logs = FuelLog::with('vehicle')->orderByDesc('filled_at')->orderByDesc('id')->get()
            ->map(fn ($f) => $this->format($f));

        return response()->json(['data' => $logs]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'vehicle' => 'required|string',
            'liters' => 'required|numeric',
            'cost' => 'required|numeric',
            'odometer' => 'required|numeric',
            'filledAt' => 'required|date',
        ]);

        $vehicle = $this->resolveVehicle($data['vehicle']);

        $log = FuelLog::create([
            'vehicle_id' => $vehicle->id,
            'liters' => $data['liters'],
            'cost' => $data['cost'],
            'odometer' => $data['odometer'],
            'filled_at' => $data['filledAt'],
        ]);

        ActivityLogger::log(
            $request->user(),
            'fuel_log_added',
            'Kendaraan',
            "Catat pengisian BBM {$data['liters']}L untuk {$vehicle->label}"
        );

        return response()->json(['data' => $this->format($log->fresh('vehicle'))], 201);
    }

    private function resolveVehicle(string $label): Vehicle
    {
        $code = trim(explode('·', $label)[0]);
        $vehicle = Vehicle::where('code', $code)->first();

        if (! $vehicle) {
            throw ValidationException::withMessages(['vehicle' => "Kendaraan '{$label}' tidak ditemukan."]);
        }

        return $vehicle;
    }

    private function format(FuelLog $f): array
    {
        return [
            'id' => $f->id,
            'vehicle' => $f->vehicle->label,
            'liters' => $f->liters,
            'cost' => $f->cost,
            'odometer' => $f->odometer,
            'filledAt' => $f->filled_at->format('Y-m-d'),
        ];
    }
}
