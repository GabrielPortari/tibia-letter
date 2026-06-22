import { useAuthStore } from '../stores/authStore'
import { queryClient } from './queryClient'

const BASE = ((import.meta.env.VITE_API_URL as string) || '') + '/api/v1'

// Deduplicates concurrent refresh calls into a single request
let refreshPromise: Promise<boolean> | null = null

async function tryRefresh(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(BASE + path, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (res.status === 401) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      const retry = await fetch(BASE + path, {
        ...init,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...init?.headers },
      })
      if (retry.ok) {
        if (retry.status === 204 || retry.headers.get('content-length') === '0') return undefined as T
        return retry.json() as Promise<T>
      }
      // Retry failed for a non-auth reason (403, 500, …) — don't log the user out
      if (retry.status !== 401) {
        const body = await retry.json().catch(() => ({}))
        throw new Error((body as { message?: string }).message ?? `HTTP ${retry.status}`)
      }
    }
    useAuthStore.getState().setUser(null)
    queryClient.clear()
    return Promise.reject(new Error('Unauthorized'))
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error((body as { message?: string }).message ?? `HTTP ${res.status}`)
  }

  if (res.status === 204 || res.headers.get('content-length') === '0') {
    return undefined as T
  }
  return res.json() as Promise<T>
}

export const api = {
  get:    <T>(path: string)                 => request<T>(path),
  post:   <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST',   body: body !== undefined ? JSON.stringify(body) : undefined }),
  patch:  <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH',  body: body !== undefined ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string)                 => request<T>(path, { method: 'DELETE' }),
}
