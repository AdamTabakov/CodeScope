import { useState } from 'react'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import Navbar from './components/Navbar.jsx'
import LegalModal from './components/LegalModal.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Scan from './pages/Scan.jsx'
import ErrorPage from './pages/ErrorPage.jsx'

// Views that require the user to be signed in
const AUTH_REQUIRED = new Set(['dashboard', 'scan'])

// All known views — anything else gets a 404
const KNOWN_VIEWS = new Set(['home', 'login', 'signup', 'dashboard', 'scan', 'error'])

export default function App() {
  const [view, setView] = useState('home')
  const [auth, setAuth] = useState({ token: null, user: null })
  const [legalPage, setLegalPage] = useState(null)
  const [errorState, setErrorState] = useState({ type: 404, message: '' })
  const [scanUrl, setScanUrl] = useState('')
  const [recentRepos, setRecentRepos] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem('codescope:recentRepos') || '[]')
    } catch {
      return []
    }
  })

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
      <Navbar
        navigate={navigate}
        user={auth.user}
        onSignOut={handleSignOut}
        openLegal={openLegal}
        currentView={view}
      />
      {renderPage()}
      <LegalModal page={legalPage} onClose={closeLegal} />
    </ErrorBoundary>
  )
}
