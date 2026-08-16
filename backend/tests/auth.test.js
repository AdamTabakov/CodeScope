import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import jwt from 'jsonwebtoken'
import app from '../app.js'
import { config } from '../config/env.js'

let server
let baseUrl

describe('auth api', () => {
  before(async () => {
    server = app.listen(0)
    await new Promise((resolve) => server.once('listening', resolve))
    const { port } = server.address()
    baseUrl = `http://127.0.0.1:${port}`
  })

  after(async () => {
    await new Promise((resolve) => server.close(resolve))
  })

  it('logs in the seeded admin and returns a valid JWT', async () => {
    const response = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'Adam', password: 'denista77' }),
    })
    const body = await response.json()

    assert.equal(response.status, 200)
    assert.equal(body.user.username, 'Adam')
    assert.equal(body.user.role, 'admin')

    const decoded = jwt.verify(body.token, config.jwtSecret, {
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
    })
    assert.equal(decoded.username, 'Adam')
    assert.equal(decoded.role, 'admin')
  })

  it('rejects MongoDB operator-shaped identifiers', async () => {
    const response = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: { $ne: 'Adam' }, password: 'denista77' }),
    })

    assert.equal(response.status, 400)
  })

  it('rejects invalid credentials', async () => {
    const response = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'Adam', password: 'wrongpass77' }),
    })

    assert.equal(response.status, 401)
  })

  it('forgot-password accepts a well-formed email and hides account existence', async () => {
    // Registered and unregistered addresses must produce identical responses so
    // the endpoint cannot be used to enumerate accounts.
    const unknown = await fetch(`${baseUrl}/api/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'does-not-exist@example.com' }),
    })
    const known = await fetch(`${baseUrl}/api/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'adam@codescope.local' }),
    })

    assert.equal(unknown.status, 200)
    assert.equal(known.status, 200)
    assert.deepEqual(await unknown.json(), await known.json())
  })

  it('forgot-password rejects an invalid email', async () => {
    const response = await fetch(`${baseUrl}/api/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' }),
    })

    assert.equal(response.status, 400)
  })

  it('forgot-password rejects non-object payloads', async () => {
    const response = await fetch(`${baseUrl}/api/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: { $ne: 'x' } }),
    })

    assert.equal(response.status, 400)
  })

  it('reset-password rejects a short/missing token', async () => {
    const response = await fetch(`${baseUrl}/api/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: 'short', password: 'newpass123', confirmPassword: 'newpass123' }),
    })

    assert.equal(response.status, 400)
  })

  it('reset-password rejects a weak new password', async () => {
    const response = await fetch(`${baseUrl}/api/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'a'.repeat(48),
        password: 'short',
        confirmPassword: 'short',
      }),
    })

    assert.equal(response.status, 400)
  })

  it('reset-password rejects mismatched confirmation', async () => {
    const response = await fetch(`${baseUrl}/api/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'a'.repeat(48),
        password: 'newpass123',
        confirmPassword: 'different',
      }),
    })

    assert.equal(response.status, 400)
  })

  it('reset-password fails closed when the token is unknown', async () => {
    // No DB is connected during tests, so the service returns the generic
    // invalid-token error rather than a 500.
    const response = await fetch(`${baseUrl}/api/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'a'.repeat(48),
        password: 'newpass123',
        confirmPassword: 'newpass123',
      }),
    })

    assert.equal(response.status, 400)
  })
})
