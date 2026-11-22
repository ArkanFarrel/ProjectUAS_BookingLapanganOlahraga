import { Link } from 'react-router-dom'
import { useMe } from '@/features/auth/hooks'

export function OwnerDashboardPage() {
  const { data: user } = useMe()

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Dashboard Pemilik Venue</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Halo, {user?.name ?? 'Pemilik Venue'}</h1>
        <p className="mt-2 text-sm text-slate-600">
          Akun pemilik venue Anda siap digunakan. Fitur manajemen venue &amp; lapangan (Phase 4), pengaturan jam operasional &amp; blokir jadwal (Phase 5), serta persetujuan booking masuk (Phase 6–7) akan ditambahkan bertahap.
        </p>
        <div className="mt-4">
          <Link
            to="/profile"
            className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Kelola Profil
          </Link>
        </div>
      </div>
    </div>
  )
}
