import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import jwt from 'jsonwebtoken'
import app from '../app.js'
import { config } from '../config/env.js'

let server
let baseUrl

function testToken() {
  return jwt.sign(
    { sub: 'test-user', username: 'Tester', role: 'user' },
    config.jwtSecret,
    {
      expiresIn: '5m',
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
    },
  )
}

// Reads an SSE response body and reassembles the deltas + terminal model.
async function collectSse(response) {
  const text = await response.text()
  let reply = ''
  let model = null
  for (const line of text.split('\n')) {
    if (!line.startsWith('data: ')) continue
    const payload = JSON.parse(line.slice(6))
    if (typeof payload.delta === 'string') reply += payload.delta
    if (payload.done) model = payload.model
  }
  return { reply, model }
}
// Test: chat api.
describe('chat api', () => {
  // Test: chat api.
  before(async () => {
    server = app.listen(0)
    await new Promise((resolve) => server.once('listening', resolve))
    const { port } = server.address()
    baseUrl = `http://127.0.0.1:${port}`
  })
  after(async () => {
    await new Promise((resolve) => server.close(resolve))
  })
  it('streams a preview assistant response for authenticated repo context', async () => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${testToken()}`,
      },
      body: JSON.stringify({
        message: 'Explain this file',
        context: { repo: 'acme/demo', branch: 'main', file: 'src/app.js', code: 'console.log(1)' },
      }),
    })
    const { reply, model } = await collectSse(response)

    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type'), /text\/event-stream/)
    assert.equal(model, 'codescope-local-fallback')
    assert.match(reply, /acme\/demo/)
    assert.match(reply, /src\/app\.js/)
  })
  // test if unauthenticated requests are rejected
  it('requires authentication', async () => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Explain this file' }),
    })

    assert.equal(response.status, 401)
  })
})
