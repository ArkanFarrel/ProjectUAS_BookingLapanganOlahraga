import { FormBanner } from '@/components/auth/FormBanner'
import { SubmitButton } from '@/components/auth/SubmitButton'
import { TextField } from '@/components/auth/TextField'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { applyFieldErrors, apiErrorMessage } from '@/features/auth/formErrors'
import { useLogin } from '@/features/auth/hooks'
import { homePathForRole } from '@/features/auth/paths'
import { loginSchema, type LoginValues } from '@/features/auth/schemas'
import { usePageTitle } from '@/lib/usePageTitle'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { UserRole } from '@/types/user'

function nextPath(role: UserRole, from: string | undefined): string {
  const home = homePathForRole(role)
  if (from === '/account' || from === home) {
    return from
  }

  // Tamu yang memilih slot kosong harus kembali ke formulir booking, bukan ke beranda.
  if (role === 'customer' && from?.startsWith('/bookings/') && !from.includes('//')) {
    return from
  }

  return home
}

export function LoginPage() {
  usePageTitle('Masuk')
  const navigate = useNavigate()
  const location = useLocation()
  const login = useLogin()
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const from = (location.state as { from?: string } | null)?.from

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginValues) {
    setFormError(null)

    try {
      const user = await login.mutateAsync(values)
      navigate(nextPath(user.role, from), { replace: true })
    } catch (error) {
      const attached = applyFieldErrors(error, setError)
      if (!attached) {
        setFormError(apiErrorMessage(error, 'Login gagal. Coba lagi.'))
      }
    }
  }

  return (
    <AuthLayout
      panelTitle="Pesan lapangan, atau kelola venue Anda."
      panelText="Pelanggan mengajukan reservasi. Pemilik venue menyetujui booking. Akun admin dibuat terpisah dan tidak lewat formulir ini."
    >
      <form className="space-y-5" onSubmit={(event) => void handleSubmit(onSubmit)(event)} noValidate>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Masuk</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Gunakan email dan password akun SportsCourt.
          </p>
        </div>

        <FormBanner message={formError} />

        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          registration={register('email')}
          error={errors.email?.message}
        />

        <div>
          <TextField
            id="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            registration={register('password')}
            error={errors.password?.message}
          />
          <button
            type="button"
            className="mt-2 text-sm font-medium text-emerald-800 hover:text-emerald-950"
            onClick={() => setShowPassword((current) => !current)}
          >
            {showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          </button>
        </div>

        <SubmitButton
          pending={login.isPending}
          idleLabel="Masuk"
          pendingLabel="Masuk..."
        />

        <p className="text-sm text-slate-600">
          Belum punya akun?{' '}
          <Link to="/register" className="font-semibold text-emerald-800 hover:text-emerald-950">
            Daftar
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
