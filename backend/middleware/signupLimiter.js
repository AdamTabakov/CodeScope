import rateLimit from 'express-rate-limit'

// Rate limiter for account creation. Unlike login, successful signups are
// counted too, otherwise a bot could mass-create accounts without ever tripping
// the limit.
export const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many signup attempts. Try again later.' },
})