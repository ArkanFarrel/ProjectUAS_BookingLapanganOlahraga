import { useLogout, useMe } from '@/features/auth/hooks'
import { homePathForRole } from '@/features/auth/paths'
import { cn } from '@/lib/cn'
import { Link, useNavigate } from 'react-router-dom'

const linkClass = 'rounded-md px-3 py-2 text-sm font-semibold text-paper/90 hover:bg-enamel-2 hover:text-paper'

export function SiteHeader() {
  const me = useMe()
  const logout = useLogout()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout.mutateAsync()
    navigate('/login', { replace: true })
  }

  return (
    <header className="bg-enamel text-paper">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="font-display text-3xl leading-none text-lamp">
          SportsCourt
        </Link>

        <nav aria-label="Akun" className="flex flex-wrap items-center justify-end gap-1">
          <Link to="/explore" className={linkClass}>
            Cari
          </Link>
          {me.isPending ? <span className="inline-block h-9 w-24 rounded-md bg-enamel-2" aria-hidden="true" /> : null}
          {me.data ? (
            <>
              <span className="hidden max-w-40 truncate px-2 text-sm text-paper/80 sm:inline">{me.data.name}</span>
              <Link to={homePathForRole(me.data.role)} className={linkClass}>
                Area saya
              </Link>
              {me.data.role === 'customer' ? (
                <Link to="/customer/bookings" className={linkClass}>
                  Booking
                </Link>
              ) : null}
              {me.data.role === 'owner' ? (
                <Link to="/owner/bookings" className={linkClass}>
                  Booking
                </Link>
              ) : null}
              {me.data.role === 'owner' ? (
                <Link to="/owner/venues" className={linkClass}>
                  Venue
                </Link>
              ) : null}
              {me.data.role === 'admin' ? (
                <Link to="/admin/venues" className={linkClass}>
                  Verifikasi
                </Link>
              ) : null}
              <Link to="/account" className={linkClass}>
                Akun
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                disabled={logout.isPending}
                className={cn(linkClass, 'disabled:opacity-60')}
              >
                {logout.isPending ? 'Keluar...' : 'Keluar'}
              </button>
            </>
          ) : me.isPending ? null : (
            <>
              <Link to="/login" className={linkClass}>
                Masuk
              </Link>
              <Link to="/register" className="rounded-md bg-lamp px-3 py-2 text-sm font-semibold text-ink hover:bg-wait-soft">
                Daftar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
