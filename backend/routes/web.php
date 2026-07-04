<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['message' => 'Vehicle Booking & Monitoring API', 'docs' => '/api']);
});
