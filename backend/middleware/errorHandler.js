/**
 * Classifies errors into a status code + machine-readable code string,
 * then sends a consistent JSON error envelope:
 *   { error: string, code: string, status: number }
 */

// Map of error code → HTTP status (covers common library errors by name/type)
const ERROR_MAP = [
  // express-rate-limit
  { match: (e) => e.status === 429 || e.statusCode === 429,
    status: 429, code: 'RATE_LIMITED',        message: 'Too many requests. Please slow down.' },

  // CORS — origin not in the configured allowlist
  { match: (e) => e.message === 'Not allowed by CORS',
    status: 403, code: 'CORS_BLOCKED',        message: 'Request origin is not allowed.' },

  // express body-parser / JSON syntax
  { match: (e) => e.type === 'entity.too.large',
    status: 413, code: 'PAYLOAD_TOO_LARGE',   message: 'Request body is too large.' },
  { match: (e) => e instanceof SyntaxError && e.status === 400,
    status: 400, code: 'INVALID_JSON',         message: 'Request body is not valid JSON.' },

  // jsonwebtoken
  { match: (e) => e.name === 'JsonWebTokenError',
    status: 401, code: 'INVALID_TOKEN',        message: 'Authentication token is invalid.' },
  { match: (e) => e.name === 'TokenExpiredError',
    status: 401, code: 'TOKEN_EXPIRED',        message: 'Authentication token has expired. Please sign in again.' },
  { match: (e) => e.name === 'NotBeforeError',
    status: 401, code: 'TOKEN_NOT_ACTIVE',     message: 'Authentication token is not yet active.' },

  // Mongoose validation
  { match: (e) => e.name === 'ValidationError',
    status: 422, code: 'VALIDATION_ERROR',     message: (e) => e.message },
  { match: (e) => e.name === 'CastError',
    status: 400, code: 'INVALID_ID',           message: 'One or more IDs in the request are invalid.' },

  // Mongoose duplicate key (e.g. unique index violation)
  { match: (e) => e.code === 11000 || e.code === 11001,
    status: 409, code: 'DUPLICATE_KEY',
    message: (e) => {
      const field = Object.keys(e.keyValue ?? {})[0] ?? 'field'
      return `A record with that ${field} already exists.`
    },
  },

  // MongoDB network / timeout
  { match: (e) => e.name === 'MongoNetworkError' || e.name === 'MongoTimeoutError',
    status: 503, code: 'DATABASE_UNAVAILABLE', message: 'Database is temporarily unreachable. Try again shortly.' },
]

export function errorHandler(error, _request, response, _next) {
  // Never leak stack traces to clients
  const isDev = process.env.NODE_ENV !== 'production'

  // Walk the map to classify the error
  for (const rule of ERROR_MAP) {
    if (rule.match(error)) {
      const message = typeof rule.message === 'function'
        ? rule.message(error)
        : rule.message

      if (isDev) console.error(`[${rule.status}] ${rule.code}:`, error.message)

      return response.status(rule.status).json({
        error:  message,
        code:   rule.code,
        status: rule.status,
      })
    }
  }

  // Already-assigned HTTP status (e.g. manually thrown with err.status = 403)
  const status = error.status ?? error.statusCode ?? 500
  if (status >= 400 && status < 500) {
    if (isDev) console.error(`[${status}] Client error:`, error.message)
    return response.status(status).json({
      error:  error.message || 'Bad request.',
      code:   'CLIENT_ERROR',
      status,
    })
  }

  // Fallthrough — unexpected server error
  console.error('[500] Unhandled error:', error)
  return response.status(500).json({
    error:  'An unexpected server error occurred.',
    code:   'INTERNAL_ERROR',
    status: 500,
    ...(isDev ? { detail: error.message } : {}),
  })
}

/**
 * 404 handler for API routes — must be mounted AFTER all API routes
 * so only truly unmatched paths reach it.
 */
export function apiNotFound(_request, response) {
  response.status(404).json({
    error:  'API endpoint not found.',
    code:   'API_NOT_FOUND',
    status: 404,
  })
}
