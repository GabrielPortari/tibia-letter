import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../stores/authStore'
import { useQueueStore } from '../stores/queueStore'
import { api } from '../lib/api'
import type { MyQueueEntry } from '../types'

export function useMyQueues() {
  const { user } = useAuthStore()
  const { setMyEntries } = useQueueStore()
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ['my-queues'],
    queryFn: () => api.get<MyQueueEntry[]>('/queue/me'),
    enabled: !!user,
    refetchInterval: 15_000,
    staleTime: 10_000,
  })

  // Sync to Zustand only when data reference changes (TanStack Query's structural
  // sharing ensures the reference is stable when the payload is identical, so
  // setMyEntries is not called on every background refetch that returns equal data).
  useEffect(() => {
    setMyEntries(query.data ?? [])
  }, [query.data, setMyEntries])

  async function acceptEntry(worldId: string, spawnId: string) {
    await api.post(`/queue/${worldId}/${spawnId}/accept`)
    await queryClient.invalidateQueries({ queryKey: ['my-queues'] })
    // Also invalidate the per-world query so SpawnApp reflects the change immediately
    queryClient.invalidateQueries({ queryKey: ['queue', worldId] })
  }

  async function leaveEntry(worldId: string, spawnId: string) {
    await api.delete(`/queue/${worldId}/${spawnId}`)
    await queryClient.invalidateQueries({ queryKey: ['my-queues'] })
    queryClient.invalidateQueries({ queryKey: ['queue', worldId] })
  }

  return { ...query, acceptEntry, leaveEntry }
}
