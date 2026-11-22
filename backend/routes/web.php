<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'data' => [
            'service' => 'sportscourt-api',
            'version' => 'v1',
            'status' => 'ok',
        ],
    ]);
});
