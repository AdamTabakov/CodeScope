import { useMemo, useState } from 'react'
import { signup } from '../services/api.js'

const usernamePattern = /^[a-z0-9_-]{3,24}$/i

export default function SignUpForm({ onSwitchToLogin, onSignupSuccess }) {
  const [form, setForm] = useState({ name: '', username: '', password: '', confirmPassword: '' })
  const [status, setStatus] = useState({ type: 'idle', message: '' })

  const formIsValid = useMemo(() => {
    const trimmedName = form.name.trim()
    const trimmedUsername = form.username.trim()
    const passwordOk = form.password.length >= 8 && form.password.length <= 128
    const passwordsMatch = form.password === form.confirmPassword

    return Boolean(trimmedName) && usernamePattern.test(trimmedUsername) && passwordOk && passwordsMatch
  }, [form])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formIsValid) {
      setStatus({
        type: 'error',
        message: 'Choose a display name, a 3-24 character username, and matching passwords with at least 8 characters.',
      })
      return
    }

    setStatus({ type: 'loading', message: 'Preparing your account...' })

    try {
      const result = await signup({
        name: form.name.trim(),
        username: form.username.trim().toLowerCase(),
        password: form.password,
      })

      setStatus({ type: 'success', message: `Account ready for ${result.user.username}.` })
      onSignupSuccess?.(result)
      onSwitchToLogin?.()
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Could not create the account.' })
    }
  }

  return (
    <div className="signup-card">
      <div className="signup-card__header">
        <div>
          <p className="eyebrow">New account</p>
          <h2>Create your CodeScope account</h2>
        </div>
        <div className="login-panel__badge" aria-hidden="true">
          Join
        </div>
      </div>

      <p className="login-panel__copy">
        Use your account to save scans, keep notes, and pick up where you left off across devices.
      </p>

      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="signup-name">Display name</label>
        <input
          id="signup-name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Alex Chen"
          maxLength="80"
          required
        />

        <label htmlFor="signup-username">Username</label>
        <input
          id="signup-username"
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          placeholder="alex-code"
          maxLength="24"
          required
        />

        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="At least 8 characters"
          minLength="8"
          maxLength="128"
          required
        />

        <label htmlFor="signup-confirm">Confirm password</label>
        <input
          id="signup-confirm"
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Repeat password"
          minLength="8"
          maxLength="128"
          required
        />

        {status.message ? <p className={`login-status login-status--${status.type}`}>{status.message}</p> : null}

        <div className="signup-card__footer">
          <button type="button" className="ghost-link" onClick={onSwitchToLogin}>
            Back to sign in
          </button>
          <button className="button" type="submit" disabled={status.type === 'loading'}>
            {status.type === 'loading' ? 'Creating...' : 'Create account'}
            <span aria-hidden="true">-&gt;</span>
          </button>
        </div>
      </form>
    </div>
  )
}
