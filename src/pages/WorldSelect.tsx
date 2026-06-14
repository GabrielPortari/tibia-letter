import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'
import type { World } from '../types'

const REGION_LABEL: Record<string, string> = { eu: 'Europa', na: 'América do Norte', sa: 'América do Sul', oc: 'Oceania' }
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

  const { data: worlds, isLoading } = useQuery<World[]>({
    queryKey: ['worlds'],
    queryFn: async () => {
      const { data, error } = await supabase.from('worlds').select('*').order('name')
      if (error) throw error
      return data as World[]
    },
  })

  return (
    <PageWrapper>
      <div className="mb-6">
        <h1 className="font-display text-2xl sm:text-3xl text-gold font-semibold mb-1">
          Selecione o Mundo
        </h1>
        {activeChar && (
          <p className="text-text-muted text-sm">
            Jogando como <span className="text-text font-medium">{activeChar.name}</span> · Nível {activeChar.level}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {worlds?.map((world) => (
            <button
              key={world.id}
              onClick={() => navigate(`/worlds/${world.id}`)}
              className="bg-bg2 border border-border hover:border-border-hover rounded-xl p-4 text-left transition-all duration-150 hover:bg-bg3 active:scale-[0.98] min-h-[80px]"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-text">{world.name}</span>
                <Badge variant={PVP_VARIANT[world.pvp_type] ?? 'muted'} className="text-xs">
                  {world.pvp_type}
                </Badge>
              </div>
              <p className="text-text-dim text-xs">{REGION_LABEL[world.region] ?? world.region}</p>
            </button>
          ))}
        </div>
      )}
    </PageWrapper>
  )
}
