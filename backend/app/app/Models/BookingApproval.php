<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BookingApproval extends Model
{
    protected $fillable = ['booking_id', 'approver_id', 'level', 'status', 'note', 'decided_at'];

    protected function casts(): array
    {
        return [
            'decided_at' => 'datetime',
        ];
    }

    public function booking()
    {
        return $this->belongsTo(Booking::class);
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approver_id');
    }
}
