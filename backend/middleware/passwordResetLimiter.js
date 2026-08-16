import rateLimit from 'express-rate-limit'

// Rate limiter for password reset requests to prevent abuse:
// - forgot-password can be used to spam email, so the window is tight.
// - reset-password tokens are high-entropy, but the limiter still guards the
//   lookup against brute-force attempts.
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many password reset requests. Try again later.' },
})

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many reset attempts. Try again later.' },
})