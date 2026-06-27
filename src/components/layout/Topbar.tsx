import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { useQueueStore } from '../../stores/queueStore'
import { queryClient } from '../../lib/queryClient'
import { useMyQueues } from '../../hooks/useMyQueues'
import { useToasts } from '../../hooks/useToasts'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { AcceptTimer, HuntEndTimer } from '../queue/InlineTimer'
import { SUPPORTED_LANGS, type SupportedLang } from '../../i18n'
import { getEntryStatus } from '../../types'
import { fmt, secondsUntil } from '../../utils/time'
import type { MyQueueEntry } from '../../types'
import letterIcon from '../../assets/letter.png'

const LANG_LABELS: Record<SupportedLang, string> = {
  pt: 'PT',
  en: 'EN',
  es: 'ES',
  pl: 'PL',
}


function QueuePopoverItem({
  entry,
  onAccept,
  onLeave,
  loadingSpawns,
  onExpire,
}: {
  entry: MyQueueEntry
  onAccept: (worldId: string, spawnId: string) => Promise<void>
  onLeave: (worldId: string, spawnId: string) => Promise<void>
  loadingSpawns: Set<string>
  onExpire: () => void
}) {
  const { t } = useTranslation()
  const status = getEntryStatus(entry)
  const isLoading = loadingSpawns.has(entry.spawnId)

  if (status === 'pending_accept') {
    return (
      <div
        className="rounded-lg px-3 py-2 space-y-1.5"
        style={{
          background: 'var(--gold-glow)',
          border: '1px solid var(--gold)',
          animation: 'glow 2s ease-in-out infinite',
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-gold truncate">{entry.spawnName}</span>
          {entry.acceptDeadline && (
            <AcceptTimer deadline={entry.acceptDeadline} onExpire={onExpire} />
          )}
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={() => onAccept(entry.worldId, entry.spawnId)}
            disabled={isLoading}
            className="flex-1 py-1 rounded text-xs font-semibold text-bg0 disabled:opacity-50"
            style={{ background: 'var(--gold)' }}
          >
            {isLoading ? (
              <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : t('banner.accept')}
          </button>
          <button
            onClick={() => onLeave(entry.worldId, entry.spawnId)}
            disabled={isLoading}
            className="py-1 px-2 rounded text-xs disabled:opacity-50"
            style={{ background: 'var(--red-bg)', border: '0.5px solid var(--red)', color: 'var(--red)' }}
          >
            {t('banner.skip')}
          </button>
        </div>
      </div>
    )
  }

  if (status === 'active') {
    return (
      <div
        className="rounded-lg px-3 py-2 flex items-center justify-between gap-2"
        style={{ background: 'var(--green-bg)', border: '0.5px solid var(--green)' }}
      >
        <span className="text-xs font-medium" style={{ color: 'var(--green)' }}>
          ⚔ {entry.spawnName}
        </span>
        {entry.huntEndsAt && <HuntEndTimer endsAt={entry.huntEndsAt} />}
      </div>
    )
  }

  return (
    <div
      className="rounded-lg px-3 py-2 flex items-center justify-between gap-2"
      style={{ background: 'var(--bg-2)', border: '0.5px solid var(--border)' }}
    >
      <span className="text-xs text-text truncate">{entry.spawnName}</span>
      <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
        {t('banner.position', { pos: entry.position })}
        {entry.estimatedStart && (
          <> · ~{fmt(secondsUntil(entry.estimatedStart))}</>
        )}
      </span>
    </div>
  )
}

function QueueBadge({ lang }: { lang: SupportedLang }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { myEntries } = useQueueStore()
  const { acceptEntry, leaveEntry, refetch } = useMyQueues()
  const { addToast } = useToasts()
  const [open, setOpen] = useState(false)
  const [loadingSpawns, setLoadingSpawns] = useState<Set<string>>(() => new Set())
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

  if (myEntries.length === 0) return null

  const hasPendingAccept = myEntries.some((e) => getEntryStatus(e) === 'pending_accept')

  async function handleAccept(worldId: string, spawnId: string) {
    setLoadingSpawns((prev) => new Set(prev).add(spawnId))
    try {
      await acceptEntry(worldId, spawnId)
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : t('common.error'))
    } finally {
      setLoadingSpawns((prev) => { const next = new Set(prev); next.delete(spawnId); return next })
    }
  }

  async function handleLeave(worldId: string, spawnId: string) {
    setLoadingSpawns((prev) => new Set(prev).add(spawnId))
    try {
      await leaveEntry(worldId, spawnId)
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : t('common.error'))
    } finally {
      setLoadingSpawns((prev) => { const next = new Set(prev); next.delete(spawnId); return next })
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-bg2 transition-colors"
        aria-label={t('topbar.queue')}
      >
        <svg className="w-4 h-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
        </svg>
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 text-[10px] font-bold text-bg0"
          style={{ background: hasPendingAccept ? 'var(--gold)' : 'var(--green)', animation: hasPendingAccept ? 'glow 2s ease-in-out infinite' : undefined }}
        >
          {myEntries.length}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-bg2 border border-border rounded-xl shadow-xl overflow-hidden z-[9999]">
          <div className="px-3 py-2 border-b border-border flex items-center justify-between">
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: 'var(--text-dim)' }}>
              {t('topbar.queue')}
            </span>
            <button
              onClick={() => { setOpen(false); navigate(`/${lang}/app/queue`) }}
              className="text-xs text-gold hover:underline"
            >
              {t('topbar.queue')} →
            </button>
          </div>
          <div className="p-2 space-y-1.5 max-h-72 overflow-y-auto">
            {myEntries.map((entry) => (
              <QueuePopoverItem
                key={entry.id}
                entry={entry}
                onAccept={handleAccept}
                onLeave={handleLeave}
                loadingSpawns={loadingSpawns}
                onExpire={refetch}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
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
            <>
              <QueueBadge lang={lang} />

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
                          ★ {t('topbar.supporter')}
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

                      <button
                        onClick={() => go('/about')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-bg3 transition-colors text-left"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
                        </svg>
                        {t('topbar.about')}
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
            </>
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
