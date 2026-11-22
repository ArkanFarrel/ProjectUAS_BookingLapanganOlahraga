import { api, ensureCsrfCookie } from '@/lib/axios'
import type { ApiResource, User } from '@/types/api'
import type { LoginInput, PasswordInput, ProfileInput, RegisterInput } from './schemas'

export async function fetchMe(): Promise<User> {
  const { data } = await api.get<ApiResource<User>>('/api/v1/auth/me')
  return data.data
}

export async function login(input: LoginInput): Promise<User> {
  await ensureCsrfCookie()
  const { data } = await api.post<ApiResource<User>>('/api/v1/auth/login', input)
  return data.data
}

export async function register(input: RegisterInput): Promise<User> {
  await ensureCsrfCookie()
  const { data } = await api.post<ApiResource<User>>('/api/v1/auth/register', input)
  return data.data
}

export async function logout(): Promise<void> {
  await api.post('/api/v1/auth/logout')
}

export async function updateProfile(input: ProfileInput): Promise<User> {
  const { data } = await api.put<ApiResource<User>>('/api/v1/auth/profile', {
    name: input.name,
    phone: input.phone === '' ? null : input.phone,
  })
  return data.data
}

export async function updatePassword(input: PasswordInput): Promise<void> {
  await api.put('/api/v1/auth/password', input)
}
