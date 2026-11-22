import { CalendarCheck, Search, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMe } from '@/features/auth/hooks'
import { homeRouteFor } from '@/lib/routes'

export function HomePage() {
  const { data: user, isPending } = useMe()

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
      <section className="max-w-3xl">
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Temukan &amp; Pesan Lapangan Olahraga Secara Terstruktur
        </h1>
        <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
          SportsCourt menghubungkan pencari lapangan dengan berbagai pemilik venue olahraga dalam satu platform. Cek ketersediaan jadwal, bandingkan fasilitas, dan ajukan reservasi tanpa perlu konfirmasi manual yang rumit.
        </p>

        {!isPending ? (
          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <Link
                to={homeRouteFor(user.role)}
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Buka Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Daftar Sekarang
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Masuk
                </Link>
              </>
            )}
          </div>
        ) : null}
      </section>

      <section className="mt-12 grid gap-6 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <Search className="h-6 w-6 text-emerald-600" aria-hidden="true" />
          <h2 className="mt-4 text-base font-semibold text-slate-900">Eksplorasi Multi-Venue</h2>
          <p className="mt-2 text-sm text-slate-600">
            Cari venue terverifikasi berdasarkan kota, jenis olahraga, dan jam operasional yang jelas.
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <CalendarCheck className="h-6 w-6 text-emerald-600" aria-hidden="true" />
          <h2 className="mt-4 text-base font-semibold text-slate-900">Jadwal Anti-Bentrok</h2>
          <p className="mt-2 text-sm text-slate-600">
            Slot waktu per jam dihitung real-time sesuai jam buka, jadwal maintenance, dan reservasi aktif.
          </p>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <ShieldCheck className="h-6 w-6 text-emerald-600" aria-hidden="true" />
          <h2 className="mt-4 text-base font-semibold text-slate-900">Pengelolaan Terpusat</h2>
          <p className="mt-2 text-sm text-slate-600">
            Pemilik venue mengelola lapangan, harga, blokir jadwal, dan persetujuan booking dalam satu dashboard.
          </p>
        </article>
      </section>
    </div>
  )
}
