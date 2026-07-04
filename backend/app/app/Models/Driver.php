<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = ['name', 'phone', 'license_number', 'region_id'];

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }
}
