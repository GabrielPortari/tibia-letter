import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { Spinner } from '../components/ui/Spinner'
import type { User } from '../types'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    // With detectSessionInUrl: true, the SDK automatically calls
    // exchangeCodeForSession when it detects ?code= in the URL.
    // We must NOT call it again — instead we wait for the SIGNED_IN event
    // that fires after the SDK finishes the exchange.

    const fallback = setTimeout(() => {
      console.error('[AuthCallback] timeout — no SIGNED_IN event received')
      navigate('/', { replace: true })
    }, 15_000)

    async function finishLogin(accessToken: string, refreshToken: string) {
      clearTimeout(fallback)
      try {
        const user = await api.post<User>('/auth/session', {
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        // Do NOT call signOut here — on Supabase-managed auth the SDK may delete
        // the sb-* cookies that the backend relies on for subsequent requests.
        // The Supabase local session is harmless and will expire on its own.
        setUser(user)
        const hasActiveChar = user.characters.some((c) => c.active)
        navigate(hasActiveChar ? '/app/queue' : '/app/characters', { replace: true })
      } catch (err) {
        console.error('[AuthCallback] POST /auth/session failed:', err)
        navigate('/', { replace: true })
      }
    }

    // Listen for the SIGNED_IN that fires after the SDK finishes code exchange.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe()
        finishLogin(session.access_token, session.refresh_token)
      }
    })

    // Also check immediately: if detectSessionInUrl already finished before
    // our listener was registered, getSession() will return the session now.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        subscription.unsubscribe()
        finishLogin(session.access_token, session.refresh_token)
      }
    })

    return () => {
      subscription.unsubscribe()
      clearTimeout(fallback)
    }
  }, [navigate, setUser])

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-text-muted text-sm">Autenticando com Discord…</p>
    </div>
  )
}
