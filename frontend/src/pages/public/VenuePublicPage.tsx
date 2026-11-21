import { AppShell } from '@/components/layout/AppShell'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { getAvailability, getPublicVenue, type SlotStatus } from '@/features/discovery/api'
import { dayNames, facilityOptions, formatIdr } from '@/features/venues/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const slotLabel: Record<SlotStatus, string> = {
  available: 'Kosong',
  booked: 'Terisi',
  blocked: 'Diblokir',
  past: 'Lewat',
}

function todayInput(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

export function VenuePublicPage() {
  const params = useParams()
  const venueId = Number(params.venueId)
  const [date, setDate] = useState(todayInput())
  const [courtId, setCourtId] = useState<number | null>(null)
  const venue = useQuery({
    queryKey: ['public-venue', venueId],
    queryFn: () => getPublicVenue(venueId),
    enabled: Number.isFinite(venueId),
  })
  const selectedCourt = courtId ?? venue.data?.courts?.[0]?.id ?? null
  const availability = useQuery({
    queryKey: ['availability', selectedCourt, date],
    queryFn: () => getAvailability(selectedCourt as number, date),
    enabled: selectedCourt !== null && date !== '',
  })

  usePageTitle(venue.data?.name ?? 'Venue')

  if (venue.isPending) {
    return (
      <AppShell>
        <p className="text-sm text-slate-700">Memuat venue...</p>
      </AppShell>
    )
  }

  if (venue.isError || !venue.data) {
    return (
      <AppShell>
        <h1 className="text-2xl font-semibold text-slate-900">Venue tidak tersedia</h1>
        <p className="mt-2 text-sm text-slate-600">Venue ini belum disetujui, sedang ditutup, atau tidak ada.</p>
        <Link to="/explore" className="mt-4 inline-flex text-sm font-medium text-emerald-800">
          Kembali ke pencarian
        </Link>
      </AppShell>
    )
  }

  const current = venue.data

  return (
    <AppShell>
      <Link to="/explore" className="text-sm font-medium text-emerald-800">
        Kembali ke pencarian
      </Link>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{current.name}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {current.address}, {current.city}, {current.province}
      </p>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-800">{current.description}</p>
      <p className="mt-3 text-sm text-slate-700">
        Telepon {current.phone}. Zona waktu {current.timezone}.
      </p>
      {current.facilities.length > 0 ? (
        <p className="mt-2 text-sm text-slate-700">
          Fasilitas:{' '}
          {current.facilities
            .map((key) => facilityOptions.find((item) => item.value === key)?.label ?? key)
            .join(', ')}
        </p>
      ) : null}

      {current.images && current.images.length > 0 ? (
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {current.images.map((image) => (
            <li key={image.id}>
              <img src={image.url} alt="" className="h-40 w-full rounded-xl border border-slate-200 object-cover" />
            </li>
          ))}
        </ul>
      ) : null}

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Jam buka</h2>
      <ul className="mt-2 space-y-1 text-sm text-slate-800">
        {current.operating_hours?.map((hour) => (
          <li key={hour.day_of_week}>
            {dayNames[hour.day_of_week]}:{' '}
            {hour.is_closed || hour.open_hour === null || hour.close_hour === null
              ? 'Tutup'
              : `${String(hour.open_hour).padStart(2, '0')}:00-${String(hour.close_hour).padStart(2, '0')}:00`}
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-lg font-semibold text-slate-900">Ketersediaan</h2>
      <p className="mt-2 text-sm text-slate-600">
        Status slot tidak menampilkan nama pemesan atau alasan blokir.
      </p>
      {current.courts && current.courts.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-slate-800">
            Lapangan
            <select
              value={selectedCourt ?? ''}
              onChange={(event) => setCourtId(Number(event.target.value))}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              {current.courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name} · {formatIdr(court.price_per_hour)} / jam
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-slate-800">
            Tanggal
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </label>
        </div>
      ) : (
        <p className="mt-3 text-sm text-slate-600">Venue ini belum punya lapangan aktif.</p>
      )}

      {availability.isPending && selectedCourt ? <p className="mt-4 text-sm text-slate-700">Menghitung slot...</p> : null}
      {availability.isError ? (
        <p className="mt-4 text-sm text-red-700">{apiErrorMessage(availability.error, 'Jadwal gagal dimuat.')}</p>
      ) : null}
      {availability.data?.is_closed ? <p className="mt-4 text-sm text-slate-700">Venue tutup pada tanggal ini.</p> : null}
      {availability.data && !availability.data.is_closed ? (
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {availability.data.slots.map((slot) => (
            <li
              key={slot.start_hour}
              className={
                slot.status === 'available'
                  ? 'rounded-lg border border-emerald-700 px-3 py-2 text-sm text-emerald-900'
                  : 'rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600'
              }
            >
              <span className="block font-medium">{slot.label}</span>
              <span>{slotLabel[slot.status]}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </AppShell>
  )
}
