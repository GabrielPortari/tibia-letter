export function validateLevelRange(level: number, minLevel?: number, maxLevel?: number): boolean {
  if (minLevel && level < minLevel) return false
  if (maxLevel && level > maxLevel) return false
  return true
}
