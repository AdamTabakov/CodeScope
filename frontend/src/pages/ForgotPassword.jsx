import { useState } from 'react'
import { requestPasswordReset } from '../services/api.js'

const IconBack = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const IconSpinner = () => (
  <svg className="spin" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function ForgotPassword({ navigate }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!emailPattern.test(email.trim())) {
      setError('Enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      await requestPasswordReset(email.trim().toLowerCase())
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Could not reach the password reset service.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card fade-in-up">
        <button className="auth-back" onClick={() => navigate('login')} type="button">
          <IconBack />
          Back
        </button>

        <div className="auth-logo">
          <span className="auth-logo-icon">&lt;/&gt;</span>
          CodeScope
        </div>

        {submitted ? (
          <>
            <h1 className="auth-heading">Check your inbox</h1>
            <p className="auth-sub">
              If an account exists for that email, we sent a link to reset your
              password. The link expires in 5 minutes.
            </p>
            <button className="btn btn--primary btn--full" onClick={() => navigate('login')} type="button">
              Back to sign in
            </button>
          </>
        ) : (
          <>
            <h1 className="auth-heading">Reset your password</h1>
            <p className="auth-sub">
              Enter the email on your account and we&rsquo;ll send you a reset link.
            </p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <div className="form-input-wrap">
                  <input
                    id="email"
                    className={`form-input ${error ? 'form-input--error' : ''}`}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setError('')
                    }}
                    placeholder="you@example.com"
                    maxLength={254}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {error && <div className="auth-error">{error}</div>}

              <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
                {loading ? (
                  <><IconSpinner />Sending&hellip;</>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>

            <p className="auth-footer">
              Remembered your password?{' '}
              <button type="button" onClick={() => navigate('login')}>Sign in</button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}