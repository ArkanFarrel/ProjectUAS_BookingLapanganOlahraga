<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

/**
 * Laravel Sanctum SPA (cookie/session) authentication.
 * Requests must come from a stateful domain (SANCTUM_STATEFUL_DOMAINS) so that
 * session + CSRF middleware are applied.
 */
class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $this->ensureSession($request);

        $data = $request->validated();

        $user = new User([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
        ]);
        // Role/status are mapped server-side, never mass-assigned from input.
        $user->role = UserRole::from($data['account_type']);
        $user->status = UserStatus::Active;
        $user->save();

        Auth::guard('web')->login($user);
        $request->session()->regenerate();

        return (new UserResource($user))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    public function login(LoginRequest $request): JsonResponse|UserResource
    {
        $this->ensureSession($request);

        $credentials = $request->safe()->only(['email', 'password']);

        if (! Auth::guard('web')->attempt($credentials, $request->boolean('remember'))) {
            // Generic message: do not reveal whether the email exists.
            throw ValidationException::withMessages([
                'email' => 'Email atau password salah.',
            ]);
        }

        /** @var User $user */
        $user = Auth::guard('web')->user();

        if (! $user->isActive()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Akun Anda sedang dinonaktifkan. Hubungi admin SportsCourt.',
                'code' => 'ACCOUNT_SUSPENDED',
            ], Response::HTTP_FORBIDDEN);
        }

        // Prevent session fixation.
        $request->session()->regenerate();

        return new UserResource($user);
    }

    public function logout(Request $request): Response
    {
        Auth::guard('web')->logout();

        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->noContent();
    }

    public function me(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    private function ensureSession(Request $request): void
    {
        if (! $request->hasSession()) {
            abort(response()->json([
                'message' => 'Request harus berasal dari frontend SportsCourt yang terdaftar (stateful domain).',
                'code' => 'STATEFUL_REQUEST_REQUIRED',
            ], Response::HTTP_BAD_REQUEST));
        }
    }
}
