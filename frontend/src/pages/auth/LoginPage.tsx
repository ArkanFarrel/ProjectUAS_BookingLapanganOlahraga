import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { TextField } from '@/components/common/TextField'
import { useLogin } from '@/features/auth/hooks'
import { loginSchema, type LoginInput } from '@/features/auth/schemas'
import { applyServerValidationErrors, getApiErrorMessage } from '@/lib/apiError'
import { homeRouteFor, safeRedirectPath } from '@/lib/routes'

export function LoginPage() {
  const login = useLogin()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  })

  const onSubmit = (values: LoginInput) => {
    setFormError(null)
    login.mutate(values, {
      onSuccess: (user) => {
        const redirectFrom = safeRedirectPath((location.state as { from?: unknown } | null)?.from)
        navigate(redirectFrom ?? homeRouteFor(user.role), { replace: true })
      },
      onError: (error) => {
        const applied = applyServerValidationErrors(error, setError, ['email', 'password'])
        if (!applied) {
          setFormError(getApiErrorMessage(error, 'Gagal masuk. Periksa kembali data Anda.'))
        }
      },
    })
  }

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center px-4 py-12 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Masuk ke SportsCourt</h1>
        <p className="mt-1 text-sm text-slate-600">
          Gunakan email dan password akun SportsCourt Anda.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          {formError ? <Alert variant="error">{formError}</Alert> : null}

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
            autoComplete="current-password"
            placeholder="Masukkan password"
            error={errors.password?.message}
            {...register('password')}
          />

          <div className="flex items-center gap-2">
            <input
              id="remember-login"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              {...register('remember')}
            />
            <label htmlFor="remember-login" className="text-sm text-slate-700">
              Ingat saya
            </label>
          </div>

          <Button type="submit" isLoading={login.isPending} className="w-full">
            Masuk
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Belum punya akun?{' '}
          <Link to="/register" className="font-medium text-emerald-700 hover:underline">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  )
}
