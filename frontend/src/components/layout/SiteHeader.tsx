import { SiteBrand } from '@/components/layout/SiteBrand'
import { Button } from '@/components/ui/button'
import { buttonClass, buttonTones } from '@/components/ui/buttonStyles'
import { useLogout, useMe } from '@/features/auth/hooks'
import { homePathForRole, roleLabel } from '@/features/auth/paths'
import { cn } from '@/lib/cn'
import type { UserRole } from '@/types/user'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'

const links = {
  guest: [['/explore', 'Jelajah']],
  customer: [['/explore', 'Jelajah'], ['/customer/bookings', 'Jadwal'], ['/customer', 'Profil'], ['/account', 'Pengaturan']],
  owner: [['/owner', 'Dashboard'], ['/owner/venues', 'Venue & Court'], ['/owner/bookings', 'Pesanan Masuk'], ['/account', 'Pengaturan']],
  admin: [['/admin', 'Dashboard'], ['/admin/venues', 'Verifikasi Venue'], ['/admin/sports', 'Kategori'], ['/admin/users', 'Pengguna'], ['/admin/bookings', 'Booking'], ['/account', 'Pengaturan']],
} satisfies Record<UserRole | 'guest', string[][]>

export function SiteHeader() {
  const me = useMe()
  const logout = useLogout()
  const location = useLocation()
  const navigate = useNavigate()
  const role = me.data?.role
  const portal = role === 'owner' || role === 'admin'

  async function handleLogout() {
    await logout.mutateAsync()
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-x-5 gap-y-1 px-4 py-2.5 sm:px-8 lg:py-3">
        <div className="flex items-center gap-2.5">
          <SiteBrand to={portal ? homePathForRole(role) : '/'} />
          {portal ? (
            <span className="hidden rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary sm:inline">
              {roleLabel(role)}
            </span>
          ) : null}
        </div>
        <nav aria-label="Navigasi utama" className="order-last flex w-full flex-wrap items-center gap-x-3 sm:gap-x-5 lg:order-none lg:w-auto">
          {links[role ?? 'guest'].map(([path, label]) => {
            const discovery = path === '/explore'
            const onDiscovery = discovery && (location.pathname === '/' || location.pathname.startsWith('/venues/'))
            return (
              <NavLink
                key={path}
                to={path}
                end={path === '/customer' || path === '/owner' || path === '/admin'}
                aria-current={onDiscovery ? 'page' : undefined}
                className={({ isActive }) => cn(
                  'inline-flex min-h-9 items-center border-b-2 pt-0.5 text-sm font-medium transition-colors hover:text-primary',
                  isActive || onDiscovery ? 'border-primary font-semibold text-primary' : 'border-transparent text-ink-soft',
                )}
              >
                {label}
              </NavLink>
            )
          })}
          {portal ? <Link to="/explore" className="text-sm font-medium text-ink-soft hover:text-primary">Jelajah</Link> : null}
        </nav>
        <div className="flex items-center gap-2">
          {role === 'owner' ? (
            <Link to="/owner/venues/new" className={cn(buttonClass, buttonTones.open, 'hidden sm:inline-flex')}>
              Tambah Venue
            </Link>
          ) : null}
          {role ? (
            <Button tone="ghost" onClick={() => void handleLogout()} disabled={logout.isPending}>
              {logout.isPending ? 'Keluar...' : 'Keluar'}
            </Button>
          ) : me.isPending ? null : (
            <>
              <Link to="/login" className={cn(buttonClass, buttonTones.ghost)}>Masuk</Link>
              <Link to="/register" className={cn(buttonClass, buttonTones.open)}>Daftar</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
