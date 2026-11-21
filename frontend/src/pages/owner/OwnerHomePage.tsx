import { RoleHomePage } from '@/pages/auth/RoleHomePage'

export function OwnerHomePage() {
  return (
    <RoleHomePage
      title="Area pemilik venue"
      body="Daftarkan venue dan lapangan dari sini. Venue baru menunggu persetujuan admin sebelum bisa dipesan pelanggan."
      primaryHref="/owner/venues"
      primaryLabel="Venue saya"
      secondaryHref="/owner/bookings"
      secondaryLabel="Booking masuk"
    />
  )
}
