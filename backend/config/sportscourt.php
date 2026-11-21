<?php

return [
    'booking' => [
        'pending_ttl_minutes' => (int) env('BOOKING_PENDING_TTL_MINUTES', 120),
        'cancel_cutoff_hours' => (int) env('BOOKING_CANCEL_CUTOFF_HOURS', 24),
        'max_days_ahead' => (int) env('BOOKING_MAX_DAYS_AHEAD', 30),
        'min_duration_hours' => 1,
        'max_duration_hours' => 4,
    ],
    'venue' => [
        'max_images' => 5,
        'timezones' => ['Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'],
        'facilities' => ['parking', 'toilet', 'shower', 'canteen', 'musholla', 'wifi', 'locker'],
    ],
];
