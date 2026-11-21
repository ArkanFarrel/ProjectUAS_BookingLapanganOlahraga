<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\User;

class UpdatePasswordController extends Controller
{
    public function __invoke(UpdatePasswordRequest $request): UserResource
    {
        /** @var User $user */
        $user = $request->user();

        $this->authorize('update', $user);

        // Cast hashed di model yang meng-hash. Jangan Hash::make lagi di sini.
        $user->password = $request->string('password')->toString();
        $user->save();

        $request->session()->regenerate();

        return new UserResource($user);
    }
}
