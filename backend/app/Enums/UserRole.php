<?php

namespace App\Enums;

enum UserRole: string
{
    case Customer = 'customer';
    case Owner = 'owner';
    case Admin = 'admin';

    /**
     * Roles that may be chosen through public registration.
     *
     * @return list<string>
     */
    public static function registrable(): array
    {
        return [self::Customer->value, self::Owner->value];
    }
}
