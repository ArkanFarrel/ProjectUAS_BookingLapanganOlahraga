<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

// Guard UX di frontend tidak cukup. Role dicek lagi di sini.
class EnsureRole
{
    /**
     * @param  Closure(Request): Response  $next
     * @param  string  ...$roles  nilai dari middleware, misalnya role:owner
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if ($user === null) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        $role = $user->role instanceof UserRole ? $user->role->value : (string) $user->role;

        if (! in_array($role, $roles, true)) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk melakukan ini.',
            ], 403);
        }

        return $next($request);
    }
}
