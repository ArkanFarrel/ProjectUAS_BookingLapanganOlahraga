import { useLogout, useMe } from '@/features/auth/hooks'
import { homePathForRole } from '@/features/auth/paths'
import { Link, useNavigate } from 'react-router-dom'

export function SiteHeader() {
  const me = useMe()
  const logout = useLogout()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout.mutateAsync()
    navigate('/login', { replace: true })
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <Link
          to="/"
          className="text-xl font-semibold tracking-tight text-emerald-800"
        >
          SportsCourt
        </Link>

        <nav aria-label="Akun" className="flex flex-wrap items-center justify-end gap-2">
          {me.isPending ? (
            <span
              className="inline-block h-9 w-28 rounded-lg bg-slate-100"
              aria-hidden="true"
            />
          ) : me.data ? (
            <>
              <span className="hidden max-w-40 truncate text-sm text-slate-700 sm:inline">
                {me.data.name}
              </span>
              <Link
                to={homePathForRole(me.data.role)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Area saya
              </Link>
              {me.data.role === 'owner' ? (
                <Link
                  to="/owner/venues"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Venue
                </Link>
              ) : null}
              {me.data.role === 'admin' ? (
                <Link
                  to="/admin/venues"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Verifikasi
                </Link>
              ) : null}
              <Link
                to="/account"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Akun
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={logout.isPending}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {logout.isPending ? 'Keluar...' : 'Keluar'}
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
