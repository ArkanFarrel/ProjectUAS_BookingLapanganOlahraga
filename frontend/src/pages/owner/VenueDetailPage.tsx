import { AppShell } from '@/components/layout/AppShell'
import { apiErrorMessage } from '@/features/auth/formErrors'
import {
  deleteVenue,
  deleteVenueImage,
  getMyVenue,
  toggleVenueActive,
  updateVenue,
  uploadVenueImage,
} from '@/features/venues/api'
import {
  dayNames,
  formatIdr,
  statusLabel,
  type VenueInput,
} from '@/features/venues/types'
import { usePageTitle } from '@/lib/usePageTitle'
import { VenueForm } from '@/pages/owner/VenueForm'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

export function VenueDetailPage() {
  const params = useParams()
  const venueId = Number(params.venueId)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const venue = useQuery({
    queryKey: ['owner-venues', venueId],
    queryFn: () => getMyVenue(venueId),
    enabled: Number.isFinite(venueId),
  })

  usePageTitle(venue.data?.name ?? 'Venue')

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ['owner-venues'] })
    await queryClient.invalidateQueries({ queryKey: ['owner-venues', venueId] })
  }

  const save = useMutation({
    mutationFn: (input: VenueInput) => updateVenue(venueId, input),
    onSuccess: refresh,
  })
  const toggle = useMutation({ mutationFn: () => toggleVenueActive(venueId), onSuccess: refresh })
  const remove = useMutation({
    mutationFn: () => deleteVenue(venueId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['owner-venues'] })
      navigate('/owner/venues')
    },
  })
  const upload = useMutation({
    mutationFn: (file: File) => uploadVenueImage(venueId, file),
    onSuccess: refresh,
  })
  const removeImage = useMutation({
    mutationFn: (imageId: number) => deleteVenueImage(venueId, imageId),
    onSuccess: refresh,
  })

  async function run(action: () => Promise<unknown>) {
    setError(null)
    try {
      await action()
    } catch (caught) {
      setError(apiErrorMessage(caught, 'Aksi gagal. Coba lagi.'))
    }
  }

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
        <h1 className="text-2xl font-semibold text-slate-900">Venue tidak ditemukan</h1>
        <p className="mt-2 text-sm text-slate-600">Venue ini bukan milik akun Anda, atau sudah dihapus.</p>
        <Link to="/owner/venues" className="mt-4 inline-flex text-sm font-medium text-emerald-800">
          Kembali ke daftar
        </Link>
      </AppShell>
    )
  }

  const current = venue.data
  const locked = current.status === 'suspended'

  return (
    <AppShell>
      <Link to="/owner/venues" className="text-sm font-medium text-emerald-800">
        Kembali ke daftar
      </Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{current.name}</h1>
          <p className="mt-2 text-sm text-slate-600">
            {statusLabel(current.status)}
            {current.is_active ? '' : ', disembunyikan pemilik'}
          </p>
          {current.status_reason ? (
            <p className="mt-2 max-w-xl text-sm text-slate-700">Alasan admin: {current.status_reason}</p>
          ) : null}
        </div>
        <button
          type="button"
          disabled={toggle.isPending}
          onClick={() => void run(() => toggle.mutateAsync())}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
        >
          {current.is_active ? 'Nonaktifkan' : 'Aktifkan lagi'}
        </button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Data venue</h2>
        {locked ? (
          <p className="mt-2 text-sm text-slate-700">
            Venue ditangguhkan admin, jadi isinya tidak bisa diubah sampai diaktifkan kembali.
          </p>
        ) : (
          <div className="mt-4">
            <VenueForm
              initial={{
                name: current.name,
                description: current.description,
                address: current.address,
                city: current.city,
                province: current.province,
                phone: current.phone,
                timezone: current.timezone,
                facilities: current.facilities,
              }}
              pending={save.isPending}
              error={null}
              submitLabel={current.status === 'rejected' ? 'Simpan dan kirim ulang' : 'Simpan perubahan'}
              onSubmit={async (values) => {
                await run(() => save.mutateAsync(values))
              }}
            />
          </div>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Foto</h2>
        <p className="mt-2 text-sm text-slate-600">Maksimal 5 foto, JPG, PNG, atau WebP, tiap file maksimal 2 MB.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {current.images?.map((image) => (
            <li key={image.id} className="overflow-hidden rounded-xl border border-slate-200">
              <img src={image.url} alt="" className="h-36 w-full object-cover" />
              <button
                type="button"
                className="px-3 py-2 text-sm font-medium text-red-700"
                onClick={() => void run(() => removeImage.mutateAsync(image.id))}
              >
                Hapus foto
              </button>
            </li>
          ))}
        </ul>
        {!locked && (current.images?.length ?? 0) < 5 ? (
          <label className="mt-4 inline-flex cursor-pointer text-sm font-semibold text-emerald-800">
            Unggah foto
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0]
                event.target.value = ''
                if (file) {
                  void run(() => upload.mutateAsync(file))
                }
              }}
            />
          </label>
        ) : null}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Lapangan</h2>
          {!locked ? (
            <Link
              to={`/owner/venues/${current.id}/courts/new`}
              className="text-sm font-semibold text-emerald-800"
            >
              Tambah lapangan
            </Link>
          ) : null}
        </div>
        {current.courts && current.courts.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-200">
            {current.courts.map((court) => (
              <li key={court.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{court.name}</p>
                  <p className="text-sm text-slate-600">
                    {court.sport?.name ?? 'Olahraga'} · {formatIdr(court.price_per_hour)} / jam
                    {court.is_active ? '' : ' · nonaktif'}
                  </p>
                </div>
                <Link
                  to={`/owner/venues/${current.id}/courts/${court.id}`}
                  className="text-sm font-semibold text-emerald-800"
                >
                  Ubah
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-600">Belum ada lapangan di venue ini.</p>
        )}
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Jam operasional</h2>
        <p className="mt-2 text-sm text-slate-600">
          Jam bawaan 08.00-22.00 setiap hari. Mengubah jam per hari menyusul di fase berikutnya.
        </p>
        <ul className="mt-4 space-y-1 text-sm text-slate-800">
          {current.operating_hours?.map((hour) => (
            <li key={hour.day_of_week}>
              {dayNames[hour.day_of_week]}:{' '}
              {hour.is_closed || hour.open_hour === null || hour.close_hour === null
                ? 'Tutup'
                : `${String(hour.open_hour).padStart(2, '0')}.00-${String(hour.close_hour).padStart(2, '0')}.00`}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        {confirmDelete ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-slate-700">Hapus venue ini dari daftar Anda?</p>
            <button
              type="button"
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white"
              onClick={() => void run(() => remove.mutateAsync())}
            >
              Ya, hapus
            </button>
            <button type="button" className="text-sm font-medium text-slate-700" onClick={() => setConfirmDelete(false)}>
              Batal
            </button>
          </div>
        ) : (
          <button type="button" className="text-sm font-medium text-red-700" onClick={() => setConfirmDelete(true)}>
            Hapus venue
          </button>
        )}
      </section>
    </AppShell>
  )
}
