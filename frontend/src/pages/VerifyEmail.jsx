import { useEffect, useState } from 'react'
import { verifyEmail } from '../services/api.js'

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

export default function VerifyEmail({ token, onAuthSuccess, navigate }) {
  const [state, setState] = useState({ status: 'verifying', error: '' })

  useEffect(() => {
    let cancelled = false
    verifyEmail(token)
      .then((result) => {
        if (cancelled) return
        onAuthSuccess(result)
      })
      .catch((err) => {
        if (cancelled) return
        setState({ status: 'error', error: err.message || 'Could not verify your email.' })
      })
    return () => { cancelled = true }
  }, [token])

  return (
    <div className="auth-page">
      <div className="auth-card fade-in-up">
        <div className="auth-logo">
          <span className="auth-logo-icon">&lt;/&gt;</span>
          CodeScope
        </div>

        {state.status === 'verifying' ? (
          <>
            <h1 className="auth-heading">Verifying your email</h1>
            <p className="auth-sub">
              <IconSpinner /> Checking your verification link&hellip;
            </p>
          </>
        ) : (
          <>
            <h1 className="auth-heading">Verification link invalid</h1>
            <p className="auth-sub">
              This link may have expired or already been used. Request a new one by signing in and resending, or check the email address you signed up with.
            </p>
            <div className="auth-error">
              <IconAlert />
              {state.error}
            </div>
            <button className="btn btn--primary btn--full" onClick={() => navigate('login')} type="button">
              Go to sign in
            </button>
          </>
        )}
      </div>
    </div>
  )
}