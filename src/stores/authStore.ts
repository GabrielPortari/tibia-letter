import { create } from 'zustand'
import type { User, Character } from '../types'

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (v: boolean) => void
  activeChar: () => Character | null
  isBanned: () => boolean
  banSecondsLeft: () => number
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  activeChar: () => get().user?.characters.find((c) => c.active) ?? null,
  isBanned: () => {
    const { user } = get()
    if (!user) return false
    if (user.banned) return true
    if (!user.banUntil) return false
    return new Date(user.banUntil) > new Date()
  },
  banSecondsLeft: () => {
    const { user } = get()
    if (!user?.banUntil) return 0
    return Math.max(0, Math.floor((new Date(user.banUntil).getTime() - Date.now()) / 1000))
  },
}))
