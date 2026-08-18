import { isDisposableEmail } from './disposableEmails.js'

export function parseLoginBody(body) {
  if (!isPlainObject(body)) {
    return { ok: false, error: 'Invalid login payload.' }
  }

  const { identifier, email, username, password } = body
  const rawIdentifier = identifier ?? email ?? username

  if (!isSafeIdentifier(rawIdentifier) || !isSafePassword(password)) {
    return { ok: false, error: 'Enter a valid username/email and password.' }
  }

  const normalizedIdentifier = normalizeIdentifier(rawIdentifier)

  if (!isValidEmail(normalizedIdentifier) && !isValidUsername(normalizedIdentifier)) {
    return { ok: false, error: 'Use a valid email address or username.' }
  }

  return {
    ok: true,
    identifier: normalizedIdentifier,
    password,
  }
}

export function isPlainObject(value) {
  return value !== null && typeof value === 'object' && Object.getPrototypeOf(value) === Object.prototype
}

export function isSafeIdentifier(value) {
  if (typeof value !== 'string') return false
  const trimmed = value.trim()
  return trimmed.length >= 3 && trimmed.length <= 254 && !/[\u0000-\u001f\u007f]/.test(trimmed)
}

export function isSafePassword(value) {
  return typeof value === 'string' && value.length >= 8 && value.length <= 128 && !/[\u0000-\u001f\u007f]/.test(value)
}

export function normalizeIdentifier(value) {
  const trimmed = value.trim()
  return trimmed.includes('@') ? trimmed.toLowerCase() : trimmed
}

export function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value)
}

export function isValidUsername(value) {
  return /^[A-Za-z][A-Za-z0-9_-]{2,31}$/.test(value)
}

export function parseSignupBody(body) {
  if (!isPlainObject(body)) return { ok: false, field: null, error: 'Invalid signup payload.' }

  const { username, email, password, confirmPassword } = body

  if (!isValidUsername(username ?? '')) {
    return { ok: false, field: 'username', error: 'Username must be 3-32 characters and start with a letter.' }
  }

  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  if (!isValidEmail(trimmedEmail)) {
    return { ok: false, field: 'email', error: 'Enter a valid email address.' }
  }

  if (isDisposableEmail(trimmedEmail)) {
    return { ok: false, field: 'email', error: 'Please use a permanent email address, not a temporary one.' }
  }

  if (!isSafePassword(password)) {
    return { ok: false, field: 'password', error: 'Password must be 8-128 characters.' }
  }

  if (password !== confirmPassword) {
    return { ok: false, field: 'confirmPassword', error: 'Passwords do not match.' }
  }

  return { ok: true, username, email: trimmedEmail, password }
}

export function parseForgotPasswordBody(body) {
  if (!isPlainObject(body)) {
    return { ok: false, error: 'Invalid request payload.' }
  }

  const { email } = body
  const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  if (!isValidEmail(trimmedEmail)) {
    return { ok: false, error: 'Enter a valid email address.' }
  }

  return { ok: true, email: trimmedEmail }
}

export function parseResetPasswordBody(body) {
  if (!isPlainObject(body)) {
    return { ok: false, field: null, error: 'Invalid request payload.' }
  }

  const { token, password, confirmPassword } = body

  if (typeof token !== 'string' || token.length < 16 || token.length > 256) {
    return { ok: false, field: 'token', error: 'Invalid or expired reset link.' }
  }

  if (!isSafePassword(password)) {
    return { ok: false, field: 'password', error: 'Password must be 8-128 characters.' }
  }

  if (password !== confirmPassword) {
    return { ok: false, field: 'confirmPassword', error: 'Passwords do not match.' }
  }

  return { ok: true, token, password }
}
