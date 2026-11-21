<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Aturan password yang sama untuk register, ganti password, dan buat admin.
        Password::defaults(fn () => Password::min(8)->letters()->numbers());

        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Kunci login memakai email + IP supaya satu orang tidak mengunci email orang lain.
        RateLimiter::for('login', function (Request $request) {
            $email = $request->input('email');
            $emailKey = is_string($email) ? Str::lower($email) : 'invalid';

            return Limit::perMinute(5)
                ->by($emailKey.'|'.$request->ip())
                ->response(fn () => response()->json([
                    'message' => 'Terlalu banyak percobaan login. Coba lagi dalam satu menit.',
                ], 429));
        });

        RateLimiter::for('register', function (Request $request) {
            return Limit::perMinute(5)
                ->by($request->ip())
                ->response(fn () => response()->json([
                    'message' => 'Terlalu banyak percobaan daftar. Coba lagi dalam satu menit.',
                ], 429));
        });

        RateLimiter::for('uploads', function (Request $request) {
            return Limit::perMinute(20)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('booking-create', function (Request $request) {
            return Limit::perMinute(10)->by($request->user()?->id ?: $request->ip());
        });
    }
}
