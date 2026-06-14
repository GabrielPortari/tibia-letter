import { useMemo } from 'react'
import { useCountdown } from '../../hooks/useCountdown'
import { fmt, huntDuration } from '../../utils/time'

interface HuntTimerProps {
  startedAt: string
}

export function HuntTimer({ startedAt }: HuntTimerProps) {
  const elapsed = useMemo(() => huntDuration(startedAt), [])
  return (
    <span
      className="font-mono text-sm text-text-muted"
      aria-live="polite"
      aria-label="Tempo de caça"
    >
      {fmt(elapsed)}
    </span>
  )
}

interface AcceptTimerProps {
  deadline: string
  onExpire: () => void
}

export function AcceptTimer({ deadline, onExpire }: AcceptTimerProps) {
  const endTime = useMemo(() => new Date(deadline).getTime(), [deadline])
  const seconds = useCountdown(endTime, onExpire)
  return (
    <span
      className={`font-mono text-base font-bold ${seconds <= 60 ? 'text-red' : 'text-amber'}`}
      aria-live="polite"
      aria-label="Tempo para aceitar"
    >
      {fmt(seconds)}
    </span>
  )
}
