<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Response;

class ProfileController extends Controller
{
    public function update(UpdateProfileRequest $request): UserResource
    {
        /** @var User $user */
        $user = $request->user();

        // Only validated name/phone are applied; role/status/email are ignored.
        $user->fill($request->safe()->only(['name', 'phone']));
        $user->save();

        return new UserResource($user);
    }

    public function password(UpdatePasswordRequest $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $user->password = $request->validated('password');
        $user->save();

        if ($request->hasSession()) {
            $request->session()->regenerate();
        }

        return response()->noContent();
    }
}
