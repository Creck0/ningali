<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name', 'email', 'password', 'role', 'region_id', 'approval_level',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'approval_level' => 'integer',
        ];
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function bookingApprovals()
    {
        return $this->hasMany(BookingApproval::class, 'approver_id');
    }

    // Human-readable position label used for approver dropdowns in the UI.
    public function getPositionAttribute(): ?string
    {
        if ($this->role !== 'approver') {
            return null;
        }

        return $this->approval_level === 1 ? 'Site Supervisor' : 'Manager Operasional';
    }
}
