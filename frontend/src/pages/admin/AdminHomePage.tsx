import { AppShell } from '@/components/layout/AppShell'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { statusLabel, type BookingStatus } from '@/features/bookings/api'
import { getAdminDashboard } from '@/features/dashboard/api'
import { statusLabel as venueStatusLabel, type VenueStatus } from '@/features/venues/types'
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
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Area admin</h1>
      {dashboard.isPending ? <p className="mt-4 text-sm text-slate-700">Memuat ringkasan...</p> : null}
      {dashboard.isError ? (
        <p className="mt-4 text-sm text-red-800">{apiErrorMessage(dashboard.error, 'Ringkasan gagal dimuat.')}</p>
      ) : null}
      {dashboard.data ? (
        <>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-800">
            {dashboard.data.users_count} pengguna, {dashboard.data.owners_count} pemilik venue, {dashboard.data.courts_count} lapangan.
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-800">
            Venue:{' '}
            {venueOrder.map((status) => `${dashboard.data?.venues_by_status[status] ?? 0} ${venueStatusLabel(status).toLowerCase()}`).join(', ')}
            .
          </p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-800">
            Booking:{' '}
            {bookingOrder.map((status) => `${dashboard.data?.bookings_by_status[status] ?? 0} ${statusLabel(status).toLowerCase()}`).join(', ')}
            .
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/admin/venues" className="inline-flex rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
              Verifikasi venue
            </Link>
            <Link to="/admin/users" className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Pengguna
            </Link>
            <Link to="/admin/sports" className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Olahraga
            </Link>
            <Link to="/admin/bookings" className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Pantau booking
            </Link>
          </div>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">Menunggu verifikasi</h2>
          {dashboard.data.pending_venues.length === 0 ? (
            <p className="mt-2 text-sm text-slate-700">Tidak ada venue yang menunggu.</p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-200 border-y border-slate-200">
              {dashboard.data.pending_venues.map((venue) => (
                <li key={venue.id} className="py-3">
                  <Link to={`/admin/venues/${venue.id}`} className="font-medium text-emerald-800">
                    {venue.name}
                  </Link>
                  <p className="mt-1 text-sm text-slate-700">
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
