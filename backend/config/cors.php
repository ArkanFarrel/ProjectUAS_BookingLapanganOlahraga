<?php

// CORS untuk SPA. Origin harus persis FRONTEND_URL dan credentials harus true.
// Tanda bintang tidak boleh dipakai bersama cookie, karena browser akan menolaknya.

$frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [$frontendUrl],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
