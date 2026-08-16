const IconCrown = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 7l5 4 5-6 5 6 5-4-1 12H3z" />
    <path d="M3 21h18" />
  </svg>
)
const IconBranch = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="6" y1="3" x2="6" y2="15" />
    <circle cx="18" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M18 9a9 9 0 0 1-9 9" />
  </svg>
)

export default function Dashboard({ user, onSignOut, openLegal, navigate }) {
  const isAdmin = user?.role === 'admin'

  return (
    <div className="dashboard-page">
      <div className="dashboard-header fade-in-up">
        <div className="dashboard-welcome">
          Welcome back, {user?.username}
          {isAdmin && (
            <span className="admin-badge">
              <IconCrown />
              Admin
            </span>
          )}
        </div>
        <p className="dashboard-sub">
          {isAdmin
            ? 'You have admin access. All scans and users are visible to you.'
            : 'Your recent scans and saved repositories are below.'}
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid fade-in-up fade-in-up--2">
        <div className="stat-card">
          <div className="stat-value">0</div>
          <div className="stat-label">Scans run</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">0</div>
          <div className="stat-label">Repos connected</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">—</div>
          <div className="stat-label">Avg. complexity</div>
        </div>
        {isAdmin && (
          <div className="stat-card">
            <div className="stat-value" style={{ color: '#fbbf24' }}>∞</div>
            <div className="stat-label">Admin access</div>
          </div>
        )}
      </div>

      {/* Recent scans */}
      <div className="fade-in-up fade-in-up--3">
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--subtle)', marginBottom: '1rem', letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}>
          Recent scans
        </h2>
        <div className="stat-card" style={{ padding: '1.25rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
          No scans yet. Run your first scan to see its complexity score and analysis here.
        </div>
      </div>

      {/* Actions */}
      <div className="dashboard-actions fade-in-up fade-in-up--4">
        <button className="btn btn--primary" type="button" onClick={() => navigate('scan')}>
          <IconBranch />
          New scan
        </button>
        <button className="btn btn--ghost" type="button" onClick={onSignOut}>
          Sign out
        </button>
      </div>

      {/* Legal footer */}
      <div className="dashboard-legal fade-in-up fade-in-up--5">
        Your account data (username, email, hashed password) and scan submissions are stored
        securely on CodeScope servers. We never sell your data.{' '}
        <button type="button" className="legal-inline-link" onClick={() => openLegal('privacy')}>
          Privacy Policy
        </button>
        {' · '}
        <button type="button" className="legal-inline-link" onClick={() => openLegal('terms')}>
          Terms of Service
        </button>
      </div>
    </div>
  )
}
