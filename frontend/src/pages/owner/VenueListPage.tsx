import { AppShell } from '@/components/layout/AppShell'
import { listMyVenues } from '@/features/venues/api'
import { statusLabel } from '@/features/venues/types'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { usePageTitle } from '@/lib/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

export function VenueListPage() {
  usePageTitle('Venue saya')
  const venues = useQuery({
    queryKey: ['owner-venues'],
    queryFn: listMyVenues,
  })

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Venue saya</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
            Venue baru berstatus menunggu verifikasi. Admin yang menyetujui atau menolak.
          </p>
        </div>
        <Link
          to="/owner/venues/new"
          className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Tambah venue
        </Link>
      </div>

      {venues.isPending ? <p className="mt-8 text-sm text-slate-700">Memuat venue...</p> : null}
      {venues.isError ? (
        <p className="mt-8 text-sm text-red-700">
          {apiErrorMessage(venues.error, 'Daftar venue gagal dimuat.')}{' '}
          <button type="button" className="font-semibold underline" onClick={() => void venues.refetch()}>
            Coba lagi
          </button>
        </p>
      ) : null}

      {venues.data && venues.data.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
          Belum ada venue. Tambah venue pertama, lalu lengkapi lapangan dan fotonya.
        </p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {venues.data?.map((venue) => (
          <li key={venue.id}>
            <Link
              to={`/owner/venues/${venue.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-700"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-slate-900">{venue.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {venue.city}, {venue.province}
                  </p>
                </div>
                <p className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
                  {statusLabel(venue.status)}
                  {venue.is_active ? '' : ', nonaktif'}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  )
}
