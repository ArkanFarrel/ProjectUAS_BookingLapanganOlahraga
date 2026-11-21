import { AppShell } from '@/components/layout/AppShell'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { BookingLines } from '@/features/bookings/BookingLines'
import { getCustomerDashboard } from '@/features/dashboard/api'
import { usePageTitle } from '@/lib/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

export function CustomerHomePage() {
  usePageTitle('Area pelanggan')
  const dashboard = useQuery({ queryKey: ['customer-dashboard'], queryFn: getCustomerDashboard })

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Area pelanggan</h1>
      {dashboard.isPending ? <p className="mt-4 text-sm text-slate-700">Memuat ringkasan...</p> : null}
      {dashboard.isError ? (
        <p className="mt-4 text-sm text-red-800">{apiErrorMessage(dashboard.error, 'Ringkasan gagal dimuat.')}</p>
      ) : null}
      {dashboard.data ? (
        <>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-800">
            {dashboard.data.upcoming_count} booking akan datang, {dashboard.data.pending_count} masih menunggu konfirmasi pemilik.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/explore" className="inline-flex rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
              Cari lapangan
            </Link>
            <Link to="/customer/bookings" className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Semua booking
            </Link>
          </div>

          <h2 className="mt-8 text-lg font-semibold text-slate-900">Akan datang</h2>
          <BookingLines bookings={dashboard.data.upcoming} empty="Belum ada jadwal yang masih berjalan." />

          <h2 className="mt-8 text-lg font-semibold text-slate-900">Terbaru</h2>
          <BookingLines bookings={dashboard.data.recent} empty="Belum ada booking." />
        </>
      ) : null}
    </AppShell>
  )
}
