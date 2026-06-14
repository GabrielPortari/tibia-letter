export interface Character {
  id: string
  name: string
  level: number
  world: string
  verified: boolean
  active: boolean
  verifyCode: string | null
  verifyCodeExpiresAt: string | null
  verifiedAt: string | null
}

export interface User {
  id: string
  discordId: string
  discordName: string
  avatarUrl: string | null
  premium: boolean
  warnings: number
  banned: boolean
  banUntil: string | null
  isAdmin: boolean
  characters: Character[]
}

export interface Spawn {
  id: string
  name: string
  location: string
  minLevel: number
  maxLevel: number
  active: boolean
}

export interface QueueEntry {
  id: string
  characterName: string
  characterLevel: number
  position: number
  premium: boolean
  huntDurationS: number
  estimatedStart: string | null
  huntStartedAt: string | null
  huntEndsAt: string | null
  acceptDeadline: string | null
  joinedAt: string
}

export type QueueStatus = 'waiting' | 'pending_accept' | 'active'

export function getEntryStatus(e: QueueEntry): QueueStatus {
  if (e.huntStartedAt != null) return 'active'
  if (e.acceptDeadline != null) return 'pending_accept'
  return 'waiting'
}

export interface RemovalLog {
  id: string
  targetId: string
  targetName: string
  action: 'removed_from_queue' | 'removed_from_spawn'
  reporters: string[]
  reason: string
  spawnId: string
  spawnName: string
  worldId: string
  warningsAfter: number
  createdAt: string
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}

export interface AdminStats {
  totalUsers: number
  activeQueues: number
  recentRemovals: number
}
