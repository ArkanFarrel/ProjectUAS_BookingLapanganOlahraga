<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthCheckTest extends TestCase
{
    public function test_health_endpoint_returns_ok_payload(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertOk()
            ->assertExactJson([
                'data' => [
                    'status' => 'ok',
                    'service' => 'sportscourt-api',
                ],
            ]);
    }
}
