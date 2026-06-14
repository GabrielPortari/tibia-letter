import { create } from 'zustand'
import type { Player, Character } from '../types'

interface AuthState {
  player: Player | null
  activeChar: Character | null
  isLoading: boolean
  setPlayer: (player: Player | null) => void
  setActiveChar: (char: Character | null) => void
  setLoading: (v: boolean) => void
  isBanned: () => boolean
  banSecondsLeft: () => number
}

export const useAuthStore = create<AuthState>((set, get) => ({
  player: null,
  activeChar: null,
  isLoading: true,
  setPlayer: (player) => set({ player }),
  setActiveChar: (activeChar) => set({ activeChar }),
  setLoading: (isLoading) => set({ isLoading }),
  isBanned: () => {
    const { player } = get()
    if (!player?.banned_until) return false
    return new Date(player.banned_until) > new Date()
  },
  banSecondsLeft: () => {
    const { player } = get()
    if (!player?.banned_until) return 0
    return Math.max(0, Math.floor((new Date(player.banned_until).getTime() - Date.now()) / 1000))
  },
}))
