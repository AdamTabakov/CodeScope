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
    await mongoose.connect(config.mongoUri, {
      // Fail fast instead of hanging for the 30s+ driver default when the
      // database is unreachable or sleeping (e.g. a paused Atlas free tier).
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    })
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
//
// Partial index filters only support a small operator set ($ne, $and, $or, ...)
// — $nin/$not are not allowed — so each allowlisted address becomes its own
// $ne constraint ANDed together. With an empty allowlist this behaves exactly
// like a plain unique index.
async function ensureEmailIndexes() {
  try {
    const allowlist = config.duplicateEmailAllowlist
    const spec = { unique: true, key: { email: 1 }, name: 'email_unique' }
    if (allowlist.length > 0) {
      spec.partialFilterExpression =
        allowlist.length === 1
          ? { email: { $ne: allowlist[0] } }
          : { $and: allowlist.map((email) => ({ email: { $ne: email } })) }
    }

    // Build the new index FIRST, then drop the legacy one. Reversing the order
    // (drop then create) leaves the collection without any unique constraint
    // if the rebuild fails, which is what caused the earlier duplicate-key
    // index build error on the production database.
    await User.collection.createIndex({ email: 1 }, spec)

    const indexes = await User.collection.indexes()
    for (const index of indexes) {
      if (index.name === 'email_unique') continue
      if (index.key && index.key.email === 1 && index.unique) {
        await User.collection.dropIndex(index.name)
        console.warn(`[db] Replaced legacy unique email index "${index.name}" with "email_unique".`)
      }
    }
    if (allowlist.length > 0) {
      console.warn(`[db] Duplicate email registration allowed only for: ${allowlist.join(', ')}`)
    }
  } catch (err) {
    console.warn('[db] Failed to adjust email indexes:', err.message)
  }
}

export function isConnected() {
  return connected
}
