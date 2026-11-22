import axios from 'axios'
import { queryClient } from '@/lib/queryClient'
import type { ApiErrorBody } from '@/types/api'

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    /** Internal flag: request already retried once after refreshing the CSRF cookie. */
    _csrfRetried?: boolean
  }
}

/**
 * Shared Axios client configured for Laravel Sanctum SPA cookie/CSRF flow.
 * - `withCredentials`: send the session cookie to http://localhost:8000.
 * - `withXSRFToken`: send the XSRF-TOKEN cookie as `X-XSRF-TOKEN` header cross-origin.
 * No token is ever stored in localStorage.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
})

/** Initializes (or refreshes) the XSRF-TOKEN cookie. */
export async function ensureCsrfCookie(): Promise<void> {
  await api.get('/sanctum/csrf-cookie')
}

// 419 = CSRF token mismatch / expired: refresh the cookie and retry exactly once.
// 401 (outside auth endpoints) or 403 ACCOUNT_SUSPENDED: sync cached auth state to guest.
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 419 && error.config && !error.config._csrfRetried) {
      error.config._csrfRetried = true
      await ensureCsrfCookie()
      return api.request(error.config)
    }

    if (axios.isAxiosError<ApiErrorBody>(error) && error.response) {
      const status = error.response.status
      const code = error.response.data?.code
      const url = error.config?.url ?? ''

      const isAuthSelfRequest =
        url.includes('/api/v1/auth/me') ||
        url.includes('/api/v1/auth/login') ||
        url.includes('/api/v1/auth/register')

      if ((status === 401 && !isAuthSelfRequest) || (status === 403 && code === 'ACCOUNT_SUSPENDED')) {
        queryClient.setQueryData(['auth', 'me'], null)
      }
    }

    return Promise.reject(error)
  },
)
