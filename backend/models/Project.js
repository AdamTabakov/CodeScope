import mongoose from 'mongoose'

// A saved scan. Stores repository metadata, the file list, and the chat
// history so a user can reopen a project later. Source-code contents are not
// stored — they are re-fetched from GitHub when a project is reopened.
const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    file: { type: String, default: null },
  },
  { _id: false, timestamps: true },
)

const projectSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    repoUrl: { type: String, required: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    branch: { type: String, default: null },
    meta: {
      owner: String,
      repo: String,
      branch: String,
      fullName: String,
      url: String,
    },
    metrics: { type: mongoose.Schema.Types.Mixed, default: null },
    files: [
      {
        path: String,
        language: String,
        lineCount: Number,
      },
    ],
    messages: [messageSchema],
  },
  { timestamps: true },
)

projectSchema.index({ user: 1, repoUrl: 1 }, { unique: true })

export const Project = mongoose.model('Project', projectSchema)