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
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Area pemilik venue</h1>
      {dashboard.isPending ? <p className="mt-4 text-sm text-slate-700">Memuat ringkasan...</p> : null}
      {dashboard.isError ? (
        <p className="mt-4 text-sm text-red-800">{apiErrorMessage(dashboard.error, 'Ringkasan gagal dimuat.')}</p>
      ) : null}
      {dashboard.data ? (
        <>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-800">
            {dashboard.data.venues_count} venue dan {dashboard.data.courts_count} lapangan. {dashboard.data.pending_bookings} booking menunggu, {dashboard.data.confirmed_upcoming} sudah dikonfirmasi dan belum selesai.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/owner/venues" className="inline-flex rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
              Venue saya
            </Link>
            <Link to="/owner/bookings" className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
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
