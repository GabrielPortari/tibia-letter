import { useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import type { User } from '../types'

const BASE = ((import.meta.env.VITE_API_URL as string) || '') + '/api/v1'

export function useAuth() {
  const { user, isLoading, setUser, setLoading } = useAuthStore()

  useEffect(() => {
    let mounted = true

    async function loadMe() {
      try {
        // Raw fetch — intentionally bypasses the api.ts 401→redirect interceptor.
        // A 401 here simply means "not logged in yet" and must NOT trigger a redirect.
        const res = await fetch(`${BASE}/auth/me`, { credentials: 'include' })
        if (!mounted) return
        if (res.ok) {
          const me: User = await res.json()
          setUser(me)
        } else {
          setUser(null)
        }
      } catch {
        if (mounted) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadMe()

    return () => { mounted = false }
  }, [setUser, setLoading])

  return { user, isLoading }
}
