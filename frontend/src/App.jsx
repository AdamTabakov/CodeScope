import { lazy, Suspense, useEffect, useState } from 'react'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Navbar from './components/Navbar.jsx'
import LegalModal from './components/LegalModal.jsx'
import LoadingBar from './components/LoadingBar.jsx'
import CookieBanner from './components/CookieBanner.jsx'
import Home from './pages/Home.jsx'
import ErrorPage from './pages/ErrorPage.jsx'
import { VIEW_META } from './meta.js'

// Non-landing pages are code-split and fetched on first navigation so the
// initial bundle stays small (Home and ErrorPage stay eager: Home is the
// landing page, ErrorPage is needed synchronously by the ErrorBoundary).
const Login = lazy(() => import('./pages/Login.jsx'))
const Signup = lazy(() => import('./pages/Signup.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const Scan = lazy(() => import('./pages/Scan.jsx'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'))
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'))
const VerifyEmail = lazy(() => import('./pages/VerifyEmail.jsx'))

// Views that require the user to be signed in
const AUTH_REQUIRED = new Set(['dashboard', 'scan'])

// All known views — anything else gets a 404
const KNOWN_VIEWS = new Set(['home', 'login', 'signup', 'dashboard', 'scan', 'error', 'forgot', 'reset', 'verify'])

// Short human labels used when composing error-page <title>s.
const ERROR_LABELS = {
  404: 'Page not found',
  401: 'Sign in required',
  403: 'Access denied',
  429: 'Too many requests',
  500: 'Internal server error',
  503: 'Service unavailable',
  offline: 'No network connection',
  crash: 'Application crashed',
}
const viewLabel = (type) => ERROR_LABELS[type] ?? 'Something went wrong'

export default function App() {
  const [view, setView] = useState('home')
  const [auth, setAuth] = useState({ token: null, user: null })
  const [legalPage, setLegalPage] = useState(null)
  const [errorState, setErrorState] = useState({ type: 404, message: '' })
  const [scanUrl, setScanUrl] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [verifyToken, setVerifyToken] = useState('')
  const [recentRepos, setRecentRepos] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('codescope:recentRepos') || '[]')
    } catch {
      return []
    }
  })
  const [loading, setLoading] = useState(true)

  // Keep <head> metadata (title + description) in sync with the active view.
  useEffect(() => {
    const meta =
      view === 'error' && errorState.type
        ? {
            ...VIEW_META.error,
            title: `${errorState.type} | ${viewLabel(errorState.type)} | CodeScope`,
          }
        : VIEW_META[view] ?? VIEW_META.home

    document.title = meta.title
    let desc = document.querySelector('meta[name="description"]')
    if (!desc) {
      desc = document.createElement('meta')
      desc.name = 'description'
      document.head.appendChild(desc)
    }
    desc.content = meta.description
  }, [view, errorState])

  // Simulated boot loader so the app never flashes unstyled content.
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  // If the app is opened from an emailed link, route straight to the matching
  // view with the emailed token. Verification links are `${APP_URL}/verify?token=...`,
  // password-reset links are `${APP_URL}/reset?token=...`. The token is removed
  // from the address bar immediately so it doesn't linger in the URL or browser
  // history after the page has captured it.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const pathname = window.location.pathname
    if (token) {
      if (pathname.includes('/verify')) {
        setVerifyToken(token)
        setView('verify')
      } else if (pathname.includes('/reset')) {
        setResetToken(token)
        setView('reset')
      }

      // Strip the token from the URL now that it's held in memory.
      params.delete('token')
      const search = params.toString()
      window.history.replaceState(null, '', `${pathname}${search ? `?${search}` : ''}`)
    }
  }, [])

  const navigate = (target, opts = {}) => {
    if (!KNOWN_VIEWS.has(target)) {
      setErrorState({ type: 404, message: `Unknown route: ${target}` })
      setView('error')
      return
    }
    // Auth guard: redirect to 401 error if the view requires login
    if (AUTH_REQUIRED.has(target) && !auth.user) {
      setErrorState({ type: 401, message: 'Sign in to access this page.' })
      setView('error')
      return
    }
    if (opts.errorType) {
      setErrorState({ type: opts.errorType, message: opts.errorMessage ?? '' })
    }
    setView(target)
  }

  const rememberRepo = (repo) => {
    setRecentRepos((prev) => {
      const next = [
        { ...repo, openedAt: new Date().toISOString() },
        ...prev.filter((item) => item.url !== repo.url),
      ].slice(0, 8)
      window.localStorage.setItem('codescope:recentRepos', JSON.stringify(next))
      return next
    })
  }

  const openRecentRepo = (repoUrl) => {
    setScanUrl(repoUrl)
    navigate('scan')
  }

  const openLegal = (page) => setLegalPage(page)
  const closeLegal = () => setLegalPage(null)

  const handleAuthSuccess = ({ token, user }) => {
    setAuth({ token, user })
    setView('dashboard')
  }

  const handleSignOut = () => {
    setAuth({ token: null, user: null })
    setView('home')
  }

  // Called by any page that receives a structured API error
  const handleApiError = (status, message) => {
    const type = [401, 403, 429, 500, 503].includes(status) ? status : 500
    setErrorState({ type, message })
    setView('error')
  }

  const renderPage = () => {
    // Auth guard check — belt-and-suspenders on top of navigate()
    if (AUTH_REQUIRED.has(view) && !auth.user) {
      return (
        <ErrorPage
          type={401}
          navigate={navigate}
          errorMessage="Sign in to access this page."
        />
      )
    }

    switch (view) {
      case 'login':
        return (
          <Login
            navigate={navigate}
            onAuthSuccess={handleAuthSuccess}
            openLegal={openLegal}
          />
        )
      case 'signup':
        return (
          <Signup
            navigate={navigate}
            onAuthSuccess={handleAuthSuccess}
            openLegal={openLegal}
          />
        )
      case 'forgot':
        return (
          <ForgotPassword
            navigate={navigate}
          />
        )
      case 'verify':
        return (
          <VerifyEmail
            token={verifyToken}
            onAuthSuccess={handleAuthSuccess}
            navigate={navigate}
          />
        )
      case 'reset':
        return (
          <ResetPassword
            navigate={navigate}
            token={resetToken}
          />
        )
      case 'dashboard':
        return (
          <Dashboard
            user={auth.user}
            onSignOut={handleSignOut}
            openLegal={openLegal}
            navigate={navigate}
            onApiError={handleApiError}
            recentRepos={recentRepos}
            onOpenRepo={openRecentRepo}
          />
        )
      case 'scan':
        return (
          <Scan
            user={auth.user}
            navigate={navigate}
            token={auth.token}
            onApiError={handleApiError}
            initialUrl={scanUrl}
            onRepoOpened={rememberRepo}
          />
        )
      case 'error':
        return (
          <ErrorPage
            type={errorState.type}
            errorMessage={errorState.message}
            navigate={navigate}
            onRetry={() => navigate('home')}
          />
        )
      default:
        return (
          <Home
            navigate={navigate}
            onAuthSuccess={handleAuthSuccess}
            openLegal={openLegal}
          />
        )
    }
  }

  return (
    <ErrorBoundary navigate={navigate}>
      <LoadingBar active={loading} />
      <Navbar
        navigate={navigate}
        user={auth.user}
        onSignOut={handleSignOut}
        openLegal={openLegal}
        currentView={view}
      />
      {loading ? null : <Suspense fallback={null}>{renderPage()}</Suspense>}
      <CookieBanner openLegal={openLegal} />
      <LegalModal page={legalPage} onClose={closeLegal} />
    </ErrorBoundary>
  )
}
