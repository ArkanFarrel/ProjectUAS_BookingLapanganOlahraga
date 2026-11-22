import { z } from 'zod'

/*
 * Client-side validation is for UX only. The Laravel backend re-validates everything
 * and remains the security boundary.
 */

const passwordRule = z
  .string()
  .min(8, 'Password minimal 8 karakter.')
  .max(72, 'Password maksimal 72 karakter.')
  .regex(/[A-Za-z]/, 'Password harus mengandung huruf.')
  .regex(/[0-9]/, 'Password harus mengandung angka.')

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email wajib diisi.').pipe(z.email('Format email tidak valid.')),
  password: z.string().min(1, 'Password wajib diisi.'),
  remember: z.boolean(),
})
export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(100, 'Nama maksimal 100 karakter.'),
    email: z.string().trim().min(1, 'Email wajib diisi.').pipe(z.email('Format email tidak valid.')),
    password: passwordRule,
    password_confirmation: z.string().min(1, 'Konfirmasi password wajib diisi.'),
    account_type: z.enum(['customer', 'owner'], { message: 'Pilih tipe akun.' }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Konfirmasi password tidak cocok.',
    path: ['password_confirmation'],
  })
export type RegisterInput = z.infer<typeof registerSchema>

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(100, 'Nama maksimal 100 karakter.'),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || /^(\+62|0)8[0-9]{7,12}$/.test(value.replace(/[\s-]+/g, '')), {
      message: 'Format nomor HP tidak valid (contoh: 081234567890).',
    }),
})
export type ProfileInput = z.infer<typeof profileSchema>

export const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Password saat ini wajib diisi.'),
    password: passwordRule,
    password_confirmation: z.string().min(1, 'Konfirmasi password wajib diisi.'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Konfirmasi password tidak cocok.',
    path: ['password_confirmation'],
  })
export type PasswordInput = z.infer<typeof passwordSchema>
