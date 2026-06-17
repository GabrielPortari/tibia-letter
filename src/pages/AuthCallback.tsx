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

    const fallback = setTimeout(() => {
      console.error('[AuthCallback] timeout — no SIGNED_IN event received')
      navigate(`/${lang}`, { replace: true })
    }, 15_000)

    async function finishLogin(accessToken: string, refreshToken: string) {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe()
        finishLogin(session.access_token, session.refresh_token)
      }
    })

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
