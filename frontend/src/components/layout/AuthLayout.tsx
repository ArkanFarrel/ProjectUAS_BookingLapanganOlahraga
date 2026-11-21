import { SiteHeader } from '@/components/layout/SiteHeader'
import type { ReactNode } from 'react'

type AuthLayoutProps = {
  panelTitle: string
  panelText: string
  children: ReactNode
}

// Form di depan pada layar kecil. Panel hijau hanya menjelaskan peran, bukan data palsu.
export function AuthLayout({ panelTitle, panelText, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-2 lg:py-12">
        <section className="order-1 rounded-2xl border border-slate-200 bg-white px-6 py-8 sm:px-8 lg:order-2">
          {children}
        </section>
        <section className="order-2 flex flex-col justify-center rounded-2xl bg-emerald-800 px-6 py-8 text-emerald-50 sm:px-8 lg:order-1 lg:py-12">
          <h2 className="max-w-sm text-3xl font-semibold tracking-tight text-white">
            {panelTitle}
          </h2>
          <p className="mt-4 max-w-sm text-base leading-relaxed text-emerald-50">
            {panelText}
          </p>
        </section>
      </main>
    </div>
  )
}
