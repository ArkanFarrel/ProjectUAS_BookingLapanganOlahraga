import { CourtArt } from '@/components/common/CourtArt'
import { AppShell } from '@/components/layout/AppShell'
import { fieldClass } from '@/components/ui/field'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { useMe } from '@/features/auth/hooks'
import { bookingNewPath } from '@/features/bookings/api'
import { getAvailability, getPublicVenue, type AvailabilitySlot, type SlotStatus } from '@/features/discovery/api'
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
  const me = useMe()
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
        <p className="text-sm text-ink">Memuat venue...</p>
      </AppShell>
    )
  }

  if (venue.isError || !venue.data) {
    return (
      <AppShell>
        <h1 className="text-2xl font-semibold text-ink">Venue tidak tersedia</h1>
        <p className="mt-2 text-sm text-ink-soft">Venue ini belum disetujui, sedang ditutup, atau tidak ada.</p>
        <Link to="/explore" className="mt-4 inline-flex text-sm font-medium text-open">
          Kembali ke pencarian
        </Link>
      </AppShell>
    )
  }

  const current = venue.data

  return (
    <AppShell>
      <Link to="/explore" className="text-sm font-medium text-open">
        Kembali ke pencarian
      </Link>
      {current.images && current.images.length > 0 ? null : <CourtArt name={current.name} className="mt-4 h-48 w-full rounded-lg" />}
      <h1 className="mt-4 font-display text-5xl leading-none text-ink">{current.name}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {current.address}, {current.city}, {current.province}
      </p>
      {/* Deskripsi ditampilkan sebagai teks. React tidak menjalankan HTML di dalamnya. */}
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink">{current.description}</p>
      <p className="mt-3 text-sm text-ink">
        Telepon {current.phone}. Zona waktu {current.timezone}.
      </p>
      {current.facilities.length > 0 ? (
        <p className="mt-2 text-sm text-ink">
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

      <h2 className="mt-8 text-lg font-semibold text-ink">Jam buka</h2>
      <ul className="mt-2 space-y-1 text-sm text-ink">
        {current.operating_hours?.map((hour) => (
          <li key={hour.day_of_week}>
            {dayNames[hour.day_of_week]}:{' '}
            {hour.is_closed || hour.open_hour === null || hour.close_hour === null
              ? 'Tutup'
              : `${String(hour.open_hour).padStart(2, '0')}:00-${String(hour.close_hour).padStart(2, '0')}:00`}
          </li>
        ))}
      </ul>

      <h2 className="mt-8 text-lg font-semibold text-ink">Ketersediaan</h2>
      <p className="mt-2 text-sm text-ink-soft">
        Status slot tidak menampilkan nama pemesan atau alasan blokir.
        {me.data?.role === 'customer' ? ' Jam kosong bisa langsung diajukan.' : ''}
        {!me.data && !me.isPending ? ' Masuk sebagai pelanggan untuk mengajukan jam kosong.' : ''}
        {me.data && me.data.role !== 'customer' ? ' Akun ini tidak membuat booking.' : ''}
      </p>
      {current.courts && current.courts.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-ink">
            Lapangan
            <select
              value={selectedCourt ?? ''}
              onChange={(event) => setCourtId(Number(event.target.value))}
              className={fieldClass}
            >
              {current.courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name} · {formatIdr(court.price_per_hour)} / jam
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm text-ink">
            Tanggal
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className={fieldClass}
            />
          </label>
        </div>
      ) : (
        <p className="mt-3 text-sm text-ink-soft">Venue ini belum punya lapangan aktif.</p>
      )}

      {availability.isPending && selectedCourt ? <p className="mt-4 text-sm text-ink">Menghitung slot...</p> : null}
      {availability.isError ? (
        <p className="mt-4 text-sm text-taken">{apiErrorMessage(availability.error, 'Jadwal gagal dimuat.')}</p>
      ) : null}
      {availability.data?.is_closed ? <p className="mt-4 text-sm text-ink">Venue tutup pada tanggal ini.</p> : null}
      {availability.data && !availability.data.is_closed ? (
        <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {availability.data.slots.map((slot) => (
            <li key={slot.start_hour}>
              <SlotCell
                slot={slot}
                href={
                  slot.status === 'available' && selectedCourt
                    ? bookingNewPath(current.id, selectedCourt, date, slot.start_hour)
                    : null
                }
                role={me.data?.role ?? null}
                pending={me.isPending}
              />
            </li>
          ))}
        </ul>
      ) : null}
    </AppShell>
  )
}

function SlotCell({
  slot,
  href,
  role,
  pending,
}: {
  slot: AvailabilitySlot
  href: string | null
  role: 'customer' | 'owner' | 'admin' | null
  pending: boolean
}) {
  const available = slot.status === 'available'
  const className = available
    ? 'block rounded-md border border-open bg-open-soft px-3 py-2 text-sm text-open hover:bg-panel'
    : 'block rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink-soft'

  const body = (
    <>
      <span className="block font-medium">{slot.label}</span>
      <span>{slotLabel[slot.status]}</span>
    </>
  )

  if (!available || !href || pending || role === 'owner' || role === 'admin') {
    return <div className={className}>{body}</div>
  }

  if (role === 'customer') {
    return (
      <Link to={href} className={className}>
        {body}
      </Link>
    )
  }

  return (
    <Link to="/login" state={{ from: href }} className={className}>
      {body}
    </Link>
  )
}
