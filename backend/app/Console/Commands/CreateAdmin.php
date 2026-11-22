<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;

/**
 * Creates an admin account interactively. Admins can never self-register (FR-001),
 * and credentials are never hardcoded in seeders. The password is always prompted
 * (hidden input) so it does not end up in shell history.
 */
class CreateAdmin extends Command
{
    protected $signature = 'app:create-admin
        {--name= : Nama admin}
        {--email= : Email admin}';

    protected $description = 'Buat akun admin SportsCourt secara aman (password diminta lewat prompt tersembunyi)';

    public function handle(): int
    {
        $name = trim((string) ($this->option('name') ?: $this->ask('Nama admin')));
        $email = mb_strtolower(trim((string) ($this->option('email') ?: $this->ask('Email admin'))));
        $password = (string) $this->secret('Password (min. 12 karakter, huruf besar/kecil, angka, simbol)');
        $confirmation = (string) $this->secret('Ulangi password');

        $validator = Validator::make(
            [
                'name' => $name,
                'email' => $email,
                'password' => $password,
                'password_confirmation' => $confirmation,
            ],
            [
                'name' => ['required', 'string', 'min:2', 'max:100'],
                'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'string', 'max:72', 'confirmed', Password::min(12)->letters()->mixedCase()->numbers()->symbols()],
            ],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        $user = new User([
            'name' => $name,
            'email' => $email,
            'password' => $password,
        ]);
        $user->role = UserRole::Admin;
        $user->status = UserStatus::Active;
        $user->email_verified_at = now();
        $user->save();

        $this->info("Admin {$user->email} berhasil dibuat (id: {$user->id}).");

        return self::SUCCESS;
    }
}
