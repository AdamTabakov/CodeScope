import { config } from '../config/env.js'
import { isConnected } from '../config/db.js'
import { User } from '../models/User.js'
import { isUsernameTaken } from './userService.js'
import { isDisposableEmail } from '../utils/disposableEmails.js'

const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const GOOGLE_USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/userinfo'

// The exact redirect_uri Google must call back to. It has to match a URI
// registered in the Google Cloud console for this client.
export function googleCallbackUrl() {
  return `${config.appUrl.replace(/\/+$/, '')}/api/auth/google/callback`
}

// Builds the Google consent URL. `state` ties the callback to this session.
export function buildGoogleAuthUrl(state) {
  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: googleCallbackUrl(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
    access_type: 'online',
  })
  return `${GOOGLE_AUTH_ENDPOINT}?${params.toString()}`
}

// Exchanges the one-time authorization code for the user's Google profile.
// Throws on any failure; the caller turns that into a redirect to login.
export async function exchangeCodeForUser(code) {
  const tokenResponse = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: config.googleClientId,
      client_secret: config.googleClientSecret,
      redirect_uri: googleCallbackUrl(),
      grant_type: 'authorization_code',
    }),
  })

  if (!tokenResponse.ok) {
    throw new Error('Google token exchange failed.')
  }
  const tokenData = await tokenResponse.json()
  const accessToken = tokenData.access_token
  if (!accessToken) {
    throw new Error('Google token exchange returned no access token.')
  }

  const userInfoResponse = await fetch(GOOGLE_USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!userInfoResponse.ok) {
    throw new Error('Google profile lookup failed.')
  }
  const profile = await userInfoResponse.json()

  // Only accept addresses Google has verified, otherwise anyone could claim an
  // arbitrary email on signup.
  if (!profile.email || !profile.email_verified) {
    throw new Error('Google account email is not verified.')
  }

  return profile
}

// Finds the user backing a Google profile, linking or creating the account as
// needed. Returns { ok, user } or { ok: false, error }.
export async function findOrCreateGoogleUser(profile) {
  if (!isConnected()) {
    return { ok: false, error: 'Signup is currently unavailable.' }
  }

  const email = String(profile.email ?? '').trim().toLowerCase()
  const googleId = String(profile.sub ?? '')

  if (isDisposableEmail(email)) {
    return { ok: false, error: 'Please use a permanent email address, not a temporary one.' }
  }

  // Existing Google account — sign them in.
  const existingGoogle = await User.findOne({ googleId: { $eq: googleId } })
  if (existingGoogle) {
    return { ok: true, user: existingGoogle }
  }

  // An account with the same verified email already exists (created with a
  // password). Link Google as a sign-in method.
  const existingEmail = await User.findOne({ email: { $eq: email } })
  if (existingEmail) {
    await existingEmail.updateOne({ googleId, authProvider: 'google' })
    return { ok: true, user: existingEmail }
  }

  const username = await uniqueUsernameFromEmail(email)
  const user = await User.create({
    username,
    email,
    googleId,
    authProvider: 'google',
    emailVerified: true,
  })
  return { ok: true, user }
}

// Derives a username from a Google email prefix and guarantees it is unique.
async function uniqueUsernameFromEmail(email) {
  const base = String(email.split('@')[0] ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '')
    .replace(/^[^a-z]+/, '')
  let stem = (base || 'user').slice(0, 28)
  while (stem.length < 3) stem += 'x'

  if (!(await isUsernameTaken(stem))) return stem
  for (let i = 1; i < 1000; i += 1) {
    const candidate = `${stem.slice(0, 32 - String(i).length)}${i}`
    if (!(await isUsernameTaken(candidate))) return candidate
  }
  return `${stem.slice(0, 30)}${Date.now().toString(36).slice(-2)}`
}