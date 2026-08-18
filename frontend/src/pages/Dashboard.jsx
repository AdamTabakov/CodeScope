import { useEffect, useState } from 'react'
import { listProjects, deleteProject } from '../services/api.js'

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
const IconTrash = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

const formatDate = (iso) => {
  if (!iso) return ''
  const date = new Date(iso)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function Dashboard({ user, onSignOut, openLegal, navigate, token, onApiError, onOpenProject, onNewScan }) {
  const isAdmin = user?.role === 'admin'
  const [projects, setProjects] = useState([])
  const [projectsLoading, setProjectsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setProjectsLoading(false)
      return
    }
    listProjects(token)
      .then(({ projects }) => setProjects(projects))
      .catch(() => setProjects([]))
      .finally(() => setProjectsLoading(false))
  }, [token])

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Delete this saved project and its chat history?')) return
    try {
      await deleteProject(id, token)
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch {
      // Ignore — the project stays listed.
    }
  }

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
            : 'Your saved projects and chat history are below.'}
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid fade-in-up fade-in-up--2">
        <div className="stat-card">
          <div className="stat-value">{projects.length}</div>
          <div className="stat-label">Saved projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {projects.reduce((sum, p) => sum + (p.messageCount ?? 0), 0)}
          </div>
          <div className="stat-label">Chat messages</div>
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

      {/* Saved projects */}
      <div className="fade-in-up fade-in-up--3">
        <h2 style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--subtle)', marginBottom: '1rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-sans)' }}>
          Saved projects
        </h2>
        {projectsLoading ? (
          <div className="stat-card" style={{ padding: '1.25rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
            Loading your saved projects…
          </div>
        ) : projects.length === 0 ? (
          <div className="stat-card" style={{ padding: '1.25rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
            No saved projects yet. Scan a repository and its project and chat history will be saved here automatically.
          </div>
        ) : (
          <div className="project-list">
            {projects.map((project) => (
              <div
                key={project.id}
                role="button"
                tabIndex={0}
                className="project-card"
                onClick={() => onOpenProject(project)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onOpenProject(project)
                  }
                }}
              >
                <span className="project-card__icon"><IconBranch /></span>
                <span className="project-card__body">
                  <span className="project-card__name">{project.fullName}</span>
                  <span className="project-card__meta">
                    {project.messageCount} messages · {project.linesOfCode.toLocaleString()} LOC
                    {project.languages.length ? ` · ${project.languages.slice(0, 3).join(', ')}` : ''}
                  </span>
                </span>
                <span className="project-card__right">
                  <span className="project-card__date">{formatDate(project.updatedAt)}</span>
                  <button
                    type="button"
                    className="project-card__delete"
                    title="Delete project"
                    aria-label={`Delete ${project.fullName}`}
                    onClick={(e) => handleDelete(e, project.id)}
                  >
                    <IconTrash />
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="dashboard-actions fade-in-up fade-in-up--4">
        <button className="btn btn--primary" type="button" onClick={onNewScan}>
          <IconBranch />
          New scan
        </button>
        <button className="btn btn--ghost" type="button" onClick={onSignOut}>
          Sign out
        </button>
      </div>

      {/* Legal footer */}
      <div className="dashboard-legal fade-in-up fade-in-up--5">
        Your account data (username, email, hashed password) and saved projects (repo metadata,
        file list, and chat history) are stored securely on CodeScope servers. We never sell your data.{' '}
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