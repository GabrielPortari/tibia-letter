import { useState } from 'react'
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
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import type { Spawn, QueueEntry, CreateSpawnResponse } from '../types'
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

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSpawnName, setNewSpawnName] = useState('')

  const { data: spawns, isLoading } = useQuery<Spawn[]>({
    queryKey: ['spawns', worldId],
    queryFn: () => api.get<Spawn[]>(`/spawns?worldId=${worldId}`),
    staleTime: 30_000,
    enabled: !!worldId,
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

  const myEntries = char ? getMyEntries(char.name) : []
  const isActivelyHunting = myEntries.some((e) => getEntryStatus(e) === 'active')

  function validateJoin(spawnId: string): string | null {
    if (!user) return 'Não autenticado'
    if (!char) return 'Sem personagem ativo'
    if (useAuthStore.getState().isBanned()) return 'Conta banida'

    const spawn = spawns?.find((s) => s.id === spawnId)
    if (!spawn) return 'Spawn não encontrado'

    const isHunting = myEntries.some((e) => getEntryStatus(e) === 'active')
    if (isHunting) return 'Você já está caçando. Finalize a hunt antes de entrar em outra fila.'

    const alreadyInThisSpawn = myEntries.some((e) => e.spawnId === spawnId)
    if (alreadyInThisSpawn) return 'Você já está na fila deste spawn.'

    const limit = user.premium ? QUEUE_LIMIT.premium : QUEUE_LIMIT.free
    const waitingQueues = myEntries.filter((e) => getEntryStatus(e) !== 'active').length
    if (waitingQueues >= limit) {
      return user.premium
        ? 'Limite de 3 filas simultâneas atingido.'
        : 'Plano Free permite apenas 1 fila por vez. Assine Premium para até 3 filas e personagens ilimitados.'
    }

    return null
  }

  const createSpawnMutation = useMutation({
    mutationFn: () =>
      api.post<CreateSpawnResponse>('/spawns', { name: newSpawnName.trim(), worldId }),
    onSuccess: (data) => {
      // Update store immediately so SpawnCard shows player as hunting without waiting for refetch
      const current = useQueueStore.getState().entries
      useQueueStore.getState().setWorldEntries({
        ...current,
        [data.spawn.id]: [data.entry],
      })
      qc.invalidateQueries({ queryKey: ['spawns', worldId] })
      qc.invalidateQueries({ queryKey: ['queue', worldId] })
      setShowCreateModal(false)
      setNewSpawnName('')
      addToast('success', 'Hunt iniciada!')
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  const joinMutation = useMutation({
    mutationFn: async (spawnId: string) => {
      const err = validateJoin(spawnId)
      if (err) throw new Error(err)
      return api.post<QueueEntry>(`/queue/${worldId}/${spawnId}/join`, { characterId: char!.id })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['queue', worldId] })
      qc.invalidateQueries({ queryKey: ['spawns', worldId] })
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  const acceptMutation = useMutation({
    mutationFn: (spawnId: string) =>
      api.post<QueueEntry>(`/queue/${worldId}/${spawnId}/accept`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['queue', worldId] })
      qc.invalidateQueries({ queryKey: ['spawns', worldId] })
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  const finishMutation = useMutation({
    mutationFn: (spawnId: string) =>
      api.post<{ message: string }>(`/queue/${worldId}/${spawnId}/finish`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['queue', worldId] })
      qc.invalidateQueries({ queryKey: ['spawns', worldId] })
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  const leaveMutation = useMutation({
    mutationFn: (spawnId: string) =>
      api.delete<{ message: string }>(`/queue/${worldId}/${spawnId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['queue', worldId] })
      qc.invalidateQueries({ queryKey: ['spawns', worldId] })
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  return (
    <BannedGuard>
      <PageWrapper>
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <button
            onClick={() => navigate('/app/queue')}
            className="text-text-muted hover:text-text transition-colors text-sm"
          >
            ← Mundos
          </button>
          <h1 className="font-display text-xl sm:text-2xl text-gold font-semibold flex-1">
            {worldId}
          </h1>
          {char && (
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              disabled={isActivelyHunting}
              title={isActivelyHunting ? 'Finalize sua hunt atual primeiro' : undefined}
            >
              + Iniciar Hunt
            </Button>
          )}
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
            {spawns?.map((spawn) => (
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
            {!isLoading && spawns?.length === 0 && (
              <p className="col-span-full text-center py-16 text-text-muted">
                Nenhum spawn ativo neste mundo. Seja o primeiro a iniciar uma hunt!
              </p>
            )}
          </div>
        )}

        <Modal
          isOpen={showCreateModal}
          onClose={() => { setShowCreateModal(false); setNewSpawnName('') }}
          title="Iniciar Hunt"
        >
          <div className="space-y-4">
            <Input
              label="Nome do Spawn"
              placeholder="ex: Asura Palace"
              value={newSpawnName}
              onChange={(e) => setNewSpawnName(e.target.value)}
            />
            <p className="text-xs text-text-muted">
              Você entrará automaticamente como ativo neste spawn.
            </p>
            <Button
              className="w-full"
              isLoading={createSpawnMutation.isPending}
              disabled={!newSpawnName.trim()}
              onClick={() => createSpawnMutation.mutate()}
            >
              Iniciar Hunt
            </Button>
          </div>
        </Modal>
      </PageWrapper>
    </BannedGuard>
  )
}
