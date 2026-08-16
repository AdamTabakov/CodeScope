// Strip any trailing slashes from the configured API URL so a value like
// "https://example.com/" can never produce a broken "//api" base.
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

export function login(identifier, password) {
  return request('/login', { identifier, password })
}

export function signup({ username, email, password, confirmPassword }) {
  return request('/signup', { username, email, password, confirmPassword })
}

/**
 * Streams an assistant reply from the /api/chat endpoint.
 * Resolves with the fully accumulated reply string; calls onDelta(delta)
 * incrementally as each SSE frame arrives.
 */
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

  const readFrame = (block) => {
    for (const line of block.split('\n')) {
      if (!line.startsWith('data: ')) continue
      const payload = JSON.parse(line.slice(6))
      if (typeof payload.delta === 'string') {
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
