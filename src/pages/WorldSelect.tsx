import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'

interface TibiaWorld {
  id: string
  region: 'eu' | 'na' | 'sa' | 'oc'
  pvpType: 'open' | 'optional' | 'hardcore' | 'retro-open' | 'retro-hardcore'
}

const WORLDS: TibiaWorld[] = [
  { id: 'Antica', region: 'eu', pvpType: 'open' },
  { id: 'Premia', region: 'eu', pvpType: 'open' },
  { id: 'Refugia', region: 'eu', pvpType: 'optional' },
  { id: 'Secura', region: 'eu', pvpType: 'optional' },
  { id: 'Luminera', region: 'eu', pvpType: 'optional' },
  { id: 'Harmonia', region: 'eu', pvpType: 'optional' },
  { id: 'Celebra', region: 'eu', pvpType: 'open' },
  { id: 'Quelibra', region: 'eu', pvpType: 'open' },
  { id: 'Pacera', region: 'eu', pvpType: 'optional' },
  { id: 'Gladera', region: 'eu', pvpType: 'optional' },
  { id: 'Damora', region: 'eu', pvpType: 'open' },
  { id: 'Firmera', region: 'eu', pvpType: 'optional' },
  { id: 'Belobra', region: 'sa', pvpType: 'open' },
  { id: 'Batabra', region: 'sa', pvpType: 'open' },
  { id: 'Vunira', region: 'sa', pvpType: 'optional' },
  { id: 'Talera', region: 'sa', pvpType: 'open' },
  { id: 'Quintera', region: 'sa', pvpType: 'optional' },
  { id: 'Zanera', region: 'sa', pvpType: 'open' },
  { id: 'Solidera', region: 'sa', pvpType: 'optional' },
  { id: 'Ferobra', region: 'sa', pvpType: 'open' },
  { id: 'Nefera', region: 'sa', pvpType: 'open' },
  { id: 'Descubra', region: 'sa', pvpType: 'open' },
  { id: 'Relembra', region: 'sa', pvpType: 'open' },
  { id: 'Yonabra', region: 'sa', pvpType: 'open' },
  { id: 'Peloria', region: 'na', pvpType: 'open' },
  { id: 'Astera', region: 'na', pvpType: 'optional' },
  { id: 'Wintera', region: 'na', pvpType: 'optional' },
  { id: 'Torpera', region: 'na', pvpType: 'open' },
  { id: 'Funera', region: 'na', pvpType: 'retro-open' },
  { id: 'Garnera', region: 'na', pvpType: 'retro-open' },
  { id: 'Xandebra', region: 'oc', pvpType: 'open' },
  { id: 'Zuna', region: 'oc', pvpType: 'retro-open' },
]

const REGION_LABEL: Record<string, string> = {
  eu: 'Europa',
  na: 'América do Norte',
  sa: 'América do Sul',
  oc: 'Oceania',
}

const PVP_VARIANT: Record<string, 'red' | 'amber' | 'muted' | 'blue'> = {
  open: 'red',
  'retro-open': 'red',
  optional: 'amber',
  hardcore: 'red',
  'retro-hardcore': 'red',
}

export default function WorldSelect() {
  const { activeChar } = useAuthStore()
  const navigate = useNavigate()
  const char = activeChar()

  const charWorld = char?.world
  const charWorldEntry = charWorld ? WORLDS.find((w) => w.id === charWorld) : null

  const grouped = WORLDS.reduce<Record<string, TibiaWorld[]>>((acc, w) => {
    ;(acc[w.region] ??= []).push(w)
    return acc
  }, {})

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl text-gold font-semibold mb-1">
          Selecione o Mundo
        </h1>
        {char && (
          <p className="text-text-muted text-sm">
            Jogando como <span className="text-text font-medium">{char.name}</span> · Lv. {char.level}
          </p>
        )}
      </div>

      {charWorldEntry && (
        <div className="mb-6">
          <p className="text-xs text-[var(--gold-dim)] tracking-widest font-semibold mb-2">
            SEU MUNDO
          </p>
          <button
            onClick={() => navigate(`/app/queue/${charWorldEntry.id}`)}
            className="flex items-center gap-3 bg-bg2 border-2 border-gold rounded-xl p-4 hover:bg-bg3 transition-all duration-150 w-full sm:w-auto min-w-[180px]"
            style={{ boxShadow: '0 0 16px var(--gold-glow)' }}
          >
            <span className="font-semibold text-gold">{charWorldEntry.id}</span>
            <Badge variant={PVP_VARIANT[charWorldEntry.pvpType] ?? 'muted'}>
              {charWorldEntry.pvpType}
            </Badge>
          </button>
        </div>
      )}

      {Object.entries(grouped).map(([region, worlds]) => (
        <div key={region} className="mb-6">
          <p className="text-xs text-text-dim tracking-widest font-semibold mb-2">
            {REGION_LABEL[region] ?? region.toUpperCase()}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {worlds.map((world) => (
              <button
                key={world.id}
                onClick={() => navigate(`/app/queue/${world.id}`)}
                className="bg-bg2 border border-border hover:border-border-hover rounded-xl p-3 text-left transition-all duration-150 hover:bg-bg3 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-text text-sm">{world.id}</span>
                  <Badge variant={PVP_VARIANT[world.pvpType] ?? 'muted'} className="text-xs">
                    {world.pvpType}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}

      {!char && (
        <div className="mt-4 text-center">
          <p className="text-text-muted text-sm mb-2">
            Vincule um personagem para entrar nas filas.
          </p>
          <Button variant="secondary" onClick={() => navigate('/app/characters')}>
            Gerenciar Personagens
          </Button>
        </div>
      )}
    </PageWrapper>
  )
}
