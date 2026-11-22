import axios from 'axios'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import type { ApiErrorBody, ApiValidationErrorBody } from '@/types/api'

const DEFAULT_MESSAGE = 'Terjadi kesalahan. Silakan coba lagi.'

export function getApiStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}

export function getApiErrorCode(error: unknown): string | undefined {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return undefined
  return error.response?.data?.code
}

export function getValidationErrors(error: unknown): Record<string, string[]> | null {
  if (!axios.isAxiosError<ApiValidationErrorBody>(error)) return null
  if (error.response?.status !== 422) return null
  return error.response.data?.errors ?? null
}

/** Human-readable message for any API error (network, 4xx, 5xx). */
export function getApiErrorMessage(error: unknown, fallback = DEFAULT_MESSAGE): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback

  if (!error.response) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi Anda.'
  }

  const { status, data } = error.response

  if (status === 429) return data?.message ?? 'Terlalu banyak permintaan. Coba lagi nanti.'
  if (status >= 500) return 'Server sedang bermasalah. Silakan coba beberapa saat lagi.'

  return data?.message || fallback
}

/**
 * Maps Laravel 422 field errors onto react-hook-form fields.
 * Returns true when at least one known field error was applied.
 */
export function applyServerValidationErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[],
): boolean {
  const errors = getValidationErrors(error)
  if (!errors) return false

  let applied = false
  for (const field of fields) {
    const messages = errors[field]
    if (messages && messages.length > 0) {
      setError(field, { type: 'server', message: messages[0] })
      applied = true
    }
  }

  return applied
}
