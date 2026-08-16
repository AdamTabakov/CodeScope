import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'

// Middleware to require authentication for protected routes
export function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  // Extract the token from the Authorization header
  const token = authHeader.slice(7)

  // Verify the JWT token and attach the payload to the request object
  try {
    const payload = jwt.verify(token, config.jwtSecret, {
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
    })
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}
