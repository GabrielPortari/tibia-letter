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
    queryFn: async () => {
      const entries = await api.get<MyQueueEntry[]>('/queue/me')
      setMyEntries(entries)
      return entries
    },
    enabled: !!user,
    refetchInterval: 15_000,
    staleTime: 10_000,
  })

  async function acceptEntry(worldId: string, spawnId: string) {
    await api.post(`/queue/${worldId}/${spawnId}/accept`)
    queryClient.invalidateQueries({ queryKey: ['my-queues'] })
  }

  async function leaveEntry(worldId: string, spawnId: string) {
    await api.delete(`/queue/${worldId}/${spawnId}`)
    queryClient.invalidateQueries({ queryKey: ['my-queues'] })
  }

  return { ...query, acceptEntry, leaveEntry }
}
