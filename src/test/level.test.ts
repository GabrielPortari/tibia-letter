import { describe, it, expect } from 'vitest'
import { validateLevelRange } from '../utils/level'

describe('validateLevelRange', () => {
  it('returns true for level exactly at min boundary', () => {
    expect(validateLevelRange(100, 100, 200)).toBe(true)
  })

  it('returns true for level exactly at max boundary', () => {
    expect(validateLevelRange(200, 100, 200)).toBe(true)
  })

  it('returns true for level within range', () => {
    expect(validateLevelRange(150, 100, 200)).toBe(true)
  })

  it('returns false for level below min', () => {
    expect(validateLevelRange(99, 100, 200)).toBe(false)
  })

  it('returns false for level above max', () => {
    expect(validateLevelRange(201, 100, 200)).toBe(false)
  })

  it('handles single-level range', () => {
    expect(validateLevelRange(100, 100, 100)).toBe(true)
    expect(validateLevelRange(101, 100, 100)).toBe(false)
  })
})
