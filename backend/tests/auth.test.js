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
})
