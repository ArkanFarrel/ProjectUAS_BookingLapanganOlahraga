import { Loader2 } from 'lucide-react'

export function PageLoader({ label = 'Memuat...' }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-live="polite">
      <Loader2 className="h-6 w-6 animate-spin text-emerald-600" aria-hidden="true" />
      <span className="ml-2 text-sm text-slate-600">{label}</span>
    </div>
  )
}
