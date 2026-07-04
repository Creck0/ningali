<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\FuelLogController;
use App\Http\Controllers\Api\MetaController;
use App\Http\Controllers\Api\RegionController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ServiceLogController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

// Public
Route::post('/login', [AuthController::class, 'login']);

// Authenticated (any role)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/vehicles', [VehicleController::class, 'index']);
    Route::get('/drivers', [DriverController::class, 'index']);
    Route::get('/regions', [RegionController::class, 'index']);
    Route::get('/approvers', [MetaController::class, 'approvers']);

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/fuel-logs', [FuelLogController::class, 'index']);
    Route::get('/service-logs', [ServiceLogController::class, 'index']);
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/reports/bookings/export', [ReportController::class, 'exportBookings']);

    // Approver-only: approve/reject bookings pending their level
    Route::middleware('role:approver')->group(function () {
        Route::post('/bookings/{booking}/decision', [BookingController::class, 'decide']);
    });

    // Admin-only: fleet pool / vehicle coordinator actions
    Route::middleware('role:admin')->group(function () {
        Route::post('/bookings', [BookingController::class, 'store']);
        Route::post('/bookings/{booking}/complete', [BookingController::class, 'complete']);
        Route::patch('/vehicles/{vehicle}/status', [VehicleController::class, 'updateStatus']);
        Route::post('/fuel-logs', [FuelLogController::class, 'store']);
        Route::post('/service-logs', [ServiceLogController::class, 'store']);
        Route::get('/activity-logs', [ActivityLogController::class, 'index']);
    });
});
