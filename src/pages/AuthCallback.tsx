import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { Spinner } from '../components/ui/Spinner'
import { detectLang } from '../i18n'
import type { User } from '../types'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const { t } = useTranslation()
  const ranRef = useRef(false)

  useEffect(() => {
    if (ranRef.current) return
    ranRef.current = true

    const lang = detectLang()
    let loginStarted = false

    const fallback = setTimeout(() => {
      console.error('[AuthCallback] timeout — no session received')
      navigate(`/${lang}`, { replace: true })
    }, 15_000)

    async function finishLogin(accessToken: string, refreshToken: string) {
      if (loginStarted) return
      loginStarted = true
      clearTimeout(fallback)
      try {
        const user = await api.post<User>('/auth/session', {
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        setUser(user)
        const hasActiveChar = user.characters.some((c) => c.active)
        navigate(hasActiveChar ? `/${lang}/app/queue` : `/${lang}/app/characters`, { replace: true })
      } catch (err) {
        console.error('[AuthCallback] POST /auth/session failed:', err)
        navigate(`/${lang}`, { replace: true })
      }
    }

    // Supabase JS v2: on registration, the listener fires INITIAL_SESSION with the
    // current session (if PKCE exchange already completed) OR SIGNED_IN when it
    // completes. Both must be handled — relying only on SIGNED_IN misses the
    // fast-exchange case where INITIAL_SESSION carries the session.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session) {
        subscription.unsubscribe()
        finishLogin(session.access_token, session.refresh_token)
      }
    })

    // Fallback: if the session was already established before the listener was set up
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
      <p className="text-text-muted text-sm">{t('authCallback.authenticating')}</p>
    </div>
  )
}
