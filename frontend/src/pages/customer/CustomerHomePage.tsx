import { StatReadout } from '@/components/common/StatReadout'
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
      <h1 className="font-display text-5xl leading-none text-ink">Area pelanggan</h1>
      {dashboard.isPending ? <p className="mt-4 text-sm text-slate-700">Memuat ringkasan...</p> : null}
      {dashboard.isError ? (
        <p className="mt-4 text-sm text-red-800">{apiErrorMessage(dashboard.error, 'Ringkasan gagal dimuat.')}</p>
      ) : null}
      {dashboard.data ? (
        <>
          <div className="mt-6 flex flex-wrap gap-8 rounded-lg bg-enamel px-5 py-6">
            <StatReadout value={dashboard.data.upcoming_count} label="Akan datang" />
            <StatReadout value={dashboard.data.pending_count} label="Menunggu pemilik" />
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/explore" className="inline-flex rounded-md bg-open px-4 py-2.5 text-sm font-semibold text-panel hover:bg-enamel">
              Cari lapangan
            </Link>
            <Link to="/customer/bookings" className="inline-flex rounded-md border border-line bg-panel px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper">
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
