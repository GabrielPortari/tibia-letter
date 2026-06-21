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
        let res = await fetch(`${BASE}/auth/me`, { credentials: 'include' })

        // Access token may be expired but refresh token still valid — try once
        if (res.status === 401) {
          const refreshed = await fetch(`${BASE}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
          })
          if (refreshed.ok) {
            res = await fetch(`${BASE}/auth/me`, { credentials: 'include' })
          }
        }

        if (!mounted) return
        if (res.ok) {
          const me: User = await res.json()
          setUser(me)
        } else {
          // Don't overwrite a user set concurrently by AuthCallback (race on /auth/callback).
          // If AuthCallback's finishLogin already ran, getState().user is non-null and we
          // must not clobber it — doing so would cause PrivateRoute to redirect immediately.
          if (!useAuthStore.getState().user) {
            setUser(null)
          }
        }
      } catch {
        if (mounted && !useAuthStore.getState().user) setUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadMe()

    return () => { mounted = false }
  }, [setUser, setLoading])

  return { user, isLoading }
}
