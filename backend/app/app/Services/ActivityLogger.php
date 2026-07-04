<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Support\Facades\Request;

/**
 * Every write action in the system (booking created, approved, rejected,
 * vehicle updated, fuel/service logged, etc.) is recorded here so it shows
 * up in the Activity Log / audit trail, per README requirement #8.
 */
class ActivityLogger
{
    public static function log(?User $user, string $action, string $module, string $description): ActivityLog
    {
        return ActivityLog::create([
            'user_id' => $user?->id,
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'ip_address' => Request::ip(),
        ]);
    }
}
