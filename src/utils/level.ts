export function validateLevelRange(level: number, minLevel?: number): boolean {
  if (minLevel && level < minLevel) return false
  return true
}
