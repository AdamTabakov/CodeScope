import rateLimit from 'express-rate-limit'
// Note: express-rate-limit defaults to in-memory storage, meaning rate limits
// reset per server instance and don't work correctly with multiple processes.
// For production with multiple instances, configure a Redis store:
// npm install rate-limit-redis --save
// const redis = require('redis').createClient({ url: process.env.REDIS_URL })
// const chatLimiter = rateLimit({ store: new (require('rate-limit-redis')).RedisStore({ client: redis }) })

// Rate limiter for chat requests to prevent abuse
// 60 requests per 15 minutes per IP
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