<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\Concerns\InteractsWithSpa;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use InteractsWithSpa;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpSpa();
    }

    public function test_user_can_update_name_and_phone_but_not_role(): void
    {
        $user = User::factory()->create([
            'name' => 'Budi',
            'email' => 'budi@mail.test',
            'password' => 'Rahasia12',
            'role' => UserRole::Customer,
        ]);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'budi@mail.test',
            'password' => 'Rahasia12',
        ])->assertOk();

        $this->carryCookies($login);

        $this->putJson('/api/v1/auth/profile', [
            'name' => 'Budi Baru',
            'phone' => '081234567890',
            'email' => 'dicuri@mail.test',
            'role' => 'admin',
            'status' => 'suspended',
        ])->assertOk()
            ->assertJsonPath('data.name', 'Budi Baru')
            ->assertJsonPath('data.phone', '081234567890')
            ->assertJsonPath('data.email', 'budi@mail.test')
            ->assertJsonPath('data.role', 'customer')
            ->assertJsonPath('data.status', 'active');

        $user->refresh();
        $this->assertSame(UserRole::Customer, $user->role);
        $this->assertSame(UserStatus::Active, $user->status);
        $this->assertSame('budi@mail.test', $user->email);
    }

    public function test_invalid_phone_is_rejected(): void
    {
        User::factory()->create([
            'email' => 'budi@mail.test',
            'password' => 'Rahasia12',
        ]);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'budi@mail.test',
            'password' => 'Rahasia12',
        ]);

        $this->carryCookies($login)
            ->putJson('/api/v1/auth/profile', [
                'name' => 'Budi',
                'phone' => 'bukan-nomor',
            ])->assertUnprocessable()
            ->assertJsonValidationErrors('phone');
    }

    public function test_password_change_requires_the_current_password(): void
    {
        $user = User::factory()->create([
            'email' => 'budi@mail.test',
            'password' => 'Rahasia12',
        ]);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => 'budi@mail.test',
            'password' => 'Rahasia12',
        ]);

        $this->carryCookies($login);

        $this->putJson('/api/v1/auth/password', [
            'current_password' => 'Salah1234',
            'password' => 'Baru12345',
            'password_confirmation' => 'Baru12345',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('current_password');

        $this->putJson('/api/v1/auth/password', [
            'current_password' => 'Rahasia12',
            'password' => 'Baru12345',
            'password_confirmation' => 'Baru12345',
        ])->assertOk()
            ->assertJsonPath('data.email', 'budi@mail.test');

        $this->assertTrue(Hash::check('Baru12345', $user->refresh()->password));
    }
}
