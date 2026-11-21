import { SiteHeader } from '@/components/layout/SiteHeader'
import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  )
}
