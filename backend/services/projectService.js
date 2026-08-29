import mongoose from 'mongoose'
import { Project } from '../models/Project.js'

const MAX_MESSAGES = 200
const MAX_CONTENT_CHARS = 20000

function stringOr(value, max, fallback = '') {
  return typeof value === 'string' ? value.slice(0, max) : fallback
}

// Normalize and bound a client-supplied project payload before storage.
function normalize(payload = {}) {
  const repoUrl = stringOr(payload.repoUrl, 2048)
  const fullName = stringOr(payload.fullName, 512)
  if (!repoUrl || !fullName) {
    throw new Error('Project requires a repository URL and full name.')
  }
  const meta = payload.meta && typeof payload.meta === 'object'
    ? {
        owner: stringOr(payload.meta.owner, 256),
        repo: stringOr(payload.meta.repo, 256),
        branch: stringOr(payload.meta.branch, 256, payload.branch ?? null),
        fullName: stringOr(payload.meta.fullName, 512, fullName),
        url: stringOr(payload.meta.url, 2048, repoUrl),
      }
    : { fullName, url: repoUrl, branch: payload.branch ?? null }
  const files = Array.isArray(payload.files)
    ? payload.files.slice(0, 800).map((file) => ({
        path: stringOr(file.path, 1024),
        language: stringOr(file.language, 64, 'Other') || 'Other',
        lineCount: Number(file.lineCount) || 0,
      }))
    : []


  const messages = Array.isArray(payload.messages)
    ? payload.messages
        .slice(-MAX_MESSAGES)
        .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
        .map((m) => ({
          role: m.role,
          content: m.content.slice(0, MAX_CONTENT_CHARS),
          file: stringOr(m.file, 1024, null),
        }))
    : []

  return { repoUrl, fullName, branch: meta.branch, meta, files, messages }
}

// Save or update the user's project for a repository.
export async function saveProject(userId, payload) {
  const data = normalize(payload)
  const project = await Project.findOneAndUpdate(
    { user: userId, repoUrl: data.repoUrl },
    {
      $set: {
        fullName: data.fullName,
        branch: data.branch,
        meta: data.meta,
        metrics: payload.metrics && typeof payload.metrics === 'object' ? payload.metrics : null,
        files: data.files,
        messages: data.messages,
      },
      $setOnInsert: { user: userId, repoUrl: data.repoUrl },
    },
    { returnDocument: 'after', upsert: true, runValidators: true },
  )
  return project
}
// List all projects for a user, sorted by last update.
export async function listProjects(userId) {
  const projects = await Project.find({ user: userId })
    .sort({ updatedAt: -1 })
    .select('repoUrl fullName branch updatedAt metrics messages')
    .lean()
  return projects.map((p) => ({
    id: String(p._id),
    repoUrl: p.repoUrl,
    fullName: p.fullName,
    branch: p.branch,
    updatedAt: p.updatedAt,
    filesRetrieved: p.metrics?.filesRetrieved ?? 0,
    linesOfCode: p.metrics?.linesOfCode ?? 0,
    languages: Array.isArray(p.metrics?.languages) ? p.metrics.languages : [],
    messageCount: p.messages?.length ?? 0,
    lastMessage: p.messages?.[p.messages.length - 1]?.content?.slice(0, 120) ?? '',
  }))
}

// Get a specific project by ID for a user.
export async function getProject(userId, projectId) {
  if (!mongoose.isValidObjectId(projectId)) throw new Error('Project not found.')
  const project = await Project.findOne({ _id: projectId, user: userId }).lean()
  if (!project) throw new Error('Project not found.')
  return project
}
// Delete a project by ID for a user.
export async function deleteProject(userId, projectId) {
  if (!mongoose.isValidObjectId(projectId)) throw new Error('Project not found.')
  const result = await Project.deleteOne({ _id: projectId, user: userId })
  if (!result.deletedCount) throw new Error('Project not found.')
}
