import { StatReadout } from '@/components/common/StatReadout'
import { VenueBadge } from '@/components/common/StatusBadge'
import { AppShell } from '@/components/layout/AppShell'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { statusLabel, type BookingStatus } from '@/features/bookings/api'
import { getAdminDashboard } from '@/features/dashboard/api'
import type { VenueStatus } from '@/features/venues/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

const venueOrder: VenueStatus[] = ['pending_verification', 'approved', 'rejected', 'suspended']
const bookingOrder: BookingStatus[] = ['pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'expired']

export function AdminHomePage() {
  usePageTitle('Area admin')
  const dashboard = useQuery({ queryKey: ['admin-dashboard'], queryFn: getAdminDashboard })

  return (
    <AppShell>
      <h1 className="font-display text-5xl leading-none text-ink">Area admin</h1>
      {dashboard.isPending ? <p className="mt-4 text-sm text-slate-700">Memuat ringkasan...</p> : null}
      {dashboard.isError ? (
        <p className="mt-4 text-sm text-red-800">{apiErrorMessage(dashboard.error, 'Ringkasan gagal dimuat.')}</p>
      ) : null}
      {dashboard.data ? (
        <>
          <div className="mt-6 grid gap-6 rounded-lg bg-enamel px-5 py-6 sm:grid-cols-3">
            <StatReadout value={dashboard.data.users_count} label="Pengguna" />
            <StatReadout value={dashboard.data.owners_count} label="Pemilik venue" />
            <StatReadout value={dashboard.data.courts_count} label="Lapangan" />
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="overflow-x-auto rounded-lg border border-line bg-panel">
              <table className="w-full text-left text-sm">
                <caption className="px-4 py-3 text-left font-semibold text-ink">Venue</caption>
                <thead className="border-y border-line text-ink-soft">
                  <tr>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {venueOrder.map((status) => (
                    <tr key={status} className="border-b border-line">
                      <td className="px-4 py-2"><VenueBadge status={status} /></td>
                      <td className="px-4 py-2 tabular-nums">{dashboard.data?.venues_by_status[status] ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto rounded-lg border border-line bg-panel">
              <table className="w-full text-left text-sm">
                <caption className="px-4 py-3 text-left font-semibold text-ink">Booking</caption>
                <thead className="border-y border-line text-ink-soft">
                  <tr>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Jumlah</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingOrder.map((status) => (
                    <tr key={status} className="border-b border-line">
                      <td className="px-4 py-2">{statusLabel(status)}</td>
                      <td className="px-4 py-2 tabular-nums">{dashboard.data?.bookings_by_status[status] ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/admin/venues" className="inline-flex rounded-md bg-open px-4 py-2.5 text-sm font-semibold text-panel hover:bg-enamel">
              Verifikasi venue
            </Link>
            <Link to="/admin/users" className="inline-flex rounded-md border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper">
              Pengguna
            </Link>
            <Link to="/admin/sports" className="inline-flex rounded-md border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper">
              Olahraga
            </Link>
            <Link to="/admin/bookings" className="inline-flex rounded-md border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper">
              Pantau booking
            </Link>
          </div>

          <h2 className="mt-10 font-display text-4xl text-ink">Menunggu verifikasi</h2>
          {dashboard.data.pending_venues.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">Tidak ada venue yang menunggu.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line border-y border-line">
              {dashboard.data.pending_venues.map((venue) => (
                <li key={venue.id} className="py-3">
                  <Link to={`/admin/venues/${venue.id}`} className="font-semibold text-open">
                    {venue.name}
                  </Link>
                  <p className="mt-1 text-sm text-ink-soft">
                    {venue.city} · {venue.owner_name ?? 'Pemilik tidak diketahui'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}
    </AppShell>
  )
}
