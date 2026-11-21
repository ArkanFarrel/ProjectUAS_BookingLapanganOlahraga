import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { HomePage } from '@/pages/public/HomePage'

function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <p className="text-sm font-semibold text-emerald-700">404</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Tautan yang Anda buka tidak tersedia atau telah dipindahkan.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
      >
        Kembali ke Beranda
      </Link>
    </main>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
