const BASE = '/api'

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

export function login(identifier, password) {
  return request('/login', { identifier, password })
}

export function signup({ username, email, password, confirmPassword }) {
  return request('/signup', { username, email, password, confirmPassword })
}
