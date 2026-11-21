import { RoleHomePage } from '@/pages/auth/RoleHomePage'

export function OwnerHomePage() {
  return (
    <RoleHomePage
      title="Area pemilik venue"
      body="Akun pemilik sudah aktif dan bisa dipakai nanti untuk mendaftarkan venue. Verifikasi venue dilakukan admin, bukan saat pendaftaran akun."
    />
  )
}
