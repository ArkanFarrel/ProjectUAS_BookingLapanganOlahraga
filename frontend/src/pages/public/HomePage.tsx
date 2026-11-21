import { SiteHeader } from '@/components/layout/SiteHeader'
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
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main>
        <section className="bg-enamel text-paper">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
            <div>
              <h1 className="font-display max-w-xl text-5xl leading-none text-paper sm:text-7xl">
                Lapangan kosong, jamnya terlihat
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-paper/85">
                Cari venue yang sudah disetujui, lihat slot per jam, lalu ajukan booking. Harga dan status dihitung server, bukan dari halaman ini.
              </p>
              <form className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={search}>
                <label className="text-sm font-semibold text-paper">
                  Nama venue
                  <input value={q} onChange={(event) => setQ(event.target.value)} className="mt-1 w-full rounded-md border border-enamel-2 bg-enamel-2 px-3 py-2.5 text-base text-paper placeholder:text-paper/50" />
                </label>
                <label className="text-sm font-semibold text-paper">
                  Kota
                  <input value={city} onChange={(event) => setCity(event.target.value)} className="mt-1 w-full rounded-md border border-enamel-2 bg-enamel-2 px-3 py-2.5 text-base text-paper placeholder:text-paper/50" />
                </label>
                <button type="submit" className="lamp-live self-end rounded-md bg-lamp px-4 py-2.5 text-sm font-semibold text-ink hover:bg-wait-soft">
                  Cari lapangan
                </button>
              </form>
              <div className="mt-4 flex flex-wrap gap-3">
                {me.data ? (
                  <Link to={homePathForRole(me.data.role)} className="text-sm font-semibold text-lamp">
                    Lanjut sebagai {roleLabel(me.data.role)}
                  </Link>
                ) : (
                  <Link to="/register" className="text-sm font-semibold text-lamp">
                    Belum punya akun? Daftar
                  </Link>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-enamel-2 bg-enamel-2 p-5">
              <p className="font-display text-5xl text-lamp tabular-nums">19:00</p>
              <p className="mt-1 text-sm text-paper/80">Contoh jam di papan. Slot sungguhan ada di halaman venue.</p>
              <ul className="mt-6 divide-y divide-white/10 text-sm">
                <li className="flex items-center justify-between py-3">
                  <span>Kosong</span>
                  <span className="rounded-full bg-open px-2 py-0.5 text-xs font-semibold text-panel">Bisa diajukan</span>
                </li>
                <li className="flex items-center justify-between py-3">
                  <span>Terisi</span>
                  <span className="rounded-full bg-taken px-2 py-0.5 text-xs font-semibold text-panel">Sudah ada booking</span>
                </li>
                <li className="flex items-center justify-between py-3">
                  <span>Pemilik</span>
                  <span className="text-paper/80">Yang menyetujui pengajuan</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="font-display text-4xl text-ink">Cara kerjanya</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            <li className="rounded-lg border border-line bg-panel p-5">
              <p className="font-display text-4xl text-open">1</p>
              <h3 className="mt-2 text-lg font-semibold">Cari venue yang disetujui</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">Filter kota, olahraga, dan harga. Venue yang belum lolos admin tidak muncul.</p>
            </li>
            <li className="rounded-lg border border-line bg-panel p-5">
              <p className="font-display text-4xl text-open">2</p>
              <h3 className="mt-2 text-lg font-semibold">Pilih jam yang kosong</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">Slot dihitung dari jam buka, blokir, dan booking yang masih menahan jadwal.</p>
            </li>
            <li className="rounded-lg border border-line bg-panel p-5">
              <p className="font-display text-4xl text-open">3</p>
              <h3 className="mt-2 text-lg font-semibold">Tunggu keputusan pemilik</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">Pengajuan berstatus menunggu sampai pemilik mengonfirmasi atau menolak.</p>
            </li>
          </ol>
        </section>
      </main>
    </div>
  )
}
