<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FuelLog extends Model
{
    protected $fillable = ['vehicle_id', 'booking_id', 'liters', 'cost', 'odometer', 'filled_at'];

    protected function casts(): array
    {
        return [
            'filled_at' => 'date:Y-m-d',
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }
}
