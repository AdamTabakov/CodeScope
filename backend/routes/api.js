import { Router } from 'express'
import { health } from '../controllers/healthController.js'
import { login, signup, verifyEmailAddress, forgotPassword, resetPasswordEndpoint } from '../controllers/authController.js'
import { loginLimiter } from '../middleware/loginLimiter.js'
import { forgotPasswordLimiter, resetPasswordLimiter } from '../middleware/passwordResetLimiter.js'
import { requireAuth } from '../middleware/auth.js'
import { chatLimiter, chat } from '../controllers/chatController.js'
import { repositoryLimiter, uploadRepository } from '../controllers/repositoryController.js'
import {
  saveProjectEndpoint,
  listProjectsEndpoint,
  getProjectEndpoint,
  deleteProjectEndpoint,
} from '../controllers/projectController.js'

// Create a new router instance
const router = Router()

// Define API routes and associate them with their respective controllers and middleware
router.get('/health', health)
router.post('/login', loginLimiter, login)
router.post('/signup', signup)
router.get('/verify-email', verifyEmailAddress)
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword)
router.post('/reset-password', resetPasswordLimiter, resetPasswordEndpoint)
router.post('/chat', chatLimiter, requireAuth, chat)
router.post('/repositories/upload', repositoryLimiter, requireAuth, uploadRepository)
router.post('/projects', requireAuth, saveProjectEndpoint)
router.get('/projects', requireAuth, listProjectsEndpoint)
router.get('/projects/:id', requireAuth, getProjectEndpoint)
router.delete('/projects/:id', requireAuth, deleteProjectEndpoint)

export default router
