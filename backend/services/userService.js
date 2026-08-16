import bcrypt from 'bcryptjs'
import { config } from '../config/env.js'
import { isConnected } from '../config/db.js'
import { isValidEmail } from '../utils/validation.js'
import { User } from '../models/User.js'

const adminUser = config.adminPassword
  ? {
      id: 'admin-adam',
      username: config.adminUsername,
      email: config.adminEmail.toLowerCase(),
      role: 'admin',
      passwordHash: bcrypt.hashSync(config.adminPassword, 12),
    }
  : null

export async function findUserForLogin(identifier) {
  const isEmail = isValidEmail(identifier)
  const mongoSafeQuery = isEmail
    ? { email: { $eq: identifier.toLowerCase() } }
    : { username: { $eq: identifier } }

  if (isConnected()) {
    const user = await User.findOne(mongoSafeQuery).lean()
    return user ? { ...user, id: user._id.toString() } : null
  }

  // In-memory fallback
  if (!adminUser) return null
  if (isEmail && mongoSafeQuery.email.$eq === adminUser.email) return adminUser
  if (!isEmail && mongoSafeQuery.username.$eq === adminUser.username) return adminUser
  return null
}

export async function createUser({ username, email, password }) {
  const passwordHash = await bcrypt.hash(password, 12)
  const user = new User({ username, email: email.toLowerCase(), passwordHash })
  await user.save()
  return user
}

export async function isUsernameTaken(username) {
  return !!(await User.exists({ username: { $eq: username } }))
}

export async function isEmailTaken(email) {
  return !!(await User.exists({ email: { $eq: String(email).trim().toLowerCase() } }))
}

export async function seedAdminUser() {
  if (!config.adminPassword) {
    console.warn('[userService] ADMIN_PASSWORD not set — skipping admin seed.')
    return
  }

  const existing = await User.findOne({
    $or: [
      { username: { $eq: config.adminUsername } },
      { email: { $eq: config.adminEmail.toLowerCase() } },
    ],
  })

  if (existing) return

  const passwordHash = await bcrypt.hash(config.adminPassword, 12)
  await User.create({
    username: config.adminUsername,
    email: config.adminEmail.toLowerCase(),
    passwordHash,
    role: 'admin',
  })
  console.log('[userService] Admin user seeded.')
}
