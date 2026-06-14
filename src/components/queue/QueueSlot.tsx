import type { QueueEntry } from '../../types'
import { Badge } from '../ui/Badge'
import { HuntTimer } from './InlineTimer'

interface QueueSlotProps {
  entry: QueueEntry
  position: number
  isMe: boolean
  isNext?: boolean
}

export function QueueSlot({ entry, position, isMe, isNext }: QueueSlotProps) {
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        isMe ? 'bg-[var(--gold-glow)] border border-[var(--gold-dim)]' : 'hover:bg-bg3'
      }`}
    >
      <span className="w-5 text-center text-text-dim font-mono text-xs">{position}</span>
      <span className={`flex-1 font-medium truncate ${isMe ? 'text-gold' : 'text-text'}`}>
        {entry.character_name}
      </span>
      <span className="text-text-muted text-xs">Lv.{entry.character_level}</span>
      {isNext && (
        <Badge variant="amber">próximo</Badge>
      )}
      {entry.status === 'active' && entry.started_at && (
        <HuntTimer startedAt={entry.started_at} />
      )}
      {entry.status === 'pending_accept' && (
        <Badge variant="gold">Aguardando aceite</Badge>
      )}
    </div>
  )
}
