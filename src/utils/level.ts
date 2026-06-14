export function validateLevelRange(
  level: number,
  minLevel: number,
  maxLevel: number,
): boolean {
  return level >= minLevel && level <= maxLevel
}
