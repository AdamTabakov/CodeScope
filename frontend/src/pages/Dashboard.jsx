const IconCrown = () => (
  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 7l5 4 5-6 5 6 5-4-1 12H3z" />
    <path d="M3 21h18" />
  </svg>
)
const IconFile = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
)
const IconClock = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
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

const PLACEHOLDER_SCANS = [
  { id: 1, file: 'src/api/payments.js', score: 'B', lang: 'JS', ago: '2 hours ago' },
  { id: 2, file: 'auth/session.ts', score: 'C', lang: 'TS', ago: 'Yesterday' },
  { id: 3, file: 'processors/pipeline.py', score: 'A', lang: 'PY', ago: '3 days ago' },
]

const SCORE_COLORS = {
  A: 'var(--green)',
  B: 'var(--cyan)',
  C: '#fbbf24',
  D: 'var(--red)',
}

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
          <div className="stat-value">3</div>
          <div className="stat-label">Scans run</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">1</div>
          <div className="stat-label">Repos connected</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">B+</div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          {PLACEHOLDER_SCANS.map((scan) => (
            <div
              key={scan.id}
              className="stat-card"
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}
            >
              <IconFile />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {scan.file}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>
                {scan.lang}
              </span>
              <IconClock />
              <span style={{ fontSize: '0.78rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{scan.ago}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.875rem', color: SCORE_COLORS[scan.score] ?? 'var(--text)', minWidth: '1.5rem', textAlign: 'right' }}>
                {scan.score}
              </span>
            </div>
          ))}
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
