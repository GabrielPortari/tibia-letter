import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { api } from '../lib/api'
import { useAuthStore } from '../stores/authStore'
import { useQueueStore } from '../stores/queueStore'
import { useToasts } from '../hooks/useToasts'
import { useLangNavigate } from '../hooks/useLangNavigate'
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

export default function SpawnApp() {
  const { worldId } = useParams<{ worldId: string }>()
  const { user, activeChar } = useAuthStore()
  const { setWorldEntries, getMyEntries } = useQueueStore()
  const { addToast } = useToasts()
  const { t } = useTranslation()
  const langNavigate = useLangNavigate()
  const qc = useQueryClient()
  const char = activeChar()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSpawnName, setNewSpawnName] = useState('')
  const [search, setSearch] = useState('')

  const { data: spawns, isLoading, isError: spawnsError, error: spawnsErrorObj } = useQuery<Spawn[]>({
    queryKey: ['spawns', worldId],
    queryFn: () => api.get<Spawn[]>(`/spawns?worldId=${worldId}`),
    staleTime: 30_000,
    retry: false,
    enabled: !!worldId,
  })

  useEffect(() => {
    if (spawnsError) {
      addToast('error', (spawnsErrorObj as Error)?.message ?? t('spawnApp.invalid_world_toast'))
      langNavigate('/app/queue')
    }
  }, [spawnsError]) // eslint-disable-line react-hooks/exhaustive-deps

  useQuery<Record<string, QueueEntry[]>>({
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
    retry: false,
    enabled: !!worldId && !spawnsError,
  })

  const myEntries = char ? getMyEntries(char.name) : []
  const isActivelyHunting = myEntries.some((e) => getEntryStatus(e) === 'active')
  const wrongWorld = !!char && char.world.toLowerCase() !== worldId?.toLowerCase()

  const trimmedSearch = search.trim().toLowerCase()
  const filteredSpawns = trimmedSearch
    ? (spawns ?? []).filter((s) => s.name.toLowerCase().includes(trimmedSearch))
    : (spawns ?? [])

  const nameAlreadyExists = !!spawns?.some(
    (s) => s.name.toLowerCase() === newSpawnName.trim().toLowerCase(),
  )

  function validateJoin(spawnId: string): string | null {
    if (!user) return t('spawnApp.not_auth')
    if (!char) return t('spawnApp.no_active_char')
    if (useAuthStore.getState().isBanned()) return t('spawnApp.banned')
    if (wrongWorld) return t('spawnApp.wrong_world_err', { world: char.world })

    const spawn = spawns?.find((s) => s.id === spawnId)
    if (!spawn) return t('spawnApp.spawn_not_found')

    const isHunting = myEntries.some((e) => getEntryStatus(e) === 'active')
    if (isHunting) return t('spawnApp.already_hunting')

    const alreadyInThisSpawn = myEntries.some((e) => e.spawnId === spawnId)
    if (alreadyInThisSpawn) return t('spawnApp.already_in_queue')

    if (myEntries.length >= 2) {
      return t('spawnApp.queue_limit')
    }

    return null
  }

  const createSpawnMutation = useMutation({
    mutationFn: () =>
      api.post<CreateSpawnResponse>('/spawns', { name: newSpawnName.trim(), worldId }),
    onSuccess: (data) => {
      const current = useQueueStore.getState().entries
      useQueueStore.getState().setWorldEntries({
        ...current,
        [data.spawn.id]: [data.entry],
      })
      qc.invalidateQueries({ queryKey: ['spawns', worldId] })
      qc.invalidateQueries({ queryKey: ['queue', worldId] })
      qc.invalidateQueries({ queryKey: ['my-queues'] })
      setShowCreateModal(false)
      setNewSpawnName('')
      addToast('success', t('spawnApp.hunt_started_toast'))
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
      qc.invalidateQueries({ queryKey: ['my-queues'] })
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  const acceptMutation = useMutation({
    mutationFn: (spawnId: string) =>
      api.post<QueueEntry>(`/queue/${worldId}/${spawnId}/accept`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['queue', worldId] })
      qc.invalidateQueries({ queryKey: ['spawns', worldId] })
      qc.invalidateQueries({ queryKey: ['my-queues'] })
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  const finishMutation = useMutation({
    mutationFn: (spawnId: string) =>
      api.post<{ message: string }>(`/queue/${worldId}/${spawnId}/finish`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['queue', worldId] })
      qc.invalidateQueries({ queryKey: ['spawns', worldId] })
      qc.invalidateQueries({ queryKey: ['my-queues'] })
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  const leaveMutation = useMutation({
    mutationFn: (spawnId: string) =>
      api.delete<{ message: string }>(`/queue/${worldId}/${spawnId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['queue', worldId] })
      qc.invalidateQueries({ queryKey: ['spawns', worldId] })
      qc.invalidateQueries({ queryKey: ['my-queues'] })
    },
    onError: (e: Error) => addToast('error', e.message),
  })

  return (
    <BannedGuard>
      <PageWrapper>
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <button
            onClick={() => langNavigate('/app/queue')}
            className="text-text-muted hover:text-text transition-colors text-sm"
          >
            {t('spawnApp.back')}
          </button>
          <h1 className="font-display text-xl sm:text-2xl text-gold font-semibold flex-1">
            {worldId}
          </h1>
          {char && !wrongWorld && (
            <div className="flex flex-col items-end gap-1">
              <Button
                size="sm"
                onClick={() => setShowCreateModal(true)}
                disabled={isActivelyHunting}
                title={isActivelyHunting ? t('spawnApp.finish_hunt_first') : undefined}
              >
                {t('spawnApp.start_hunt')}
              </Button>
              <span className={`text-xs tabular-nums ${
                myEntries.length >= 2 ? 'text-amber' : 'text-text-dim'
              }`}>
                {t('spawnApp.queue_counter', { count: myEntries.length })}
              </span>
            </div>
          )}
        </div>

        {wrongWorld && (
          <div
            className="mb-4 rounded-lg px-4 py-3 text-sm"
            style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber)', color: 'var(--amber)' }}
          >
            {t('spawnApp.wrong_world', { world: char!.world })}
          </div>
        )}

        <div className="mb-5">
          <Input
            placeholder={t('spawnApp.search_placeholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
            {filteredSpawns.map((spawn) => (
              <SpawnCard
                key={spawn.id}
                spawn={spawn}
                onJoin={(id) => joinMutation.mutateAsync(id)}
                onAccept={(id) => acceptMutation.mutateAsync(id)}
                onFinish={(id) => finishMutation.mutateAsync(id)}
                onLeave={(id) => leaveMutation.mutateAsync(id)}
              />
            ))}
            {!isLoading && spawns?.length === 0 && (
              <p className="col-span-full text-center py-16 text-text-muted">
                {t('spawnApp.no_spawns')}
              </p>
            )}
            {!isLoading && spawns && spawns.length > 0 && filteredSpawns.length === 0 && (
              <p className="col-span-full text-center py-16 text-text-muted">
                {t('spawnApp.no_results', { query: search.trim() })}
              </p>
            )}
          </div>
        )}

        <Modal
          isOpen={showCreateModal}
          onClose={() => { setShowCreateModal(false); setNewSpawnName('') }}
          title={t('spawnApp.modal_title')}
        >
          <div className="space-y-4">
            <Input
              label={t('spawnApp.spawn_name_label')}
              placeholder={t('spawnApp.spawn_name_placeholder')}
              value={newSpawnName}
              onChange={(e) => setNewSpawnName(e.target.value)}
            />
            {nameAlreadyExists && newSpawnName.trim() && (
              <p className="text-xs text-amber">{t('spawnApp.name_exists')}</p>
            )}
            {!nameAlreadyExists && (
              <p className="text-xs text-text-muted">{t('spawnApp.auto_active')}</p>
            )}
            <Button
              className="w-full"
              isLoading={createSpawnMutation.isPending}
              disabled={!newSpawnName.trim() || nameAlreadyExists}
              onClick={() => createSpawnMutation.mutate()}
            >
              {t('spawnApp.start_btn')}
            </Button>
          </div>
        </Modal>
      </PageWrapper>
    </BannedGuard>
  )
}
