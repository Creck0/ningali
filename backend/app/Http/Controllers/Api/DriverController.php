<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Driver;

class DriverController extends Controller
{
    public function index()
    {
        $drivers = Driver::orderBy('name')->get(['id', 'name', 'phone', 'license_number']);

        return response()->json(['data' => $drivers]);
    }
}
