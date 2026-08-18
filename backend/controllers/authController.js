import crypto from 'node:crypto'
import { loginUser, signupUser, verifyEmail, requestPasswordReset, resetPassword, signToken } from '../services/authService.js'
import { buildGoogleAuthUrl, exchangeCodeForUser, findOrCreateGoogleUser } from '../services/googleAuthService.js'
import { parseLoginBody, parseSignupBody, parseForgotPasswordBody, parseResetPasswordBody } from '../utils/validation.js'
import { isConnected } from '../config/db.js'
import { config } from '../config/env.js'

const OAUTH_STATE_COOKIE = 'google_oauth_state'
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000

// Reads a cookie value without needing a cookie-parsing dependency.
function readCookie(header, name) {
  if (!header) return undefined
  const match = String(header).match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : undefined
}

// Controller for handling user login
export async function login(request, response, next) {
  // Validate and parse the request body for login
  try {
    const parsed = parseLoginBody(request.body)
    // Check if the parsed data is valid
    if (!parsed.ok) {
      return response.status(400).json({ error: parsed.error })
    }

    // Attempt to log in the user with the provided identifier and password
    const result = await loginUser(parsed.identifier, parsed.password)

    // Check if the login was successful
    if (!result.ok) {
      return response.status(401).json({ error: 'Invalid username/email or password.' })
    }

    return response.json({
      token: result.token,
      user: result.user,
    })
  } catch (error) {
    return next(error)
  }
}

// Controller for handling user signup
export async function signup(request, response, next) {
  // Validate and parse the request body for signup
  try {
    if (!isConnected()) {
      return response.status(503).json({ error: 'Signup is currently unavailable.' })
    }

    // Parse and validate the signup request body
    const parsed = parseSignupBody(request.body)
    if (!parsed.ok) {
      return response.status(400).json({ field: parsed.field, error: parsed.error })
    }

    // Attempt to sign up the user with the provided data
    const result = await signupUser(parsed)
    if (!result.ok) {
      return response.status(409).json({ field: result.field, error: result.error })
    }

    return response.status(201).json({ token: result.token, user: result.user })
  } catch (error) {
    return next(error)
  }
}

// Controller for verifying an email address via the link emailed at signup.
// This is public: the emailed token itself is the credential. On success the
// user is signed in and receives a session token.
export async function verifyEmailAddress(request, response, next) {
  try {
    const token = request.query?.token
    const result = await verifyEmail(token)
    if (!result.ok) {
      return response.status(400).json({ field: result.field, error: result.error })
    }
    return response.json({ token: result.token, user: result.user })
  } catch (error) {
    return next(error)
  }
}

// Requests a password reset email. Always returns success so the response
// cannot reveal whether the address is registered.
export async function forgotPassword(request, response, next) {
  try {
    const parsed = parseForgotPasswordBody(request.body)
    if (!parsed.ok) {
      return response.status(400).json({ error: parsed.error })
    }

    await requestPasswordReset(parsed.email)

    return response.json({ ok: true })
  } catch (error) {
    return next(error)
  }
}

// Completes a password reset using the token from the emailed link.
export async function resetPasswordEndpoint(request, response, next) {
  try {
    const parsed = parseResetPasswordBody(request.body)
    if (!parsed.ok) {
      return response.status(400).json({ field: parsed.field, error: parsed.error })
    }

    const result = await resetPassword(parsed.token, parsed.password)
    if (!result.ok) {
      return response.status(400).json({ field: result.field, error: result.error })
    }

    return response.json({ ok: true })
  } catch (error) {
    return next(error)
  }
}

// Starts a Google OAuth flow: sets a state cookie and redirects to Google's
// consent screen. Credentials stay server-side.
export async function googleAuth(request, response, next) {
  try {
    if (!config.googleClientId || !config.googleClientSecret) {
      return response.status(503).json({ error: 'Google sign-in is currently unavailable.' })
    }

    const state = crypto.randomBytes(24).toString('hex')
    response.cookie(OAUTH_STATE_COOKIE, state, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: OAUTH_STATE_TTL_MS,
      secure: config.isProd,
      path: '/',
    })
    return response.redirect(buildGoogleAuthUrl(state))
  } catch (error) {
    return next(error)
  }
}

// Handles the redirect back from Google. Verifies the state cookie, exchanges
// the code, and signs the user in by redirecting to the frontend callback with
// a fresh session token.
export async function googleAuthCallback(request, response, next) {
  const expectedState = readCookie(request.headers.cookie, OAUTH_STATE_COOKIE)
  response.clearCookie(OAUTH_STATE_COOKIE, { path: '/' })

  const { code, state, error } = request.query
  if (!expectedState || !state || state !== expectedState || !code || error) {
    return response.redirect(`${config.frontendUrl}/login?googleError=1`)
  }

  try {
    const profile = await exchangeCodeForUser(code)
    const result = await findOrCreateGoogleUser(profile)
    if (!result.ok) {
      return response.redirect(`${config.frontendUrl}/login?googleError=2`)
    }
    const token = signToken(result.user)
    return response.redirect(`${config.frontendUrl}/auth/callback?token=${encodeURIComponent(token)}`)
  } catch (error) {
    console.error('Google sign-in failed:', error)
    return response.redirect(`${config.frontendUrl}/login?googleError=1`)
  }
}

// Returns the authenticated user for a valid Bearer token.
export async function me(request, response) {
  const { username, email, role, emailVerified } = request.user
  return response.json({
    user: { username, email, role, emailVerified: !!emailVerified },
  })
}
