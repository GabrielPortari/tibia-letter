import { useState, useMemo } from 'react'
import type { Spawn, QueueEntry } from '../../types'
import { getEntryStatus } from '../../types'
import { useAuthStore } from '../../stores/authStore'
import { useQueueStore } from '../../stores/queueStore'
import { fmt, secondsUntil } from '../../utils/time'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { QueueSlot } from '../queue/QueueSlot'
import { AcceptTimer, HuntEndTimer } from '../queue/InlineTimer'
import { ReportModal } from '../report/ReportModal'

interface SpawnCardProps {
  spawn: Spawn
  worldId: string
  onJoin: (spawnId: string) => Promise<void>
  onAccept: (spawnId: string) => Promise<void>
  onFinish: (spawnId: string) => Promise<void>
  onLeave: (spawnId: string) => Promise<void>
}

function getSpawnStatus(queue: QueueEntry[]) {
  if (queue.length === 0) return 'free'
  const topStatus = getEntryStatus(queue[0])
  if (topStatus === 'pending_accept') return 'pending'
  if (topStatus === 'active') return 'occupied'
  return 'free'
}

export function SpawnCard({
  spawn,
  worldId,
  onJoin,
  onAccept,
  onFinish,
  onLeave,
}: SpawnCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [reportOpen, setReportOpen] = useState(false)
  const { user, activeChar } = useAuthStore()
  const getSpawnQueue = useQueueStore((s) => s.getSpawnQueue)
  const char = activeChar()

  const queue = getSpawnQueue(spawn.id)
  const status = getSpawnStatus(queue)

  const myEntry = useMemo(
    () => (char ? queue.find((e) => e.characterName === char.name) : null),
    [queue, char],
  )
  const myStatus = myEntry ? getEntryStatus(myEntry) : null

  const isMyTurnToAccept = myStatus === 'pending_accept'
  const isHunting = myStatus === 'active'

  const canJoin = !!char

  const statusDot = { free: 'bg-green', occupied: 'bg-amber', pending: 'bg-gold animate-pulse' }[status]
  const statusLabel = { free: 'Livre', occupied: 'Ocupado', pending: 'Aguard. aceite' }[status]
  const statusBadge = { free: 'green', occupied: 'amber', pending: 'gold' } as const

  // Who is currently hunting (first entry with active status)
  const activeEntry = queue.find((e) => getEntryStatus(e) === 'active')

  async function wrap(key: string, fn: () => Promise<void>) {
    setLoading(key)
    try { await fn() } finally { setLoading(null) }
  }

  return (
    <>
      <div
        className={`bg-bg2 border rounded-xl transition-all duration-200 ${
          isMyTurnToAccept
            ? 'border-gold animate-glow'
            : isHunting
            ? 'border-green'
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
          </div>
          {isHunting && myEntry?.huntEndsAt && (
            <span className="text-xs text-green font-mono">
              {fmt(secondsUntil(myEntry.huntEndsAt))}
            </span>
          )}
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
            {/* Accept prompt */}
            {isMyTurnToAccept && myEntry?.acceptDeadline && (
              <div className="bg-[var(--gold-glow)] border border-[var(--gold-dim)] rounded-lg p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Sua vez! Tempo para aceitar:</p>
                <AcceptTimer deadline={myEntry.acceptDeadline} onExpire={() => {}} />
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

            {/* Hunting status */}
            {isHunting && myEntry?.huntEndsAt && (
              <div
                className="rounded-lg p-3 text-center"
                style={{ background: 'var(--green-bg)', border: '1px solid var(--green)' }}
              >
                <p className="text-xs mb-1" style={{ color: 'var(--green)' }}>
                  Você está caçando aqui!
                </p>
                <p className="text-xs text-text-muted">
                  Tempo restante: <HuntEndTimer endsAt={myEntry.huntEndsAt} />
                </p>
              </div>
            )}

            {/* Queue list */}
            {queue.length > 0 && (
              <div className="space-y-1">
                {queue.map((e, i) => (
                  <QueueSlot
                    key={e.id}
                    entry={e}
                    position={i + 1}
                    isMe={e.characterName === char?.name}
                    isNext={
                      i === 1 &&
                      (getEntryStatus(queue[0]) === 'active' || getEntryStatus(queue[0]) === 'pending_accept')
                    }
                  />
                ))}
              </div>
            )}

            {queue.length === 0 && (
              <p className="text-center text-sm py-2" style={{ color: 'var(--green)' }}>
                Respawn livre — comece a caçar!
              </p>
            )}

            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap">
              {!myEntry && (
                <Button
                  size="sm"
                  isLoading={loading === 'join'}
                  disabled={!canJoin}
                  onClick={() => wrap('join', () => onJoin(spawn.id))}
                  className="flex-1"
                  title={!canJoin ? 'Selecione um personagem para entrar na fila' : undefined}
                >
                  {queue.length === 0 ? 'Caçar agora' : 'Entrar na Fila'}
                </Button>
              )}
              {isHunting && (
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
              {myStatus === 'waiting' && (
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
              {/* Report active hunter */}
              {activeEntry && activeEntry.characterName !== char?.name && user && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReportOpen(true)}
                  className="text-text-dim hover:text-red"
                >
                  Reportar
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {activeEntry && user && (
        <ReportModal
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
          spawnId={spawn.id}
          spawnName={spawn.name}
          worldId={worldId}
          targetName={activeEntry.characterName}
        />
      )}
    </>
  )
}
