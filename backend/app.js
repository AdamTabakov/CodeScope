import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mongoose from 'mongoose'
import apiRouter from './routes/api.js'
import { errorHandler, apiNotFound } from './middleware/errorHandler.js'
import { config } from './config/env.js'

// Initialize the Express app.a
const app = express()

// Trust the first proxy hop for rate limiting and CORS origin validation.
app.set('trust proxy', 1)

// Resolve the path to the frontend dist folder.
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendDist = path.resolve(__dirname, '../frontend/dist')

// Check if the frontend dist folder exists.
const servesFrontend = fs.existsSync(path.join(frontendDist, 'index.html'))
const healthBody = '{"status":"ok","service":"codescope-homepage"}'

// Disable the X-Powered-By header to avoid exposing the server technology.
app.disable('x-powered-by')

// Serve the health endpoint with MongoDB connectivity check.
app.use((request, response, next) => {
  if (request.method === 'GET' && request.url === '/api/health') {
    // Perform lightweight MongoDB connectivity check
    const mongoUri = process.env.MONGODB_URI || ''
    if (mongoUri) {
      try {
        if (mongoose.connection.readyState === 1) {
          response.statusCode = 200
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.setHeader('Content-Length', Buffer.byteLength(healthBody))
          response.end(healthBody)
        } else {
          response.statusCode = 503
          response.setHeader('Content-Type', 'application/json; charset=utf-8')
          response.setHeader('Content-Length', Buffer.byteLength('{"status":"error","service":"codescope-homepage","mongodb":"unreachable"}'))
          response.end('{"status":"error","service":"codescope-homepage","mongodb":"unreachable"}')
        }
      } catch {
        response.statusCode = 503
        response.setHeader('Content-Type', 'application/json; charset=utf-8')
        response.setHeader('Content-Length', Buffer.byteLength('{"status":"error","service":"codescope-homepage","mongodb":"unreachable"}'))
        response.end('{"status":"error","service":"codescope-homepage","mongodb":"unreachable"}')
      }
    } else {
      response.statusCode = 200
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
      response.setHeader('Content-Length', Buffer.byteLength(healthBody))
      response.end(healthBody)
    }
    return
  }
  next()
})

// Remove the Chrome DevTools probe endpoint.
app.use('/.well-known/appspecific/com.chrome.devtools.json', (_request, response) => {
  response.status(204).end()
})

// CORS: allow only the explicitly configured frontend origins.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
  }),
)

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
)

// Parse request bodies with the appropriate size limits.
app.use('/api/chat', express.json({ limit: '10mb', strict: true }))
app.use('/api/projects', express.json({ limit: '5mb', strict: true }))
app.use(express.json({ limit: '256kb', strict: true }))

// gzip-compress responses. Server-Sent Events must never be compressed (it
app.use(
  compression({
    threshold: 1024,
    filter: (request, response) => {
      if (request.path === '/api/chat') return false
      const type = String(response.getHeader('Content-Type') || '')
      if (type.includes('text/event-stream')) return false
      return true
    },
  }),
)

app.use('/api', apiRouter)

// Return JSON 404 for any /api/* path that didn't match a route
app.use('/api', apiNotFound)

// Serve static assets with cache headers when the frontend is co-located.
if (servesFrontend) {
  app.use(
    express.static(frontendDist, {
      index: false,
      setHeaders(response, filePath) {
        const rel = path.relative(frontendDist, filePath).replace(/\\/g, '/')
        const ext = path.extname(filePath).toLowerCase()
        if (rel.startsWith('assets/')) {
          response.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        } else if (['.png', '.svg', '.ico', '.jpg', '.jpeg', '.webp', '.avif'].includes(ext)) {
          response.setHeader('Cache-Control', 'public, max-age=86400')
        } else {
          response.setHeader('Cache-Control', 'no-cache')
        }
      },
    }),
  )

  // SPA fallback: serve index.html for any non-API route.
  app.get('*splat', (_request, response) => {
    response.setHeader('Cache-Control', 'no-cache')
    response.sendFile(path.join(frontendDist, 'index.html'))
  })
}

app.use(errorHandler)

export default app
