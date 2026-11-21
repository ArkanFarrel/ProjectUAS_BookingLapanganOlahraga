<?php

namespace App\Http\Middleware;

use App\Enums\UserStatus;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

// Session yang sudah terbit harus putus saat admin men-suspend akun.
class EnsureUserIsActive
{
    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            return $next($request);
        }

        $status = $user->status instanceof UserStatus ? $user->status : UserStatus::tryFrom((string) $user->status);

        if ($status === UserStatus::Active) {
            return $next($request);
        }

        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        // Sama seperti logout: buang guard di memori supaya session baru tidak masih menganggap user lama login.
        Auth::forgetGuards();

        return response()->json([
            'message' => 'Akun Anda ditangguhkan. Hubungi admin SportsCourt.',
            'code' => 'ACCOUNT_SUSPENDED',
        ], 403);
    }
}
