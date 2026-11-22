import type { UserRole } from '@/types/api'

/** Landing route after login for each role (UX only; backend enforces access). */
export function homeRouteFor(role: UserRole): string {
  switch (role) {
    case 'owner':
      return '/owner'
    case 'admin':
      return '/admin'
    default:
      return '/dashboard'
  }
}

/** Accept only same-app relative paths to prevent open redirects. */
export function safeRedirectPath(path: unknown): string | null {
  if (typeof path !== 'string') return null
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return null
  return path
}

export const roleLabel: Record<UserRole, string> = {
  customer: 'Customer',
  owner: 'Pemilik Venue',
  admin: 'Admin',
}
