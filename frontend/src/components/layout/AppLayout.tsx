import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Menu, UserCircle2, X } from 'lucide-react'
import { useLogout, useMe } from '@/features/auth/hooks'
import { homeRouteFor, roleLabel } from '@/lib/routes'

const CURRENT_YEAR = new Date().getFullYear()

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
  }`

export function AppLayout() {
  const { data: user, isPending } = useMe()
  const logout = useLogout()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        setMobileOpen(false)
        navigate('/login', { replace: true })
      },
    })
  }

  const links = user
    ? [
        { to: homeRouteFor(user.role), label: 'Dashboard' },
        { to: '/profile', label: 'Profil' },
      ]
    : []

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6" aria-label="Navigasi utama">
          <Link to="/" className="text-xl font-bold tracking-tight text-emerald-700">
            SportsCourt
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink key={link.to} to={link.to} className={navLinkClass}>
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {isPending ? (
              <span className="h-8 w-32 animate-pulse rounded-md bg-slate-100" aria-hidden="true" />
            ) : user ? (
              <>
                <span className="flex items-center gap-2 text-sm text-slate-700">
                  <UserCircle2 className="h-5 w-5 text-slate-400" aria-hidden="true" />
                  <span className="max-w-40 truncate font-medium">{user.name}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{roleLabel[user.role]}</span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logout.isPending}
                  className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  Keluar
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navLinkClass}>
                  Masuk
                </NavLink>
                <Link
                  to="/register"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Daftar
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label={mobileOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </nav>

        {mobileOpen ? (
          <div id="mobile-menu" className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {user ? (
                <>
                  <p className="px-3 py-2 text-sm text-slate-700">
                    <span className="font-medium">{user.name}</span>{' '}
                    <span className="text-xs text-slate-500">({roleLabel[user.role]})</span>
                  </p>
                  {links.map((link) => (
                    <NavLink key={link.to} to={link.to} className={navLinkClass} onClick={() => setMobileOpen(false)}>
                      {link.label}
                    </NavLink>
                  ))}
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={logout.isPending}
                    className="rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <NavLink to="/login" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    Masuk
                  </NavLink>
                  <NavLink to="/register" className={navLinkClass} onClick={() => setMobileOpen(false)}>
                    Daftar
                  </NavLink>
                </>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        © {CURRENT_YEAR} SportsCourt — Marketplace Booking Lapangan Olahraga
      </footer>
    </div>
  )
}
