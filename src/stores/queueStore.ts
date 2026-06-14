import { create } from 'zustand'
import type { QueueEntry } from '../types'

interface QueueEntryWithSpawn extends QueueEntry {
  spawnId: string
}

interface QueueState {
  entries: Record<string, QueueEntry[]>
  setEntries: (spawnId: string, entries: QueueEntry[]) => void
  getSpawnQueue: (spawnId: string) => QueueEntry[]
  getMyEntries: (characterName: string) => QueueEntryWithSpawn[]
  clearWorld: () => void
}

export const useQueueStore = create<QueueState>((set, get) => ({
  entries: {},

  setEntries: (spawnId, entries) =>
    set((s) => ({ entries: { ...s.entries, [spawnId]: entries } })),

  getSpawnQueue: (spawnId) => {
    const list = get().entries[spawnId] ?? []
    return [...list].sort((a, b) => a.position - b.position)
  },

  getMyEntries: (characterName) => {
    const all: QueueEntryWithSpawn[] = []
    for (const [spawnId, list] of Object.entries(get().entries)) {
      for (const e of list) {
        if (e.characterName === characterName) {
          all.push({ ...e, spawnId })
        }
      }
    }
    return all
  },

  clearWorld: () => set({ entries: {} }),
}))
