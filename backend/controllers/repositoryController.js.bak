import rateLimit from 'express-rate-limit'
import { loadRepository } from '../services/repositoryService.js'

// Rate limiter for repository uploads to prevent abuse
export const repositoryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many repository uploads. Please wait before loading another repo.' },
})

// Controller for handling repository uploads
export async function uploadRepository(req, res, next) {
  try {
    const result = await loadRepository(req.body?.url)
    return res.status(200).json(result)
  } catch (err) {
    const message = err.message || 'Could not load that repository.'
    const status = /required|Use the full|Only public/.test(message) ? 400 : 502
    return res.status(status).json({ error: message })
  }
}
