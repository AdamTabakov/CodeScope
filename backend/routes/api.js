import { Router } from 'express'
import { health } from '../controllers/healthController.js'
import { login, signup, verifyEmailAddress } from '../controllers/authController.js'
import { loginLimiter } from '../middleware/loginLimiter.js'
import { requireAuth } from '../middleware/auth.js'
import { chatLimiter, chat } from '../controllers/chatController.js'
import { repositoryLimiter, uploadRepository } from '../controllers/repositoryController.js'

// Create a new router instance
const router = Router()

// Define API routes and associate them with their respective controllers and middleware
router.get('/health', health)
router.post('/login', loginLimiter, login)
router.post('/signup', signup)
router.get('/verify-email', verifyEmailAddress)
router.post('/chat', chatLimiter, requireAuth, chat)
router.post('/repositories/upload', repositoryLimiter, requireAuth, uploadRepository)

export default router
