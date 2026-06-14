import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useQueueRealtime } from '../hooks/useQueueRealtime'
import { useQueueStore } from '../stores/queueStore'
import { useAuthStore } from '../stores/authStore'
import { useToasts } from '../hooks/useToasts'
import { validateLevelRange } from '../utils/level'
import { PageWrapper } from '../components/layout/PageWrapper'
import { SpawnCard } from '../components/spawn/SpawnCard'
import { MyQueuesBanner } from '../components/spawn/MyQueuesBanner'
import { BannedGuard } from '../components/layout/RouteGuards'
import { Spinner } from '../components/ui/Spinner'
import type { Spawn, QueueEntry } from '../types'

const QUEUE_LIMIT = { free: 1, premium: 3 }

export default function SpawnApp() {
  const { worldId } = useParams<{ worldId: string }>()
  const { player, activeChar } = useAuthStore()
  const { setEntries, removePlayerFromAllQueues } = useQueueStore()
  const { addToast } = useToasts()
  const navigate = useNavigate()

useQueueRealtime(worldId!)

  const { data: spawns, isLoading } = useQuery<Spawn[]>({
    queryKey: ['spawns', worldId],
    queryFn: async () => {
      const { data, error } = await supabase.from('spawns').select('*').order('name')
      if (error) throw error
      const spawnList = data as Spawn[]
      for (const spawn of spawnList) {
        const { data: qData } = await supabase
          .from('queue_entries')
          .select('*')
          .eq('world_id', worldId)
          .eq('spawn_id', spawn.id)
          .order('position')
        if (qData) setEntries(spawn.id, qData as QueueEntry[])
      }
      return spawnList
    },
  })

  function validateJoin(spawnId: string): string | null {
    if (!player) return 'Não autenticado'
    if (!activeChar) return 'Sem personagem ativo'
    if (useAuthStore.getState().isBanned()) return 'Conta banida'

    const spawn = spawns?.find((s) => s.id === spawnId)
    if (!spawn) return 'Spawn não encontrado'
    if (!validateLevelRange(activeChar.level, spawn.min_level, spawn.max_level)) {
      return `Nível ${activeChar.level} fora do range (Lv. ${spawn.min_level}–${spawn.max_level})`
    }

    const myEntries = useQueueStore.getState().getMyEntries(player.id)

    // Bloqueia se está caçando ativamente em qualquer spawn
    const isHunting = myEntries.some((e) => e.status === 'active')
    if (isHunting) return 'Você já está caçando. Finalize a hunt antes de entrar em outra fila.'

    // Bloqueia se já está neste spawn
    const alreadyInThisSpawn = myEntries.some((e) => e.spawn_id === spawnId)
    if (alreadyInThisSpawn) return 'Você já está na fila deste spawn.'

    // Bloqueia por limite de filas simultâneas
    const limit = player.is_premium ? QUEUE_LIMIT.premium : QUEUE_LIMIT.free
    const activeQueues = myEntries.filter((e) => e.status !== 'active').length
    if (activeQueues >= limit) {
      return player.is_premium
        ? 'Limite de 3 filas simultâneas atingido (Premium).'
        : 'Plano Free permite apenas 1 fila por vez. Assine Premium para até 3.'
    }

    return null
  }

  const joinMutation = useMutation({
    mutationFn: async (spawnId: string) => {
      const err = validateJoin(spawnId)
      if (err) throw new Error(err)
      const { error } = await supabase.from('queue_entries').insert({
        world_id: worldId,
        spawn_id: spawnId,
        player_id: player!.id,
        character_id: activeChar!.id,
        character_name: activeChar!.name,
        character_level: activeChar!.level,
      })
      if (error) throw error
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  const acceptMutation = useMutation({
    mutationFn: async (spawnId: string) => {
      const { error } = await supabase.functions.invoke('accept-spawn', {
        body: { spawnId, worldId, playerId: player!.id },
      })
      if (error) throw error
    },
    onSuccess: (_data, spawnId) => {
      // Otimista: remove o player de todas as outras filas (exceto a que aceitou)
      removePlayerFromAllQueues(player!.id, spawnId)
    },
    onError: () => addToast('error', 'Falha ao aceitar respawn.'),
  })

  const finishMutation = useMutation({
    mutationFn: async (spawnId: string) => {
      const { error } = await supabase.functions.invoke('finish-hunt', {
        body: { spawnId, worldId, playerId: player!.id },
      })
      if (error) throw error
    },
    onError: () => addToast('error', 'Falha ao finalizar caça.'),
  })

  const leaveMutation = useMutation({
    mutationFn: async (spawnId: string) => {
      const { error } = await supabase
        .from('queue_entries')
        .delete()
        .eq('spawn_id', spawnId)
        .eq('world_id', worldId)
        .eq('player_id', player!.id)
      if (error) throw error
    },
    onError: () => addToast('error', 'Falha ao sair da fila.'),
  })

  return (
    <BannedGuard>
      <PageWrapper>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/worlds')}
            className="text-text-muted hover:text-text transition-colors text-sm"
          >
            ← Mundos
          </button>
          <h1 className="font-display text-xl sm:text-2xl text-gold font-semibold">
            {worldId}
          </h1>
        </div>

        <MyQueuesBanner
          spawns={spawns ?? []}
          onAccept={(spawnId) => acceptMutation.mutateAsync(spawnId)}
          onLeave={(spawnId) => leaveMutation.mutateAsync(spawnId)}
        />

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {spawns?.map((spawn) => (
              <SpawnCard
                key={spawn.id}
                spawn={spawn}
                onJoin={(id) => joinMutation.mutateAsync(id)}
                onAccept={(id) => acceptMutation.mutateAsync(id)}
                onFinish={(id) => finishMutation.mutateAsync(id)}
                onLeave={(id) => leaveMutation.mutateAsync(id)}
              />
            ))}
          </div>
        )}

      </PageWrapper>
    </BannedGuard>
  )
}
