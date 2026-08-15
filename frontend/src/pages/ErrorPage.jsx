import { useEffect, useState } from 'react'
import { Home, RefreshCw, LogIn, ArrowLeft } from 'lucide-react'

// ── Error catalogue ───────────────────────────────────────────────────────────

const ERRORS = {
  404: {
    code: '404',
    title: 'Page not found',
    detail: 'The route you requested doesn\'t exist or has been moved.',
    color: 'var(--primary)',
    glow: 'rgba(99, 102, 241, 0.35)',
    terminal: 'NOT_FOUND',
    actions: ['home', 'back'],
  },
  401: {
    code: '401',
    title: 'Authentication required',
    detail: 'You need to sign in before you can access this page.',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.3)',
    terminal: 'UNAUTHENTICATED',
    actions: ['login', 'home'],
  },
  403: {
    code: '403',
    title: 'Access denied',
    detail: 'You don\'t have permission to view this resource.',
    color: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.3)',
    terminal: 'FORBIDDEN',
    actions: ['home', 'back'],
  },
  429: {
    code: '429',
    title: 'Too many requests',
    detail: 'You\'ve hit a rate limit. Wait a moment then try again.',
    color: '#f97316',
    glow: 'rgba(249, 115, 22, 0.3)',
    terminal: 'RATE_LIMITED',
    actions: ['retry', 'home'],
  },
  500: {
    code: '500',
    title: 'Internal server error',
    detail: 'Something went wrong on our end. We\'ve logged the issue.',
    color: 'var(--red)',
    glow: 'rgba(239, 68, 68, 0.3)',
    terminal: 'INTERNAL_ERROR',
    actions: ['retry', 'home'],
  },
  503: {
    code: '503',
    title: 'Service unavailable',
    detail: 'CodeScope is temporarily down. Please try again in a moment.',
    color: '#f97316',
    glow: 'rgba(249, 115, 22, 0.3)',
    terminal: 'SERVICE_UNAVAILABLE',
    actions: ['retry', 'home'],
  },
  offline: {
    code: '---',
    title: 'No network connection',
    detail: 'Unable to reach CodeScope. Check your connection and try again.',
    color: 'var(--muted)',
    glow: 'rgba(100, 116, 139, 0.25)',
    terminal: 'NETWORK_UNREACHABLE',
    actions: ['retry'],
  },
  crash: {
    code: '500',
    title: 'Application crashed',
    detail: 'An unexpected error occurred in the app. Refreshing the page usually fixes this.',
    color: 'var(--red)',
    glow: 'rgba(239, 68, 68, 0.3)',
    terminal: 'UNHANDLED_EXCEPTION',
    actions: ['refresh', 'home'],
  },
}

// ── Action button map ─────────────────────────────────────────────────────────

function Actions({ actions, navigate, onRetry }) {
  return (
    <div className="error-actions">
      {actions.map((key) => {
        switch (key) {
          case 'home':
            return (
              <button key="home" className="btn btn--primary" onClick={() => navigate('home')}>
                <Home size={15} />
                Go home
              </button>
            )
          case 'back':
            return (
              <button key="back" className="btn btn--ghost" onClick={() => navigate('home')}>
                <ArrowLeft size={15} />
                Go back
              </button>
            )
          case 'login':
            return (
              <button key="login" className="btn btn--primary" onClick={() => navigate('login')}>
                <LogIn size={15} />
                Sign in
              </button>
            )
          case 'retry':
            return (
              <button key="retry" className="btn btn--ghost" onClick={onRetry ?? (() => window.location.reload())}>
                <RefreshCw size={15} />
                Try again
              </button>
            )
          case 'refresh':
            return (
              <button key="refresh" className="btn btn--primary" onClick={() => window.location.reload()}>
                <RefreshCw size={15} />
                Refresh page
              </button>
            )
          default:
            return null
        }
      })}
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ErrorPage({
  type = 404,
  navigate = () => {},
  onRetry,
  errorMessage,  // optional raw error text (shown in terminal block)
}) {
  const cfg = ERRORS[type] ?? ERRORS[404]
  const [ts] = useState(() => new Date().toISOString())

  // Set page title so browser tab reflects the error
  useEffect(() => {
    document.title = `${cfg.code} — ${cfg.title} | CodeScope`
    return () => { document.title = 'CodeScope | Code scanning in plain English' }
  }, [cfg])

  return (
    <div className="error-page fade-in-up">
      {/* Background glow matched to error colour */}
      <div
        className="error-page__glow"
        style={{ background: `radial-gradient(ellipse 60% 50% at 50% 30%, ${cfg.glow} 0%, transparent 70%)` }}
        aria-hidden="true"
      />

      <div className="error-page__card">
        {/* Large error code */}
        <div
          className="error-code"
          style={{ color: cfg.color, textShadow: `0 0 60px ${cfg.glow}, 0 0 120px ${cfg.glow}` }}
          aria-label={`Error ${cfg.code}`}
        >
          {cfg.code}
        </div>

        <h1 className="error-title">{cfg.title}</h1>
        <p className="error-detail">{cfg.detail}</p>

        {/* Terminal-style metadata block */}
        <div className="error-terminal" aria-label="Error details">
          <div className="error-terminal__line">
            <span className="t-comment"># codescope diagnostic</span>
          </div>
          <div className="error-terminal__line">
            <span className="t-keyword">status</span>
            <span className="t-op">  = </span>
            <span className="t-number">{cfg.code}</span>
          </div>
          <div className="error-terminal__line">
            <span className="t-keyword">code</span>
            <span className="t-op">    = </span>
            <span className="t-string">"{cfg.terminal}"</span>
          </div>
          {errorMessage && (
            <div className="error-terminal__line">
              <span className="t-keyword">message</span>
              <span className="t-op"> = </span>
              <span className="t-warn">"{errorMessage.slice(0, 120)}"</span>
            </div>
          )}
          <div className="error-terminal__line">
            <span className="t-keyword">time</span>
            <span className="t-op">    = </span>
            <span className="t-plain">{ts}</span>
          </div>
        </div>

        <Actions actions={cfg.actions} navigate={navigate} onRetry={onRetry} />
      </div>
    </div>
  )
}
