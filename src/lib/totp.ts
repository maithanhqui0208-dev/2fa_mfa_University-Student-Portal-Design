// RFC 6238 (TOTP) + RFC 4226 (HOTP) implementation using the Web Crypto API.
// This runs entirely client-side (no backend) for demo/coursework purposes.

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const PERIOD_SECONDS = 30
const DIGITS = 6
const WINDOW = 1 // accept 1 step before/after to tolerate clock drift

// ---- Base32 ----------------------------------------------------------

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0
  let value = 0
  let output = ''
  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i]
    bits += 8
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) output += BASE32_ALPHABET[(value << (5 - bits)) & 31]
  return output
}

export function base32Decode(secret: string): Uint8Array {
  const clean = secret.replace(/=+$/, '').toUpperCase().replace(/[^A-Z2-7]/g, '')
  let bits = 0
  let value = 0
  const bytes: number[] = []
  for (const char of clean) {
    const idx = BASE32_ALPHABET.indexOf(char)
    if (idx === -1) continue
    value = (value << 5) | idx
    bits += 5
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  return new Uint8Array(bytes)
}

// ---- Secret / URI ------------------------------------------------------

export function generateSecret(byteLength = 20): string {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return base32Encode(bytes)
}

export function buildOtpAuthUri(secret: string, accountName: string, issuer = 'UTH Portal'): string {
  const label = encodeURIComponent(`${issuer}:${accountName}`)
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: String(DIGITS),
    period: String(PERIOD_SECONDS),
  })
  return `otpauth://totp/${label}?${params.toString()}`
}

// ---- HOTP / TOTP core ----------------------------------------------------

function intToBytes(num: number): Uint8Array {
  // 8-byte big-endian counter
  const buf = new ArrayBuffer(8)
  const view = new DataView(buf)
  // JS numbers are safe ints up to 2^53; counter fits in the low 32 bits for centuries
  view.setUint32(4, num, false)
  return new Uint8Array(buf)
}

async function hmacSha1(keyBytes: Uint8Array, msgBytes: Uint8Array): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes.buffer.slice(keyBytes.byteOffset, keyBytes.byteOffset + keyBytes.byteLength) as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    msgBytes.buffer.slice(msgBytes.byteOffset, msgBytes.byteOffset + msgBytes.byteLength) as ArrayBuffer
  )
  return new Uint8Array(sig)
}

async function hotp(secretBytes: Uint8Array, counter: number, digits = DIGITS): Promise<string> {
  const hash = await hmacSha1(secretBytes, intToBytes(counter))
  const offset = hash[hash.length - 1] & 0xf
  const binCode =
    ((hash[offset] & 0x7f) << 24) |
    ((hash[offset + 1] & 0xff) << 16) |
    ((hash[offset + 2] & 0xff) << 8) |
    (hash[offset + 3] & 0xff)
  const code = (binCode % 10 ** digits).toString().padStart(digits, '0')
  return code
}

export function currentStep(time = Date.now(), period = PERIOD_SECONDS): number {
  return Math.floor(time / 1000 / period)
}

export async function generateTOTP(secret: string, time = Date.now()): Promise<string> {
  const secretBytes = base32Decode(secret)
  return hotp(secretBytes, currentStep(time))
}

// Seconds remaining before the current code rotates
export function secondsRemaining(time = Date.now(), period = PERIOD_SECONDS): number {
  return period - (Math.floor(time / 1000) % period)
}

/**
 * Verify a 6-digit token against the secret, tolerating +-WINDOW steps of clock drift.
 * `lastUsedStep` (if provided) blocks replay of a code within the same or earlier step.
 * Returns the matched step on success (so the caller can persist it as lastUsedStep), or null.
 */
export async function verifyTOTP(
  secret: string,
  token: string,
  opts: { time?: number; lastUsedStep?: number } = {}
): Promise<number | null> {
  const clean = token.replace(/\D/g, '')
  if (clean.length !== DIGITS) return null
  const secretBytes = base32Decode(secret)
  const step = currentStep(opts.time)
  for (let errorWindow = -WINDOW; errorWindow <= WINDOW; errorWindow++) {
    const candidateStep = step + errorWindow
    if (opts.lastUsedStep != null && candidateStep <= opts.lastUsedStep) continue // anti-replay
    const candidate = await hotp(secretBytes, candidateStep)
    if (candidate === clean) return candidateStep
  }
  return null
}

// ---- Recovery codes ------------------------------------------------------

export function generateRecoveryCodes(count = 8): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const bytes = new Uint8Array(5)
    crypto.getRandomValues(bytes)
    const raw = base32Encode(bytes).slice(0, 8)
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4, 8)}`)
  }
  return codes
}
