<?php

namespace App\Http\Resources;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Bentuk user yang boleh dilihat client.
 * Password dan remember_token sengaja tidak ikut.
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $role = $this->role instanceof UserRole ? $this->role->value : $this->role;
        $status = $this->status instanceof UserStatus ? $this->status->value : $this->status;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $role,
            'status' => $status,
            'created_at' => $this->created_at?->utc()->format('Y-m-d\TH:i:s\Z'),
        ];
    }
}
