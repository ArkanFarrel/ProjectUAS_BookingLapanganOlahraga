<?php

namespace App\Exceptions;

use RuntimeException;

class BlockConflictsWithBooking extends RuntimeException
{
    public function __construct(string $message = 'Blokir bertabrakan dengan booking yang masih aktif.')
    {
        parent::__construct($message);
    }
}
