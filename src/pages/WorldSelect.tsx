import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../stores/authStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useLangNavigate } from '../hooks/useLangNavigate'
import type { Character } from '../types'

interface TibiaWorld {
  id: string
  pvpType: 'open' | 'optional' | 'hardcore' | 'retro-open' | 'retro-hardcore'
}

const WORLDS: TibiaWorld[] = [
  { id: 'Antica', pvpType: 'open' },
  { id: 'Premia', pvpType: 'open' },
  { id: 'Refugia', pvpType: 'optional' },
  { id: 'Secura', pvpType: 'optional' },
  { id: 'Luminera', pvpType: 'optional' },
  { id: 'Harmonia', pvpType: 'optional' },
  { id: 'Celebra', pvpType: 'open' },
  { id: 'Quelibra', pvpType: 'open' },
  { id: 'Pacera', pvpType: 'optional' },
  { id: 'Gladera', pvpType: 'optional' },
  { id: 'Damora', pvpType: 'open' },
  { id: 'Firmera', pvpType: 'optional' },
  { id: 'Belobra', pvpType: 'open' },
  { id: 'Batabra', pvpType: 'open' },
  { id: 'Vunira', pvpType: 'optional' },
  { id: 'Talera', pvpType: 'open' },
  { id: 'Quintera', pvpType: 'optional' },
  { id: 'Zanera', pvpType: 'open' },
  { id: 'Solidera', pvpType: 'optional' },
  { id: 'Ferobra', pvpType: 'open' },
  { id: 'Nefera', pvpType: 'open' },
  { id: 'Descubra', pvpType: 'open' },
  { id: 'Relembra', pvpType: 'open' },
  { id: 'Yonabra', pvpType: 'open' },
  { id: 'Peloria', pvpType: 'open' },
  { id: 'Astera', pvpType: 'optional' },
  { id: 'Wintera', pvpType: 'optional' },
  { id: 'Torpera', pvpType: 'open' },
  { id: 'Funera', pvpType: 'retro-open' },
  { id: 'Garnera', pvpType: 'retro-open' },
  { id: 'Xandebra', pvpType: 'open' },
  { id: 'Zuna', pvpType: 'retro-open' },
]

const PVP_VARIANT: Record<string, 'red' | 'amber' | 'muted'> = {
  open: 'red',
  'retro-open': 'red',
  optional: 'amber',
  hardcore: 'red',
  'retro-hardcore': 'red',
}

const PVP_LABEL: Record<string, string> = {
  open: 'Open PvP',
  'retro-open': 'Retro Open',
  optional: 'Optional PvP',
  hardcore: 'Hardcore PvP',
  'retro-hardcore': 'Retro Hardcore',
}

export default function WorldSelect() {
  const { user, activeChar } = useAuthStore()
  const { t } = useTranslation()
  const langNavigate = useLangNavigate()
  const activeCharData = activeChar()

  const verifiedChars = (user?.characters ?? []).filter((c) => c.verified)

  const worldMap = verifiedChars.reduce<Record<string, Character[]>>((acc, c) => {
    if (!c.world) return acc
    ;(acc[c.world] ??= []).push(c)
    return acc
  }, {})

  const myWorlds = Object.entries(worldMap)
    .map(([worldId, chars]) => ({
      worldId,
      chars,
      meta: WORLDS.find((w) => w.id === worldId),
    }))
    .sort((a, b) => {
      if (a.worldId === activeCharData?.world) return -1
      if (b.worldId === activeCharData?.world) return 1
      return a.worldId.localeCompare(b.worldId)
    })

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl text-gold font-semibold mb-1">
          {t('worldSelect.title')}
        </h1>
        <p className="text-text-muted text-sm">{t('worldSelect.subtitle')}</p>
      </div>

      {myWorlds.length === 0 ? (
        <div className="text-center py-16 text-text-muted">
          <p className="text-4xl mb-3">🌍</p>
          <p className="font-semibold mb-1">{t('worldSelect.empty_title')}</p>
          <p className="text-sm mb-4">{t('worldSelect.empty_desc')}</p>
          <Button variant="secondary" onClick={() => langNavigate('/app/characters')}>
            {t('worldSelect.manage_chars')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {myWorlds.map(({ worldId, chars, meta }) => {
            const isActive = worldId === activeCharData?.world
            return (
              <button
                key={worldId}
                onClick={() => langNavigate(`/app/queue/${worldId}`)}
                className={`text-left rounded-xl p-4 transition-all duration-150 hover:bg-bg3 active:scale-[0.98] ${
                  isActive
                    ? 'bg-bg2 border-2 border-gold'
                    : 'bg-bg2 border border-border hover:border-border-hover'
                }`}
                style={isActive ? { boxShadow: '0 0 16px var(--gold-glow)' } : undefined}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold text-base ${isActive ? 'text-gold' : 'text-text'}`}>
                    {worldId}
                  </span>
                  {meta && (
                    <Badge variant={PVP_VARIANT[meta.pvpType] ?? 'muted'}>
                      {PVP_LABEL[meta.pvpType] ?? meta.pvpType}
                    </Badge>
                  )}
                </div>
                <div className="space-y-1">
                  {chars.map((c) => (
                    <div key={c.id} className="flex items-center gap-2">
                      {c.active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                      )}
                      <span className={`text-xs ${c.active ? 'text-gold font-medium' : 'text-text-muted'}`}>
                        {c.name} · Lv. {c.level}
                      </span>
                    </div>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => langNavigate('/app/characters')}
          className="text-xs text-text-dim hover:text-text-muted underline transition-colors"
        >
          {t('worldSelect.link_other_world')}
        </button>
      </div>
    </PageWrapper>
  )
}
