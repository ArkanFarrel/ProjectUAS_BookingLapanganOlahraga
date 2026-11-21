import { apiErrorMessage } from '@/features/auth/formErrors'
import { createBlock, deleteBlock, listBlocks } from '@/features/discovery/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

export function BlockEditor({ courtId }: { courtId: number }) {
  const queryClient = useQueryClient()
  const [date, setDate] = useState('')
  const [startHour, setStartHour] = useState(10)
  const [endHour, setEndHour] = useState(12)
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const blocks = useQuery({
    queryKey: ['blocks', courtId],
    queryFn: () => listBlocks(courtId),
  })
  const save = useMutation({
    mutationFn: () => createBlock(courtId, { date, start_hour: startHour, end_hour: endHour, reason }),
    onSuccess: async () => {
      setReason('')
      await queryClient.invalidateQueries({ queryKey: ['blocks', courtId] })
    },
  })

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-semibold text-slate-900">Blokir jadwal</h2>
      <p className="mt-2 text-sm text-slate-600">
        Jam mengikuti zona waktu venue. Blokir ditolak jika masih ada booking aktif di jam itu.
      </p>
      <form
        className="mt-4 grid gap-3 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault()
          setError(null)
          void save.mutateAsync().catch((caught: unknown) => {
            setError(apiErrorMessage(caught, 'Blokir gagal disimpan.'))
          })
        }}
      >
        <label className="text-sm text-slate-800">
          Tanggal
          <input type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm text-slate-800">
          Alasan
          <input required value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm text-slate-800">
          Jam mulai
          <input type="number" min={0} max={23} value={startHour} onChange={(event) => setStartHour(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        <label className="text-sm text-slate-800">
          Jam selesai
          <input type="number" min={1} max={24} value={endHour} onChange={(event) => setEndHour(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
        </label>
        {error ? <p className="text-sm text-red-700 sm:col-span-2">{error}</p> : null}
        <button type="submit" disabled={save.isPending} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-2">
          {save.isPending ? 'Menyimpan...' : 'Simpan blokir'}
        </button>
      </form>
      <ul className="mt-4 space-y-2 text-sm text-slate-800">
        {blocks.data?.map((block) => (
          <li key={block.id} className="flex items-center justify-between gap-3">
            <span>
              {block.date} {String(block.start_hour).padStart(2, '0')}:00-{String(block.end_hour).padStart(2, '0')}:00 · {block.reason}
            </span>
            <button
              type="button"
              className="text-red-700"
              onClick={() => {
                void deleteBlock(block.id).then(() => queryClient.invalidateQueries({ queryKey: ['blocks', courtId] }))
              }}
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>
      {blocks.data && blocks.data.length === 0 ? <p className="mt-3 text-sm text-slate-600">Belum ada blokir.</p> : null}
    </section>
  )
}
