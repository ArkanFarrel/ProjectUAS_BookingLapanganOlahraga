<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class ProfileTest extends StatefulApiTestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_access_me_or_profile(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
        $this->putJson('/api/v1/auth/profile', ['name' => 'X'])->assertUnauthorized();
        $this->putJson('/api/v1/auth/password', [])->assertUnauthorized();
    }

    public function test_me_returns_current_user_without_sensitive_fields(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.role', 'customer')
            ->assertJsonMissingPath('data.password')
            ->assertJsonMissingPath('data.remember_token');
    }

    public function test_user_can_update_name_and_phone_only(): void
    {
        $user = User::factory()->create(['email' => 'budi@example.com']);

        $this->actingAs($user, 'web')
            ->putJson('/api/v1/auth/profile', [
                'name' => 'Budi Baru',
                'phone' => '0812-3456-7890',
                'role' => 'admin',
                'status' => 'suspended',
                'email' => 'hacker@example.com',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Budi Baru')
            ->assertJsonPath('data.phone', '081234567890')
            ->assertJsonPath('data.role', 'customer')
            ->assertJsonPath('data.email', 'budi@example.com');

        $user->refresh();
        $this->assertSame(UserRole::Customer, $user->role);
        $this->assertTrue($user->isActive());
        $this->assertSame('budi@example.com', $user->email);
    }

    public function test_invalid_phone_is_rejected(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->putJson('/api/v1/auth/profile', ['name' => 'Budi', 'phone' => '12345'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('phone');
    }

    public function test_password_change_requires_current_password(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->putJson('/api/v1/auth/password', [
                'current_password' => 'salah123',
                'password' => 'passwordBaru123',
                'password_confirmation' => 'passwordBaru123',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('current_password');

        $this->assertTrue(Hash::check('password', $user->fresh()->password));
    }

    public function test_user_can_change_password(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'web')
            ->putJson('/api/v1/auth/password', [
                'current_password' => 'password',
                'password' => 'passwordBaru123',
                'password_confirmation' => 'passwordBaru123',
            ])
            ->assertNoContent();

        $this->assertTrue(Hash::check('passwordBaru123', $user->fresh()->password));
    }

    public function test_suspended_user_session_is_rejected(): void
    {
        $user = User::factory()->suspended()->create();

        $this->actingAs($user, 'web')
            ->getJson('/api/v1/auth/me')
            ->assertForbidden()
            ->assertJsonPath('code', 'ACCOUNT_SUSPENDED');
    }
}
