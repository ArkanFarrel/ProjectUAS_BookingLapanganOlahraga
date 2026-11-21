<?php

namespace App\Exceptions;

use RuntimeException;

class InvalidAvailabilityDate extends RuntimeException
{
    public function __construct(string $message = 'Tanggal di luar jangkauan pencarian.')
    {
        parent::__construct($message);
    }
}
