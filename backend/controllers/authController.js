import { loginUser, signupUser, verifyEmail } from '../services/authService.js'
import { parseLoginBody, parseSignupBody } from '../utils/validation.js'
import { isConnected } from '../config/db.js'

// Controller for handling user login
export async function login(request, response, next) {
  // Validate and parse the request body for login
  try {
    const parsed = parseLoginBody(request.body)
    // Check if the parsed data is valid
    if (!parsed.ok) {
      return response.status(400).json({ error: parsed.error })
    }

    // Attempt to log in the user with the provided identifier and password
    const result = await loginUser(parsed.identifier, parsed.password)

    // Check if the login was successful
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

// Controller for handling user signup
export async function signup(request, response, next) {
  // Validate and parse the request body for signup
  try {
    if (!isConnected()) {
      return response.status(503).json({ error: 'Signup is currently unavailable.' })
    }

    // Parse and validate the signup request body
    const parsed = parseSignupBody(request.body)
    if (!parsed.ok) {
      return response.status(400).json({ field: parsed.field, error: parsed.error })
    }

    // Attempt to sign up the user with the provided data
    const result = await signupUser(parsed)
    if (!result.ok) {
      return response.status(409).json({ field: result.field, error: result.error })
    }

    return response.status(201).json({ token: result.token, user: result.user })
  } catch (error) {
    return next(error)
  }
}

// Controller for verifying an email address via the link emailed at signup.
// This is public: the emailed token itself is the credential.
export async function verifyEmailAddress(request, response, next) {
  try {
    const token = request.query?.token
    const result = await verifyEmail(token)
    if (!result.ok) {
      return response.status(400).json({ field: result.field, error: result.error })
    }
    return response.json({ ok: true, user: result.user })
  } catch (error) {
    return next(error)
  }
}
