<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CurrentUserController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        // Identitas selalu dari session, bukan dari id yang dikirim client.
        // Status dipaksa 200 supaya GET ini tidak ikut status 201 milik model yang baru dibuat.
        return (new UserResource($request->user()))->response()->setStatusCode(200);
    }
}
