<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

// Admin tidak ada di form register. Akun ini dibuat manual lewat terminal.
class CreateAdmin extends Command
{
    protected $signature = 'app:create-admin
                            {--name= : Nama lengkap admin}
                            {--email= : Email admin}
                            {--password= : Password. Untuk pemakaian biasa, kosongkan agar diminta secara tersembunyi}';

    protected $description = 'Buat akun admin SportsCourt. Password diminta secara interaktif jika opsi tidak diisi.';

    public function handle(): int
    {
        $name = $this->option('name') ?: $this->ask('Nama admin');
        $email = Str::lower(trim((string) ($this->option('email') ?: $this->ask('Email admin'))));
        $password = $this->option('password');

        if (! is_string($password) || $password === '') {
            $password = (string) $this->secret('Password admin');
            $confirmation = (string) $this->secret('Ulangi password');

            if ($password !== $confirmation) {
                $this->error('Konfirmasi password tidak cocok.');

                return self::FAILURE;
            }
        }

        $validator = Validator::make(
            [
                'name' => $name,
                'email' => $email,
                'password' => $password,
            ],
            [
                'name' => ['required', 'string', 'max:100'],
                'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', Password::defaults()],
            ],
            [],
            [
                'name' => 'nama',
                'email' => 'email',
                'password' => 'password',
            ],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        User::query()->create([
            'name' => $validator->validated()['name'],
            'email' => $validator->validated()['email'],
            'password' => $validator->validated()['password'],
            'role' => UserRole::Admin,
            'status' => UserStatus::Active,
        ]);

        $this->info('Admin berhasil dibuat untuk '.$email.'.');

        return self::SUCCESS;
    }
}
