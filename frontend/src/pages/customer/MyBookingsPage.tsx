import { FormBanner } from '@/components/auth/FormBanner'
import { AppShell } from '@/components/layout/AppShell'
import { apiErrorMessage } from '@/features/auth/formErrors'
import {
  cancelMyBooking,
  listMyBookings,
  statusLabel,
  type Booking,
  type BookingStatus,
} from '@/features/bookings/api'
import { formatIdr } from '@/features/venues/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const statuses: Array<BookingStatus | ''> = ['', 'pending', 'confirmed', 'rejected', 'cancelled', 'completed', 'expired']

export function MyBookingsPage() {
  usePageTitle('Booking saya')
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('')
  const [period, setPeriod] = useState('')
  const [page, setPage] = useState(1)
  const [openId, setOpenId] = useState<number | null>(null)
  const [reason, setReason] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const list = useQuery({
    queryKey: ['my-bookings', status, period, page],
    queryFn: () =>
      listMyBookings({
        status: status || undefined,
        period: period || undefined,
        page,
      }),
  })
  const cancel = useMutation({
    mutationFn: (booking: Booking) => cancelMyBooking(booking.id, reason),
    onSuccess: async () => {
      setOpenId(null)
      setReason('')
      setActionError(null)
      await queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
    },
    onError: (error) => {
      setActionError(apiErrorMessage(error, 'Booking gagal dibatalkan.'))
    },
  })

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Booking saya</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-700">
        Booking yang sudah dikonfirmasi hanya bisa dibatalkan sebelum batas waktu. Server yang memutuskan, tombol mengikuti jawaban itu.
      </p>
      <Link to="/explore" className="mt-3 inline-flex text-sm font-medium text-emerald-800">
        Cari lapangan
      </Link>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-slate-800">
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value)
              setPage(1)
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            {statuses.map((item) => (
              <option key={item || 'all'} value={item}>
                {item === '' ? 'Semua' : statusLabel(item)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm text-slate-800">
          Waktu
          <select
            value={period}
            onChange={(event) => {
              setPeriod(event.target.value)
              setPage(1)
            }}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
          >
            <option value="">Semua</option>
            <option value="upcoming">Akan datang</option>
            <option value="past">Sudah lewat</option>
          </select>
        </label>
      </div>

      <FormBanner message={actionError} />

      {list.isPending ? (
        <div className="mt-6 space-y-3" aria-busy="true">
          <p className="sr-only">Memuat booking...</p>
          <div className="h-20 rounded-xl bg-slate-100" />
          <div className="h-20 rounded-xl bg-slate-100" />
        </div>
      ) : null}
      {list.isError ? <p className="mt-6 text-sm text-red-800">{apiErrorMessage(list.error, 'Booking gagal dimuat.')}</p> : null}

      {list.data && list.data.data.length === 0 ? (
        <p className="mt-6 text-sm text-slate-700">Belum ada booking pada filter ini.</p>
      ) : null}

      <ul className="mt-6 divide-y divide-slate-200 border-y border-slate-200">
        {list.data?.data.map((booking) => (
          <li key={booking.id} className="py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium text-slate-900">
                {booking.venue.name} · {booking.court.name}
              </p>
              <p className="text-sm font-medium text-slate-800">{statusLabel(booking.status)}</p>
            </div>
            <p className="mt-1 text-sm text-slate-700">
              {booking.code} · {booking.local.date} {booking.local.start}-{booking.local.end} · {formatIdr(booking.total_price)}
            </p>
            {booking.notes ? <p className="mt-1 text-sm text-slate-600">{booking.notes}</p> : null}
            {booking.can_cancel ? (
              <div className="mt-3">
                {openId === booking.id ? (
                  <form
                    className="space-y-2"
                    onSubmit={(event) => {
                      event.preventDefault()
                      cancel.mutate(booking)
                    }}
                  >
                    <label htmlFor={`reason-${booking.id}`} className="block text-sm text-slate-800">
                      Alasan batal
                      <textarea
                        id={`reason-${booking.id}`}
                        value={reason}
                        onChange={(event) => setReason(event.target.value)}
                        maxLength={500}
                        rows={2}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={cancel.isPending}
                        className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                      >
                        {cancel.isPending ? 'Membatalkan...' : 'Batalkan booking'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setOpenId(null)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800"
                      >
                        Tutup
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setOpenId(booking.id)
                      setReason('')
                      setActionError(null)
                    }}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                  >
                    Batalkan
                  </button>
                )}
              </div>
            ) : null}
          </li>
        ))}
      </ul>

      {list.data && list.data.meta.last_page > 1 ? (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50"
          >
            Sebelumnya
          </button>
          <span className="text-slate-700">
            Halaman {list.data.meta.current_page} dari {list.data.meta.last_page}
          </span>
          <button
            type="button"
            disabled={page >= list.data.meta.last_page}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-lg border border-slate-300 px-3 py-2 disabled:opacity-50"
          >
            Berikutnya
          </button>
        </div>
      ) : null}
    </AppShell>
  )
}
