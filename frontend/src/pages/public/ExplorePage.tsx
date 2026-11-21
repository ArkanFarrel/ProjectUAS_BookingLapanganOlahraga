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

      {venues.isPending ? <p className="mt-6 text-base text-ink">Mencari venue...</p> : null}
      {venues.isError ? (
        <p className="mt-6 text-base text-taken">{apiErrorMessage(venues.error, 'Pencarian gagal. Periksa filter lalu coba lagi.')}</p>
      ) : null}
      {venues.data && venues.data.data.length === 0 ? (
        <p className="mt-6 border-y-[3px] border-ink py-6 text-base text-ink">
          Tidak ada venue yang cocok. Coba kota lain atau hapus filter harga.
        </p>
      ) : null}

      <ul className="mt-8 border-t-[3px] border-ink">
        {venues.data?.data.map((venue, index) => (
          <li key={venue.id} className={index === 0 ? 'border-b-[3px] border-ink' : 'border-b border-ink'}>
            <Link
              to={`/venues/${venue.id}`}
              className={
                index === 0
                  ? 'grid min-h-44 gap-4 py-4 sm:grid-cols-12'
                  : 'flex min-h-11 items-center gap-4 py-3'
              }
            >
              {venue.cover_image_url ? (
                <img
                  src={venue.cover_image_url}
                  alt=""
                  className={index === 0 ? 'h-56 w-full object-cover sm:col-span-7' : 'h-14 w-20 object-cover'}
                />
              ) : (
                <CourtArt
                  name={venue.name}
                  className={index === 0 ? 'h-56 w-full sm:col-span-7' : 'h-14 w-20'}
                />
              )}
              <span className={index === 0 ? 'sm:col-span-5 sm:py-4' : 'min-w-0 flex-1'}>
                <span className={index === 0 ? 'block font-display text-5xl leading-none text-ink' : 'block text-base font-semibold text-ink'}>
                  {venue.name}
                </span>
                <span className="mt-1 block text-base text-ink">
                  {venue.city}, {venue.province}
                  {venue.starting_price ? ` · mulai ${formatIdr(venue.starting_price)}` : ''}
                </span>
                <span className="mt-1 block text-base text-ink">
                  {venue.sports.map((sport) => sport.name).join(', ') || 'Belum ada lapangan'}
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
            className="inline-flex min-h-11 items-center border border-ink px-3 text-base disabled:opacity-50"
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
            className="inline-flex min-h-11 items-center border border-ink px-3 text-base disabled:opacity-50"
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
