import { useState, useEffect, useRef } from 'react'
import { fmt } from '../../utils/time'

// ── Mock data ──────────────────────────────────────────────────────────────────

interface MockEntry {
  name: string
  level: number
  isYou?: boolean
  startedAt?: number
}

interface MockSpawn {
  id: string
  name: string
  location: string
  minLevel: number
  maxLevel: number
  queue: MockEntry[]
  acceptDeadline?: number
}

const INITIAL_SPAWNS: MockSpawn[] = [
  {
    id: 's1',
    name: 'Dragon Lair',
    location: 'Mount Sternum',
    minLevel: 80,
    maxLevel: 150,
    queue: [
      { name: 'Drakenheim', level: 120, startedAt: Date.now() - 41 * 60 * 1000 },
      { name: 'Seraphion', level: 87, isYou: true },
      { name: 'Mirella', level: 95 },
    ],
  },
  {
    id: 's2',
    name: 'Cyclops Camp',
    location: 'North Plains',
    minLevel: 40,
    maxLevel: 80,
    queue: [],
  },
  {
    id: 's3',
    name: 'Demon Oak',
    location: 'Edron Plains',
    minLevel: 200,
    maxLevel: 999,
    queue: [
      { name: 'Thalindra', level: 445, startedAt: Date.now() - 112 * 60 * 1000 },
    ],
    acceptDeadline: Date.now() + 4 * 60 * 1000 + 33 * 1000,
  },
  {
    id: 's4',
    name: 'Orc Fortress',
    location: 'Ulderek Rock',
    minLevel: 60,
    maxLevel: 120,
    queue: [
      { name: 'Orindel', level: 88 },
      { name: 'Thal Maker', level: 72 },
      { name: 'Mirella Jr', level: 61 },
    ],
  },
]

// ── Sub-components ─────────────────────────────────────────────────────────────

function ElapsedTimer({ startedAt }: { startedAt: number }) {
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - startedAt) / 1000))
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000)
    return () => clearInterval(id)
  }, [startedAt])
  return (
    <span
      className="font-mono text-xs tabular-nums"
      style={{ color: elapsed > 3600 ? 'var(--red)' : 'var(--green)' }}
    >
      {fmt(elapsed)}
    </span>
  )
}

function AcceptCountdown({ deadline }: { deadline: number }) {
  const [secs, setSecs] = useState(Math.max(0, Math.floor((deadline - Date.now()) / 1000)))
  useEffect(() => {
    const id = setInterval(
      () => setSecs(Math.max(0, Math.floor((deadline - Date.now()) / 1000))),
      1000,
    )
    return () => clearInterval(id)
  }, [deadline])
  return (
    <span
      className="font-mono font-bold tabular-nums"
      style={{ color: secs < 60 ? 'var(--red)' : 'var(--gold)' }}
    >
      {fmt(secs)}
    </span>
  )
}

function StatusDot({ spawn }: { spawn: MockSpawn }) {
  const hasActive = spawn.queue[0]?.startedAt !== undefined
  const hasPending = !!spawn.acceptDeadline
  const isEmpty = spawn.queue.length === 0

  if (hasPending) return <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse flex-shrink-0" />
  if (isEmpty) return <span className="w-2.5 h-2.5 rounded-full bg-green flex-shrink-0" />
  if (hasActive) return <span className="w-2.5 h-2.5 rounded-full bg-amber flex-shrink-0" />
  return <span className="w-2.5 h-2.5 rounded-full bg-amber flex-shrink-0" />
}

function SpawnCardMock({ spawn, defaultOpen }: { spawn: MockSpawn; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false)
  const isMyTurn = spawn.acceptDeadline !== undefined
  const myEntry = spawn.queue.find((e) => e.isYou)
  const myPos = spawn.queue.findIndex((e) => e.isYou)

  const statusLabel = () => {
    if (spawn.queue.length === 0) return { text: 'Livre', color: 'var(--green)' }
    if (spawn.acceptDeadline) return { text: 'Aguard. aceite', color: 'var(--gold)' }
    return { text: `${spawn.queue.length} na fila`, color: 'var(--amber)' }
  }
  const { text, color } = statusLabel()

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: 'var(--bg-2)',
        border: `1px solid ${isMyTurn ? 'var(--gold)' : open ? 'var(--border-hover)' : 'var(--border)'}`,
        boxShadow: isMyTurn ? '0 0 16px var(--gold-glow)' : undefined,
        animation: isMyTurn ? 'glow 2s ease-in-out infinite' : undefined,
      }}
    >
      {/* Header row */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <StatusDot spawn={spawn} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text truncate">{spawn.name}</p>
          <p className="text-xs text-text-muted">
            {spawn.location} · Lv. {spawn.minLevel}–{spawn.maxLevel === 999 ? '∞' : spawn.maxLevel}
          </p>
        </div>

        <span className="text-xs font-medium flex-shrink-0" style={{ color }}>
          {text}
        </span>

        {myEntry && (
          <span
            className="text-xs px-2 py-0.5 rounded font-medium flex-shrink-0"
            style={{
              background: 'var(--gold-glow)',
              border: '0.5px solid var(--gold-dim)',
              color: 'var(--gold)',
            }}
          >
            {myPos === 0 ? 'você' : `${myPos + 1}º`}
          </span>
        )}

        <svg
          className="w-4 h-4 text-text-muted transition-transform flex-shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : 'none' }}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expanded body */}
      {open && (
        <div
          className="px-4 pb-4 space-y-3 animate-fadeIn"
          style={{ borderTop: '0.5px solid var(--border)' }}
        >
          {/* Accept timer banner */}
          {spawn.acceptDeadline && (
            <div
              className="rounded-lg p-3 mt-3 text-center"
              style={{ background: 'var(--gold-glow)', border: '1px solid var(--gold-dim)' }}
            >
              <p className="text-xs text-text-muted mb-1">⚡ Sua vez! Aceite em:</p>
              <AcceptCountdown deadline={spawn.acceptDeadline} />
              <button
                className="mt-2 w-full py-1.5 rounded-lg text-xs font-semibold text-bg0 transition-opacity hover:opacity-90"
                style={{ background: 'var(--gold)' }}
              >
                ⚔ Aceitar respawn
              </button>
            </div>
          )}

          {/* Queue list */}
          {spawn.queue.length > 0 && (
            <div className="space-y-1 pt-2">
              <p className="text-xs text-text-dim font-semibold tracking-widest mb-2">FILA ATUAL</p>
              {spawn.queue.map((entry, i) => (
                <div
                  key={entry.name}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
                  style={{
                    background: entry.isYou ? 'var(--gold-glow)' : i === 0 ? 'var(--bg-3)' : 'transparent',
                    border: `0.5px solid ${entry.isYou ? 'var(--gold-dim)' : 'var(--border)'}`,
                  }}
                >
                  <span
                    className="w-5 text-center text-xs font-mono flex-shrink-0"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    {i === 0 ? '⚔' : `${i + 1}º`}
                  </span>
                  <span
                    className="flex-1 font-medium truncate text-sm"
                    style={{ color: entry.isYou ? 'var(--gold)' : 'var(--text)' }}
                  >
                    {entry.name}
                    {entry.isYou && (
                      <span className="text-xs ml-1" style={{ color: 'var(--gold-dim)' }}>
                        (você)
                      </span>
                    )}
                  </span>
                  <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                    Lv.{entry.level}
                  </span>
                  {entry.startedAt && <ElapsedTimer startedAt={entry.startedAt} />}
                  {i === 0 && !entry.startedAt && !entry.isYou && (
                    <button
                      className="text-xs px-2 py-0.5 rounded flex-shrink-0 transition-opacity hover:opacity-80"
                      style={{
                        background: 'var(--red-bg)',
                        border: '0.5px solid var(--red)',
                        color: 'var(--red)',
                      }}
                    >
                      reportar
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {spawn.queue.length === 0 && (
            <p className="text-center text-sm pt-2" style={{ color: 'var(--text-dim)' }}>
              Respawn livre — entre na fila!
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            {!myEntry && spawn.queue.length === 0 && (
              <button
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--gold)',
                  color: 'var(--gold)',
                }}
              >
                + Entrar na fila
              </button>
            )}
            {!myEntry && spawn.queue.length > 0 && !spawn.acceptDeadline && (
              <button
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-opacity hover:opacity-90"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--gold)',
                  color: 'var(--gold)',
                }}
              >
                + Entrar na fila
              </button>
            )}
            {myEntry && myPos > 0 && (
              <button
                className="py-2 px-3 rounded-lg text-xs transition-opacity hover:opacity-80"
                style={{
                  background: 'var(--red-bg)',
                  border: '0.5px solid var(--red)',
                  color: 'var(--red)',
                }}
              >
                Sair da fila
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main demo section ──────────────────────────────────────────────────────────

export function DemoSection() {
  const [spawns] = useState<MockSpawn[]>(INITIAL_SPAWNS)
  const [tickMs, setTickMs] = useState(Date.now())
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    tickRef.current = setInterval(() => setTickMs(Date.now()), 1000)
    return () => { if (tickRef.current) clearInterval(tickRef.current) }
  }, [])

  // My queues banner data
  const mySpawn = spawns[0]
  const myPos = mySpawn.queue.findIndex((e) => e.isYou)
  const estWaitSecs = myPos * 3600

  return (
    <section className="py-16 sm:py-20 px-4" style={{ background: 'var(--bg-1)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-widest mb-3" style={{ color: 'var(--gold-dim)' }}>
            DEMO INTERATIVA
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3">
            Veja como funciona na prática.
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Clique nos cards abaixo para expandir. Dados simulados — em produção tudo é em tempo real.
          </p>
        </div>

        {/* Simulated app chrome */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--border)', background: 'var(--bg-0)' }}
        >
          {/* Mock topbar */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '0.5px solid var(--border)', background: 'var(--bg-1)' }}
          >
            <span className="font-display text-sm font-bold" style={{ color: 'var(--gold)' }}>
              ⚔ Tibia Letter
            </span>
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="font-medium" style={{ color: 'var(--text)' }}>Seraphion</span> Lv.87
              </span>
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm"
                style={{ background: 'var(--bg-3)', border: '1.5px solid var(--border)' }}
              >
                ⚔️
              </span>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* My queues banner */}
            <div
              className="rounded-xl px-4 py-3"
              role="status"
              style={{
                background: 'var(--blue-bg)',
                border: '1px solid var(--blue)',
              }}
            >
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--blue)' }}>
                SUAS FILAS EM ANTICA
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <div
                  className="flex-shrink-0 rounded-lg px-3 py-2 text-xs"
                  style={{
                    background: 'var(--bg-2)',
                    border: '0.5px solid var(--border)',
                  }}
                >
                  <span className="font-medium" style={{ color: 'var(--text)' }}>Dragon Lair</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {' '}— {myPos + 1}º na fila · espera ~{fmt(estWaitSecs)}
                  </span>
                </div>
              </div>
            </div>

            {/* World label + spawn count */}
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                {spawns.length} spawns · Antica
              </span>
              <div
                className="h-px flex-1"
                style={{ background: 'var(--border)' }}
              />
            </div>

            {/* Spawn cards */}
            <div className="space-y-2">
              {spawns.map((spawn, i) => (
                <SpawnCardMock
                  key={spawn.id + tickMs}
                  spawn={spawn}
                  defaultOpen={i === 0}
                />
              ))}
            </div>

            {/* Disclaimer */}
            <p className="text-center text-xs pt-1" style={{ color: 'var(--text-dim)' }}>
              🔒 Demo somente-leitura · Entre com Discord para usar de verdade
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
