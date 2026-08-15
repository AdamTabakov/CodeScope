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

describe('chat api', () => {
  before(async () => {
    server = app.listen(0)
    await new Promise((resolve) => server.once('listening', resolve))
    const { port } = server.address()
    baseUrl = `http://127.0.0.1:${port}`
  })

  after(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  it('returns a preview assistant response for authenticated repo context', async () => {
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
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.model, 'codescope-local-fallback')
    assert.match(body.reply, /acme\/demo/)
    assert.match(body.reply, /src\/app\.js/)
  })

  it('requires authentication', async () => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Explain this file' }),
    })

    assert.equal(response.status, 401)
  })
})
