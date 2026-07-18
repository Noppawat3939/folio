const CORRECT_PIN = '301039'
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 30_000

const KEY_UNLOCKED = 'folio_unlocked'
const KEY_FAILURES = 'folio_failures'
const KEY_LOCKOUT  = 'folio_lockout_until'

export function verifyPin(input: string) {
  return input === CORRECT_PIN
}

export function isUnlocked() {
  return sessionStorage.getItem(KEY_UNLOCKED) === '1'
}

export function unlock() {
  sessionStorage.setItem(KEY_UNLOCKED, '1')
  clearFailures()
}

export function lock() {
  sessionStorage.removeItem(KEY_UNLOCKED)
}

export function recordFailure(): number {
  const next = getFailureCount() + 1
  localStorage.setItem(KEY_FAILURES, String(next))
  if (next >= MAX_ATTEMPTS) {
    localStorage.setItem(KEY_LOCKOUT, String(Date.now() + LOCKOUT_MS))
  }
  return next
}

export function getFailureCount(): number {
  return parseInt(localStorage.getItem(KEY_FAILURES) ?? '0', 10)
}

export function clearFailures() {
  localStorage.removeItem(KEY_FAILURES)
  localStorage.removeItem(KEY_LOCKOUT)
}

export function getLockoutUntil(): number | null {
  const raw = localStorage.getItem(KEY_LOCKOUT)
  if (!raw) return null
  const until = parseInt(raw, 10)
  if (Date.now() >= until) {
    localStorage.removeItem(KEY_LOCKOUT)
    return null
  }
  return until
}
