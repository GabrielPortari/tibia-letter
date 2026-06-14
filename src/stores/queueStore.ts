import { create } from 'zustand'
import type { QueueEntry } from '../types'

interface QueueState {
  entries: Record<string, QueueEntry[]>
  setEntries: (spawnId: string, entries: QueueEntry[]) => void
  upsertEntry: (entry: QueueEntry) => void
  removeEntry: (id: string) => void
  removePlayerFromAllQueues: (playerId: string, exceptSpawnId?: string) => void
  getSpawnQueue: (spawnId: string) => QueueEntry[]
  getMyEntries: (playerId: string) => QueueEntry[]
}

export const useQueueStore = create<QueueState>((set, get) => ({
  entries: {},

  setEntries: (spawnId, entries) =>
    set((s) => ({ entries: { ...s.entries, [spawnId]: entries } })),

  upsertEntry: (entry) =>
    set((s) => {
      const current = s.entries[entry.spawn_id] ?? []
      const exists = current.findIndex((e) => e.id === entry.id)
      const updated =
        exists >= 0
          ? current.map((e) => (e.id === entry.id ? entry : e))
          : [...current, entry]
      return { entries: { ...s.entries, [entry.spawn_id]: updated } }
    }),

  removeEntry: (id) =>
    set((s) => {
      const newEntries: Record<string, QueueEntry[]> = {}
      for (const [spawnId, list] of Object.entries(s.entries)) {
        newEntries[spawnId] = list.filter((e) => e.id !== id)
      }
      return { entries: newEntries }
    }),

  // Remove o player de todas as filas, exceto o spawn que ele acabou de aceitar.
  // Usado para limpeza otimista após aceitar um respawn.
  removePlayerFromAllQueues: (playerId, exceptSpawnId) =>
    set((s) => {
      const newEntries: Record<string, QueueEntry[]> = {}
      for (const [spawnId, list] of Object.entries(s.entries)) {
        if (spawnId === exceptSpawnId) {
          newEntries[spawnId] = list
        } else {
          newEntries[spawnId] = list.filter((e) => e.player_id !== playerId)
        }
      }
      return { entries: newEntries }
    }),

  getSpawnQueue: (spawnId) => {
    const list = get().entries[spawnId] ?? []
    return [...list].sort((a, b) => a.position - b.position)
  },

  getMyEntries: (playerId) => {
    const all = Object.values(get().entries).flat()
    return all.filter((e) => e.player_id === playerId)
  },
}))
