import { loginUser, signupUser } from '../services/authService.js'
import { parseLoginBody, parseSignupBody } from '../utils/validation.js'
import { isConnected } from '../config/db.js'

export async function login(request, response, next) {
  try {
    const parsed = parseLoginBody(request.body)

    if (!parsed.ok) {
      return response.status(400).json({ error: parsed.error })
    }

    const result = await loginUser(parsed.identifier, parsed.password)

    if (!result.ok) {
      return response.status(401).json({ error: 'Invalid username/email or password.' })
    }

    return response.json({
      token: result.token,
      user: result.user,
    })
  } catch (error) {
    return next(error)
  }
}

export async function signup(request, response, next) {
  try {
    if (!isConnected()) {
      return response.status(503).json({ error: 'Signup is currently unavailable.' })
    }

    const parsed = parseSignupBody(request.body)
    if (!parsed.ok) {
      return response.status(400).json({ field: parsed.field, error: parsed.error })
    }

    const result = await signupUser(parsed)
    if (!result.ok) {
      return response.status(409).json({ field: result.field, error: result.error })
    }

    return response.status(201).json({ token: result.token, user: result.user })
  } catch (error) {
    return next(error)
  }
}
