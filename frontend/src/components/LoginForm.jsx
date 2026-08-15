import { useEffect, useMemo, useState } from 'react'
import { login } from '../services/api.js'
import SignUpForm from './SignUpForm.jsx'

const identifierPattern = /^([A-Za-z][A-Za-z0-9_-]{2,31}|[^\s@]+@[^\s@]+\.[^\s@]{2,})$/

export default function LoginForm({ open, onClose, onOpenLegal, onLogin }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState({ type: 'idle', message: '' })
  const [mode, setMode] = useState('login')

  const formIsValid = useMemo(() => {
    return identifierPattern.test(identifier.trim()) && password.length >= 8 && password.length <= 128
  }, [identifier, password])

  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }

    document.body.classList.add('modal-open')
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.classList.remove('modal-open')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setIdentifier('')
      setPassword('')
      setStatus({ type: 'idle', message: '' })
      setMode('login')
    }
  }, [open])

  if (!open) return null

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formIsValid) {
      setStatus({ type: 'error', message: 'Use a valid username/email and a password with at least 8 characters.' })
      return
    }

    setStatus({ type: 'loading', message: 'Checking credentials...' })

    try {
      const result = await login(identifier.trim(), password)
      setStatus({ type: 'success', message: `Logged in as ${result.user.username}.` })
      onLogin(result)
      onClose()
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not reach the login service.' })
    }
  }

  const handleSignupSuccess = (result) => {
    setMode('login')
    setStatus({ type: 'success', message: `Account ready for ${result.user.username}. You can sign in now.` })
  }

  return (
    <div className="login-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="login-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-heading"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="icon-close" type="button" aria-label="Close login form" onClick={onClose}>
          <span />
          <span />
        </button>

        <div className="login-panel__header">
          <div>
            <p className="eyebrow">{mode === 'signup' ? 'New account' : 'Account console'}</p>
            <h2 id="login-heading">{mode === 'signup' ? 'Create your account' : 'Sign in to scan'}</h2>
          </div>
          <div className="login-panel__badge" aria-hidden="true">
            {mode === 'signup' ? 'Join' : 'Secure'}
          </div>
        </div>

        {mode === 'signup' ? (
          <SignUpForm onSwitchToLogin={() => setMode('login')} onSignupSuccess={handleSignupSuccess} />
        ) : (
          <>
            <p className="login-panel__copy">
              Use your CodeScope account to view saved scans and connected repositories.
            </p>

            <div className="auth-mode-toggle" role="tablist" aria-label="Authentication mode">
              <button className="auth-mode-toggle__button auth-mode-toggle__button--active" type="button" aria-pressed="true">
                Sign in
              </button>
              <button
                className="auth-mode-toggle__button"
                type="button"
                aria-pressed="false"
                onClick={() => setMode('signup')}
              >
                Create account
              </button>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              <label htmlFor="identifier">Email</label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                inputMode="email"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="Email"
                maxLength="254"
                required
              />

              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                minLength="8"
                maxLength="128"
                required
              />

              <div className="login-form__row">
                <label className="login-form__check">
                  <input type="checkbox" name="remember" disabled />
                  Session only
                </label>
                <a href="/reset-password">Reset password</a>
              </div>

              {status.message ? <p className={`login-status login-status--${status.type}`}>{status.message}</p> : null}

              <button className="button" type="submit" disabled={status.type === 'loading'}>
                {status.type === 'loading' ? 'Verifying...' : 'Log in'}
                <span aria-hidden="true">-&gt;</span>
              </button>

              <p className="login-legal">
                By logging in, you agree to the{' '}
                <button type="button" onClick={() => onOpenLegal('terms')}>
                  Terms
                </button>{' '}
                and{' '}
                <button type="button" onClick={() => onOpenLegal('privacy')}>
                  Privacy Policy
                </button>
                .
              </p>
            </form>
          </>
        )}
      </section>
    </div>
  )
}
