import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { TextField } from '@/components/common/TextField'
import { useRegister } from '@/features/auth/hooks'
import { registerSchema, type RegisterInput } from '@/features/auth/schemas'
import { applyServerValidationErrors, getApiErrorMessage } from '@/lib/apiError'
import { homeRouteFor } from '@/lib/routes'

export function RegisterPage() {
  const registerUser = useRegister()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      account_type: 'customer',
    },
  })

  const onSubmit = (values: RegisterInput) => {
    setFormError(null)
    registerUser.mutate(values, {
      onSuccess: (user) => {
        navigate(homeRouteFor(user.role), { replace: true })
      },
      onError: (error) => {
        const applied = applyServerValidationErrors(error, setError, [
          'name',
          'email',
          'password',
          'password_confirmation',
          'account_type',
        ])
        if (!applied) {
          setFormError(getApiErrorMessage(error, 'Registrasi gagal. Silakan coba lagi.'))
        }
      },
    })
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Daftar Akun SportsCourt</h1>
        <p className="mt-1 text-sm text-slate-600">
          Buat akun sebagai Customer atau Pemilik Venue.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          {formError ? <Alert variant="error">{formError}</Alert> : null}

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">Tipe Akun</legend>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-300 bg-white p-3 text-sm hover:border-emerald-400 has-checked:border-emerald-600 has-checked:bg-emerald-50">
                <input
                  type="radio"
                  value="customer"
                  className="mt-0.5 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  {...register('account_type')}
                />
                <span>
                  <span className="block font-medium text-slate-900">Customer</span>
                  <span className="block text-xs text-slate-600">Cari venue &amp; buat booking lapangan</span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-slate-300 bg-white p-3 text-sm hover:border-emerald-400 has-checked:border-emerald-600 has-checked:bg-emerald-50">
                <input
                  type="radio"
                  value="owner"
                  className="mt-0.5 h-4 w-4 text-emerald-600 focus:ring-emerald-500"
                  {...register('account_type')}
                />
                <span>
                  <span className="block font-medium text-slate-900">Pemilik Venue</span>
                  <span className="block text-xs text-slate-600">Daftarkan &amp; kelola venue olahraga</span>
                </span>
              </label>
            </div>
            {errors.account_type?.message ? (
              <p role="alert" className="text-xs font-medium text-red-600">
                {errors.account_type.message}
              </p>
            ) : null}
          </fieldset>

          <TextField
            label="Nama Lengkap"
            type="text"
            autoComplete="name"
            placeholder="Contoh: Budi Santoso"
            error={errors.name?.message}
            {...register('name')}
          />

          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="nama@email.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Buat password"
            hint="Minimal 8 karakter, kombinasi huruf dan angka."
            error={errors.password?.message}
            {...register('password')}
          />

          <TextField
            label="Konfirmasi Password"
            type="password"
            autoComplete="new-password"
            placeholder="Ulangi password"
            error={errors.password_confirmation?.message}
            {...register('password_confirmation')}
          />

          <Button type="submit" isLoading={registerUser.isPending} className="w-full">
            Daftar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-medium text-emerald-700 hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
