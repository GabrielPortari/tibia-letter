import { useState, useEffect, useMemo } from 'react'
import { useCountdown } from '../../hooks/useCountdown'
import { fmt, huntDuration } from '../../utils/time'

interface HuntTimerProps {
  startedAt: string
}

export function HuntTimer({ startedAt }: HuntTimerProps) {
  const [elapsed, setElapsed] = useState(() => huntDuration(startedAt))

  useEffect(() => {
    const id = setInterval(() => setElapsed(huntDuration(startedAt)), 1000)
    return () => clearInterval(id)
  }, [startedAt])

  return (
    <span
      className="font-mono text-sm text-text-muted"
      aria-live="polite"
      aria-label="Tempo de caça"
    >
      +{fmt(elapsed)}
    </span>
  )
}

interface HuntEndTimerProps {
  endsAt: string
}

export function HuntEndTimer({ endsAt }: HuntEndTimerProps) {
  const endTime = useMemo(() => new Date(endsAt).getTime(), [endsAt])
  const seconds = useCountdown(endTime, () => {})
  return (
    <span
      className={`font-mono text-xs ${seconds <= 300 ? 'text-amber' : 'text-text-muted'}`}
      aria-live="polite"
      aria-label="Tempo restante de caça"
    >
      {fmt(seconds)}
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
