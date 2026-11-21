<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;

class UpdateProfileController extends Controller
{
    public function __invoke(UpdateProfileRequest $request): UserResource
    {
        /** @var User $user */
        $user = $request->user();

        $this->authorize('update', $user);

        // validated() hanya berisi name dan phone, jadi role atau email di body terbuang.
        $user->fill($request->validated());
        $user->save();

        return new UserResource($user);
    }
}
