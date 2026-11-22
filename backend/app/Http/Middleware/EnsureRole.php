<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Usage: ->middleware('role:owner') or ->middleware('role:owner,admin').
 * Must run after authentication middleware.
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], Response::HTTP_UNAUTHORIZED);
        }

        $allowed = array_map(static fn (string $role): UserRole => UserRole::from($role), $roles);

        if (! $user->hasRole(...$allowed)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke resource ini.',
                'code' => 'FORBIDDEN_ROLE',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
