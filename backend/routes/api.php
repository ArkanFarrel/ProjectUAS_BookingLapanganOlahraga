<?php

use App\Http\Controllers\Api\V1\Admin\VenueModerationController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\ProfileController;
use App\Http\Controllers\Api\V1\Owner\CourtBlockController;
use App\Http\Controllers\Api\V1\Owner\CourtController;
use App\Http\Controllers\Api\V1\Owner\OperatingHourController;
use App\Http\Controllers\Api\V1\Owner\VenueController;
use App\Http\Controllers\Api\V1\Owner\VenueImageController;
use App\Http\Controllers\Api\V1\Public\AvailabilityController;
use App\Http\Controllers\Api\V1\Public\SportController;
use App\Http\Controllers\Api\V1\Public\VenueDiscoveryController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', function () {
        return response()->json([
            'data' => [
                'status' => 'ok',
                'service' => 'sportscourt-api',
            ],
        ]);
    });

    Route::prefix('auth')->group(function (): void {
        Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:register');
        Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');

        Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/me', [AuthController::class, 'me']);
            Route::put('/profile', [ProfileController::class, 'update']);
            Route::put('/password', [ProfileController::class, 'password'])->middleware('throttle:password');
        });
    });

    Route::get('/sports', [SportController::class, 'index'])->name('sports.index');
    Route::get('/venues', [VenueDiscoveryController::class, 'index'])->name('venues.index');
    Route::get('/venues/{venue}', [VenueDiscoveryController::class, 'show'])->name('venues.show');
    Route::get('/venues/{venue}/courts', [VenueDiscoveryController::class, 'courts'])->name('venues.courts');
    Route::get('/courts/{court}/availability', AvailabilityController::class)->name('courts.availability');

    Route::middleware(['auth:sanctum', 'active', 'role:owner'])->prefix('owner')->group(function (): void {
        Route::get('/venues', [VenueController::class, 'index'])->name('owner.venues.index');
        Route::post('/venues', [VenueController::class, 'store'])->name('owner.venues.store');
        Route::get('/venues/{venue}', [VenueController::class, 'show'])->name('owner.venues.show');
        Route::put('/venues/{venue}', [VenueController::class, 'update'])->name('owner.venues.update');
        Route::patch('/venues/{venue}/toggle-active', [VenueController::class, 'toggleActive'])->name('owner.venues.toggle');
        Route::delete('/venues/{venue}', [VenueController::class, 'destroy'])->name('owner.venues.destroy');
        Route::post('/venues/{venue}/images', [VenueImageController::class, 'store'])
            ->middleware('throttle:uploads')
            ->name('owner.venues.images.store');
        Route::delete('/venues/{venue}/images/{image}', [VenueImageController::class, 'destroy'])
            ->name('owner.venues.images.destroy');

        Route::get('/venues/{venue}/operating-hours', [OperatingHourController::class, 'index'])->name('owner.hours.index');
        Route::put('/venues/{venue}/operating-hours', [OperatingHourController::class, 'update'])->name('owner.hours.update');

        Route::get('/venues/{venue}/courts', [CourtController::class, 'index'])->name('owner.courts.index');
        Route::post('/venues/{venue}/courts', [CourtController::class, 'store'])->name('owner.courts.store');
        Route::put('/courts/{court}', [CourtController::class, 'update'])->name('owner.courts.update');
        Route::patch('/courts/{court}/toggle-active', [CourtController::class, 'toggleActive'])->name('owner.courts.toggle');
        Route::post('/courts/{court}/image', [CourtController::class, 'storeImage'])
            ->middleware('throttle:uploads')
            ->name('owner.courts.image');
        Route::delete('/courts/{court}', [CourtController::class, 'destroy'])->name('owner.courts.destroy');
        Route::get('/courts/{court}/blocks', [CourtBlockController::class, 'index'])->name('owner.blocks.index');
        Route::post('/courts/{court}/blocks', [CourtBlockController::class, 'store'])->name('owner.blocks.store');
        Route::delete('/blocks/{block}', [CourtBlockController::class, 'destroy'])->name('owner.blocks.destroy');
    });

    Route::middleware(['auth:sanctum', 'active', 'role:admin'])->prefix('admin')->group(function (): void {
        Route::get('/venues', [VenueModerationController::class, 'index'])->name('admin.venues.index');
        Route::get('/venues/{venue}', [VenueModerationController::class, 'show'])->name('admin.venues.show');
        Route::patch('/venues/{venue}/approve', [VenueModerationController::class, 'approve'])->name('admin.venues.approve');
        Route::patch('/venues/{venue}/reject', [VenueModerationController::class, 'reject'])->name('admin.venues.reject');
        Route::patch('/venues/{venue}/suspend', [VenueModerationController::class, 'suspend'])->name('admin.venues.suspend');
        Route::patch('/venues/{venue}/reactivate', [VenueModerationController::class, 'reactivate'])->name('admin.venues.reactivate');
    });
});
