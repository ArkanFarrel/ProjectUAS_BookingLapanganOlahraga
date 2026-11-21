import { SiteHeader } from '@/components/layout/SiteHeader'
import type { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="court-sheet min-h-screen text-ink">
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl px-6 py-8 sm:px-8 sm:py-10">
        {children}
      </main>
    </div>
  )
}
