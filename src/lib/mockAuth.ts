// Client-side "backend" simulation for the auth + MFA demo.
// Persists to localStorage so the flow survives page reloads.
// NOTE: this is a coursework/demo stand-in, not a production auth backend.

import { buildOtpAuthUri, generateRecoveryCodes, generateSecret, verifyTOTP } from './totp'

const USERS_KEY = 'uth_portal_users'
const SESSION_KEY = 'uth_portal_session'

export interface RecoveryCodeEntry {
  code: string
  used: boolean
}

export interface UserRecord {
  email: string
  passwordHash: string
  fullName: string
  mfaEnabled: boolean
  mfaSecret: string | null
  pendingMfaSecret: string | null
  recoveryCodes: RecoveryCodeEntry[]
  lastUsedStep: number | null
  mfaFailedAttempts: number
  mfaLockUntil: number | null
  loginFailedAttempts: number
  loginLockUntil: number | null
}

type UserStore = Record<string, UserRecord>

// ---- low level storage ----------------------------------------------------

function readUsers(): UserStore {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeUsers(store: UserStore) {
  localStorage.setItem(USERS_KEY, JSON.stringify(store))
}

async function sha256(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

// ---- registration / login --------------------------------------------------

export async function registerUser(email: string, password: string, fullName: string) {
  const store = readUsers()
  const key = normalizeEmail(email)
  store[key] = {
    email: key,
    passwordHash: await sha256(password),
    fullName,
    mfaEnabled: false,
    mfaSecret: null,
    pendingMfaSecret: null,
    recoveryCodes: [],
    lastUsedStep: null,
    mfaFailedAttempts: 0,
    mfaLockUntil: null,
    loginFailedAttempts: 0,
    loginLockUntil: null,
  }
  writeUsers(store)
}

export function getUser(email: string): UserRecord | null {
  return readUsers()[normalizeEmail(email)] || null
}

// Seeds a demo account on first use so the login/MFA flow works without a
// separate registration step. Idempotent - does nothing if already present.
export async function ensureDemoUser(email: string, fullName: string, defaultPassword: string) {
  const store = readUsers()
  const key = normalizeEmail(email)
  if (store[key]) return
  store[key] = {
    email: key,
    passwordHash: await sha256(defaultPassword),
    fullName,
    mfaEnabled: false,
    mfaSecret: null,
    pendingMfaSecret: null,
    recoveryCodes: [],
    lastUsedStep: null,
    mfaFailedAttempts: 0,
    mfaLockUntil: null,
    loginFailedAttempts: 0,
    loginLockUntil: null,
  }
  writeUsers(store)
}

export function regenerateRecoveryCodes(email: string): string[] {
  const store = readUsers()
  const key = normalizeEmail(email)
  const user = store[key]
  if (!user || !user.mfaEnabled) return []
  const codes = generateRecoveryCodes()
  user.recoveryCodes = codes.map(code => ({ code, used: false }))
  writeUsers(store)
  return codes
}

export function disableMfa(email: string) {
  const store = readUsers()
  const key = normalizeEmail(email)
  const user = store[key]
  if (!user) return
  user.mfaEnabled = false
  user.mfaSecret = null
  user.pendingMfaSecret = null
  user.recoveryCodes = []
  user.lastUsedStep = null
  writeUsers(store)
}

const LOGIN_LOCK_THRESHOLD = 5
const LOGIN_LOCK_MS = 30_000

export type LoginResult =
  | { ok: true; mfaRequired: boolean }
  | { ok: false; reason: 'not_found' | 'wrong_password' | 'locked'; retryAfterMs?: number }

export async function loginUser(email: string, password: string): Promise<LoginResult> {
  const store = readUsers()
  const key = normalizeEmail(email)
  const user = store[key]
  if (!user) return { ok: false, reason: 'not_found' }

  if (user.loginLockUntil && Date.now() < user.loginLockUntil) {
    return { ok: false, reason: 'locked', retryAfterMs: user.loginLockUntil - Date.now() }
  }

  const hash = await sha256(password)
  if (hash !== user.passwordHash) {
    user.loginFailedAttempts += 1
    if (user.loginFailedAttempts >= LOGIN_LOCK_THRESHOLD) {
      user.loginLockUntil = Date.now() + LOGIN_LOCK_MS
      user.loginFailedAttempts = 0
    }
    writeUsers(store)
    return { ok: false, reason: 'wrong_password' }
  }

  user.loginFailedAttempts = 0
  user.loginLockUntil = null
  writeUsers(store)
  return { ok: true, mfaRequired: user.mfaEnabled }
}

// ---- MFA enrollment ----------------------------------------------------

export function startMfaEnrollment(email: string): { secret: string; otpauthUri: string } {
  const store = readUsers()
  const key = normalizeEmail(email)
  const user = store[key]
  if (!user) throw new Error('User not found')
  const secret = generateSecret()
  user.pendingMfaSecret = secret
  writeUsers(store)
  return { secret, otpauthUri: buildOtpAuthUri(secret, key, 'UTH Portal') }
}

export async function confirmMfaEnrollment(
  email: string,
  token: string
): Promise<{ ok: true; recoveryCodes: string[] } | { ok: false }> {
  const store = readUsers()
  const key = normalizeEmail(email)
  const user = store[key]
  if (!user || !user.pendingMfaSecret) return { ok: false }

  const matchedStep = await verifyTOTP(user.pendingMfaSecret, token)
  if (matchedStep == null) return { ok: false }

  const recoveryCodes = generateRecoveryCodes()
  user.mfaSecret = user.pendingMfaSecret
  user.pendingMfaSecret = null
  user.mfaEnabled = true
  user.lastUsedStep = matchedStep
  user.recoveryCodes = recoveryCodes.map(code => ({ code, used: false }))
  writeUsers(store)
  return { ok: true, recoveryCodes }
}

// ---- MFA verification (login step 2) --------------------------------------

const MFA_LOCK_THRESHOLD = 5
const MFA_LOCK_MS = 30_000

export type MfaVerifyResult =
  | { ok: true }
  | { ok: false; reason: 'invalid' | 'locked'; retryAfterMs?: number }

export async function verifyMfaCode(email: string, token: string): Promise<MfaVerifyResult> {
  const store = readUsers()
  const key = normalizeEmail(email)
  const user = store[key]
  if (!user || !user.mfaSecret) return { ok: false, reason: 'invalid' }

  if (user.mfaLockUntil && Date.now() < user.mfaLockUntil) {
    return { ok: false, reason: 'locked', retryAfterMs: user.mfaLockUntil - Date.now() }
  }

  const matchedStep = await verifyTOTP(user.mfaSecret, token, { lastUsedStep: user.lastUsedStep ?? undefined })
  if (matchedStep == null) {
    user.mfaFailedAttempts += 1
    if (user.mfaFailedAttempts >= MFA_LOCK_THRESHOLD) {
      user.mfaLockUntil = Date.now() + MFA_LOCK_MS
      user.mfaFailedAttempts = 0
    }
    writeUsers(store)
    return { ok: false, reason: 'invalid' }
  }

  user.lastUsedStep = matchedStep
  user.mfaFailedAttempts = 0
  user.mfaLockUntil = null
  writeUsers(store)
  issueSession(key)
  return { ok: true }
}

export function verifyRecoveryCode(email: string, rawCode: string): boolean {
  const store = readUsers()
  const key = normalizeEmail(email)
  const user = store[key]
  if (!user) return false
  const code = rawCode.trim().toUpperCase()
  const entry = user.recoveryCodes.find(c => c.code === code && !c.used)
  if (!entry) return false
  entry.used = true
  writeUsers(store)
  issueSession(key)
  return true
}

// ---- session (mock JWT) ----------------------------------------------------

function base64url(input: string) {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function issueSession(email: string) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = base64url(
    JSON.stringify({ sub: email, iat: Date.now(), exp: Date.now() + 60 * 60 * 1000 })
  )
  // Demo-only "signature" - not cryptographically meaningful, just JWT-shaped.
  const signature = base64url(`${header}.${payload}`).slice(0, 32)
  const token = `${header}.${payload}.${signature}`
  localStorage.setItem(SESSION_KEY, token)
  return token
}

export function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY)
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}
