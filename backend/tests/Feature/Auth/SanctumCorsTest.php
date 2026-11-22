<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

class SanctumCorsTest extends TestCase
{
    public function test_csrf_cookie_endpoint_sets_xsrf_cookie_and_allows_frontend_origin(): void
    {
        $response = $this->withHeaders([
            'Origin' => 'http://localhost:5173',
        ])->get('/sanctum/csrf-cookie');

        $response->assertNoContent()
            ->assertCookie('XSRF-TOKEN')
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
            ->assertHeader('Access-Control-Allow-Credentials', 'true');
    }

    public function test_disallowed_origin_is_never_reflected_or_wildcarded_in_cors_header(): void
    {
        $response = $this->withHeaders([
            'Origin' => 'http://evil.test',
        ])->get('/sanctum/csrf-cookie');

        $response->assertNoContent();

        $allowOrigin = $response->headers->get('Access-Control-Allow-Origin');
        $this->assertNotSame('http://evil.test', $allowOrigin);
        $this->assertNotSame('*', $allowOrigin);
    }

    public function test_preflight_options_request_allows_configured_frontend_origin(): void
    {
        $response = $this->withHeaders([
            'Origin' => 'http://localhost:5173',
            'Access-Control-Request-Method' => 'POST',
            'Access-Control-Request-Headers' => 'content-type,x-xsrf-token',
        ])->options('/api/v1/auth/login');

        $response->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
            ->assertHeader('Access-Control-Allow-Credentials', 'true');
    }
}
