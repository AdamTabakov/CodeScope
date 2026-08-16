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
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  resendApiKey: process.env.RESEND_API_KEY || '',
  emailFrom: process.env.EMAIL_FROM || 'CodeScope <no-reply@codescope.local>',
}
