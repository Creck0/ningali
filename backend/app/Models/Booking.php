<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $fillable = [
        'booking_no', 'vehicle_id', 'driver_id', 'requested_by', 'purpose', 'destination',
        'region_id', 'start_date', 'end_date', 'status', 'odometer_start', 'odometer_end',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function approvals()
    {
        return $this->hasMany(BookingApproval::class)->orderBy('level');
    }

    public function fuelLogs()
    {
        return $this->hasMany(FuelLog::class);
    }

    // The pending approval level implied by the current status, or null if the
    // booking is no longer awaiting a decision (approved / rejected / completed).
    public function currentLevel(): ?int
    {
        return match ($this->status) {
            'pending_l1' => 1,
            'pending_l2' => 2,
            default => null,
        };
    }
}
