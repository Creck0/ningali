<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceLog;
use App\Models\Vehicle;
use App\Services\ActivityLogger;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ServiceLogController extends Controller
{
    public function index()
    {
        $logs = ServiceLog::with('vehicle')->orderByDesc('service_date')->orderByDesc('id')->get()
            ->map(fn ($s) => $this->format($s));

        return response()->json(['data' => $logs]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'vehicle' => 'required|string',
            'type' => 'required|string',
            'cost' => 'required|numeric',
            'serviceDate' => 'required|date',
            'nextDue' => 'required|date',
        ]);

        $vehicle = $this->resolveVehicle($data['vehicle']);

        $log = ServiceLog::create([
            'vehicle_id' => $vehicle->id,
            'service_type' => $data['type'],
            'cost' => $data['cost'],
            'service_date' => $data['serviceDate'],
            'next_service_due' => $data['nextDue'],
        ]);

        ActivityLogger::log(
            $request->user(),
            'service_log_added',
            'Kendaraan',
            "Catat servis \"{$data['type']}\" untuk {$vehicle->label}"
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

    private function format(ServiceLog $s): array
    {
        return [
            'id' => $s->id,
            'vehicle' => $s->vehicle->label,
            'type' => $s->service_type,
            'cost' => $s->cost,
            'serviceDate' => $s->service_date->format('Y-m-d'),
            'nextDue' => $s->next_service_due?->format('Y-m-d'),
        ];
    }
}
