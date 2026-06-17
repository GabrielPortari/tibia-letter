import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { QueueEntry } from '../../types'
import { getEntryStatus } from '../../types'
import { Badge } from '../ui/Badge'
import { HuntTimer } from './InlineTimer'

interface QueueSlotProps {
  entry: QueueEntry
  position: number
  isMe: boolean
  isNext?: boolean
}

export function QueueSlot({ entry, position, isMe, isNext }: QueueSlotProps) {
  const { t } = useTranslation()
  const status = getEntryStatus(entry)
  const [copied, setCopied] = useState(false)

  function copyName() {
    navigator.clipboard.writeText(entry.characterName).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        isMe ? 'bg-[var(--gold-glow)] border border-[var(--gold-dim)]' : 'hover:bg-bg3'
      }`}
    >
      <span className="w-5 text-center text-text-dim font-mono text-xs">{position}</span>
      <span className={`flex-1 font-medium truncate ${isMe ? 'text-gold' : 'text-text'}`}>
        {entry.characterName}
      </span>
      <button
        onClick={copyName}
        title={t('slot.copy_name')}
        aria-label={t('slot.copy_name')}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-text-dim hover:text-text text-xs px-1"
      >
        {copied ? '✓' : '⎘'}
      </button>
      <span className="text-text-muted text-xs">Lv.{entry.characterLevel}</span>
      {entry.premium && <span className="text-xs text-[var(--gold-dim)]">★</span>}
      {isNext && <Badge variant="amber">{t('slot.next')}</Badge>}
      {status === 'active' && entry.huntStartedAt && (
        <HuntTimer startedAt={entry.huntStartedAt} />
      )}
      {status === 'pending_accept' && (
        <Badge variant="gold">{t('slot.awaiting_accept')}</Badge>
      )}
    </div>
  )
}
