<?php

namespace Tests\Feature\Auth;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\DataProvider;

class RegisterTest extends StatefulApiTestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'Budi Santoso',
            'email' => 'budi@example.com',
            'password' => 'rahasia123',
            'password_confirmation' => 'rahasia123',
            'account_type' => 'customer',
        ], $overrides);
    }

    #[DataProvider('registrableRoles')]
    public function test_customer_and_owner_can_register_and_are_logged_in(string $accountType): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->payload(['account_type' => $accountType]));

        $response->assertCreated()
            ->assertJsonPath('data.email', 'budi@example.com')
            ->assertJsonPath('data.role', $accountType)
            ->assertJsonPath('data.status', 'active')
            ->assertJsonMissingPath('data.password')
            ->assertJsonMissingPath('data.remember_token');

        $user = User::where('email', 'budi@example.com')->firstOrFail();
        $this->assertSame($accountType, $user->role->value);
        $this->assertTrue(Hash::check('rahasia123', $user->password));
        $this->assertAuthenticatedAs($user, 'web');
    }

    /**
     * @return array<string, array{string}>
     */
    public static function registrableRoles(): array
    {
        return ['customer' => ['customer'], 'owner' => ['owner']];
    }

    public function test_cannot_register_as_admin(): void
    {
        $this->postJson('/api/v1/auth/register', $this->payload(['account_type' => 'admin']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('account_type');

        $this->assertDatabaseMissing('users', ['email' => 'budi@example.com']);
    }

    public function test_role_and_status_fields_in_payload_are_ignored(): void
    {
        $this->postJson('/api/v1/auth/register', $this->payload([
            'role' => 'admin',
            'status' => 'suspended',
        ]))->assertCreated()->assertJsonPath('data.role', 'customer')->assertJsonPath('data.status', 'active');

        $this->assertSame(UserRole::Customer, User::firstOrFail()->role);
    }

    public function test_email_is_normalized_and_must_be_unique(): void
    {
        User::factory()->create(['email' => 'budi@example.com']);

        $this->postJson('/api/v1/auth/register', $this->payload(['email' => '  BUDI@Example.com ']))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_password_must_be_strong_and_confirmed(): void
    {
        $this->postJson('/api/v1/auth/register', $this->payload([
            'password' => 'short',
            'password_confirmation' => 'different',
        ]))->assertUnprocessable()->assertJsonValidationErrors('password');

        $this->postJson('/api/v1/auth/register', $this->payload([
            'password' => 'onlyletters',
            'password_confirmation' => 'onlyletters',
        ]))->assertUnprocessable()->assertJsonValidationErrors('password');
    }

    public function test_required_fields_are_validated(): void
    {
        $this->postJson('/api/v1/auth/register', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password', 'account_type']);
    }
}
