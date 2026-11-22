import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Alert } from '@/components/common/Alert'
import { Button } from '@/components/common/Button'
import { TextField } from '@/components/common/TextField'
import { useMe, useUpdatePassword, useUpdateProfile } from '@/features/auth/hooks'
import { passwordSchema, profileSchema, type PasswordInput, type ProfileInput } from '@/features/auth/schemas'
import { applyServerValidationErrors, getApiErrorMessage } from '@/lib/apiError'
import { roleLabel } from '@/lib/routes'

export function ProfilePage() {
  const { data: user } = useMe()
  const updateProfile = useUpdateProfile()
  const updatePassword = useUpdatePassword()

  const [profileStatus, setProfileStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
    },
  })

  const passwordForm = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  })

  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        phone: user.phone ?? '',
      })
    }
  }, [user, profileForm])

  if (!user) return null

  const handleProfileSubmit = (values: ProfileInput) => {
    setProfileStatus(null)
    updateProfile.mutate(values, {
      onSuccess: () => {
        setProfileStatus({ type: 'success', message: 'Profil berhasil diperbarui.' })
      },
      onError: (error) => {
        const applied = applyServerValidationErrors(error, profileForm.setError, ['name', 'phone'])
        if (!applied) {
          setProfileStatus({
            type: 'error',
            message: getApiErrorMessage(error, 'Gagal memperbarui profil.'),
          })
        }
      },
    })
  }

  const handlePasswordSubmit = (values: PasswordInput) => {
    setPasswordStatus(null)
    updatePassword.mutate(values, {
      onSuccess: () => {
        passwordForm.reset()
        setPasswordStatus({ type: 'success', message: 'Password berhasil diubah.' })
      },
      onError: (error) => {
        const applied = applyServerValidationErrors(error, passwordForm.setError, [
          'current_password',
          'password',
          'password_confirmation',
        ])
        if (!applied) {
          setPasswordStatus({
            type: 'error',
            message: getApiErrorMessage(error, 'Gagal mengubah password.'),
          })
        }
      },
    })
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profil Akun</h1>
        <p className="mt-1 text-sm text-slate-600">Kelola informasi pribadi dan keamanan akun Anda.</p>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-semibold text-slate-900">Informasi Akun</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Email</dt>
            <dd className="mt-1 font-medium text-slate-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Peran</dt>
            <dd className="mt-1 font-medium text-slate-900">{roleLabel[user.role]}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Status</dt>
            <dd className="mt-1">
              <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                {user.status === 'active' ? 'Aktif' : 'Dinonaktifkan'}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-semibold text-slate-900">Edit Profil</h2>
        <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="mt-4 space-y-4" noValidate>
          {profileStatus ? <Alert variant={profileStatus.type}>{profileStatus.message}</Alert> : null}

          <TextField
            label="Nama Lengkap"
            type="text"
            autoComplete="name"
            error={profileForm.formState.errors.name?.message}
            {...profileForm.register('name')}
          />

          <TextField
            label="Nomor HP"
            type="tel"
            autoComplete="tel"
            placeholder="081234567890"
            hint="Opsional. Contoh: 081234567890 atau +6281234567890"
            error={profileForm.formState.errors.phone?.message}
            {...profileForm.register('phone')}
          />

          <div className="flex justify-end">
            <Button type="submit" isLoading={updateProfile.isPending}>
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h2 className="text-base font-semibold text-slate-900">Ubah Password</h2>
        <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="mt-4 space-y-4" noValidate>
          {passwordStatus ? <Alert variant={passwordStatus.type}>{passwordStatus.message}</Alert> : null}

          <TextField
            label="Password Saat Ini"
            type="password"
            autoComplete="current-password"
            error={passwordForm.formState.errors.current_password?.message}
            {...passwordForm.register('current_password')}
          />

          <TextField
            label="Password Baru"
            type="password"
            autoComplete="new-password"
            hint="Minimal 8 karakter, kombinasi huruf dan angka."
            error={passwordForm.formState.errors.password?.message}
            {...passwordForm.register('password')}
          />

          <TextField
            label="Konfirmasi Password Baru"
            type="password"
            autoComplete="new-password"
            error={passwordForm.formState.errors.password_confirmation?.message}
            {...passwordForm.register('password_confirmation')}
          />

          <div className="flex justify-end">
            <Button type="submit" isLoading={updatePassword.isPending}>
              Perbarui Password
            </Button>
          </div>
        </form>
      </section>
    </div>
  )
}
