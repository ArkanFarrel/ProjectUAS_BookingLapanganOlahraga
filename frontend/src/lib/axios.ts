import axios from 'axios'

/**
 * Shared Axios client configured for Laravel Sanctum SPA cookie/CSRF flow.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
})
