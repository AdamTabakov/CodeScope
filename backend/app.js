import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import apiRouter from './routes/api.js'
import { errorHandler, apiNotFound } from './middleware/errorHandler.js'
import { config } from './config/env.js'

const app = express()

// Trust the first proxy hop. Production is deployed behind a reverse proxy
// (Render) that sets X-Forwarded-For; without this, express-rate-limit cannot
// derive the client IP and fails with ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
app.set('trust proxy', 1)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendDist = path.resolve(__dirname, '../frontend/dist')
// The backend only serves the built frontend when it is co-located (local dev).
// In production the frontend is deployed separately (e.g. Cloudflare Pages),
// so the dist folder is absent and static serving must be skipped entirely.
const servesFrontend = fs.existsSync(path.join(frontendDist, 'index.html'))
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

// Chrome DevTools sends a harmless "Automatic Workspace Folders" probe to this
// well-known path on localhost. We answer it with 204 so the request doesn't
// surface as a CSP violation / 404 in the console. See:
// https://developer.chrome.com/docs/devtools/automatic-workspaces
app.use('/.well-known/appspecific/com.chrome.devtools.json', (_request, response) => {
  response.status(204).end()
})

// CORS: allow only the explicitly configured frontend origins. The browser
// sends Authorization headers (Bearer tokens), so a wildcard is unacceptable.
// Requests with no Origin (server-to-server, curl, health checks) are allowed.
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
// Chat requests carry the full repository context (all file contents), so they
// need a much larger body limit than the other endpoints. Must run before the
// global parser so the larger limit wins for /api/chat.
app.use('/api/chat', express.json({ limit: '10mb', strict: true }))
app.use(express.json({ limit: '256kb', strict: true }))

// gzip-compress responses. Server-Sent Events must never be compressed (it
// buffers the stream and breaks token delivery), so the chat stream is excluded.
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
// (must come before the static-file handler, which would otherwise serve index.html)
app.use('/api', apiNotFound)

// Static assets with cache headers:
//  - hashed build files under /assets/ are content-addressed → immutable
//  - brand images (favicon, og-image) are stable but may change → short cache
//  - everything else is revalidated (no-cache)
// Skipped entirely when the frontend is not co-located (see servesFrontend above).
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
