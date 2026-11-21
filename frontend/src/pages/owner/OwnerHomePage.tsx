import { StatReadout } from '@/components/common/StatReadout'
import { AppShell } from '@/components/layout/AppShell'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { BookingLines } from '@/features/bookings/BookingLines'
import { getOwnerDashboard } from '@/features/dashboard/api'
import { usePageTitle } from '@/lib/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

export function OwnerHomePage() {
  usePageTitle('Area pemilik venue')
  const dashboard = useQuery({ queryKey: ['owner-dashboard'], queryFn: getOwnerDashboard })

  return (
    <AppShell>
      <h1 className="font-display text-5xl leading-none text-ink">Area pemilik venue</h1>
      {dashboard.isPending ? <p className="mt-4 text-sm text-slate-700">Memuat ringkasan...</p> : null}
      {dashboard.isError ? (
        <p className="mt-4 text-sm text-red-800">{apiErrorMessage(dashboard.error, 'Ringkasan gagal dimuat.')}</p>
      ) : null}
      {dashboard.data ? (
        <>
          <div className="mt-6 grid gap-6 rounded-lg bg-enamel px-5 py-6 sm:grid-cols-4">
            <StatReadout value={dashboard.data.venues_count} label="Venue" />
            <StatReadout value={dashboard.data.courts_count} label="Lapangan" />
            <StatReadout value={dashboard.data.pending_bookings} label="Menunggu" />
            <StatReadout value={dashboard.data.confirmed_upcoming} label="Dikonfirmasi" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/owner/venues" className="inline-flex rounded-md bg-open px-4 py-2.5 text-sm font-semibold text-panel hover:bg-enamel">
              Venue saya
            </Link>
            <Link to="/owner/bookings" className="inline-flex rounded-md border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper">
              Booking masuk
            </Link>
          </div>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">Booking terbaru</h2>
          <BookingLines
            bookings={dashboard.data.recent_bookings}
            showCustomer
            empty="Belum ada booking di venue Anda."
          />
        </>
      ) : null}
    </AppShell>
  )
}
