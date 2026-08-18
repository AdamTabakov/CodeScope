import { useState } from 'react'
import ThemeToggle from './ThemeToggle.jsx'

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}
const IconMenu = () => (
  <svg {...iconProps} width="18" height="18"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
)
const IconClose = () => (
  <svg {...iconProps} width="18" height="18"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
)

export default function Navbar({ navigate, user, onSignOut, openLegal, currentView }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const go = (target) => {
    setMenuOpen(false)
    navigate(target)
  }

  const closeMenu = () => setMenuOpen(false)

  const navLink = (label, target) => (
    <button
      type="button"
      className={`navbar__nav-link${currentView === target ? ' navbar__nav-link--active' : ''}`}
      onClick={() => go(target)}
    >
      {label}
    </button>
  )

  return (
    <nav className="navbar">
      <button
        className="navbar__logo"
        onClick={() => go('home')}
        aria-label="Go to homepage"
      >
        <span className="navbar__logo-icon">&lt;/&gt;</span>
        <span className="navbar__logo-text">CodeScope</span>
      </button>

      {user && (
        <div className="navbar__nav">
          {navLink('Dashboard', 'dashboard')}
          {navLink('Scan', 'scan')}
        </div>
      )}

      <div className="navbar__actions">
        <ThemeToggle />

        {user ? (
          <>
            <span className="navbar__user navbar__user--desktop">
              <span className="navbar__username">
                {user.username}
              </span>
            </span>
            <button
              className="btn btn--ghost navbar__user--desktop"
              onClick={onSignOut}
              style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}
            >
              Sign out
            </button>
          </>
        ) : (
          <div className="navbar__auth navbar__user--desktop">
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
              onClick={() => go('login')}
              style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}
            >
              Log in
            </button>
            <button
              className="btn btn--primary"
              onClick={() => go('signup')}
              style={{ fontSize: '0.8125rem', padding: '0.375rem 0.875rem' }}
            >
              Get Started
            </button>
          </div>
        )}

        {/* Mobile hamburger */}
        <button
          type="button"
          className={`navbar__menu-btn${menuOpen ? ' navbar__menu-btn--open' : ''}`}
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="navbar__menu">
          {user ? (
            <div className="navbar__menu-group">
              <span className="navbar__menu-user">{user.username}</span>
              {navLink('Dashboard', 'dashboard')}
              {navLink('Scan', 'scan')}
              <button
                className="btn btn--ghost btn--full"
                onClick={onSignOut}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="navbar__menu-group">
              <button className="btn btn--primary btn--full" onClick={() => go('signup')}>
                Get started free
              </button>
              <button className="btn btn--ghost btn--full" onClick={() => go('login')}>
                Log in
              </button>
              <div className="navbar__menu-legal">
                <button
                  type="button"
                  className="navbar__legal-link"
                  onClick={() => {
                    openLegal('privacy')
                    closeMenu()
                  }}
                >
                  Privacy Policy
                </button>
                <button
                  type="button"
                  className="navbar__legal-link"
                  onClick={() => {
                    openLegal('terms')
                    closeMenu()
                  }}
                >
                  Terms of Service
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}