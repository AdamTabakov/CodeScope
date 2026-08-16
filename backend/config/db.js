// CONFIGURATION: Database connection and management

import mongoose from 'mongoose'
import { config } from './env.js'
import { User } from '../models/User.js'

let connected = false

// Connect to MongoDB using Mongoose
export async function connectDb() {
  if (!config.mongoUri) {
    console.warn('[db] MONGODB_URI is not set — running without database (in-memory fallback only).')
    return
  }
  // Attempt to connect to MongoDB
  try {
    await mongoose.connect(config.mongoUri)
    connected = true
    console.log('[db] Connected to MongoDB:', config.mongoUri)
    await ensureEmailIndexes()
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message)
  }
}

// Keep email uniqueness as a partial index that excludes any testing-allowlist
// addresses. Everyone else still gets DB-level unique-email enforcement; only
// the listed addresses may register more than once.
async function ensureEmailIndexes() {
  try {
    const indexes = await User.collection.indexes()
    for (const index of indexes) {
      if (index.key && index.key.email === 1 && index.unique) {
        await User.collection.dropIndex(index.name)
        console.warn(`[db] Dropped unique email index "${index.name}" (recreating as allowlist-aware partial index).`)
      }
    }

    // Unique on email except for allowlisted addresses (e.g. the developer's
    // own email during testing). With an empty allowlist this behaves exactly
    // like a plain unique index.
    await User.collection.createIndex(
      { email: 1 },
      { unique: true, partialFilterExpression: { email: { $nin: config.duplicateEmailAllowlist } } },
    )
    if (config.duplicateEmailAllowlist.length > 0) {
      console.warn(`[db] Duplicate email registration allowed only for: ${config.duplicateEmailAllowlist.join(', ')}`)
    }
  } catch (err) {
    console.warn('[db] Failed to adjust email indexes:', err.message)
  }
}

export function isConnected() {
  return connected
}
