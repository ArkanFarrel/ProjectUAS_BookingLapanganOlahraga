<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;

/**
 * Base for API tests that exercise the real Sanctum SPA (stateful) flow.
 * Sending the frontend Origin makes Sanctum apply session middleware,
 * exactly like the browser on http://localhost:5173 does.
 */
abstract class StatefulApiTestCase extends TestCase
{
    protected const FRONTEND_ORIGIN = 'http://localhost:5173';

    protected function setUp(): void
    {
        parent::setUp();

        $this->withHeaders([
            'Origin' => self::FRONTEND_ORIGIN,
            'Referer' => self::FRONTEND_ORIGIN.'/',
            'Accept' => 'application/json',
        ]);
    }

    /**
     * Simulate a fresh HTTP request cycle (auth guards keep the user in memory otherwise).
     */
    protected function resetAuthGuards(): void
    {
        $this->app['auth']->forgetGuards();
    }
}
