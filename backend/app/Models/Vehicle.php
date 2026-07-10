<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = [
        'code', 'plate_number', 'type', 'ownership', 'rental_company', 'region_id', 'status',
        'maintenance_override_key',
    ];

    protected function casts(): array
    {
        return [
            'maintenance_override_key' => 'date:Y-m-d',
        ];
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function fuelLogs()
    {
        return $this->hasMany(FuelLog::class);
    }

    public function serviceLogs()
    {
        return $this->hasMany(ServiceLog::class);
    }

    // "VH-001 · DR 1234 EA" — the identifier string the frontend uses across
    public function getLabelAttribute(): string
    {
        return "{$this->code} · {$this->plate_number}";
    }
}
