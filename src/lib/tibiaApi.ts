export interface TibiaCharacter {
  name: string
  level: number
  vocation: string
  world: string
  comment: string
}

export async function fetchTibiaCharacter(name: string): Promise<TibiaCharacter | null> {
  const encoded = encodeURIComponent(name)
  const res = await fetch(`/api/tibia-proxy?name=${encoded}`, {
    signal: AbortSignal.timeout(5000),
  })
  if (!res.ok) return null
  const data = await res.json()
  const char = data?.characters?.character
  if (!char) return null
  return {
    name: char.name,
    level: char.level,
    vocation: char.vocation,
    world: char.world,
    comment: char.comment ?? '',
  }
}
