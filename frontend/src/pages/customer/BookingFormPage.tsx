import { FormBanner } from '@/components/auth/FormBanner'
import { fieldClass } from '@/components/ui/field'
import { SubmitButton } from '@/components/auth/SubmitButton'
import { AppShell } from '@/components/layout/AppShell'
import { apiErrorMessage } from '@/features/auth/formErrors'
import { createBooking, statusLabel, type Booking } from '@/features/bookings/api'
import { getPublicVenue } from '@/features/discovery/api'
import { formatIdr } from '@/features/venues/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'

const bookingSchema = z.object({
  duration_hours: z.number().int().min(1, 'Pilih 1 sampai 4 jam.').max(4, 'Pilih 1 sampai 4 jam.'),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter.'),
})

type BookingValues = z.infer<typeof bookingSchema>

function readParams(params: URLSearchParams): { venueId: number; courtId: number; date: string; hour: number } | null {
  const venueId = Number(params.get('venue'))
  const courtId = Number(params.get('court'))
  const hour = Number(params.get('hour'))
  const date = params.get('date') ?? ''
  if (!Number.isInteger(venueId) || !Number.isInteger(courtId) || !Number.isInteger(hour)) {
    return null
  }
  if (hour < 0 || hour > 23 || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return null
  }

  return { venueId, courtId, date, hour }
}

export function BookingFormPage() {
  usePageTitle('Ajukan booking')
  const [params] = useSearchParams()
  const selection = readParams(params)
  const venue = useQuery({
    queryKey: ['public-venue', selection?.venueId],
    queryFn: () => getPublicVenue(selection?.venueId as number),
    enabled: selection !== null,
  })
  const court = venue.data?.courts?.find((item) => item.id === selection?.courtId) ?? null
  const [formError, setFormError] = useState<string | null>(null)
  const [created, setCreated] = useState<Booking | null>(null)
  const form = useForm<BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { duration_hours: 1, notes: '' },
  })
  const duration = form.watch('duration_hours')
  const submit = useMutation({
    mutationFn: (values: BookingValues) =>
      createBooking({
        court_id: selection?.courtId as number,
        date: selection?.date as string,
        start_hour: selection?.hour as number,
        duration_hours: values.duration_hours,
        notes: values.notes.trim() === '' ? null : values.notes.trim(),
      }),
    onSuccess: (booking) => {
      setCreated(booking)
      setFormError(null)
    },
    onError: (error) => {
      setFormError(apiErrorMessage(error, 'Booking gagal diajukan.'))
    },
  })

  if (!selection) {
    return (
      <AppShell>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Slot belum dipilih</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-700">
          Pilih jam kosong di halaman venue. Formulir ini tidak menerima harga atau status dari halaman.
        </p>
        <Link to="/explore" className="mt-4 inline-flex text-sm font-medium text-emerald-800">
          Cari lapangan
        </Link>
      </AppShell>
    )
  }

  const back = `/venues/${selection.venueId}`

  return (
    <AppShell>
      <Link to={back} className="text-sm font-medium text-emerald-800">
        Kembali ke venue
      </Link>
      <h1 className="mt-3 font-display text-5xl leading-none text-ink">Ajukan booking</h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-soft">
        Pengajuan berstatus menunggu sampai pemilik venue mengonfirmasi. Harga dihitung server dari harga lapangan saat ini.
      </p>

      {venue.isPending ? <p className="mt-6 text-sm text-slate-700">Memuat lapangan...</p> : null}
      {venue.isError || (venue.data && !court) ? (
        <p className="mt-6 text-sm text-red-800">Lapangan ini tidak bisa dipesan dari halaman publik.</p>
      ) : null}

      {court && selection && !created ? (
        <form
          className="mt-6 space-y-5"
          onSubmit={(event) => void form.handleSubmit((values) => submit.mutate(values))(event)}
          noValidate
        >
          <dl className="space-y-2 rounded-lg bg-enamel p-4 text-sm text-paper">
            <div className="flex justify-between gap-4">
              <dt>Venue</dt>
              <dd className="font-medium text-lamp">{venue.data?.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Lapangan</dt>
              <dd className="font-medium text-paper">
                {court.name}
                {court.sport ? ` · ${court.sport.name}` : ''}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Mulai</dt>
              <dd className="font-medium text-paper">
                {selection.date} {String(selection.hour).padStart(2, '0')}:00
              </dd>
            </div>
          </dl>

          <FormBanner message={formError} />

          <div>
            <label htmlFor="duration_hours" className="block text-sm font-medium text-slate-900">
              Durasi
            </label>
            <select
              id="duration_hours"
              className={fieldClass}
              {...form.register('duration_hours', { valueAsNumber: true })}
            >
              <option value={1}>1 jam</option>
              <option value={2}>2 jam</option>
              <option value={3}>3 jam</option>
              <option value={4}>4 jam</option>
            </select>
            {form.formState.errors.duration_hours ? (
              <p className="mt-1 text-sm text-red-800">{form.formState.errors.duration_hours.message}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-900">
              Catatan
            </label>
            <textarea
              id="notes"
              rows={3}
              maxLength={500}
              className={fieldClass}
              {...form.register('notes')}
            />
            <p className="mt-1 text-sm text-slate-600">Opsional. Misalnya jumlah pemain atau perlengkapan yang dibawa.</p>
          </div>

          <p className="text-sm text-slate-800">
            Perkiraan total{' '}
            <span className="font-semibold text-slate-900">
              {formatIdr(Number(court.price_per_hour) * (Number.isFinite(duration) ? duration : 1))}
            </span>
            . Angka ini hanya tampilan. Server yang menyimpan harga.
          </p>

          <SubmitButton pending={submit.isPending} idleLabel="Ajukan booking" pendingLabel="Mengajukan..." />
        </form>
      ) : null}

      {created ? (
        <div className="mt-6 space-y-3 text-sm text-slate-800">
          <p className="text-base font-semibold text-slate-900">Booking {created.code} diajukan.</p>
          <p>
            Status {statusLabel(created.status)}. {created.local.date} {created.local.start}-{created.local.end} ({created.local.timezone}).
          </p>
          <p>Total {formatIdr(created.total_price)}.</p>
          <p>Pemilik venue perlu mengonfirmasi sebelum batas waktu pengajuan habis.</p>
          <Link
            to="/customer/bookings"
            className="inline-flex rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Lihat booking saya
          </Link>
        </div>
      ) : null}
    </AppShell>
  )
}
