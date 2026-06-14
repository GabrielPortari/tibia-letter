import { useAuthStore } from '../../stores/authStore'
import { useQueueStore } from '../../stores/queueStore'

export function MyQueuesBanner() {
  const { player } = useAuthStore()
  const getMyEntries = useQueueStore((s) => s.getMyEntries)

  if (!player) return null
  const myEntries = getMyEntries(player.id)
  if (myEntries.length === 0) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-[var(--blue-bg)] border border-blue rounded-xl px-4 py-3 mb-4"
    >
      <p className="text-sm font-semibold text-blue mb-2">Suas Filas Ativas</p>
      <div className="flex gap-2 overflow-x-auto sm:flex-wrap pb-1">
        {myEntries.map((e) => (
          <span
            key={e.id}
            className="flex-shrink-0 bg-bg2 border border-border rounded-lg px-3 py-1.5 text-xs text-text-muted whitespace-nowrap"
          >
            <span className="text-text font-medium">{e.character_name}</span>
            {' '}— posição #{e.position + 1}
          </span>
        ))}
      </div>
    </div>
  )
}
