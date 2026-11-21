<?php

namespace App\Enums;

// Akun suspended tidak boleh tetap memakai session yang sudah ada.
enum UserStatus: string
{
    case Active = 'active';
    case Suspended = 'suspended';
}
