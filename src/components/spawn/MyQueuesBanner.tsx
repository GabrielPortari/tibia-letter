import { useAuthStore } from '../../stores/authStore'
import { useQueueStore } from '../../stores/queueStore'
import { useCountdown } from '../../hooks/useCountdown'
import { fmt, secondsUntil } from '../../utils/time'
import { HuntEndTimer } from '../queue/InlineTimer'
import { getEntryStatus } from '../../types'
import type { Spawn } from '../../types'

interface MyQueuesBannerProps {
  spawns: Spawn[]
  onAccept: (spawnId: string) => Promise<unknown>
  onLeave: (spawnId: string) => Promise<unknown>
}

function AcceptChip({
  spawnId,
  spawnName,
  deadline,
  showSkip,
  onAccept,
  onLeave,
}: {
  spawnId: string
  spawnName: string
  deadline: string
  showSkip: boolean
  onAccept: (id: string) => Promise<unknown>
  onLeave: (id: string) => Promise<unknown>
}) {
  const secs = useCountdown(new Date(deadline).getTime(), () => {})

  return (
    <div
      className="flex-shrink-0 rounded-xl px-4 py-3 space-y-2 min-w-[200px]"
      style={{
        background: 'var(--gold-glow)',
        border: '1px solid var(--gold)',
        animation: 'glow 2s ease-in-out infinite',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-gold truncate">{spawnName}</span>
        <span
          className="font-mono font-bold text-sm flex-shrink-0"
          style={{ color: secs <= 60 ? 'var(--red)' : 'var(--gold)' }}
          aria-live="polite"
        >
          {fmt(secs)}
        </span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onAccept(spawnId)}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold text-bg0 transition-opacity hover:opacity-90"
          style={{ background: 'var(--gold)' }}
        >
          ⚔ Aceitar
        </button>
        {showSkip && (
          <button
            onClick={() => onLeave(spawnId)}
            className="py-1.5 px-3 rounded-lg text-xs transition-opacity hover:opacity-80"
            style={{
              background: 'var(--red-bg)',
              border: '0.5px solid var(--red)',
              color: 'var(--red)',
            }}
          >
            Pular
          </button>
        )}
      </div>
    </div>
  )
}

export function MyQueuesBanner({ spawns, onAccept, onLeave }: MyQueuesBannerProps) {
  const { activeChar } = useAuthStore()
  const { getMyEntries } = useQueueStore()
  const char = activeChar()

  if (!char) return null
  const myEntries = getMyEntries(char.name)
  if (myEntries.length === 0) return null

  const pendingAccepts = myEntries.filter(
    (e) => getEntryStatus(e) === 'pending_accept' && e.acceptDeadline,
  )
  const activeHunts = myEntries.filter((e) => getEntryStatus(e) === 'active')
  const waiting = myEntries.filter((e) => getEntryStatus(e) === 'waiting')

  const hasConflict = pendingAccepts.length > 1

  if (pendingAccepts.length === 0 && activeHunts.length === 0 && waiting.length === 0) return null

  function spawnName(spawnId: string) {
    return spawns.find((s) => s.id === spawnId)?.name ?? spawnId
  }

  return (
    <div role="status" aria-live="polite" className="mb-4 space-y-3">

      {pendingAccepts.length > 0 && (
        <div>
          {hasConflict ? (
            <>
              <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: 'var(--gold-dim)' }}>
                ESCOLHA UM RESPAWN
              </p>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                Dois respawns vagos ao mesmo tempo. Aceite um — o outro será repassado automaticamente.
              </p>
            </>
          ) : (
            <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'var(--gold-dim)' }}>
              SUA VEZ DE ACEITAR
            </p>
          )}

          <div className="flex gap-3 overflow-x-auto pb-1 sm:flex-wrap">
            {pendingAccepts.map((e) => (
              <AcceptChip
                key={e.id}
                spawnId={e.spawnId}
                spawnName={spawnName(e.spawnId)}
                deadline={e.acceptDeadline!}
                showSkip={!hasConflict}
                onAccept={onAccept}
                onLeave={onLeave}
              />
            ))}
          </div>
        </div>
      )}

      {activeHunts.length > 0 && (
        <div className="flex gap-2 overflow-x-auto sm:flex-wrap pb-1">
          {activeHunts.map((e) => (
            <span
              key={e.id}
              className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap"
              style={{
                background: 'var(--green-bg)',
                border: '0.5px solid var(--green)',
                color: 'var(--green)',
              }}
            >
              ⚔ <span className="font-medium">{e.characterName}</span>
              {' '}caçando em <span className="font-medium">{spawnName(e.spawnId)}</span>
              {e.huntEndsAt && (
                <span className="text-text-muted ml-1">· <HuntEndTimer endsAt={e.huntEndsAt} /></span>
              )}
            </span>
          ))}
        </div>
      )}

      {waiting.length > 0 && (
        <div>
          <p className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'var(--text-dim)' }}>
            AGUARDANDO NA FILA
          </p>
          <div className="flex gap-2 overflow-x-auto sm:flex-wrap pb-1">
            {waiting.map((e) => (
              <span
                key={e.id}
                className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap"
                style={{ background: 'var(--bg-2)', border: '0.5px solid var(--border)', color: 'var(--text-muted)' }}
              >
                <span className="text-text font-medium">{spawnName(e.spawnId)}</span>
                {' '}— #{e.position} na fila
                {e.estimatedStart && (
                  <span className="text-text-dim ml-1">
                    · ~{fmt(secondsUntil(e.estimatedStart))}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
