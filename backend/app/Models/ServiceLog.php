<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ServiceLog extends Model
{
    protected $fillable = ['vehicle_id', 'service_type', 'description', 'cost', 'service_date', 'next_service_due'];

    protected function casts(): array
    {
        return [
            'service_date' => 'date:Y-m-d',
            'next_service_due' => 'date:Y-m-d',
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
