import { SiteHeader } from '@/components/layout/SiteHeader'
import { usePageTitle } from '@/lib/usePageTitle'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  usePageTitle('Tidak ditemukan')

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Halaman tidak ditemukan
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          Tautan yang Anda buka tidak tersedia.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Kembali ke beranda
        </Link>
      </main>
    </div>
  )
}
