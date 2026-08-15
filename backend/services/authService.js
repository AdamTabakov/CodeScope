import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'
import { findUserForLogin, createUser, isUsernameTaken, isEmailTaken } from './userService.js'

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id ?? user._id?.toString(),
      username: user.username,
      role: user.role,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpiresIn,
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
    },
  )
}

export async function loginUser(identifier, password) {
  const user = await findUserForLogin(identifier)
  const passwordMatches = user ? await bcrypt.compare(password, user.passwordHash) : false

  if (!passwordMatches) {
    return { ok: false }
  }

  return {
    ok: true,
    token: signToken(user),
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
    },
  }
}

export async function signupUser({ username, email, password }) {
  if (await isUsernameTaken(username)) {
    return { ok: false, field: 'username', error: 'Username is already taken.' }
  }
  if (await isEmailTaken(email)) {
    return { ok: false, field: 'email', error: 'Email is already registered.' }
  }

  const user = await createUser({ username, email, password })

  return {
    ok: true,
    token: signToken(user),
    user: {
      username: user.username,
      email: user.email,
      role: user.role,
    },
  }
}
