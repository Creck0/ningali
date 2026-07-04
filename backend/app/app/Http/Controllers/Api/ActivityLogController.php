<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;

class ActivityLogController extends Controller
{
    public function index()
    {
        $logs = ActivityLog::with('user')->orderByDesc('id')->limit(200)->get()->map(fn ($l) => [
            'id' => $l->id,
            'user' => $l->user?->name ?? 'System',
            'action' => $l->action,
            'module' => $l->module,
            'description' => $l->description,
            'time' => $l->created_at->format('Y-m-d H:i'),
        ]);

        return response()->json(['data' => $logs]);
    }
}
