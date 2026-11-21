import { AppShell } from '@/components/layout/AppShell'
import { useMe } from '@/features/auth/hooks'
import { roleLabel } from '@/features/auth/paths'
import { usePageTitle } from '@/lib/usePageTitle'
import { Link } from 'react-router-dom'

type RoleHomePageProps = {
  title: string
  body: string
  primaryHref?: string
  primaryLabel?: string
}

// Halaman ini hanya bukti guard role. Angka dashboard menyusul di fase 7.
export function RoleHomePage({
  title,
  body,
  primaryHref = '/account',
  primaryLabel = 'Kelola akun',
}: RoleHomePageProps) {
  usePageTitle(title)
  const me = useMe()

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-700">{body}</p>
      {me.data ? (
        <p className="mt-6 text-sm text-slate-600">
          Masuk sebagai <span className="font-medium text-slate-900">{me.data.name}</span>
          {' '}({roleLabel(me.data.role)}).
        </p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          to={primaryHref}
          className="inline-flex rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          {primaryLabel}
        </Link>
        {primaryHref !== '/account' ? (
          <Link
            to="/account"
            className="inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Kelola akun
          </Link>
        ) : null}
      </div>
    </AppShell>
  )
}
