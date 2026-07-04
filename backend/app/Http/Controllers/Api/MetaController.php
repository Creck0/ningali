<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

class MetaController extends Controller
{
    /**
     * Approver lists (level 1 / level 2) used to populate the "Approver Level 1/2"
     * dropdowns when an admin creates a booking.
     */
    public function approvers()
    {
        $approvers = User::where('role', 'approver')->orderBy('approval_level')->get();

        return response()->json([
            'data' => $approvers->map(fn ($a) => [
                'id' => $a->id,
                'name' => $a->name,
                'level' => $a->approval_level,
                'position' => $a->position,
                'label' => "{$a->name} — {$a->position}",
            ]),
        ]);
    }
}
