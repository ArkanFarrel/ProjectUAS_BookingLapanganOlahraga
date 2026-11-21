<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreateAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_creates_an_admin_that_can_login(): void
    {
        $this->artisan('app:create-admin', [
            '--name' => 'Admin Utama',
            '--email' => 'Admin@SportsCourt.test',
            '--password' => 'Rahasia12',
        ])->assertSuccessful();

        $admin = User::query()->where('email', 'admin@sportscourt.test')->first();

        $this->assertNotNull($admin);
        $this->assertSame(UserRole::Admin, $admin->role);

        $this->withCredentials()
            ->withHeaders([
                'origin' => 'http://localhost:5173',
                'referer' => 'http://localhost:5173',
            ])
            ->postJson('/api/v1/auth/login', [
                'email' => 'admin@sportscourt.test',
                'password' => 'Rahasia12',
            ])->assertOk()
            ->assertJsonPath('data.role', 'admin');
    }

    public function test_command_rejects_a_weak_password_and_a_duplicate_email(): void
    {
        $this->artisan('app:create-admin', [
            '--name' => 'Admin Utama',
            '--email' => 'admin@sportscourt.test',
            '--password' => 'password',
        ])->assertFailed();

        $this->assertDatabaseCount('users', 0);

        User::factory()->create(['email' => 'ada@sportscourt.test']);

        $this->artisan('app:create-admin', [
            '--name' => 'Admin Lain',
            '--email' => 'ada@sportscourt.test',
            '--password' => 'Rahasia12',
        ])->assertFailed();

        $this->assertSame(0, User::query()->where('role', UserRole::Admin)->count());
    }
}
