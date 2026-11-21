import { SiteHeader } from '@/components/layout/SiteHeader'

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6" aria-busy="true">
        <p className="text-sm text-slate-700">Memeriksa sesi akun...</p>
        <div className="mt-6 h-8 w-48 rounded-lg bg-slate-200" />
        <div className="mt-4 h-4 w-full max-w-md rounded bg-slate-200" />
        <div className="mt-2 h-4 w-2/3 rounded bg-slate-200" />
      </main>
    </div>
  )
}

export function LoadErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteHeader />
      <main className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Sesi tidak bisa dicek
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          Server tidak menjawab. Pastikan API berjalan di localhost:8000, lalu coba lagi.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Coba lagi
        </button>
      </main>
    </div>
  )
}
