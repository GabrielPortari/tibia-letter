import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import { queryClient } from '../../lib/queryClient'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

export function Topbar() {
  const { user, setUser, activeChar } = useAuthStore()
  const navigate = useNavigate()
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

  async function handleLogout() {
    setOpen(false)
    try {
      await api.post('/auth/logout')
    } catch {
      // best-effort
    }
    setUser(null)
    queryClient.clear()
    navigate('/')
  }

  function go(path: string) {
    setOpen(false)
    navigate(path)
  }

  return (
    <header className="sticky top-0 z-40 bg-bg1/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="font-display text-gold text-lg font-semibold tracking-wide">
          Tibia Letter
        </Link>

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
                <Badge variant="gold" className="hidden sm:inline-flex">Premium</Badge>
              )}
              <svg
                className={`w-3.5 h-3.5 text-text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-bg2 border border-border rounded-xl shadow-xl overflow-hidden z-50">
                {/* User info */}
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-text truncate">{user.discordName}</p>
                  {char ? (
                    <p className="text-xs text-text-muted mt-0.5">
                      {char.name} · Lv.{char.level}
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted mt-0.5">Nenhum personagem ativo</p>
                  )}
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    onClick={() => go('/app/characters')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-bg3 transition-colors text-left"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Meus personagens
                  </button>

                  <button
                    onClick={() => go('/app/queue')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-bg3 transition-colors text-left"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />
                    </svg>
                    Fila
                  </button>

                  {!user.premium && (
                    <button
                      onClick={() => go('/premium')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gold hover:bg-bg3 transition-colors text-left"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      Assinar Premium
                    </button>
                  )}

                  {user.isAdmin && (
                    <button
                      onClick={() => go('/app/admin')}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-muted hover:text-text hover:bg-bg3 transition-colors text-left"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                        <path d="M12 2l2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7z" />
                      </svg>
                      Admin
                    </button>
                  )}
                </div>

                {/* Logout */}
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
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button size="sm" onClick={() => navigate('/')}>
            Entrar com Discord
          </Button>
        )}
      </div>
    </header>
  )
}
