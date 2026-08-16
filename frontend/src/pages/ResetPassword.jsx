import { useState } from 'react'
import { resetPassword } from '../services/api.js'

const IconBack = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)
const IconAlert = ({ size = 15 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)
const IconEye = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)
const IconEyeOff = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
)
const IconSpinner = () => (
  <svg className="spin" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
)

export default function ResetPassword({ navigate, token }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (password.length < 8 || password.length > 128) {
      setError('Password must be 8-128 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await resetPassword({ token, password, confirmPassword })
      setDone(true)
    } catch (err) {
      setError(err.message || 'Could not reset your password.')
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

        {done ? (
          <>
            <h1 className="auth-heading">Password updated</h1>
            <p className="auth-sub">
              Your password has been changed. Sign in with your new password.
            </p>
            <button className="btn btn--primary btn--full" onClick={() => navigate('login')} type="button">
              Sign in
            </button>
          </>
        ) : (
          <>
            <h1 className="auth-heading">Choose a new password</h1>
            <p className="auth-sub">Your new password will take effect immediately.</p>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="password">New password</label>
                <div className="form-input-wrap">
                  <input
                    id="password"
                    className={`form-input form-input--has-toggle ${error ? 'form-input--error' : ''}`}
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    minLength={8}
                    maxLength={128}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setShowPw((v) => !v)}
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm new password</label>
                <div className="form-input-wrap">
                  <input
                    id="confirmPassword"
                    className={`form-input form-input--has-toggle ${error ? 'form-input--error' : ''}`}
                    type={showConfirm ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    minLength={8}
                    maxLength={128}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="toggle-visibility"
                    onClick={() => setShowConfirm((v) => !v)}
                    aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirm ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="auth-error">
                  <IconAlert />
                  {error}
                </div>
              )}

              <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
                {loading ? (
                  <><IconSpinner />Updating&hellip;</>
                ) : (
                  'Set new password'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}