export type UserRole = 'customer' | 'owner' | 'admin'
export type UserStatus = 'active' | 'suspended'

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: UserRole
  status: UserStatus
  created_at: string | null
}

/** Laravel single-resource envelope: `{ data: T }`. */
export interface ApiResource<T> {
  data: T
}

/** Laravel validation error body (HTTP 422). */
export interface ApiValidationErrorBody {
  message: string
  errors: Record<string, string[]>
}

/** Domain/other error body: `{ message, code? }`. */
export interface ApiErrorBody {
  message: string
  code?: string
}
