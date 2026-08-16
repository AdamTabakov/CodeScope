import rateLimit from 'express-rate-limit'
import { streamAnswerCodeQuestion } from '../services/chatService.js'

// Rate limiter for chat requests to prevent abuse
export const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please wait before sending more messages.' },
})

// Controller for handling chat requests. Responds with a Server-Sent Events
// stream: each `data:` frame is either { delta } (incremental text) or
// { done, model } (terminal frame), or { error } when something goes wrong.
export async function chat(req, res, next) {
  try {
    const { message, context } = req.body

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required.' })
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message must be under 2000 characters.' })
    }

    res.status(200).set({
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    })
    res.flushHeaders()

    // Stop writing if the client closes the connection early.
    let aborted = false
    req.on('close', () => { aborted = true })

    await streamAnswerCodeQuestion(
      message.trim(),
      context ?? {},
      (delta) => { if (!aborted) res.write(`data: ${JSON.stringify({ delta })}\n\n`) },
      (info) => {
        if (!aborted) {
          res.write(`data: ${JSON.stringify({ done: true, model: info.model })}\n\n`)
          res.end()
        }
      },
    )
  } catch (err) {
    if (res.headersSent) {
      try {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`)
        res.end()
      } catch { /* connection already closed */ }
      return
    }
    return next(err)
  }
}
