import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getApiStatus } from '@/lib/apiError'
import type { User } from '@/types/api'
import * as authApi from './api'

export const authKeys = {
  me: ['auth', 'me'] as const,
}

/**
 * Current user from the Laravel session (source of truth).
 * Resolves to `null` when not logged in (401) or when the account was suspended (403).
 */
export function useMe() {
  return useQuery<User | null>({
    queryKey: authKeys.me,
    queryFn: async () => {
      try {
        return await authApi.fetchMe()
      } catch (error) {
        const status = getApiStatus(error)
        if (status === 401 || status === 403) return null
        throw error
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      // Drop every cached private resource, then mark the visitor as guest.
      queryClient.clear()
      queryClient.setQueryData(authKeys.me, null)
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me, user)
    },
  })
}

export function useUpdatePassword() {
  return useMutation({ mutationFn: authApi.updatePassword })
}
