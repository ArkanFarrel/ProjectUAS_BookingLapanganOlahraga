<?php

namespace App\Enums;

// Status yang menahan slot: confirmed, atau pending yang belum lewat expires_at.
enum BookingStatus: string
{
    case Pending = 'pending';
    case Confirmed = 'confirmed';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';
    case Completed = 'completed';
    case Expired = 'expired';
}
