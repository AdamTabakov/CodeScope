// CONFIGURATION: Database connection and management

import mongoose from 'mongoose'
import { config } from './env.js'

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
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message)
  }
}

export function isConnected() {
  return connected
}
