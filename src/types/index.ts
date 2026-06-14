export interface Player {
  id: string
  discord_id: string
  discord_username: string
  discord_avatar: string | null
  is_premium: boolean
  warnings: number
  banned_until: string | null
  created_at: string
}

export interface Character {
  id: string
  player_id: string
  name: string
  level: number
  vocation: string
  world: string
  is_verified: boolean
  is_active: boolean
  created_at: string
}

export interface Spawn {
  id: string
  name: string
  min_level: number
  max_level: number
  location: string | null
  image_url: string | null
  created_at: string
}

export type QueueEntryStatus = 'waiting' | 'active' | 'pending_accept'

export interface QueueEntry {
  id: string
  world_id: string
  spawn_id: string
  player_id: string
  character_id: string
  character_name: string
  character_level: number
  position: number
  status: QueueEntryStatus
  started_at: string | null
  accept_deadline: string | null
  joined_at: string
}

export interface Report {
  id: string
  reporter_id: string
  target_id: string
  target_name: string
  spawn_id: string
  spawn_name: string
  world_id: string
  reason: string
  created_at: string
}

export interface RemovalLog {
  id: string
  target_id: string
  target_name: string
  action: 'removed_from_queue' | 'removed_from_spawn'
  reporters: string[]
  reason: string
  spawn_id: string
  spawn_name: string
  world_id: string
  warnings_after: number
  created_at: string
}

export interface World {
  id: string
  name: string
  region: 'eu' | 'na' | 'sa' | 'oc'
  pvp_type: 'open' | 'optional' | 'hardcore' | 'retro-open' | 'retro-hardcore'
}

export interface VerificationCode {
  code: string
  expires_at: string
}

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
}
