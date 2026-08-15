import rateLimit from 'express-rate-limit'
import { answerCodeQuestion } from '../services/chatService.js'

export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait before sending more messages.' },
})

export async function chat(req, res, next) {
  try {
    const { message, context } = req.body

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required.' })
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message must be under 2000 characters.' })
    }

    const { reply, model } = await answerCodeQuestion(message.trim(), context ?? {})
    return res.status(200).json({ reply, model })
  } catch (err) {
    next(err)
  }
}
