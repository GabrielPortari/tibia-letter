import { useEffect, useRef, useState } from 'react'

export function useCountdown(endTime: number, onExpire: () => void): number {
  const [seconds, setSeconds] = useState(() =>
    Math.max(0, Math.floor((endTime - Date.now()) / 1000)),
  )
  const expiredRef = useRef(false)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    expiredRef.current = false
    const tick = () => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
      setSeconds(remaining)
      if (remaining === 0 && !expiredRef.current) {
        expiredRef.current = true
        onExpireRef.current()
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [endTime])

  return seconds
}
