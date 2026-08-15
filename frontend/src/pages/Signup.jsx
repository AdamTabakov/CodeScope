import { useState } from 'react'
import { ChevronLeft, AlertCircle, Loader, Eye, EyeOff } from 'lucide-react'
import { signup } from '../services/api.js'

const usernamePattern = /^[A-Za-z][A-Za-z0-9_-]{2,31}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function Signup({ navigate, onAuthSuccess, openLegal }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [agreed, setAgreed] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
    setFieldErrors((fe) => ({ ...fe, [field]: '' }))
    setServerError('')
  }

  const validate = () => {
    const errs = {}
    if (!usernamePattern.test(form.username.trim()))
      errs.username = 'Must start with a letter, 3–32 characters (letters, numbers, _ -).'
    if (!emailPattern.test(form.email.trim()))
      errs.email = 'Enter a valid email address.'
    if (form.password.length < 8 || form.password.length > 128)
      errs.password = 'Password must be 8–128 characters.'
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match.'
    return errs
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setServerError('')

    if (!agreed) {
      setServerError('You must agree to the Terms of Service and Privacy Policy to create an account.')
      return
    }

    const errs = validate()
    if (Object.keys(errs).length) {
      setFieldErrors(errs)
      return
    }

    setLoading(true)
    try {
      const result = await signup({
        username: form.username.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
      })
      onAuthSuccess(result)
    } catch (err) {
      if (err.field) {
        setFieldErrors({ [err.field]: err.message })
      } else {
        setServerError(err.message || 'Could not create your account.')
      }
    } finally {
      setLoading(false)
    }
  }

  const legalLink = (page, label) => (
    <button
      type="button"
      className="legal-inline-link"
      onClick={() => openLegal(page)}
    >
      {label}
    </button>
  )

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide fade-in-up">
        <button className="auth-back" onClick={() => navigate('home')} type="button">
          <ChevronLeft size={16} />
          Back
        </button>

        <div className="auth-logo">
          <span className="auth-logo-icon">&lt;/&gt;</span>
          CodeScope
        </div>

        <h1 className="auth-heading">Create your account</h1>
        <p className="auth-sub">Start scanning repositories and saving notes in seconds.</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Username */}
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <div className="form-input-wrap">
              <input
                id="username"
                className={`form-input ${fieldErrors.username ? 'form-input--error' : ''}`}
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={set('username')}
                placeholder="yourhandle"
                maxLength={32}
                required
                disabled={loading}
              />
            </div>
            {fieldErrors.username && (
              <span className="field-error"><AlertCircle size={12} />{fieldErrors.username}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <div className="form-input-wrap">
              <input
                id="email"
                className={`form-input ${fieldErrors.email ? 'form-input--error' : ''}`}
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                maxLength={254}
                required
                disabled={loading}
              />
            </div>
            {fieldErrors.email && (
              <span className="field-error"><AlertCircle size={12} />{fieldErrors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <div className="form-input-wrap">
              <input
                id="password"
                className={`form-input form-input--has-toggle ${fieldErrors.password ? 'form-input--error' : ''}`}
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.password}
                onChange={set('password')}
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
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.password && (
              <span className="field-error"><AlertCircle size={12} />{fieldErrors.password}</span>
            )}
          </div>

          {/* Confirm password */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm password</label>
            <div className="form-input-wrap">
              <input
                id="confirmPassword"
                className={`form-input form-input--has-toggle ${fieldErrors.confirmPassword ? 'form-input--error' : ''}`}
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                placeholder="Repeat password"
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
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <span className="field-error"><AlertCircle size={12} />{fieldErrors.confirmPassword}</span>
            )}
          </div>

          {/* ── Consent checkbox ──────────────────────────────────────── */}
          <label className={`legal-consent ${!agreed && serverError ? 'legal-consent--error' : ''}`}>
            <input
              type="checkbox"
              className="legal-consent__check"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked)
                setServerError('')
              }}
              disabled={loading}
            />
            <span className="legal-consent__text">
              I have read and agree to the{' '}
              {legalLink('terms', 'Terms of Service')}{' '}
              and{' '}
              {legalLink('privacy', 'Privacy Policy')}.
              By creating an account, my username, email address, and a hashed
              (bcrypt) version of my password will be stored securely on
              CodeScope&apos;s servers. Code I submit for scanning will also be
              stored and linked to my account.
            </span>
          </label>

          {serverError && (
            <div className="auth-error">
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              {serverError}
            </div>
          )}

          <button
            className="btn btn--primary btn--full"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <><Loader size={15} className="spin" />Creating account&hellip;</>
            ) : (
              'Create account'
            )}
          </button>
        </form>

        {/* Data notice */}
        <div className="legal-data-notice">
          <strong>What we store:</strong> username, email, bcrypt-hashed password, and any
          code you scan. We never store your plain-text password or sell your data.
          Read our{' '}
          <button type="button" className="legal-inline-link" onClick={() => openLegal('privacy')}>
            Privacy Policy
          </button>{' '}
          for full details.
        </div>

        <p className="auth-footer">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('login')}>Sign in</button>
        </p>
      </div>
    </div>
  )
}
