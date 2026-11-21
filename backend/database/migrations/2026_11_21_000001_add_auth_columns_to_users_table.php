<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// Kolom role dan status dipakai RBAC. Phone disimpan untuk profil, bukan untuk login.
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('name', 100)->change();
            $table->string('phone', 20)->nullable()->after('email');
            $table->enum('role', ['customer', 'owner', 'admin'])->default('customer')->after('password');
            $table->enum('status', ['active', 'suspended'])->default('active')->after('role');
            $table->index(['role', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role', 'status']);
            $table->dropColumn(['phone', 'role', 'status']);
            $table->string('name')->change();
        });
    }
};
