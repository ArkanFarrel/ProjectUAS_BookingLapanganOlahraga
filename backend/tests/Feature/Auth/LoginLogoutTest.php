<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;

class LoginLogoutTest extends StatefulApiTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('budi@example.com|127.0.0.1');
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->owner()->create(['email' => 'budi@example.com']);

        $this->postJson('/api/v1/auth/login', ['email' => 'BUDI@example.com', 'password' => 'password'])
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.role', 'owner')
            ->assertJsonMissingPath('data.password');

        $this->assertAuthenticatedAs($user, 'web');
    }

    public function test_wrong_password_returns_generic_error(): void
    {
        User::factory()->create(['email' => 'budi@example.com']);

        $this->postJson('/api/v1/auth/login', ['email' => 'budi@example.com', 'password' => 'salah'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'Email atau password salah.');

        $this->assertGuest('web');
    }

    public function test_unknown_email_returns_same_generic_error(): void
    {
        $this->postJson('/api/v1/auth/login', ['email' => 'tidakada@example.com', 'password' => 'password'])
            ->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'Email atau password salah.');
    }

    public function test_suspended_user_cannot_login(): void
    {
        User::factory()->suspended()->create(['email' => 'budi@example.com']);

        $this->postJson('/api/v1/auth/login', ['email' => 'budi@example.com', 'password' => 'password'])
            ->assertForbidden()
            ->assertJsonPath('code', 'ACCOUNT_SUSPENDED');

        $this->assertGuest('web');
    }

    public function test_login_is_rate_limited_after_five_attempts(): void
    {
        User::factory()->create(['email' => 'budi@example.com']);

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', ['email' => 'budi@example.com', 'password' => 'salah'])
                ->assertUnprocessable();
        }

        $this->postJson('/api/v1/auth/login', ['email' => 'budi@example.com', 'password' => 'password'])
            ->assertTooManyRequests()
            ->assertJsonPath('code', 'TOO_MANY_REQUESTS');

        $this->assertGuest('web');
    }

    public function test_logout_ends_the_session(): void
    {
        $user = User::factory()->create(['email' => 'budi@example.com']);

        $this->postJson('/api/v1/auth/login', ['email' => 'budi@example.com', 'password' => 'password'])->assertOk();
        $this->getJson('/api/v1/auth/me')->assertOk()->assertJsonPath('data.id', $user->id);

        $this->postJson('/api/v1/auth/logout')->assertNoContent();

        $this->resetAuthGuards();
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_login_without_stateful_origin_is_rejected(): void
    {
        User::factory()->create(['email' => 'budi@example.com']);

        $this->withHeaders(['Origin' => 'http://evil.test', 'Referer' => 'http://evil.test/'])
            ->postJson('/api/v1/auth/login', ['email' => 'budi@example.com', 'password' => 'password'])
            ->assertStatus(400)
            ->assertJsonPath('code', 'STATEFUL_REQUEST_REQUIRED');
    }
}
