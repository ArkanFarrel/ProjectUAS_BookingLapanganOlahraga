import { CourtArt } from '@/components/common/CourtArt'
import { AppShell } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/button'
import { fieldClass } from '@/components/ui/field'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { exploreVenues, type ExploreFilters } from '@/features/discovery/api'
import { listSports } from '@/features/venues/api'
import { formatIdr } from '@/features/venues/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

// Hasil pencarian hanya venue yang sudah disetujui dan masih aktif.
export function ExplorePage() {
  usePageTitle('Cari lapangan')
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const [city, setCity] = useState(params.get('city') ?? '')
  const [minPrice, setMinPrice] = useState(params.get('min_price') ?? '')
  const [maxPrice, setMaxPrice] = useState(params.get('max_price') ?? '')
  const filters: ExploreFilters = {
    q: params.get('q') ?? '',
    city: params.get('city') ?? '',
    sport: params.get('sport') ?? '',
    min_price: params.get('min_price') ?? '',
    max_price: params.get('max_price') ?? '',
    sort: params.get('sort') ?? 'newest',
    page: Number(params.get('page') ?? '1'),
  }
  const sports = useQuery({ queryKey: ['sports'], queryFn: listSports })
  const venues = useQuery({
    queryKey: ['explore', filters],
    queryFn: () => exploreVenues(filters),
  })

  function apply(next: URLSearchParams) {
    next.delete('page')
    setParams(next)
  }

  return (
    <AppShell>
      <h1 className="font-display text-5xl leading-none text-ink">Cari lapangan</h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-soft">
        Daftar ini hanya venue yang sudah disetujui admin dan pemiliknya masih aktif.
      </p>

      <form
        className="mt-6 grid gap-3 rounded-lg border border-line bg-panel p-4 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          const next = new URLSearchParams(params)
          const setOrDelete = (key: string, value: string) => {
            if (value.trim()) next.set(key, value.trim())
            else next.delete(key)
          }
          setOrDelete('q', q)
          setOrDelete('city', city)
          setOrDelete('min_price', minPrice)
          setOrDelete('max_price', maxPrice)
          apply(next)
        }}
      >
        <label className="text-sm font-medium text-ink">
          Nama venue
          <input value={q} onChange={(event) => setQ(event.target.value)} className={fieldClass} />
        </label>
        <label className="text-sm font-medium text-ink">
          Kota
          <input value={city} onChange={(event) => setCity(event.target.value)} className={fieldClass} />
        </label>
        <label className="text-sm font-medium text-ink">
          Olahraga
          <select
            value={filters.sport}
            onChange={(event) => {
              const next = new URLSearchParams(params)
              if (event.target.value) next.set('sport', event.target.value)
              else next.delete('sport')
              apply(next)
            }}
            className={fieldClass}
          >
            <option value="">Semua</option>
            {sports.data?.map((sport) => (
              <option key={sport.id} value={sport.slug}>
                {sport.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          Urutan
          <select
            value={filters.sort}
            onChange={(event) => {
              const next = new URLSearchParams(params)
              next.set('sort', event.target.value)
              apply(next)
            }}
            className={fieldClass}
          >
            <option value="newest">Terbaru</option>
            <option value="price_asc">Harga termurah</option>
            <option value="price_desc">Harga termahal</option>
            <option value="name">Nama</option>
          </select>
        </label>
        <label className="text-sm font-medium text-ink">
          Harga minimum
          <input value={minPrice} onChange={(event) => setMinPrice(event.target.value)} inputMode="numeric" className={fieldClass} />
        </label>
        <label className="text-sm font-medium text-ink">
          Harga maksimum
          <input value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} inputMode="numeric" className={fieldClass} />
        </label>
        <Button type="submit" className="sm:col-span-2 sm:w-fit">
          Terapkan filter
        </Button>
      </form>

      {venues.isPending ? <p className="mt-6 text-sm text-slate-700">Mencari venue...</p> : null}
      {venues.isError ? (
        <p className="mt-6 text-sm text-red-700">{apiErrorMessage(venues.error, 'Pencarian gagal. Periksa filter lalu coba lagi.')}</p>
      ) : null}
      {venues.data && venues.data.data.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
          Tidak ada venue yang cocok. Coba kota lain atau hapus filter harga.
        </p>
      ) : null}

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {venues.data?.data.map((venue) => (
          <li key={venue.id}>
            <Link to={`/venues/${venue.id}`} className="block overflow-hidden rounded-lg border border-line bg-panel hover:border-open">
              {venue.cover_image_url ? (
                <img src={venue.cover_image_url} alt="" className="h-40 w-full object-cover" />
              ) : (
                <CourtArt name={venue.name} className="h-40 w-full" />
              )}
              <span className="block p-4">
                <span className="block font-display text-3xl leading-none text-ink">{venue.name}</span>
                <span className="mt-2 block text-sm text-ink-soft">
                  {venue.city}, {venue.province}
                </span>
                <span className="mt-1 block text-sm text-ink">
                  {venue.sports.map((sport) => sport.name).join(', ') || 'Belum ada lapangan'}
                  {venue.starting_price ? ` · mulai ${formatIdr(venue.starting_price)}` : ''}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {venues.data && venues.data.meta.last_page > 1 ? (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={(filters.page ?? 1) <= 1}
            className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50"
            onClick={() => {
              const next = new URLSearchParams(params)
              next.set('page', String((filters.page ?? 1) - 1))
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
            disabled={(filters.page ?? 1) >= venues.data.meta.last_page}
            className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50"
            onClick={() => {
              const next = new URLSearchParams(params)
              next.set('page', String((filters.page ?? 1) + 1))
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
