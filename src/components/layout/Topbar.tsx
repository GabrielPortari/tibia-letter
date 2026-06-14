import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../stores/authStore'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

export function Topbar() {
  const { player, activeChar } = useAuthStore()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-bg1/95 backdrop-blur border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="font-display text-gold text-lg font-semibold tracking-wide">
          Tibia Letter
        </Link>

        {player ? (
          <>
            <div className="hidden sm:flex items-center gap-3">
              {activeChar && (
                <span className="text-sm text-text-muted">
                  <span className="text-text font-medium">{activeChar.name}</span>
                  {' '}Lv.{activeChar.level}
                </span>
              )}
              {player.is_premium && <Badge variant="gold">Premium</Badge>}
              <Avatar
                src={
                  player.discord_avatar
                    ? `https://cdn.discordapp.com/avatars/${player.discord_id}/${player.discord_avatar}.png?size=64`
                    : null
                }
                alt={player.discord_username}
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

      {menuOpen && player && (
        <div className="sm:hidden border-t border-border bg-bg1 px-4 py-3 flex flex-col gap-3">
          {activeChar && (
            <p className="text-sm text-text-muted">
              Char: <span className="text-text font-medium">{activeChar.name}</span> Lv.{activeChar.level}
            </p>
          )}
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full">
            Sair
          </Button>
        </div>
      )}
    </header>
  )
}
