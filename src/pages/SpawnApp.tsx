import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { useQueueStore } from '../stores/queueStore'
import { useToasts } from '../hooks/useToasts'
import { PageWrapper } from '../components/layout/PageWrapper'
import { SpawnCard } from '../components/spawn/SpawnCard'
import { MyQueuesBanner } from '../components/spawn/MyQueuesBanner'
import { BannedGuard } from '../components/layout/RouteGuards'
import { Spinner } from '../components/ui/Spinner'
import type { Spawn, QueueEntry } from '../types'
import { getEntryStatus } from '../types'

const QUEUE_LIMIT = { free: 1, premium: 3 }

export default function SpawnApp() {
  const { worldId } = useParams<{ worldId: string }>()
  const { user, activeChar } = useAuthStore()
  const { setWorldEntries, getMyEntries } = useQueueStore()
  const { addToast } = useToasts()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const char = activeChar()

  const { data: spawns, isLoading } = useQuery<Spawn[]>({
    queryKey: ['spawns'],
    queryFn: () => api.get<Spawn[]>('/spawns'),
    staleTime: 60_000,
  })

  const { data: queueMap } = useQuery<Record<string, QueueEntry[]>>({
    queryKey: ['queue', worldId],
    queryFn: async () => {
      const list = await api.get<QueueEntry[]>(`/queue/${worldId}`)
      const map: Record<string, QueueEntry[]> = {}
      for (const entry of list) {
        if (!map[entry.spawnId]) map[entry.spawnId] = []
        map[entry.spawnId].push(entry)
      }
      setWorldEntries(map)
      return map
    },
    refetchInterval: 10_000,
    enabled: !!worldId,
  })

  function validateJoin(spawnId: string): string | null {
    if (!user) return 'Não autenticado'
    if (!char) return 'Sem personagem ativo'
    if (useAuthStore.getState().isBanned()) return 'Conta banida'

    const spawn = spawns?.find((s) => s.id === spawnId)
    if (!spawn) return 'Spawn não encontrado'
const myEntries = getMyEntries(char.name)
    const isHunting = myEntries.some((e) => getEntryStatus(e) === 'active')
    if (isHunting) return 'Você já está caçando. Finalize a hunt antes de entrar em outra fila.'

    const alreadyInThisSpawn = myEntries.some((e) => e.spawnId === spawnId)
    if (alreadyInThisSpawn) return 'Você já está na fila deste spawn.'

    const limit = user.premium ? QUEUE_LIMIT.premium : QUEUE_LIMIT.free
    const waitingQueues = myEntries.filter((e) => getEntryStatus(e) !== 'active').length
    if (waitingQueues >= limit) {
      return user.premium
        ? 'Limite de 3 filas simultâneas atingido (Premium).'
        : 'Plano Free permite apenas 1 fila por vez. Assine Premium para até 3.'
    }

    return null
  }

  const joinMutation = useMutation({
    mutationFn: async (spawnId: string) => {
      const err = validateJoin(spawnId)
      if (err) throw new Error(err)
      return api.post<QueueEntry>(`/queue/${worldId}/${spawnId}/join`, { characterId: char!.id })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['queue', worldId] }),
    onError: (e: Error) => addToast('error', e.message),
  })

  const acceptMutation = useMutation({
    mutationFn: (spawnId: string) =>
      api.post<QueueEntry>(`/queue/${worldId}/${spawnId}/accept`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['queue', worldId] }),
    onError: (e: Error) => addToast('error', e.message),
  })

  const finishMutation = useMutation({
    mutationFn: (spawnId: string) =>
      api.post<{ message: string }>(`/queue/${worldId}/${spawnId}/finish`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['queue', worldId] }),
    onError: (e: Error) => addToast('error', e.message),
  })

  const leaveMutation = useMutation({
    mutationFn: (spawnId: string) =>
      api.delete<{ message: string }>(`/queue/${worldId}/${spawnId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['queue', worldId] }),
    onError: (e: Error) => addToast('error', e.message),
  })

  return (
    <BannedGuard>
      <PageWrapper>
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/app/queue')}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
            {spawns?.filter((s) => s.active).map((spawn) => (
              <SpawnCard
                key={spawn.id}
                spawn={spawn}
                worldId={worldId!}
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
