import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { PageLoader } from '@/components/common/PageLoader'
import { StatusPage } from '@/components/common/StatusPage'
import { Button } from '@/components/common/Button'
import { useMe } from '@/features/auth/hooks'
import { homeRouteFor } from '@/lib/routes'
import type { UserRole } from '@/types/api'

/*
 * Route guards are a UX convenience only. Every protected endpoint is enforced
 * again by the Laravel backend (auth:sanctum + role middleware + policies).
 */

function SessionError({ onRetry }: { onRetry: () => void }) {
  return (
    <StatusPage
      code="Error"
      title="Gagal memuat sesi"
      description="Tidak dapat memeriksa status login. Pastikan server API berjalan, lalu coba lagi."
      action={<Button onClick={onRetry}>Coba Lagi</Button>}
    />
  )
}

export function RequireAuth({ roles }: { roles?: readonly UserRole[] }) {
  const { data: user, isPending, isError, refetch } = useMe()
  const location = useLocation()

  if (isPending) return <PageLoader label="Memeriksa sesi..." />
  if (isError) return <SessionError onRetry={() => void refetch()} />

  if (!user) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <StatusPage
        code="403"
        title="Akses ditolak"
        description="Akun Anda tidak memiliki izin untuk membuka halaman ini."
      />
    )
  }

  return <Outlet />
}

/** Login/register pages: logged-in users are sent to their dashboard. */
export function GuestOnly() {
  const { data: user, isPending, isError, refetch } = useMe()

  if (isPending) return <PageLoader label="Memeriksa sesi..." />
  if (isError) return <SessionError onRetry={() => void refetch()} />
  if (user) return <Navigate to={homeRouteFor(user.role)} replace />

  return <Outlet />
}
