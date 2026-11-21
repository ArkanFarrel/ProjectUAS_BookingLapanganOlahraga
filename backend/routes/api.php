<?php

use App\Http\Controllers\Api\V1\Admin\VenueModerationController;
use App\Http\Controllers\Api\V1\Auth\CurrentUserController;
use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\LogoutController;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\Auth\UpdatePasswordController;
use App\Http\Controllers\Api\V1\Auth\UpdateProfileController;
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
        Route::post('/register', RegisterController::class)
            ->middleware('throttle:register')
            ->name('auth.register');

        Route::post('/login', LoginController::class)
            ->middleware('throttle:login')
            ->name('auth.login');

        // active berjalan setelah session dikenali, jadi akun yang baru di-suspend langsung ditolak.
        Route::middleware(['auth:sanctum', 'active'])->group(function (): void {
            Route::post('/logout', LogoutController::class)->name('auth.logout');
            Route::get('/me', CurrentUserController::class)->name('auth.me');
            Route::put('/profile', UpdateProfileController::class)->name('auth.profile.update');
            Route::put('/password', UpdatePasswordController::class)->name('auth.password.update');
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
