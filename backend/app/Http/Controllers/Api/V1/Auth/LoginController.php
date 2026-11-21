<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function __invoke(LoginRequest $request): JsonResponse|UserResource
    {
        // Tanpa session, cookie SPA tidak bisa dibuat. Jangan sampai ini jadi error 500.
        if (! $request->hasSession()) {
            return response()->json([
                'message' => 'Login membutuhkan cookie session. Ambil /sanctum/csrf-cookie dari frontend localhost:5173 terlebih dahulu.',
            ], 400);
        }

        $credentials = [
            'email' => $request->string('email')->toString(),
            'password' => $request->string('password')->toString(),
        ];

        // Selalu guard web. Request sebelumnya bisa meninggalkan guard sanctum di proses yang sama.
        if (! Auth::guard('web')->attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => 'Email atau password salah.',
            ]);
        }

        /** @var User $user */
        $user = $request->user();

        // Baru bocorkan status suspended setelah password benar, supaya email tidak bisa ditebak.
        if ($user->status !== UserStatus::Active) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Akun Anda ditangguhkan. Hubungi admin SportsCourt.',
                'code' => 'ACCOUNT_SUSPENDED',
            ], 403);
        }

        $request->session()->regenerate();

        return new UserResource($user);
    }
}
