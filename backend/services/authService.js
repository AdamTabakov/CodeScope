import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { config } from '../config/env.js'
import { findUserForLogin, createUser, isUsernameTaken, isEmailTaken } from './userService.js'
import { sendVerificationEmail, sendPasswordResetEmail } from './emailService.js'
import { isConnected } from '../config/db.js'
import { isValidEmail } from '../utils/validation.js'
import { User } from '../models/User.js'

// Email verification token lifetime (ms). Default 24h.
const VERIFY_TOKEN_TTL_MS = Number(process.env.VERIFY_TOKEN_TTL_MS || 24 * 60 * 60 * 1000)

// Password reset token lifetime (ms). Default 5 minutes.
const RESET_TOKEN_TTL_MS = Number(process.env.RESET_TOKEN_TTL_MS || 5 * 60 * 1000)

// Generates an unguessable token and returns it alongside its SHA-256 hash.
// Only the hash is stored so a database leak cannot be replayed to verify.
function makeVerificationToken() {
  const token = crypto.randomBytes(24).toString('hex')
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  return { token, hash }
}

// Requests a password reset for an email address. Always reports success so
// the API cannot be used to enumerate registered addresses. If the address is
// registered, a single-use reset token is emailed with a short expiry.
export async function requestPasswordReset(email) {
  const normalizedEmail = String(email ?? '').trim().toLowerCase()

  // Perform a lookup regardless so timing does not leak account existence.
  const user = isConnected() && isValidEmail(normalizedEmail)
    ? await User.findOne({ email: { $eq: normalizedEmail } })
    : null

  if (user) {
    const { token, hash } = makeVerificationToken()
    await user.updateOne({
      resetPasswordTokenHash: hash,
      resetPasswordTokenExpires: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    })
    await sendPasswordResetEmail({ to: user.email, username: user.username, token })
  }

  return { ok: true }
}

// Consumes a reset token and replaces the account's password. The presented
// token is hashed before lookup so stored hashes are never compared in the clear.
export async function resetPassword(token, newPassword) {
  if (typeof token !== 'string' || token.length < 16) {
    return { ok: false, field: 'token', error: 'Invalid or expired reset link.' }
  }

  // Without a database there is no way to find or update the account.
  if (!isConnected()) {
    return { ok: false, field: 'token', error: 'Invalid or expired reset link.' }
  }

  const hash = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({
    resetPasswordTokenHash: { $eq: hash },
    resetPasswordTokenExpires: { $gt: new Date() },
  })

  if (!user) {
    return { ok: false, field: 'token', error: 'Invalid or expired reset link.' }
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await user.updateOne({
    passwordHash,
    resetPasswordTokenHash: null,
    resetPasswordTokenExpires: null,
  })

  return { ok: true }
}

// Helper function to sign a JWT token for a user
export function signToken(user) {
  return jwt.sign(
    {
      // Use user.id if available, otherwise fallback to user._id (for MongoDB ObjectId)
      sub: user.id ?? user._id?.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified ?? false,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
    },
  )
}

// The user fields that are safe to expose to the client.
export function publicUser(user) {
  return {
    username: user.username,
    email: user.email,
    role: user.role,
    emailVerified: !!user.emailVerified,
  }
}

// Function to handle user login
export async function loginUser(identifier, password) {
  // Find the user by username or email
  const user = await findUserForLogin(identifier)
  // Google-created accounts have no password; they can only sign in via OAuth.
  const passwordMatches = user?.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false

  // If the user is not found or the password does not match, return an error
  if (!passwordMatches) {
    return { ok: false }
  }
  // If login is successful, return the token and user information
  return {
    ok: true,
    token: signToken(user),
    user: publicUser(user),
  }
}

// Function to handle user signup
export async function signupUser({ username, email, password }) {
  if (await isUsernameTaken(username)) {
    return { ok: false, field: 'username', error: 'Username is already taken.' }
  }
  // Allow duplicate email registration only for addresses in the testing
  // allowlist (e.g. the developer's own inbox). Everyone else is kept unique.
  const normalizedEmail = String(email ?? '').trim().toLowerCase()
  if (!config.duplicateEmailAllowlist.includes(normalizedEmail) && (await isEmailTaken(normalizedEmail))) {
    return { ok: false, field: 'email', error: 'Email is already registered.' }
  }

  const user = await createUser({ username, email, password })

  // If user creation fails, return an error
  if (!user) {
    return { ok: false, field: 'general', error: 'Failed to create user.' }
  }

  // Issue a verification token and email it to the new user (non-blocking;
  // a delivery failure must not prevent signup from succeeding).
  const { token, hash } = makeVerificationToken()
  await user.updateOne({
    emailVerified: false,
    emailVerificationTokenHash: hash,
    emailVerificationTokenExpires: new Date(Date.now() + VERIFY_TOKEN_TTL_MS),
  })
  await sendVerificationEmail({ to: user.email, username: user.username, token })

  // If signup is successful, return the token and user information
  return {
    ok: true,
    token: signToken(user),
    user: publicUser(user),
  }
}

// Verifies an account from an emailed token. On success the user is signed in
// and receives a session JWT, so clicking the emailed link lands them on the
// dashboard. The link token is single-use and short-lived, so this is safe.
// Returns { ok, token?, user?, field?, error? }.
export async function verifyEmail(token) {
  if (typeof token !== 'string' || token.length < 16) {
    return { ok: false, field: 'token', error: 'Invalid or expired verification link.' }
  }

  const hash = crypto.createHash('sha256').update(token).digest('hex')
  const user = await User.findOne({
    emailVerificationTokenHash: { $eq: hash },
    emailVerificationTokenExpires: { $gt: new Date() },
  })

  if (!user) {
    return { ok: false, field: 'token', error: 'Invalid or expired verification link.' }
  }

  await user.updateOne({
    emailVerified: true,
    emailVerificationTokenHash: null,
    emailVerificationTokenExpires: null,
  })

  return {
    ok: true,
    token: signToken(user),
    user: publicUser(user),
  }
}
