import assert from 'node:assert/strict'
import { after, before, describe, it } from 'node:test'
import jwt from 'jsonwebtoken'
import app from '../app.js'
import { config } from '../config/env.js'
import { errorHandler } from '../middleware/errorHandler.js'
import { parseGitHubUrl } from '../services/repositoryService.js'
import { parseLoginBody, parseSignupBody } from '../utils/validation.js'
import { isDisposableEmail } from '../utils/disposableEmails.js'

let server
let baseUrl

// Builds a signed test token, mirroring the real authService.signToken claims.
function signTestToken(overrides = {}) {
  return jwt.sign(
    {
      sub: overrides.sub ?? '507f1f77bcf86cd799439011',
      username: overrides.username ?? 'tester',
      email: overrides.email ?? 'tester@example.com',
      role: 'user',
      emailVerified: true,
    },
    overrides.secret ?? config.jwtSecret,
    {
      issuer: overrides.issuer ?? config.jwtIssuer,
      audience: overrides.audience ?? config.jwtAudience,
      expiresIn: overrides.expiresIn ?? '1h',
    },
  )
}

function fakeResponse() {
  return {
    statusCode: 200,
    _body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(data) {
      this._body = JSON.stringify(data)
      return this
    },
  }
}

before(async () => {
  server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  const { port } = server.address()
  baseUrl = `http://127.0.0.1:${port}`
})

after(async () => {
  await new Promise((resolve) => server.close(resolve))
})

describe('security: error envelope', () => {

  it('errorHandler hides internal details in production', () => {
    const prev = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    try {
      const res = fakeResponse()
      errorHandler(new Error('internal secret: /opt/app/index.js:42'), {}, res, () => {})
      assert.equal(res.statusCode, 500)
      assert.equal(JSON.parse(res._body).error, 'An unexpected server error occurred.')
      assert.ok(!res._body.includes('internal secret'))
      assert.ok(!res._body.includes('/opt/app'))
      assert.ok(!res._body.includes('at '))
    } finally {
      process.env.NODE_ENV = prev
    }
  })

  it('errorHandler classifies rate-limit errors as RATE_LIMITED', () => {
    const res = fakeResponse()
    errorHandler(Object.assign(new Error('Too many requests'), { status: 429 }), {}, res, () => {})
    assert.equal(res.statusCode, 429)
    assert.equal(JSON.parse(res._body).code, 'RATE_LIMITED')
  })

  it('errorHandler classifies JWT errors as INVALID_TOKEN', () => {
    const res = fakeResponse()
    errorHandler(new jwt.JsonWebTokenError('invalid signature'), {}, res, () => {})
    assert.equal(res.statusCode, 401)
    assert.equal(JSON.parse(res._body).code, 'INVALID_TOKEN')
  })

  it('errorHandler classifies expired tokens as TOKEN_EXPIRED', () => {
    const res = fakeResponse()
    errorHandler(new jwt.TokenExpiredError('jwt expired', new Date()), {}, res, () => {})
    assert.equal(res.statusCode, 401)
    assert.equal(JSON.parse(res._body).code, 'TOKEN_EXPIRED')
  })

  it('errorHandler classifies CORS blocks as CORS_BLOCKED', () => {
    const res = fakeResponse()
    errorHandler(new Error('Not allowed by CORS'), {}, res, () => {})
    assert.equal(res.statusCode, 403)
    assert.equal(JSON.parse(res._body).code, 'CORS_BLOCKED')
  })

  it('malformed JSON returns a 400 INVALID_JSON envelope', async () => {
    const res = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{this is not json',
    })
    const body = await res.json()
    assert.equal(res.status, 400)
    assert.equal(body.code, 'INVALID_JSON')
  })

  it('oversized bodies return a 413 PAYLOAD_TOO_LARGE envelope', async () => {
    const res = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: 'x'.repeat(512 * 1024) }),
    })
    const body = await res.json()
    assert.equal(res.status, 413)
    assert.equal(body.code, 'PAYLOAD_TOO_LARGE')
  })

  it('never exposes the x-powered-by header', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`)
    assert.equal(res.headers.get('x-powered-by'), null)
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff')
    assert.ok(res.headers.get('x-frame-options'))
  })
})

describe('security: CORS', () => {
  it('allows a configured origin', async () => {
    const origin = config.corsOrigins[0]
    const res = await fetch(`${baseUrl}/api/auth/me`, { headers: { Origin: origin } })
    assert.equal(res.headers.get('access-control-allow-origin'), origin)
  })

  it('blocks a disallowed origin with CORS_BLOCKED', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, { headers: { Origin: 'https://evil.example' } })
    const body = await res.json()
    assert.equal(res.status, 403)
    assert.equal(body.code, 'CORS_BLOCKED')
  })
})

describe('security: authentication tokens', () => {
  it('accepts a valid token and returns the user without secrets', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${signTestToken()}` },
    })
    const body = await res.json()
    assert.equal(res.status, 200)
    assert.deepEqual(Object.keys(body.user).sort(), ['email', 'emailVerified', 'role', 'username'])
    assert.equal(body.user.username, 'tester')
    assert.equal(body.user.email, 'tester@example.com')
    assert.ok(!('passwordHash' in body.user))
    assert.ok(!('sub' in body.user))
  })

  it('rejects a token signed with the wrong secret', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${signTestToken({ secret: 'wrong-secret' })}` },
    })
    const body = await res.json()
    assert.equal(res.status, 401)
    assert.equal(body.error, 'Invalid or expired token.')
  })

  it('rejects a tampered token', async () => {
    const token = signTestToken()
    const tampered = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a')
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${tampered}` },
    })
    assert.equal(res.status, 401)
  })

  it('rejects tokens with the wrong issuer or audience', async () => {
    for (const overrides of [{ issuer: 'evil' }, { audience: 'evil' }]) {
      const res = await fetch(`${baseUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${signTestToken(overrides)}` },
      })
      assert.equal(res.status, 401)
    }
  })

  it('rejects an expired token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${signTestToken({ expiresIn: '-1s' })}` },
    })
    const body = await res.json()
    assert.equal(res.status, 401)
    assert.equal(body.error, 'Invalid or expired token.')
  })

  it('rejects a malformed token', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: 'Bearer not-a-jwt' },
    })
    assert.equal(res.status, 401)
  })

  it('rejects chat requests without a valid token', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'hello' }),
    })
    assert.equal(res.status, 401)
  })

  it('rejects chat messages over 2000 characters', async () => {
    const res = await fetch(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${signTestToken()}`,
      },
      body: JSON.stringify({ message: 'a'.repeat(2001) }),
    })
    assert.equal(res.status, 400)
  })
})

describe('security: NoSQL injection and payload shape', () => {
  it('parseLoginBody rejects operator-shaped identifiers', () => {
    for (const payload of [
      { identifier: { $ne: 'x' }, password: 'password123' },
      { identifier: { $gt: '' }, password: 'password123' },
      { identifier: { $regex: '.*' }, password: 'password123' },
    ]) {
      assert.equal(parseLoginBody(payload).ok, false)
    }
  })

  it('parseLoginBody rejects non-string identifiers and passwords', () => {
    for (const payload of [
      { identifier: ['Adam'], password: 'password123' },
      { identifier: 12345, password: 'password123' },
      { identifier: { toString: () => 'Adam' }, password: 'password123' },
      { identifier: 'Adam', password: { $gt: '' } },
      { identifier: 'Adam', password: ['password123'] },
    ]) {
      assert.equal(parseLoginBody(payload).ok, false)
    }
  })

  it('parseLoginBody rejects oversized identifiers and passwords', () => {
    assert.equal(parseLoginBody({ identifier: 'a'.repeat(300), password: 'password123' }).ok, false)
    assert.equal(parseLoginBody({ identifier: 'Adam', password: 'a'.repeat(300) }).ok, false)
    assert.equal(parseLoginBody({ identifier: 'Ab', password: 'password123' }).ok, false)
  })

  it('login endpoint rejects operator-shaped identifiers', async () => {
    const res = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: { $ne: 'Adam' }, password: 'password123' }),
    })
    assert.equal(res.status, 400)
  })

  it('parseSignupBody rejects non-plain-object payloads', () => {
    assert.equal(parseSignupBody(null).ok, false)
    assert.equal(parseSignupBody('signup').ok, false)
    assert.equal(parseSignupBody([{ username: 'a', email: 'a@b.co' }]).ok, false)
    assert.equal(parseSignupBody(Object.create(null)).ok, false)
  })

  it('parseSignupBody rejects prototype-polluted payloads', () => {
    const valid = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    }
    const polluted = { ...valid }
    Object.setPrototypeOf(polluted, { admin: true })
    assert.equal(parseSignupBody(polluted).ok, false)
  })

  it('JSON __proto__ keys are treated as plain data, not prototype pollution', () => {
    const body = JSON.parse(
      '{"__proto__":{"admin":true},"username":"polltest","email":"polltest@example.com","password":"password123","confirmPassword":"password123"}',
    )
    const result = parseSignupBody(body)
    assert.equal(result.ok, true)
    assert.equal({}.admin, undefined)
    assert.equal(Object.prototype.admin, undefined)
  })

  it('parseSignupBody rejects oversized fields', () => {
    const valid = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    }
    assert.equal(parseSignupBody({ ...valid, username: 'a'.repeat(33) }).field, 'username')
    assert.equal(parseSignupBody({ ...valid, password: 'a'.repeat(129) }).field, 'password')
  })
})

describe('security: rate limiting', () => {
  it('rate-limits failed login attempts', async () => {
    let status = 0
    for (let i = 0; i < 26 && status !== 429; i += 1) {
      const res = await fetch(`${baseUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'nobody', password: 'wrongpass123' }),
      })
      status = res.status
    }
    assert.equal(status, 429)
  })

  it('rate-limits signup attempts', async () => {
    let status = 0
    for (let i = 0; i < 15 && status !== 429; i += 1) {
      const res = await fetch(`${baseUrl}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: `ratelimit${i}`,
          email: `ratelimit${i}@yopmail.com`,
          password: 'password123',
          confirmPassword: 'password123',
        }),
      })
      status = res.status
    }
    assert.equal(status, 429)
  })
})

describe('security: GitHub URL parsing (SSRF)', () => {
  it('rejects URLs that are not on github.com', () => {
    for (const url of [
      'https://evil.com/owner/repo',
      'http://evil.com/owner/repo',
      'https://github.com.evil.com/owner/repo',
      'https://user:pass@evil.com/owner/repo',
      'ftp://github.com/owner/repo',
      'https://github.com.evil.com.evil.io/owner/repo',
    ]) {
      assert.throws(() => parseGitHubUrl(url), /Only public GitHub/)
    }
  })

  it('rejects URLs missing owner or repo', () => {
    for (const url of ['https://github.com', 'https://github.com/onlyowner', '', '   ']) {
      assert.throws(() => parseGitHubUrl(url))
    }
  })

  it('rejects non-string input', () => {
    for (const value of [null, undefined, 123, {}, []]) {
      assert.throws(() => parseGitHubUrl(value))
    }
  })

  it('parses owner, repo, branch, and subpath from valid URLs', () => {
    assert.deepEqual(parseGitHubUrl('https://github.com/facebook/react'), {
      owner: 'facebook',
      repo: 'react',
      branch: null,
      subpath: '',
    })
    assert.deepEqual(parseGitHubUrl('https://github.com/facebook/react/tree/main'), {
      owner: 'facebook',
      repo: 'react',
      branch: 'main',
      subpath: '',
    })
    assert.deepEqual(parseGitHubUrl('https://github.com/facebook/react/blob/main/src/App.js'), {
      owner: 'facebook',
      repo: 'react',
      branch: 'main',
      subpath: 'src/App.js',
    })
  })

  it('accepts protocol-less URLs, .git suffixes, and case-insensitive hosts', () => {
    assert.deepEqual(parseGitHubUrl('github.com/facebook/react.git'), {
      owner: 'facebook',
      repo: 'react',
      branch: null,
      subpath: '',
    })
    assert.equal(parseGitHubUrl('https://GITHUB.COM/owner/repo').owner, 'owner')
    assert.deepEqual(parseGitHubUrl('https://github.com/o/r/'), {
      owner: 'o',
      repo: 'r',
      branch: null,
      subpath: '',
    })
  })
})

describe('security: disposable email detection', () => {
  it('flags known disposable providers case-insensitively', () => {
    assert.equal(isDisposableEmail('x@mailinator.com'), true)
    assert.equal(isDisposableEmail('x@MAILINATOR.COM'), true)
    assert.equal(isDisposableEmail('x@10minutemail.com '), true)
    assert.equal(isDisposableEmail('x@getnada.com'), true)
  })

  it('flags subdomains of disposable providers', () => {
    assert.equal(isDisposableEmail('x@sub.yopmail.com'), true)
    assert.equal(isDisposableEmail('x@deep.sub.maildrop.cc'), true)
    assert.equal(isDisposableEmail('x@box.10minutemail.com'), true)
  })

  it('allows normal and non-disposable addresses', () => {
    for (const email of ['x@gmail.com', 'x@example.com', 'x@company.dev', 'x@outlook.com']) {
      assert.equal(isDisposableEmail(email), false)
    }
  })

  it('returns false for malformed or empty input', () => {
    for (const value of ['', 'x@', 'x', 'not-an-email', null, undefined, 'x@mailinator']) {
      assert.equal(isDisposableEmail(value), false)
    }
  })
})