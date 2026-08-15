import { Crown } from 'lucide-react'

export default function Navbar({ navigate, user, onSignOut, openLegal, currentView }) {
  return (
    <nav className="navbar">
      <button
        className="navbar__logo"
        onClick={() => navigate('home')}
        aria-label="Go to homepage"
      >
        <span className="navbar__logo-icon">&lt;/&gt;</span>
        <span className="navbar__logo-text">CodeScope</span>
      </button>

      {user && (
        <div className="navbar__nav">
          <button
            type="button"
            className={`navbar__nav-link${currentView === 'dashboard' ? ' navbar__nav-link--active' : ''}`}
            onClick={() => navigate('dashboard')}
          >
            Dashboard
          </button>
          <button
            type="button"
            className={`navbar__nav-link${currentView === 'scan' ? ' navbar__nav-link--active' : ''}`}
            onClick={() => navigate('scan')}
          >
            Scan
          </button>
        </div>
      )}

      <div className="navbar__actions">
        {user ? (
          <>
            <span className="navbar__user">
              <span className="navbar__username">
                {user.role === 'admin' && (
                  <Crown
                    size={13}
                    aria-label="Admin"
                    title="Admin"
                    style={{
                      color: '#fbbf24',
                      filter: 'drop-shadow(0 0 5px rgba(251,191,36,0.45))',
                      marginRight: '0.2rem',
                      flexShrink: 0,
                    }}
                  />
                )}
                {user.username}
              </span>
            </span>
            <button
              className="btn btn--ghost"
              onClick={onSignOut}
              style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="navbar__legal-link"
              onClick={() => openLegal('privacy')}
            >
              Privacy
            </button>
            <button
              type="button"
              className="navbar__legal-link"
              onClick={() => openLegal('terms')}
            >
              Terms
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => navigate('login')}
              style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}
            >
              Log in
            </button>
            <button
              className="btn btn--primary"
              onClick={() => navigate('signup')}
              style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}
            >
              Get Started
            </button>
          </>
        )}
      </div>
    </nav>
  )
}
