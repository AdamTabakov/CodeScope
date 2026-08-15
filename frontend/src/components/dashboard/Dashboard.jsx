import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'

const ignorePrefixes = ['.git/', 'node_modules/', '.next/', 'dist/', 'build/', '.venv/', '__pycache__/', 'coverage/']

function buildExplorerTree(filePaths) {
  const root = {
    type: 'folder',
    name: 'repo',
    path: 'repo',
    children: [],
  }

  filePaths.forEach((filePath) => {
    const parts = filePath.split('/').filter(Boolean)
    let current = root

    parts.forEach((part, index) => {
      const isLeaf = index === parts.length - 1
      const nodePath = parts.slice(0, index + 1).join('/')
      const existing = current.children.find((child) => child.name === part)

      if (existing) {
        current = existing
        return
      }

      const node = {
        type: isLeaf ? 'file' : 'folder',
        name: part,
        path: nodePath,
        children: isLeaf ? undefined : [],
      }

      current.children.push(node)
      current = node
    })
  })

  const sortChildren = (node) => {
    if (!node.children) return

    node.children.sort((left, right) => {
      const folderWeight = left.type === 'folder' ? 0 : 1
      const rightWeight = right.type === 'folder' ? 0 : 1

      if (folderWeight !== rightWeight) {
        return folderWeight - rightWeight
      }

      return left.name.localeCompare(right.name)
    })

    node.children.forEach(sortChildren)
  }

  sortChildren(root)
  return root
}

function shouldIgnorePath(path) {
  return ignorePrefixes.some((prefix) => path.startsWith(prefix))
}

function parseGitHubRepoUrl(repoUrl) {
  const normalized = repoUrl.trim().replace(/\/+$/, '')
  const safeUrl = normalized.startsWith('http://') || normalized.startsWith('https://')
    ? normalized
    : `https://${normalized}`

  const parsed = new URL(safeUrl)

  if (parsed.hostname.toLowerCase() !== 'github.com') {
    throw new Error('Use a public GitHub repo URL like https://github.com/owner/repo')
  }

  const parts = parsed.pathname.split('/').filter(Boolean)

  if (parts.length < 2) {
    throw new Error('Use a public GitHub repo URL like https://github.com/owner/repo')
  }

  const owner = parts[0]
  const repo = parts[1].replace(/\.git$/i, '')
  const branchIndex = parts.findIndex((part) => part === 'tree' || part === 'blob')
  const branch = branchIndex >= 0 ? parts[branchIndex + 1] : null
  const subpath = branchIndex >= 0 ? parts.slice(branchIndex + 2).join('/') : ''

  return {
    owner,
    repo,
    branch,
    subpath,
  }
}

async function fetchJson(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        Accept: 'application/vnd.github+json',
      },
    })

    return response.data
  } catch (error) {
    const status = error.response?.status || 'request'
    throw new Error(`GitHub request failed with ${status}.`)
  }
}

export default function Dashboard({ user, onLogout }) {
  const [repoUrl, setRepoUrl] = useState('')
  const [repoTree, setRepoTree] = useState(null)
  const [selectedPath, setSelectedPath] = useState('')
  const [selectedFileText, setSelectedFileText] = useState('')
  const [expandedFolders, setExpandedFolders] = useState(new Set(['repo']))
  const [repoMeta, setRepoMeta] = useState(null)
  const [statusMessage, setStatusMessage] = useState('Paste a public GitHub repo URL to browse its source tree in the explorer.')
  const [statusState, setStatusState] = useState('idle')

  useEffect(() => {
    if (!repoMeta || !selectedPath) return undefined

    let cancelled = false

    const { owner, repo, branch } = repoMeta
    const encodedPath = selectedPath.split('/').map((segment) => encodeURIComponent(segment)).join('/')
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodedPath}`

    axios
      .get(rawUrl)
      .then((response) => {
        if (!cancelled) setSelectedFileText(response.data)
      })
      .catch(() => {
        if (!cancelled) setSelectedFileText('Unable to read this file as text.')
      })

    return () => {
      cancelled = true
    }
  }, [repoMeta, selectedPath])

  const explorerNodes = useMemo(() => repoTree?.children || [], [repoTree])

  const handleRepoSubmit = async (event) => {
    event.preventDefault()

    setStatusState('loading')
    setStatusMessage('Loading the repository tree...')

    try {
      const { owner, repo, branch: branchFromUrl, subpath } = parseGitHubRepoUrl(repoUrl)
      const repoInfo = await fetchJson(`https://api.github.com/repos/${owner}/${repo}`)
      const branch = branchFromUrl || repoInfo.default_branch || 'main'
      const treeResponse = await fetchJson(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
      )

      const scopedPaths = treeResponse.tree
        .filter((entry) => entry.type === 'blob' && !shouldIgnorePath(entry.path))
        .map((entry) => entry.path)
        .filter((entryPath) => {
          if (!subpath) return true
          return entryPath === subpath || entryPath.startsWith(`${subpath}/`)
        })
        .sort((left, right) => left.localeCompare(right))

      const filePaths = scopedPaths.map((entryPath) => entryPath.replace(`${subpath}/`, '').replace(`${subpath}`, ''))

      if (filePaths.length === 0) {
        throw new Error('No user-facing source files were found in that repository tree.')
      }

      const nextTree = buildExplorerTree(filePaths)
      const nextMeta = { owner, repo, branch }

      setRepoTree(nextTree)
      setRepoMeta(nextMeta)
      setSelectedPath(filePaths[0])
      setExpandedFolders(new Set(['repo']))
      setStatusState('success')
      setStatusMessage(`Loaded ${filePaths.length} source file${filePaths.length === 1 ? '' : 's'} from ${owner}/${repo}.`)
    } catch (error) {
      setStatusState('error')
      setStatusMessage(error.message || 'That GitHub repo could not be loaded.')
    }
  }

  const toggleFolder = (folderPath) => {
    setExpandedFolders((current) => {
      const next = new Set(current)

      if (next.has(folderPath)) {
        next.delete(folderPath)
      } else {
        next.add(folderPath)
      }

      return next
    })
  }

  const renderExplorer = (node, depth = 0) => {
    const isFolder = node.type === 'folder'
    const isOpen = expandedFolders.has(node.path)
    const active = selectedPath === node.path

    return (
      <div key={node.path}>
        <button
          className={`repo-explorer__node ${isFolder ? 'repo-explorer__node--folder' : 'repo-explorer__node--file'} ${active ? 'repo-explorer__node--active' : ''}`}
          type="button"
          style={{ paddingLeft: `${depth * 14 + 12}px` }}
          onClick={() => {
            if (isFolder) {
              toggleFolder(node.path)
              return
            }

            setSelectedPath(node.path)
          }}
        >
          <span className="repo-explorer__icon" aria-hidden="true">
            {isFolder ? (isOpen ? '▾' : '▸') : '•'}
          </span>
          <span>{node.name}</span>
        </button>

        {isFolder && isOpen && node.children?.map((child) => renderExplorer(child, depth + 1))}
      </div>
    )
  }

  const codeLines = selectedFileText.split('\n')

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <a className="wordmark" href="#dashboard" aria-label="CodeScope dashboard">
          <span className="wordmark__mark">CS</span>
          CodeScope
        </a>
        <nav className="dashboard-nav" aria-label="Dashboard">
          <a href="#overview">Overview</a>
          <a href="#repo">Repo scan</a>
          <a href="#assistant">Assistant</a>
        </nav>
        <button className="login-link login-link--button" type="button" onClick={onLogout}>
          Log out
        </button>
      </aside>

      <section className="dashboard-main" id="dashboard">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Signed in as {user?.role || 'user'}</p>
            <h1>Welcome back, {user?.username || 'developer'}.</h1>
          </div>
          <div className="dashboard-token">Session active</div>
        </header>

        <section className="dashboard-grid" id="overview">
          <article className="dashboard-card dashboard-card--wide">
            <span className="dashboard-card__label">Repository workspace</span>
            <h2>Open a GitHub repository</h2>
            <p>
              Paste a public GitHub repo link, browse its file tree, and inspect the source files directly in the browser.
            </p>
            <form className="repo-submit" onSubmit={handleRepoSubmit}>
              <input
                type="url"
                placeholder="https://github.com/owner/repo"
                aria-label="GitHub repository URL"
                value={repoUrl}
                onChange={(event) => setRepoUrl(event.target.value)}
              />
              <button className="button" type="submit" disabled={statusState === 'loading'}>
                {statusState === 'loading' ? 'Loading...' : 'Open repo'}
              </button>
            </form>

            <p className={`repo-status repo-status--${statusState}`}>{statusMessage}</p>

            {repoTree ? (
              <div className="repo-browser">
                <aside className="repo-browser__tree" aria-label="Repository explorer">
                  {explorerNodes.map((node) => renderExplorer(node))}
                </aside>
                <section className="repo-browser__viewer" aria-label="Selected source file">
                  <div className="repo-browser__viewer-header">
                    <span>{selectedPath || 'No file selected'}</span>
                  </div>
                  <pre className="code-viewer">
                    {codeLines.map((line, index) => (
                      <span className="code-viewer__line" key={`${selectedPath}-${index}`}>
                        <span className="code-viewer__line-no">{String(index + 1).padStart(2, '0')}</span>
                        <span>{line || ' '}</span>
                      </span>
                    ))}
                  </pre>
                </section>
              </div>
            ) : (
              <div className="repo-browser repo-browser--empty">
                <div className="repo-browser__tree repo-browser__tree--placeholder">
                  <p>Explorer will appear here after you paste a GitHub repo URL.</p>
                </div>
                <div className="repo-browser__viewer">
                  <div className="repo-browser__viewer-header">
                    <span>preview://code</span>
                  </div>
                  <pre className="code-viewer code-viewer--placeholder">
                    <span className="code-viewer__line">
                      <span className="code-viewer__line-no">00</span>
                      <span>Paste a public repository URL to inspect the files in-browser.</span>
                    </span>
                  </pre>
                </div>
              </div>
            )}
          </article>

          <article className="dashboard-card">
            <span className="dashboard-card__label">Recent result</span>
            <h2>No scans yet</h2>
            <p>Your first complexity score and issue summary will appear here.</p>
          </article>

          <article className="dashboard-card">
            <span className="dashboard-card__label">Security</span>
            <h2>Browser session</h2>
            <p>The frontend keeps the current sign-in state in browser storage for the active session only.</p>
          </article>
        </section>
      </section>

      <aside className="chat-panel" id="assistant">
        <div className="chat-panel__header">
          <span>Assistant</span>
          <strong>test mode</strong>
        </div>
        <div className="chat-message chat-message--system">
          Test: ask about a scan result here later. This panel is only a frontend mock right now.
        </div>
        <div className="chat-message">Try: explain the backend auth flow.</div>
        <form className="chat-input" onSubmit={(event) => event.preventDefault()}>
          <input type="text" placeholder="Chat is not connected yet" disabled />
          <button type="submit" disabled>
            Send
          </button>
        </form>
      </aside>
    </main>
  )
}
