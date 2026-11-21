import { CalendarCheck, ShieldCheck, Search } from 'lucide-react'

export function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <span className="text-xl font-bold tracking-tight text-emerald-700">
            SportsCourt
          </span>
          {/* <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
            Marketplace Booking Lapangan
          </span> */}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <section className="max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Temukan &amp; Pesan Lapangan Olahraga Secara Terstruktur
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
            SportsCourt menghubungkan pencari lapangan dengan berbagai pemilik
            venue olahraga dalam satu platform. Cek ketersediaan jadwal, bandingkan
            fasilitas, dan ajukan reservasi tanpa perlu konfirmasi manual yang
            rumit.
          </p>
        </section>

        <section className="mt-12 grid gap-6 sm:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <Search className="h-6 w-6 text-emerald-600" aria-hidden="true" />
            <h2 className="mt-4 text-base font-semibold text-slate-900">
              Eksplorasi Multi-Venue
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Cari venue terverifikasi berdasarkan kota, jenis olahraga, dan jam
              operasional yang jelas.
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <CalendarCheck
              className="h-6 w-6 text-emerald-600"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-base font-semibold text-slate-900">
              Jadwal Anti-Bentrok
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Slot waktu per jam dihitung real-time sesuai jam buka, jadwal
              maintenance, dan reservasi aktif.
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <ShieldCheck
              className="h-6 w-6 text-emerald-600"
              aria-hidden="true"
            />
            <h2 className="mt-4 text-base font-semibold text-slate-900">
              Pengelolaan Terpusat
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Pemilik venue mengelola lapangan, harga, blokir jadwal, dan
              persetujuan booking dalam satu dashboard.
            </p>
          </article>
        </section>
      </main>
    </div>
  )
}
