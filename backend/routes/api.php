<?php

use App\Http\Controllers\Api\V1\Auth\CurrentUserController;
use App\Http\Controllers\Api\V1\Auth\LoginController;
use App\Http\Controllers\Api\V1\Auth\LogoutController;
use App\Http\Controllers\Api\V1\Auth\RegisterController;
use App\Http\Controllers\Api\V1\Auth\UpdatePasswordController;
use App\Http\Controllers\Api\V1\Auth\UpdateProfileController;
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
});
