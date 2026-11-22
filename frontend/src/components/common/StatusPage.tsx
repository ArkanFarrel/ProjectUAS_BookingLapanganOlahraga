import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type StatusPageProps = {
  code: string
  title: string
  description: string
  action?: ReactNode
}

/** Generic full-width status view (404, 403, error). */
export function StatusPage({ code, title, description, action }: StatusPageProps) {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold text-emerald-700">{code}</p>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-slate-600">{description}</p>
      <div className="mt-6">
        {action ?? (
          <Link
            to="/"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Kembali ke Beranda
          </Link>
        )}
      </div>
    </section>
  )
}
