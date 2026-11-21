<?php

namespace App\Enums;

// Tiga role tetap. Admin tidak pernah diisi dari form publik.
enum UserRole: string
{
    case Customer = 'customer';
    case Owner = 'owner';
    case Admin = 'admin';
}
