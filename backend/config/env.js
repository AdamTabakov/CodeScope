import dotenv from 'dotenv'
dotenv.config()

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
}
