import { ensureCsrfCookie } from '@/features/auth/api'
import type { Venue, VenueStatus } from '@/features/venues/types'
import { api } from '@/lib/axios'

type Data<T> = { data: T }

export type AdminVenueFilters = {
  q?: string
  city?: string
  status?: VenueStatus | ''
  page?: number
}

export type AdminVenuePage = {
  data: Venue[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

export async function listAdminVenues(filters: AdminVenueFilters): Promise<AdminVenuePage> {
  const { data } = await api.get<AdminVenuePage>('/api/v1/admin/venues', {
    params: {
      q: filters.q || undefined,
      city: filters.city || undefined,
      status: filters.status || undefined,
      page: filters.page || undefined,
      per_page: 12,
    },
  })
  return data
}

export async function getAdminVenue(id: number): Promise<Venue> {
  const { data } = await api.get<Data<Venue>>(`/api/v1/admin/venues/${id}`)
  return data.data
}

async function patchVenue(id: number, action: string, body?: { reason: string }): Promise<Venue> {
  await ensureCsrfCookie()
  const { data } = await api.patch<Data<Venue>>(`/api/v1/admin/venues/${id}/${action}`, body)
  return data.data
}

export function approveVenue(id: number): Promise<Venue> {
  return patchVenue(id, 'approve')
}

export function rejectVenue(id: number, reason: string): Promise<Venue> {
  return patchVenue(id, 'reject', { reason })
}

export function suspendVenue(id: number, reason: string): Promise<Venue> {
  return patchVenue(id, 'suspend', { reason })
}

export function reactivateVenue(id: number): Promise<Venue> {
  return patchVenue(id, 'reactivate')
}
