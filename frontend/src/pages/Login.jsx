import { useState } from 'react'
import { login } from '../services/api.js'

const IconBack = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const IconAlert = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)
const IconSpinner = () => (
  <svg className="spin" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
)

const identifierPattern = /^([A-Za-z][A-Za-z0-9_-]{2,31}|[^\s@]+@[^\s@]+\.[^\s@]{2,})$/

export default function Login({ navigate, onAuthSuccess, openLegal }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!identifierPattern.test(identifier.trim())) {
      setError('Enter a valid username or email address.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      const result = await login(identifier.trim(), password)
      onAuthSuccess(result)
    } catch (err) {
      setError(err.message || 'Could not reach the login service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in-up">
        <button className="auth-back" onClick={() => navigate('home')} type="button">
          <IconBack />
          Back
        </button>

        <div className="auth-logo">
          <span className="auth-logo-icon">&lt;/&gt;</span>
          CodeScope
        </div>

        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-sub">Sign in to view your scans and connected repositories.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="identifier">Username or email</label>
            <div className="form-input-wrap">
              <input
                id="identifier"
                className={`form-input ${error ? 'form-input--error' : ''}`}
                type="text"
                autoComplete="username"
                inputMode="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="adam or adam@example.com"
                maxLength={254}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="form-input-wrap">
              <input
                id="password"
                className={`form-input ${error ? 'form-input--error' : ''}`}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                minLength={8}
                maxLength={128}
                required
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="auth-error">
              <IconAlert />
              {error}
            </div>
          )}

          <p className="forgot-password-row">
            <button type="button" className="legal-inline-link" onClick={() => navigate('forgot')}>
              Forgot password?
            </button>
          </p>

          <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
            {loading ? (
              <><IconSpinner />Verifying&hellip;</>
            ) : (
              'Sign in'
            )}
          </button>

          <p className="legal-continue-notice">
            By signing in you confirm you agree to our{' '}
            <button type="button" className="legal-inline-link" onClick={() => openLegal('terms')}>
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="legal-inline-link" onClick={() => openLegal('privacy')}>
              Privacy Policy
            </button>.
          </p>
        </form>

        <p className="auth-footer">
          No account yet?{' '}
          <button type="button" onClick={() => navigate('signup')}>Create one</button>
        </p>
      </div>
    </div>
  )
}
