// Load environment variables from .env file

import dotenv from 'dotenv'
dotenv.config()

// Configuration object for the application
export const config = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-this-secret-before-deploy',
  jwtIssuer: process.env.JWT_ISSUER || 'codescope',
  jwtAudience: process.env.JWT_AUDIENCE || 'codescope-web',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  adminUsername: process.env.ADMIN_USERNAME || 'Adam',
  adminPassword: process.env.ADMIN_PASSWORD, // no fallback — must come from .env
  adminEmail: process.env.ADMIN_EMAIL || 'adam@codescope.local',
  mongoUri: process.env.MONGODB_URI || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || 'CodeScope <no-reply@codescope.local>',
  // Comma-separated list of allowed browser origins for CORS. Never use "*" —
  // the frontend sends Authorization headers, so only trusted origins are allowed.
  corsOrigins: (process.env.CORS_ORIGINS || 'https://codescope-4yq.pages.dev')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  // Testing helper: email address(es) allowed to register more than once.
  // Everyone else keeps unique-email enforcement. Never list real users.
  duplicateEmailAllowlist: (process.env.ALLOW_DUPLICATE_EMAILS_FOR || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean),
}
