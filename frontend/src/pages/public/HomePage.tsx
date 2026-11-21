import { SiteHeader } from '@/components/layout/SiteHeader'
import { Button } from '@/components/ui/button'
import { useMe } from '@/features/auth/hooks'
import { homePathForRole, roleLabel } from '@/features/auth/paths'
import { usePageTitle } from '@/lib/usePageTitle'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function HomePage() {
  usePageTitle('Beranda')
  const me = useMe()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [city, setCity] = useState('')

  function search(event: FormEvent) {
    event.preventDefault()
    const next = new URLSearchParams()
    if (q.trim()) next.set('q', q.trim())
    if (city.trim()) next.set('city', city.trim())
    navigate(`/explore?${next.toString()}`)
  }

  return (
    <div className="court-sheet min-h-screen text-ink">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1200 640" preserveAspectRatio="none" aria-hidden="true">
            <rect x="48" y="36" width="1104" height="568" fill="none" stroke="#10241c" strokeWidth="4" />
            <line x1="600" y1="36" x2="600" y2="604" stroke="#10241c" strokeWidth="3" />
            <rect x="48" y="150" width="220" height="340" fill="none" stroke="#10241c" strokeWidth="3" />
            <rect x="932" y="150" width="220" height="340" fill="none" stroke="#10241c" strokeWidth="3" />
            <circle cx="600" cy="320" r="54" fill="none" stroke="#10241c" strokeWidth="3" />
          </svg>
          <div className="relative mx-auto grid min-h-[78vh] max-w-7xl items-end gap-8 px-8 py-10 lg:grid-cols-12">
            <div className="lg:col-span-7 lg:pb-8">
              <h1 className="font-display text-6xl leading-[0.9] text-ink sm:text-8xl">
                Jadwal lapangan
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-ink">
                Jam yang masih bisa diajukan tampil di papan. Harga dan status dihitung server.
              </p>
              {me.data ? (
                <Link to={homePathForRole(me.data.role)} className="mt-4 inline-flex min-h-11 items-center text-base font-semibold text-open">
                  Lanjut sebagai {roleLabel(me.data.role)}
                </Link>
              ) : (
                <Link to="/register" className="mt-4 inline-flex min-h-11 items-center text-base font-semibold text-open">
                  Daftar sebagai pelanggan
                </Link>
              )}
            </div>
            <form className="score-board p-4 lg:col-span-4 lg:col-start-9" onSubmit={search}>
              <p className="text-5xl leading-none">CARI</p>
              <label className="mt-4 block text-base text-paper">
                Nama venue
                <input value={q} onChange={(event) => setQ(event.target.value)} className="mt-1 min-h-11 w-full border border-lamp/50 bg-enamel px-3 text-base text-paper" />
              </label>
              <label className="mt-3 block text-base text-paper">
                Kota
                <input value={city} onChange={(event) => setCity(event.target.value)} className="mt-1 min-h-11 w-full border border-lamp/50 bg-enamel px-3 text-base text-paper" />
              </label>
              <Button type="submit" tone="lamp" className="mt-4 w-full">
                Cari lapangan
              </Button>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-8 py-14">
          <h2 className="font-display text-5xl leading-none text-ink">Tiga langkah</h2>
          <ol className="mt-6 border-l-[3px] border-ink">
            <li className="border-b border-ink py-6 pl-6">
              <h3 className="text-2xl font-semibold">Cari venue yang disetujui</h3>
              <p className="mt-2 max-w-xl text-base leading-relaxed text-ink">Filter kota, olahraga, dan harga. Venue yang belum lolos admin tidak muncul.</p>
            </li>
            <li className="border-b border-ink py-8 pl-10">
              <h3 className="text-2xl font-semibold">Pilih jam yang kosong</h3>
              <p className="mt-2 max-w-lg text-base leading-relaxed text-ink">Slot dihitung dari jam buka, blokir, dan booking yang masih menahan jadwal.</p>
            </li>
            <li className="py-5 pl-6">
              <h3 className="text-2xl font-semibold">Tunggu keputusan pemilik</h3>
              <p className="mt-2 max-w-xl text-base leading-relaxed text-ink">Pengajuan menunggu sampai pemilik mengonfirmasi atau menolak.</p>
            </li>
          </ol>
        </section>
      </main>
    </div>
  )
}
