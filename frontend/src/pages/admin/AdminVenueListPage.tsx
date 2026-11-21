import { AppShell } from '@/components/layout/AppShell'
import { listAdminVenues } from '@/features/admin/api'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { statusLabel, type VenueStatus } from '@/features/venues/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const statuses: { value: '' | VenueStatus; label: string }[] = [
  { value: '', label: 'Semua status' },
  { value: 'pending_verification', label: 'Menunggu verifikasi' },
  { value: 'approved', label: 'Disetujui' },
  { value: 'rejected', label: 'Ditolak' },
  { value: 'suspended', label: 'Ditangguhkan' },
]

export function AdminVenueListPage() {
  usePageTitle('Verifikasi venue')
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [city, setCity] = useState(params.get('city') ?? '')
  const status = (params.get('status') ?? '') as '' | VenueStatus
  const page = Number(params.get('page') ?? '1')

  const venues = useQuery({
    queryKey: ['admin-venues', status, params.get('q') ?? '', params.get('city') ?? '', page],
    queryFn: () =>
      listAdminVenues({
        status,
        q: params.get('q') ?? '',
        city: params.get('city') ?? '',
        page,
      }),
  })

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Verifikasi venue</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">
        Setujui venue yang datanya lengkap, atau tolak dengan alasan yang bisa dibaca pemilik.
      </p>

      <form
        className="mt-6 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault()
          const next = new URLSearchParams()
          if (q.trim()) next.set('q', q.trim())
          if (city.trim()) next.set('city', city.trim())
          if (status) next.set('status', status)
          setParams(next)
        }}
      >
        <label className="text-sm text-slate-800 sm:col-span-1">
          Nama
          <input
            value={q}
            onChange={(event) => setQ(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm text-slate-800">
          Kota
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm text-slate-800">
          Status
          <select
            value={status}
            onChange={(event) => {
              const next = new URLSearchParams(params)
              if (event.target.value) next.set('status', event.target.value)
              else next.delete('status')
              next.delete('page')
              setParams(next)
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            {statuses.map((item) => (
              <option key={item.label} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="self-end rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Cari
        </button>
      </form>

      {venues.isPending ? <p className="mt-6 text-sm text-slate-700">Memuat venue...</p> : null}
      {venues.isError ? (
        <p className="mt-6 text-sm text-red-700">{apiErrorMessage(venues.error, 'Daftar venue gagal dimuat.')}</p>
      ) : null}
      {venues.data && venues.data.data.length === 0 ? (
        <p className="mt-6 text-sm text-slate-700">Tidak ada venue untuk filter ini.</p>
      ) : null}

      <ul className="mt-4 space-y-3">
        {venues.data?.data.map((venue) => (
          <li key={venue.id}>
            <Link
              to={`/admin/venues/${venue.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-700"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{venue.name}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {venue.city}
                    {venue.owner ? ` · ${venue.owner.name}` : ''}
                  </p>
                </div>
                <p className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900">
                  {statusLabel(venue.status)}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {venues.data && venues.data.meta.last_page > 1 ? (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50"
            onClick={() => {
              const next = new URLSearchParams(params)
              next.set('page', String(page - 1))
              setParams(next)
            }}
          >
            Sebelumnya
          </button>
          <span>
            Halaman {venues.data.meta.current_page} dari {venues.data.meta.last_page}
          </span>
          <button
            type="button"
            disabled={page >= venues.data.meta.last_page}
            className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50"
            onClick={() => {
              const next = new URLSearchParams(params)
              next.set('page', String(page + 1))
              setParams(next)
            }}
          >
            Berikutnya
          </button>
        </div>
      ) : null}
    </AppShell>
  )
}
