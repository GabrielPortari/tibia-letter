import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { queryClient } from '../../lib/queryClient'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { SUPPORTED_LANGS, type SupportedLang } from '../../i18n'
import letterIcon from '../../assets/letter.png'

const LANG_LABELS: Record<SupportedLang, string> = {
  pt: 'PT',
  en: 'EN',
  es: 'ES',
  pl: 'PL',
}

function supporterLabel(t: (k: string) => string): string {
  return t('topbar.supporter')
}

export function Topbar() {
  const { user, setUser, activeChar } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const { t, i18n } = useTranslation()

  // Parse lang directly from the URL — Topbar renders outside <Route path="/:lang">
  // so useParams() won't have the lang segment.
  const segments = location.pathname.split('/')
  const lang: SupportedLang = SUPPORTED_LANGS.includes(segments[1] as SupportedLang)
    ? (segments[1] as SupportedLang)
    : 'en'

  const isHome = segments.length <= 3 && !segments[2]

  function langNavigate(to: string) {
    navigate(`/${lang}${to}`)
  }

  function handleLogoClick() {
    if (isHome) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      langNavigate('')
    }
  }
  const [open, setOpen] = useState(false)
  const char = activeChar()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'identify',
      },
    })
  }

  async function handleLogout() {
    setOpen(false)
    try {
      await api.post('/auth/logout')
    } catch {
      // best-effort
    }
    setUser(null)
    queryClient.clear()
    langNavigate('')
  }

  function go(path: string) {
    setOpen(false)
    langNavigate(path)
  }

  function switchLang(newLang: SupportedLang) {
    if (newLang === lang) return
    localStorage.setItem('i18n-lang', newLang)
    i18n.changeLanguage(newLang)
    // Replace only the first path segment (the lang code)
    const rest = segments.slice(2).join('/')
    navigate(`/${newLang}${rest ? '/' + rest : ''}`, { replace: true })
  }

  return (
    <header className="sticky top-0 z-[100] bg-bg1/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <button
          onClick={handleLogoClick}
          className="font-display text-gold text-lg font-semibold tracking-wide flex items-center gap-2"
        >
          <img src={letterIcon} alt="" className="w-6 h-6 object-contain" />
          Tibia Letter
        </button>

        <div className="flex items-center gap-2">
          {/* Language switcher */}
          <div className="flex items-center gap-0.5 bg-bg2 border border-border rounded-lg px-1 py-1">
            {SUPPORTED_LANGS.map((l) => (
              <button
                key={l}
                onClick={() => switchLang(l)}
                className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                  l === lang
                    ? 'bg-gold text-bg0'
                    : 'text-text-muted hover:text-text'
                }`}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>

          {user ? (
            <div className="relative" ref={ref}>
              <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg2 transition-colors"
                aria-expanded={open}
              >
                <Avatar src={user.avatarUrl} alt={user.discordName} size={28} />
                <span className="text-sm text-text font-medium max-w-[120px] truncate hidden sm:block">
                  {user.discordName}
                </span>
                {user.premium && (
                  <Badge variant="gold" className="hidden sm:inline-flex">Supporter</Badge>
                )}
                <svg
                  className={`w-3.5 h-3.5 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {open && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-bg2 border border-border rounded-xl shadow-xl overflow-hidden z-[9999]">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-text truncate">{user.discordName}</p>
                    {user.premium && (
                      <p className="text-xs text-gold mt-0.5">
                        ★ {supporterLabel(t)}
                      </p>
                    )}
                    {char ? (
                      <p className="text-xs text-text-muted mt-0.5">
                        {char.name} · Lv.{char.level}
                      </p>
                    ) : (
                      <p className="text-xs text-text-muted mt-0.5">{t('topbar.no_active_char')}</p>
                    )}
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => go('/app/characters')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-bg3 transition-colors text-left"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      {t('topbar.characters')}
                    </button>

                    <button
                      onClick={() => go('/app/queue')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-bg3 transition-colors text-left"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
                      </svg>
                      {t('topbar.queue')}
                    </button>

                    {user.isAdmin && (
                      <button
                        onClick={() => go('/app/admin')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-bg3 transition-colors text-left"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                          <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" />
                        </svg>
                        {t('topbar.admin')}
                      </button>
                    )}
                  </div>

                  {!user.premium && (
                    <div className="border-t border-border py-1">
                      <button
                        onClick={() => go('/supporter')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gold/80 hover:text-gold hover:bg-bg3 transition-colors text-left"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {t('topbar.be_supporter')}
                      </button>
                    </div>
                  )}

                  <div className="border-t border-border py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-red hover:bg-bg3 transition-colors text-left"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      {t('common.logout')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Button size="sm" onClick={handleLogin}>
              {t('common.login')}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
