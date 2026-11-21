import { SiteHeader } from '@/components/layout/SiteHeader'
import { useMe } from '@/features/auth/hooks'
import { homePathForRole, roleLabel } from '@/features/auth/paths'
import { usePageTitle } from '@/lib/usePageTitle'
import { CalendarCheck, Search, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomePage() {
  usePageTitle('Beranda')
  const me = useMe()

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <section className="max-w-3xl">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Temukan dan pesan lapangan olahraga secara terstruktur
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            SportsCourt menghubungkan pencari lapangan dengan pemilik venue.
            Cek ketersediaan, bandingkan fasilitas, lalu ajukan reservasi yang
            disetujui pemilik venue.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/explore"
              className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Cari lapangan
            </Link>
            {me.data ? (
              <Link
                to={homePathForRole(me.data.role)}
                className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Lanjut sebagai {roleLabel(me.data.role)}
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Daftar
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Masuk
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="mt-12 grid gap-6 sm:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-6">
            <Search className="h-6 w-6 text-emerald-700" aria-hidden="true" />
            <h2 className="mt-4 text-base font-semibold text-slate-900">
              Eksplorasi multi-venue
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Cari venue yang sudah disetujui admin berdasarkan kota, jenis
              olahraga, dan jam operasional.
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-6">
            <CalendarCheck className="h-6 w-6 text-emerald-700" aria-hidden="true" />
            <h2 className="mt-4 text-base font-semibold text-slate-900">
              Jadwal anti-bentrok
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Slot per jam dihitung dari jam buka, jadwal yang diblokir, dan
              reservasi yang masih aktif.
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-6">
            <ShieldCheck className="h-6 w-6 text-emerald-700" aria-hidden="true" />
            <h2 className="mt-4 text-base font-semibold text-slate-900">
              Pengelolaan venue
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Pemilik mengelola lapangan dan menyetujui booking. Admin memeriksa
              venue, bukan membuat akun lewat formulir publik.
            </p>
          </article>
        </section>
      </main>
    </div>
  )
}
