<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;

class RoleMiddlewareTest extends StatefulApiTestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Probe routes that mirror how real owner/admin endpoints will be protected.
        Route::middleware(['api', 'auth:sanctum', 'active', 'role:owner'])
            ->get('/api/v1/_test/owner-only', fn () => response()->json(['ok' => true]));
        Route::middleware(['api', 'auth:sanctum', 'active', 'role:admin'])
            ->get('/api/v1/_test/admin-only', fn () => response()->json(['ok' => true]));
        Route::middleware(['api', 'auth:sanctum', 'active', 'role:owner,admin'])
            ->get('/api/v1/_test/owner-or-admin', fn () => response()->json(['ok' => true]));
    }

    public function test_guest_gets_401(): void
    {
        $this->getJson('/api/v1/_test/owner-only')->assertUnauthorized();
    }

    public function test_customer_cannot_access_owner_or_admin_routes(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer, 'web')->getJson('/api/v1/_test/owner-only')
            ->assertForbidden()->assertJsonPath('code', 'FORBIDDEN_ROLE');
        $this->actingAs($customer, 'web')->getJson('/api/v1/_test/admin-only')->assertForbidden();
    }

    public function test_owner_can_access_owner_route_but_not_admin_route(): void
    {
        $owner = User::factory()->owner()->create();

        $this->actingAs($owner, 'web')->getJson('/api/v1/_test/owner-only')->assertOk();
        $this->actingAs($owner, 'web')->getJson('/api/v1/_test/admin-only')->assertForbidden();
        $this->actingAs($owner, 'web')->getJson('/api/v1/_test/owner-or-admin')->assertOk();
    }

    public function test_admin_can_access_admin_route_but_not_owner_only_route(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin, 'web')->getJson('/api/v1/_test/admin-only')->assertOk();
        $this->actingAs($admin, 'web')->getJson('/api/v1/_test/owner-only')->assertForbidden();
    }

    public function test_suspended_owner_is_blocked_before_role_check(): void
    {
        $owner = User::factory()->owner()->suspended()->create();

        $this->actingAs($owner, 'web')->getJson('/api/v1/_test/owner-only')
            ->assertForbidden()->assertJsonPath('code', 'ACCOUNT_SUSPENDED');
    }
}
