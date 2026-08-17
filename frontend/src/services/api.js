// Strip any trailing slashes from the configured API URL so a value like
const BASE = `${String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')}/api`

async function request(path, body) {
  let response

  // Network failure (backend down, DNS error, etc.)
  try {
    response = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Could not reach the server. Make sure the backend is running.')
  }

  // Parse body safely — an empty body or non-JSON (e.g. proxy 502) must not crash
  let data = {}
  const text = await response.text()
  if (text.trim()) {
    try {
      data = JSON.parse(text)
    } catch {
      // Non-JSON response (HTML error page, proxy error, etc.)
      throw new Error(`Server returned an unexpected response (HTTP ${response.status}). The backend may be down.`)
    }
  }

  if (!response.ok) {
    const err = new Error(data.error || `Request failed (${response.status}).`)
    err.field = data.field ?? null
    throw err
  }

  return data
}

// Generic authenticated fetch for the project endpoints (GET/DELETE support).
async function apiFetch(path, { method = 'GET', body, token } = {}) {
  let response
  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new Error('Could not reach the server. Make sure the backend is running.')
  }
  // Parse the response body as JSON, if present
  let data = {}
  const text = await response.text()
  if (text.trim()) {
    try {
      data = JSON.parse(text)
    } catch {
      throw new Error(`Server returned an unexpected response (HTTP ${response.status}). The backend may be down.`)
    }
  }
  // Throw an error if the response is not OK
  if (!response.ok) {
    const err = new Error(data.error || `Request failed (${response.status}).`)
    err.field = data.field ?? null
    throw err
  }

  return data
}
// Log in a user
export function login(identifier, password) {
  return request('/login', { identifier, password })
}
// Sign up a new user
export function signup({ username, email, password, confirmPassword }) {
  return request('/signup', { username, email, password, confirmPassword })
}

// Verify a user's email
export async function verifyEmail(token) {
  let response
  try {
    response = await fetch(`${BASE}/verify-email?token=${encodeURIComponent(token)}`)
  } catch {
    throw new Error('Could not reach the server. Make sure the backend is running.')
  }

  const text = await response.text()
  let data = {}
  if (text.trim()) {
    try { data = JSON.parse(text) } catch { /* non-JSON body */ }
  }

  if (!response.ok) {
    const err = new Error(data.error || `Verification failed (HTTP ${response.status}).`)
    err.field = data.field ?? null
    throw err
  }
  return data
}

// Request a password reset
export function requestPasswordReset(email) {
  return request('/forgot-password', { email })
}

// Reset a user's password
export function resetPassword({ token, password, confirmPassword }) {
  return request('/reset-password', { token, password, confirmPassword })
}

export function saveProject(payload, token) {
  return apiFetch('/projects', { method: 'POST', body: payload, token })
}

// List all projects
export function listProjects(token) {
  return apiFetch('/projects', { token })
}

// Get a project by ID
export function getProject(id, token) {
  return apiFetch(`/projects/${encodeURIComponent(id)}`, { token })
}

// Delete a project by ID
  export function deleteProject(id, token) {
  return apiFetch(`/projects/${encodeURIComponent(id)}`, { method: 'DELETE', token })
}

// Stream a chat reply
export async function streamChat({ message, context, token, onDelta }) {
  let response
  try {
    response = await fetch(`${BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message, context }),
    })
  } catch {
    throw new Error('Could not reach the server. Make sure the backend is running.')
  }

  if (!response.ok) {
    let data = {}
    const text = await response.text()
    if (text.trim()) {
      try { data = JSON.parse(text) } catch { /* non-JSON error body */ }
    }
    const err = new Error(data.error || `Request failed (${response.status}).`)
    err.field = data.field ?? null
    throw err
  }

  if (!response.body) {
    throw new Error('Server returned an empty response.')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let reply = ''
  // Read the response body as SSE frames
  const readFrame = (block) => {
    // Parse each line as a JSON object and call onDelta if it contains a delta
    for (const line of block.split('\n')) {
      // Skip lines that don't start with 'data: '
      if (!line.startsWith('data: ')) continue
      // Parse the JSON payload and call onDelta if it contains a delta
      const payload = JSON.parse(line.slice(6))
      // Skip lines that don't contain a string
      if (typeof payload.delta === 'string') {
        // Append the delta to the reply and call onDelta if it contains a delta
        reply += payload.delta
        onDelta?.(payload.delta)
      } else if (payload.error) {
        throw new Error(payload.error)
      }
    }
  }
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let sep
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)
      readFrame(block)
    }
  }
  if (buffer.trim()) readFrame(buffer)

  return reply
}
