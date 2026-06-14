import { describe, it, expect } from 'vitest'
import { fmt, overlap } from '../utils/time'

describe('fmt', () => {
  it('formats seconds below 1 minute', () => {
    expect(fmt(45)).toBe('0:45')
  })

  it('formats exactly 1 minute', () => {
    expect(fmt(60)).toBe('1:00')
  })

  it('formats minutes and seconds', () => {
    expect(fmt(125)).toBe('2:05')
  })

  it('formats with hours', () => {
    expect(fmt(3661)).toBe('1:01:01')
  })

  it('returns 0:00 for zero or negative', () => {
    expect(fmt(0)).toBe('0:00')
    expect(fmt(-1)).toBe('0:00')
  })
})

describe('overlap', () => {
  const base = '2025-01-01T00:00:00Z'

  function iso(offsetMs: number) {
    return new Date(new Date(base).getTime() + offsetMs).toISOString()
  }

  it('detects overlapping ranges', () => {
    expect(overlap(iso(0), iso(3000), iso(1000), iso(4000))).toBe(true)
  })

  it('detects non-overlapping ranges', () => {
    expect(overlap(iso(0), iso(1000), iso(2000), iso(3000))).toBe(false)
  })

  it('adjacent ranges do not overlap', () => {
    expect(overlap(iso(0), iso(1000), iso(1000), iso(2000))).toBe(false)
  })

  it('one range fully contained in another', () => {
    expect(overlap(iso(0), iso(5000), iso(1000), iso(2000))).toBe(true)
  })
})
