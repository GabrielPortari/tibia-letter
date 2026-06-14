import { useState, useMemo } from 'react'
import type { Spawn, QueueEntry } from '../../types'
import { useAuthStore } from '../../stores/authStore'
import { useQueueStore } from '../../stores/queueStore'
import { validateLevelRange } from '../../utils/level'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { QueueSlot } from '../queue/QueueSlot'
import { AcceptTimer } from '../queue/InlineTimer'

interface SpawnCardProps {
  spawn: Spawn
  worldId: string
  onJoin: (spawnId: string) => Promise<void>
  onAccept: (spawnId: string) => Promise<void>
  onFinish: (spawnId: string) => Promise<void>
  onLeave: (spawnId: string) => Promise<void>
  onReport: (spawnId: string, targetId: string) => void
}

function getSpawnStatus(queue: QueueEntry[]) {
  if (queue.length === 0) return 'free'
  if (queue[0]?.status === 'pending_accept') return 'pending'
  return 'occupied'
}

export function SpawnCard({
  spawn,
  worldId,
  onJoin,
  onAccept,
  onFinish,
  onLeave,
  onReport,
}: SpawnCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const { player, activeChar } = useAuthStore()
  const getSpawnQueue = useQueueStore((s) => s.getSpawnQueue)

  const queue = getSpawnQueue(spawn.id)
  const status = getSpawnStatus(queue)

  const myEntry = useMemo(
    () => (player ? queue.find((e) => e.player_id === player.id) : null),
    [queue, player],
  )

  const isMyTurnToAccept = myEntry?.status === 'pending_accept'
  const canJoin = useMemo(() => {
    if (!activeChar) return false
    return validateLevelRange(activeChar.level, spawn.min_level, spawn.max_level)
  }, [activeChar, spawn])

  const statusDot = {
    free: 'bg-green',
    occupied: 'bg-amber',
    pending: 'bg-gold animate-pulse',
  }[status]

  const statusLabel = { free: 'Livre', occupied: 'Ocupado', pending: 'Aguard. aceite' }[status]
  const statusBadge = { free: 'green', occupied: 'amber', pending: 'gold' } as const

  async function wrap(key: string, fn: () => Promise<void>) {
    setLoading(key)
    try { await fn() } finally { setLoading(null) }
  }

  return (
    <div
      className={`bg-bg2 border rounded-xl transition-all duration-200 ${
        isMyTurnToAccept
          ? 'border-gold animate-glow'
          : 'border-border hover:border-border-hover'
      }`}
    >
      <button
        className="w-full flex items-center gap-3 px-4 py-4 min-h-[64px] text-left"
        onClick={() => setExpanded((o) => !o)}
        aria-expanded={expanded}
      >
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusDot}`} />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-text truncate">{spawn.name}</p>
          <p className="text-xs text-text-muted">Lv. {spawn.min_level}–{spawn.max_level}</p>
        </div>
        <Badge variant={statusBadge[status]}>{statusLabel}</Badge>
        {queue.length > 0 && (
          <span className="text-xs text-text-dim">{queue.length} na fila</span>
        )}
        <svg
          className={`w-4 h-4 text-text-muted transition-transform ${expanded ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border pt-3 space-y-3 animate-fadeIn">
          {isMyTurnToAccept && myEntry?.accept_deadline && (
            <div className="bg-[var(--gold-glow)] border border-[var(--gold-dim)] rounded-lg p-3 text-center">
              <p className="text-xs text-text-muted mb-1">Sua vez! Tempo para aceitar:</p>
              <AcceptTimer
                deadline={myEntry.accept_deadline}
                onExpire={() => {}}
              />
              <Button
                size="sm"
                className="mt-2 w-full"
                isLoading={loading === 'accept'}
                onClick={() => wrap('accept', () => onAccept(spawn.id))}
              >
                Aceitar Respawn
              </Button>
            </div>
          )}

          {queue.length > 0 && (
            <div className="space-y-1">
              {queue.map((e, i) => (
                <QueueSlot
                  key={e.id}
                  entry={e}
                  position={i + 1}
                  isMe={e.player_id === player?.id}
                />
              ))}
            </div>
          )}

          {queue.length === 0 && (
            <p className="text-center text-text-dim text-sm py-2">Respawn livre — entre na fila!</p>
          )}

          {!canJoin && activeChar && (
            <p className="text-xs text-text-muted text-center py-1">
              Nível {activeChar.level} fora do range (Lv. {spawn.min_level}–{spawn.max_level})
            </p>
          )}

          <div className="flex gap-2 flex-wrap">
            {!myEntry && (
              <Button
                size="sm"
                isLoading={loading === 'join'}
                disabled={!canJoin}
                onClick={() => wrap('join', () => onJoin(spawn.id))}
                className="flex-1"
              >
                Entrar na Fila
              </Button>
            )}
            {myEntry && myEntry.status === 'active' && (
              <Button
                size="sm"
                variant="secondary"
                isLoading={loading === 'finish'}
                onClick={() => wrap('finish', () => onFinish(spawn.id))}
                className="flex-1"
              >
                Finalizar Caça
              </Button>
            )}
            {myEntry && myEntry.status === 'waiting' && (
              <Button
                size="sm"
                variant="ghost"
                isLoading={loading === 'leave'}
                onClick={() => wrap('leave', () => onLeave(spawn.id))}
                className="flex-1"
              >
                Sair da Fila
              </Button>
            )}
            {queue.length > 0 && queue[0].player_id !== player?.id && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => onReport(spawn.id, queue[0].player_id)}
              >
                Reportar
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
