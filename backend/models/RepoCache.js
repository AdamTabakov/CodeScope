import mongoose from 'mongoose'

const cacheSchema = new mongoose.Schema({
  hash: { type: String, required: true, index: true },
  repoUrl: { type: String, required: true },
  branch: { type: String, default: null },
  result: { type: mongoose.Schema.Types.Mixed, required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true })

// TTL index: documents auto-remove after 7 days
cacheSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 })

export const RepoCache = mongoose.model('RepoCache', cacheSchema)