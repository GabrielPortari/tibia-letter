import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountdown } from '../hooks/useCountdown'

describe('useCountdown', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('returns initial remaining seconds', () => {
    const end = Date.now() + 5000
    const { result } = renderHook(() => useCountdown(end, vi.fn()))
    expect(result.current).toBeGreaterThanOrEqual(4)
    expect(result.current).toBeLessThanOrEqual(5)
  })

  it('fires onExpire exactly once when timer reaches zero', () => {
    const onExpire = vi.fn()
    const end = Date.now() + 2000
    renderHook(() => useCountdown(end, onExpire))

    act(() => vi.advanceTimersByTime(3000))

    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('does not fire onExpire before timer expires', () => {
    const onExpire = vi.fn()
    const end = Date.now() + 5000
    renderHook(() => useCountdown(end, onExpire))

    act(() => vi.advanceTimersByTime(2000))

    expect(onExpire).not.toHaveBeenCalled()
  })

  it('clears interval on unmount', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearInterval')
    const end = Date.now() + 10000
    const { unmount } = renderHook(() => useCountdown(end, vi.fn()))
    unmount()
    expect(clearSpy).toHaveBeenCalled()
  })
})
