import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'

export function requireAuth(req, res, next) {
  const authHeader = req.headers['authorization']

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' })
  }

  const token = authHeader.slice(7)

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
