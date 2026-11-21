import { RoleHomePage } from '@/pages/auth/RoleHomePage'

export function CustomerHomePage() {
  return (
    <RoleHomePage
      title="Area pelanggan"
      body="Cari lapangan yang sudah disetujui, lalu ajukan jam kosong. Status booking menunggu sampai pemilik venue mengonfirmasi."
      primaryHref="/customer/bookings"
      primaryLabel="Booking saya"
      secondaryHref="/explore"
      secondaryLabel="Cari lapangan"
    />
  )
}
