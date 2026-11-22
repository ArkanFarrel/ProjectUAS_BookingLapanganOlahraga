<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class CreateAdminCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_be_created_via_command(): void
    {
        $this->artisan('app:create-admin', ['--name' => 'Admin Utama', '--email' => 'ADMIN@sportscourt.test'])
            ->expectsQuestion('Password (min. 12 karakter, huruf besar/kecil, angka, simbol)', 'Sup3r$ecretPass')
            ->expectsQuestion('Ulangi password', 'Sup3r$ecretPass')
            ->assertSuccessful();

        $admin = User::where('email', 'admin@sportscourt.test')->firstOrFail();
        $this->assertSame(UserRole::Admin, $admin->role);
        $this->assertTrue(Hash::check('Sup3r$ecretPass', $admin->password));
    }

    public function test_weak_password_is_rejected(): void
    {
        $this->artisan('app:create-admin', ['--name' => 'Admin', '--email' => 'admin@sportscourt.test'])
            ->expectsQuestion('Password (min. 12 karakter, huruf besar/kecil, angka, simbol)', 'weak')
            ->expectsQuestion('Ulangi password', 'weak')
            ->assertFailed();

        $this->assertDatabaseMissing('users', ['email' => 'admin@sportscourt.test']);
    }
}
