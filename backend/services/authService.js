import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'node:crypto'
import { config } from '../config/env.js'
import { findUserForLogin, createUser, isUsernameTaken, isEmailTaken } from './userService.js'
import { sendVerificationEmail } from './emailService.js'
import { User } from '../models/User.js'

// Email verification token lifetime (ms). Default 24h.
const VERIFY_TOKEN_TTL_MS = Number(process.env.VERIFY_TOKEN_TTL_MS || 24 * 60 * 60 * 1000)

// Generates an unguessable token and returns it alongside its SHA-256 hash.
// Only the hash is stored so a database leak cannot be replayed to verify.
function makeVerificationToken() {
  const token = crypto.randomBytes(24).toString('hex')
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  return { token, hash }
}

// Helper function to sign a JWT token for a user
function signToken(user) {
  return jwt.sign(
    {
      // Use user.id if available, otherwise fallback to user._id (for MongoDB ObjectId)
      sub: user.id ?? user._id?.toString(),
      username: user.username,
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

// Function to handle user login
export async function loginUser(identifier, password) {
  // Find the user by username or email
  const user = await findUserForLogin(identifier)
  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false

  // If the user is not found or the password does not match, return an error
  if (!passwordMatches) {
    return { ok: false }
  }
  // If login is successful, return the token and user information
  return {
    ok: true,
    token: signToken(user),
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
      emailVerified: !!user.emailVerified,
    },
  }
}

// Function to handle user signup
export async function signupUser({ username, email, password }) {
  if (await isUsernameTaken(username)) {
    return { ok: false, field: 'username', error: 'Username is already taken.' }
  }
  if (await isEmailTaken(email)) {
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
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
      emailVerified: false,
    },
  }
}

// Verifies an account from an emailed token. Returns { ok, field?, error? }.
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

  return { ok: true, user: { username: user.username, email: user.email } }
}
