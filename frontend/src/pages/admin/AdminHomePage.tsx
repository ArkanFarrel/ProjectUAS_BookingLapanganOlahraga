import { RoleHomePage } from '@/pages/auth/RoleHomePage'

export function AdminHomePage() {
  return (
    <RoleHomePage
      title="Area admin"
      body="Periksa venue yang didaftarkan pemilik. Menyetujui, menolak, atau menangguhkan venue dilakukan di halaman verifikasi. Pengelolaan user menyusul di fase berikutnya."
      primaryHref="/admin/venues"
      primaryLabel="Verifikasi venue"
    />
  )
}
