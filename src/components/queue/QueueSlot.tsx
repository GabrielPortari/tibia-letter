import type { QueueEntry } from '../../types'
import { getEntryStatus } from '../../types'
import { Badge } from '../ui/Badge'
import { HuntTimer, HuntEndTimer } from './InlineTimer'

interface QueueSlotProps {
  entry: QueueEntry
  position: number
  isMe: boolean
  isNext?: boolean
}

export function QueueSlot({ entry, position, isMe, isNext }: QueueSlotProps) {
  const status = getEntryStatus(entry)

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        isMe ? 'bg-[var(--gold-glow)] border border-[var(--gold-dim)]' : 'hover:bg-bg3'
      }`}
    >
      <span className="w-5 text-center text-text-dim font-mono text-xs">{position}</span>
      <span className={`flex-1 font-medium truncate ${isMe ? 'text-gold' : 'text-text'}`}>
        {entry.characterName}
      </span>
      <span className="text-text-muted text-xs">Lv.{entry.characterLevel}</span>
      {entry.premium && <span className="text-xs text-[var(--gold-dim)]">★</span>}
      {isNext && <Badge variant="amber">próximo</Badge>}
      {status === 'active' && entry.huntStartedAt && (
        <HuntTimer startedAt={entry.huntStartedAt} />
      )}
      {status === 'active' && entry.huntEndsAt && (
        <HuntEndTimer endsAt={entry.huntEndsAt} />
      )}
      {status === 'pending_accept' && (
        <Badge variant="gold">Aguardando aceite</Badge>
      )}
    </div>
  )
}
