import { Crown, GitBranch, FileCode2, Clock, ArrowRight } from 'lucide-react'

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
              <Crown size={12} strokeWidth={2} />
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
              <FileCode2 size={18} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {scan.file}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap', marginRight: '0.5rem' }}>
                {scan.lang}
              </span>
              <Clock size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} />
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
          <GitBranch size={15} />
          New scan
          <ArrowRight size={14} />
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
