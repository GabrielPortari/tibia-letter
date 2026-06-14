import DOMPurify from 'dompurify'

export function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] })
}

const CHAR_NAME_REGEX = /^[a-zA-Z\s]{2,30}$/

export function validateCharacterName(name: string): boolean {
  return CHAR_NAME_REGEX.test(name)
}

const CODE_REGEX = /^TL-[A-Z0-9]{6}$/

export function validateCode(code: string): boolean {
  return CODE_REGEX.test(code)
}

export function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const arr = new Uint8Array(6)
  crypto.getRandomValues(arr)
  const suffix = Array.from(arr)
    .map((b) => chars[b % chars.length])
    .join('')
  return `TL-${suffix}`
}
