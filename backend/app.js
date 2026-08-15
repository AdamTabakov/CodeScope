import express from 'express'
import helmet from 'helmet'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import apiRouter from './routes/api.js'
import { errorHandler, apiNotFound } from './middleware/errorHandler.js'

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendDist = path.resolve(__dirname, '../frontend/dist')
const healthBody = '{"status":"ok","service":"codescope-homepage"}'

app.disable('x-powered-by')

app.use((request, response, next) => {
  if (request.method === 'GET' && request.url === '/api/health') {
    response.statusCode = 200
    response.setHeader('Content-Type', 'application/json; charset=utf-8')
    response.setHeader('Content-Length', Buffer.byteLength(healthBody))
    response.end(healthBody)
    return
  }
  next()
})

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
)
app.use(express.json({ limit: '256kb', strict: true }))

app.use('/api', apiRouter)

// Return JSON 404 for any /api/* path that didn't match a route
// (must come before the static-file handler, which would otherwise serve index.html)
app.use('/api', apiNotFound)

app.use(express.static(frontendDist))

app.get('*splat', (_request, response) => {
  response.sendFile(path.join(frontendDist, 'index.html'))
})

app.use(errorHandler)

export default app
