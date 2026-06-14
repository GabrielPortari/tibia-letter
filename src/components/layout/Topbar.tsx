import { useState } from 'react'
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
  const [menuOpen, setMenuOpen] = useState(false)
  const char = activeChar()

  async function handleLogout() {
    try {
      await api.post('/auth/logout')
    } catch {
      // best-effort
    }
    setUser(null)
    queryClient.clear()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-bg1/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="font-display text-gold text-lg font-semibold tracking-wide">
          Tibia Letter
        </Link>

        {user ? (
          <>
            <div className="hidden sm:flex items-center gap-3">
              {char && (
                <Link
                  to="/app/characters"
                  className="text-sm text-text-muted hover:text-text transition-colors"
                >
                  <span className="text-text font-medium">{char.name}</span>
                  {' '}Lv.{char.level}
                </Link>
              )}
              {user.premium && <Badge variant="gold">Premium</Badge>}
              {user.isAdmin && (
                <Link
                  to="/app/admin"
                  className="text-xs text-text-muted hover:text-gold transition-colors border border-border hover:border-gold rounded px-2 py-1"
                >
                  Admin
                </Link>
              )}
              <Avatar
                src={user.avatarUrl}
                alt={user.discordName}
                size={32}
              />
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </div>

            <button
              className="sm:hidden flex flex-col gap-1.5 p-2 text-text-muted hover:text-text"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              <span className="block w-5 h-0.5 bg-current" />
              <span className="block w-5 h-0.5 bg-current" />
              <span className="block w-5 h-0.5 bg-current" />
            </button>
          </>
        ) : null}
      </div>

      {menuOpen && user && (
        <div className="sm:hidden border-t border-border bg-bg1 px-4 py-3 flex flex-col gap-3">
          {char && (
            <p className="text-sm text-text-muted">
              Char: <span className="text-text font-medium">{char.name}</span> Lv.{char.level}
            </p>
          )}
          <Link
            to="/app/characters"
            className="text-sm text-text-muted hover:text-text"
            onClick={() => setMenuOpen(false)}
          >
            Personagens
          </Link>
          {user.isAdmin && (
            <Link
              to="/app/admin"
              className="text-sm text-text-muted hover:text-text"
              onClick={() => setMenuOpen(false)}
            >
              Admin
            </Link>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full">
            Sair
          </Button>
        </div>
      )}
    </header>
  )
}
