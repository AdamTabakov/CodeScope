import { useEffect, useMemo, useRef, useState } from 'react'
import { streamChat } from '../services/api.js'

// ── Inline icons (no icon library) ───────────────────────────────────────────
const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: '2',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}
const IconBack = ({ size = 15 }) => <svg {...iconProps} width={size} height={size}><polyline points="15 18 9 12 15 6" /></svg>
const IconBranch = ({ size = 14, className }) => (
  <svg {...iconProps} width={size} height={size} className={className}>
    <line x1="6" y1="3" x2="6" y2="15" /><circle cx="18" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M18 9a9 9 0 0 1-9 9" />
  </svg>
)
const IconFolder = () => <svg {...iconProps} width={13} height={13}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
const IconFolderOpen = () => <svg {...iconProps} width={13} height={13}><path d="M6 17l-4-9 5 0 2-3h7l2 4-10 0z" /><path d="M22 17l-4-9-4 0" /></svg>
const IconFile = () => <svg {...iconProps} width={13} height={13}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
const IconAlert = ({ size = 13 }) => <svg {...iconProps} width={size} height={size}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
const IconWarning = ({ size = 12 }) => <svg {...iconProps} width={size} height={size}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
const IconLink = ({ size = 12 }) => <svg {...iconProps} width={size} height={size}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
const IconChat = ({ size = 16 }) => <svg {...iconProps} width={size} height={size}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
const IconSend = ({ size = 14 }) => <svg {...iconProps} width={size} height={size}><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
const IconClose = ({ size = 14 }) => <svg {...iconProps} width={size} height={size}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
const IconSpinner = ({ size = 14 }) => (
  <svg className="spin" {...iconProps} width={size} height={size}>
    <circle cx="12" cy="12" r="10" opacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
)

// ── Safety constants ──────────────────────────────────────────────────────────

const MAX_FILE_COUNT = 800
const MAX_REPO_SIZE_KB = 102400 // 100 MB

const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.bmp', '.tiff',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.zip', '.tar', '.gz', '.rar', '.7z', '.bin',
  '.mp3', '.mp4', '.wav', '.avi', '.mov', '.mkv',
  '.ttf', '.woff', '.woff2', '.eot', '.otf',
  '.exe', '.dll', '.so', '.dylib', '.obj',
  '.pyc', '.pyo', '.class', '.o',
])

function isBinary(path) {
  const dot = path.lastIndexOf('.')
  if (dot === -1) return false
  return BINARY_EXTENSIONS.has(path.slice(dot).toLowerCase())
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const IGNORE_PREFIXES = [
  '.git/', 'node_modules/', '.next/', 'dist/', 'build/',
  '.venv/', '__pycache__/', 'coverage/',
]

function shouldIgnore(path) {
  return IGNORE_PREFIXES.some((p) => path.startsWith(p))
}

function parseGitHubUrl(raw) {
  const normalized = raw.trim().replace(/\/+$/, '')
  const url =
    normalized.startsWith('http://') || normalized.startsWith('https://')
      ? normalized
      : `https://${normalized}`

  const parsed = new URL(url)
  if (parsed.hostname.toLowerCase() !== 'github.com') {
    throw new Error('Only public GitHub repo URLs are supported (https://github.com/owner/repo).')
  }

  const parts = parsed.pathname.split('/').filter(Boolean)
  if (parts.length < 2) {
    throw new Error('Use the full repo URL, e.g. https://github.com/owner/repo')
  }

  const owner = parts[0]
  const repo = parts[1].replace(/\.git$/i, '')
  const branchIdx = parts.findIndex((p) => p === 'tree' || p === 'blob')
  const branch = branchIdx >= 0 ? parts[branchIdx + 1] : null
  const subpath = branchIdx >= 0 ? parts.slice(branchIdx + 2).join('/') : ''

  return { owner, repo, branch, subpath }
}

async function uploadRepository(url, token) {
  const response = await fetch('/api/repositories/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token,
    },
    body: JSON.stringify({ url }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Could not load that repository.')
  return data
}

function buildTree(paths) {
  const root = { type: 'folder', name: 'repo', path: 'repo', children: [] }

  for (const filePath of paths) {
    const parts = filePath.split('/').filter(Boolean)
    let cur = root

    parts.forEach((part, i) => {
      const isLeaf = i === parts.length - 1
      const nodePath = parts.slice(0, i + 1).join('/')
      let node = cur.children.find((c) => c.name === part)

      if (!node) {
        node = {
          type: isLeaf ? 'file' : 'folder',
          name: part,
          path: nodePath,
          children: isLeaf ? undefined : [],
        }
        cur.children.push(node)
      }
      cur = node
    })
  }

  const sort = (node) => {
    if (!node.children) return
    node.children.sort((a, b) => {
      const wa = a.type === 'folder' ? 0 : 1
      const wb = b.type === 'folder' ? 0 : 1
      return wa !== wb ? wa - wb : a.name.localeCompare(b.name)
    })
    node.children.forEach(sort)
  }

  sort(root)
  return root
}

// ── Tree node ─────────────────────────────────────────────────────────────────

function TreeNode({ node, depth, selected, expanded, onSelect, onToggle }) {
  const isFolder = node.type === 'folder'
  const isOpen = expanded.has(node.path)
  const isActive = selected === node.path

  return (
    <div>
      <button
        type="button"
        className={`scan-tree-node ${isActive ? 'scan-tree-node--active' : ''}`}
        style={{ paddingLeft: `${depth * 14 + 10}px` }}
        onClick={() => {
          if (isFolder) onToggle(node.path)
          else onSelect(node.path)
        }}
      >
        <span className="scan-tree-node__icon">
          {isFolder
            ? isOpen
              ? <IconFolderOpen />
              : <IconFolder />
            : <IconFile />}
        </span>
        <span className="scan-tree-node__name">{node.name}</span>
      </button>
      {isFolder && isOpen && node.children?.map((child) => (
        <TreeNode
          key={child.path}
          node={child}
          depth={depth + 1}
          selected={selected}
          expanded={expanded}
          onSelect={onSelect}
          onToggle={onToggle}
        />
      ))}
    </div>
  )
}

// ── Quick action chips ────────────────────────────────────────────────────────

const QUICK_CHIPS = [
  'Explain this file',
  'Find security issues',
  'Summarize the logic',
  'Rate the complexity',
]

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Scan({ navigate, user, token }) {
  const [url, setUrl] = useState('')
  const [status, setStatus] = useState({ state: 'idle', message: '' })
  const [warnings, setWarnings] = useState([])
  const [meta, setMeta] = useState(null)         // { owner, repo, branch }
  const [tree, setTree] = useState(null)
  const [files, setFiles] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [selectedPath, setSelectedPath] = useState('')
  const [fileText, setFileText] = useState('')
  const [fileLoading, setFileLoading] = useState(false)
  const [expanded, setExpanded] = useState(new Set(['repo']))

  // Chat state
  const [chatOpen, setChatOpen] = useState(false)
  const [messages, setMessages] = useState([])   // { id, role, content, file }
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  const messagesEndRef = useRef(null)
  const pasteTimeoutRef = useRef(null)
  const chatHasOpened = useRef(false)

  // Auto-scroll to bottom when messages change or loading state toggles
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, chatLoading])

  // Greeting message on first open
  useEffect(() => {
    if (chatOpen && !chatHasOpened.current) {
      chatHasOpened.current = true
      setMessages([{
        id: Date.now(),
        role: 'assistant',
        content: "Hi! I'm your Code Assistant. Open a repository and select a file. Then ask me anything about the code. I can explain behaviour, flag potential issues, suggest improvements, or walk through the logic with you.",
        file: null,
      }])
    }
  }, [chatOpen])

  // Load file content from the repository payload whenever selection changes.
  useEffect(() => {
    setFileLoading(false)
    const selectedFile = files.find((file) => file.path === selectedPath)
    setFileText(selectedFile?.content ?? '')
  }, [files, selectedPath])

  const buildChatContext = (override = {}) => {
    const activePath = override.selectedPath ?? selectedPath
    const activeFile = override.files?.find((file) => file.path === activePath) ?? files.find((file) => file.path === activePath)
    const activeMeta = override.meta ?? meta
    return {
      repo: activeMeta ? `${activeMeta.owner}/${activeMeta.repo}` : null,
      branch: activeMeta?.branch,
      file: activePath,
      code: (activeFile?.content ?? fileText).slice(0, 12000),
      files: (override.files ?? files).map(({ path, language, lineCount }) => ({ path, language, lineCount })),
      metrics: override.metrics ?? metrics,
    }
  }

const patchMessage = (id, updater) =>
    setMessages((prev) => prev.map((m) => (m.id === id ? updater(m) : m)))

  const requestAssistant = async ({ message, context, onDelta }) => {
    const reply = await streamChat({ message, context, token, onDelta })
    return reply
  }

  const handleSubmitLegacy = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!url.trim()) return

    setStatus({ state: 'loading', message: 'Fetching repository tree…' })
    setWarnings([])
    setTree(null)
    setMeta(null)
    setFiles([])
    setMetrics(null)
    setSelectedPath('')
    setFileText('')

    try {
      const { owner, repo, branch: urlBranch, subpath } = parseGitHubUrl(url)
      const repoInfo = await ghFetch(`https://api.github.com/repos/${owner}/${repo}`)

      // Safety validations
      if (repoInfo.private) {
        throw new Error('Private repositories are not supported. Only public repos can be loaded.')
      }
      if (repoInfo.disabled) {
        throw new Error('This repository has been disabled on GitHub.')
      }
      if (repoInfo.size > MAX_REPO_SIZE_KB) {
        throw new Error(`Repository is too large (${Math.round(repoInfo.size / 1024)}MB). Maximum is 100MB.`)
      }

      const newWarnings = []
      if (repoInfo.archived) {
        newWarnings.push('This repository is archived and no longer actively maintained.')
      }
      if (repoInfo.size > 50 * 1024) {
        newWarnings.push(`Large repository (${Math.round(repoInfo.size / 1024)}MB). Loading may be slow.`)
      }

      const branch = urlBranch || repoInfo.default_branch || 'main'
      const treeData = await ghFetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`
      )

      let paths = treeData.tree
        .filter((e) => e.type === 'blob' && !shouldIgnore(e.path) && !isBinary(e.path))
        .map((e) => e.path)
        .filter((p) => !subpath || p === subpath || p.startsWith(`${subpath}/`))
        .map((p) => subpath ? p.replace(`${subpath}/`, '').replace(subpath, '') : p)
        .sort((a, b) => a.localeCompare(b))

      if (paths.length > MAX_FILE_COUNT) {
        newWarnings.push(`Showing first ${MAX_FILE_COUNT} of ${paths.length} files (binary files excluded).`)
        paths = paths.slice(0, MAX_FILE_COUNT)
      }

      if (paths.length === 0) {
        throw new Error('No source files found. Try a different path or branch.')
      }

      const built = buildTree(paths)
      setTree(built)
      setMeta({ owner, repo, branch })
      setSelectedPath(paths[0])
      setExpanded(new Set(['repo']))
      setWarnings(newWarnings)
      setStatus({
        state: 'success',
        message: `${paths.length} file${paths.length === 1 ? '' : 's'} from ${owner}/${repo} · ${branch}`,
      })
    } catch (err) {
      setStatus({ state: 'error', message: err.message || 'Could not load that repository.' })
    }
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    if (!url.trim()) return

    setStatus({ state: 'loading', message: 'Uploading repository link...' })
    setWarnings([])
    setTree(null)
    setMeta(null)
    setFiles([])
    setMetrics(null)
    setSelectedPath('')
    setFileText('')

    try {
      if (!token) throw new Error('Sign in before uploading a repository link.')

      const data = await uploadRepository(url, token)
      const paths = data.files.map((file) => file.path)
      const newWarnings = []

      if (data.metrics.truncated) {
        newWarnings.push(`Showing first ${data.metrics.filesRetrieved} of ${data.metrics.totalFiles} files (binary files excluded).`)
      }
      if (data.metrics.rateLimitRemaining !== null) {
        newWarnings.push(`GitHub API calls: ${data.metrics.apiCalls}. Rate limit remaining: ${data.metrics.rateLimitRemaining}.`)
      }

      setTree(data.tree)
      setMeta(data.meta)
      setFiles(data.files)
      setMetrics(data.metrics)
      setSelectedPath(paths[0] ?? '')
      setExpanded(new Set(['repo']))
      setWarnings(newWarnings)
      setStatus({
        state: 'success',
        message: `${data.metrics.filesRetrieved} files / ${data.metrics.linesOfCode} LOC from ${data.meta.fullName} - ${data.meta.branch}`,
      })

setChatOpen(true)
      setChatLoading(true)
      const summaryId = Date.now()
      setMessages([{ id: summaryId, role: 'assistant', content: '', file: null }])
      chatHasOpened.current = true
      try {
        const summary = await requestAssistant({
          message: 'Summarize this repository. Focus on purpose, structure, languages, notable files, and what I should inspect first.',
          context: buildChatContext({
            meta: data.meta,
            files: data.files,
            metrics: data.metrics,
            selectedPath: paths[0] ?? '',
          }),
          onDelta: (delta) =>
            patchMessage(summaryId, (m) => ({ ...m, content: m.content + delta })),
        })
        patchMessage(summaryId, (m) => ({ ...m, content: summary }))
      } catch {
        patchMessage(summaryId, (m) => ({
          ...m,
          content: `${data.meta.fullName} loaded with ${data.metrics.filesRetrieved} files, ${data.metrics.linesOfCode} LOC, and these languages: ${data.metrics.languages.join(', ')}. Ask about architecture, bugs, tests, security, or a selected file.`,
        }))
      } finally {
        setChatLoading(false)
      }
    } catch (err) {
      setStatus({ state: 'error', message: err.message || 'Could not load that repository.' })
    }
  }

  // Auto-submit on paste if value looks like a GitHub URL
  const handlePaste = (e) => {
    if (pasteTimeoutRef.current) clearTimeout(pasteTimeoutRef.current)
    pasteTimeoutRef.current = setTimeout(() => {
      const pasted = e.target.value
      if (pasted && pasted.includes('github.com')) {
        handleSubmit(null)
      }
    }, 80)
  }

  const toggleFolder = (path) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(path) ? next.delete(path) : next.add(path)
      return next
    })
  }

  // Chat helpers
  const hasAssistantMessages = messages.some((m) => m.role === 'assistant')
  const hasUserMessages = messages.some((m) => m.role === 'user')
  const showChips = selectedPath && !hasUserMessages

  const sendMessage = async (content) => {
    if (!content.trim() || chatLoading || !token) return

const userMsg = { id: Date.now(), role: 'user', content: content.trim(), file: selectedPath }
    setMessages((prev) => [...prev, userMsg])
    setChatInput('')
    setChatLoading(true)

    const assistantId = Date.now() + 1
    setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '', file: selectedPath }])

    try {
      const reply = await requestAssistant({
        message: content.trim(),
        context: buildChatContext(),
        onDelta: (delta) =>
          patchMessage(assistantId, (m) => ({ ...m, content: m.content + delta })),
      })
      patchMessage(assistantId, (m) => ({ ...m, content: reply }))
    } catch {
      patchMessage(assistantId, (m) => ({
        ...m,
        content: "I couldn't connect to the analysis service. Make sure you're logged in and the backend is running.",
      }))
    } finally {
      setChatLoading(false)
    }
  }

  const handleChatKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      sendMessage(chatInput)
    }
  }

  const rootNodes = useMemo(() => tree?.children ?? [], [tree])
  const codeLines = fileText.split('\n')

  return (
    <div className="scan-page fade-in-up">
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div className="scan-topbar">
        <button type="button" className="scan-back" onClick={() => navigate('dashboard')}>
          <IconBack />
          Dashboard
        </button>

        <form className="scan-url-form" onSubmit={handleSubmit}>
          <div className="scan-url-wrap">
            <IconBranch size={14} className="scan-url-icon" />
            <input
              className="scan-url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onPaste={handlePaste}
              placeholder="https://github.com/owner/repo"
              spellCheck={false}
              autoComplete="off"
              disabled={status.state === 'loading'}
            />
          </div>
          <button
            className="btn btn--primary"
            type="submit"
            disabled={status.state === 'loading' || !url.trim()}
            style={{ fontSize: '0.8125rem', padding: '0.45rem 1.1rem', whiteSpace: 'nowrap' }}
          >
            {status.state === 'loading'
              ? <><IconSpinner size={13} /> Loading…</>
              : 'Open repo'}
          </button>
        </form>

        {/* Chat toggle button */}
        <button
          type="button"
          className={`scan-chat-toggle${chatOpen ? ' scan-chat-toggle--active' : ''}`}
          onClick={() => setChatOpen((o) => !o)}
          title="Code Assistant"
          aria-label="Toggle code assistant"
        >
          <IconChat />
          {hasAssistantMessages && !chatOpen && <span className="scan-chat-badge" />}
        </button>
      </div>

      {/* ── Status bar ──────────────────────────────────────────────── */}
      {status.message && (
        <div className={`scan-status scan-status--${status.state}`}>
          {status.state === 'error' && <IconAlert />}
          {status.state === 'loading' && <IconSpinner />}
          <span>{status.message}</span>
          {status.state === 'success' && meta && (
            <a
              href={`https://github.com/${meta.owner}/${meta.repo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="scan-gh-link"
            >
              <IconLink />
              GitHub
            </a>
          )}
        </div>
      )}

      {/* ── Warnings strip ──────────────────────────────────────────── */}
      {warnings.length > 0 && (
        <div className="scan-warnings">
          {warnings.map((w, i) => (
            <div key={i} className="scan-warning">
              <IconWarning />
              {w}
            </div>
          ))}
        </div>
      )}

      {/* ── Workspace ───────────────────────────────────────────────── */}
      {metrics && (
        <div className="scan-warnings" aria-label="Repository analysis metrics">
          <div className="scan-warning">Processing: {metrics.processingMs} ms</div>
          <div className="scan-warning">LOC: {metrics.linesOfCode}</div>
          <div className="scan-warning">Languages: {metrics.languages.join(', ')}</div>
        </div>
      )}

      <div className="scan-workspace">
        {/* File tree */}
        <aside className="scan-tree" aria-label="File explorer">
          {tree ? (
            rootNodes.map((node) => (
              <TreeNode
                key={node.path}
                node={node}
                depth={0}
                selected={selectedPath}
                expanded={expanded}
                onSelect={setSelectedPath}
                onToggle={toggleFolder}
              />
            ))
          ) : (
            <div className="scan-tree-empty">
              <IconBranch size={28} />
              <p>Paste a public GitHub repo URL above to browse its files.</p>
            </div>
          )}
        </aside>

        {/* Code viewer */}
        <div className="scan-viewer">
          {selectedPath && (
            <div className="scan-viewer__header">
              <IconFile />
              <span>{selectedPath}</span>
            </div>
          )}
          <pre className="scan-code">
            {fileLoading ? (
              <span className="scan-code-loading">
                <IconSpinner /> Loading file…
              </span>
            ) : fileText ? (
              codeLines.map((line, i) => (
                <span key={i} className="scan-code__line">
                  <span className="scan-code__ln">{String(i + 1).padStart(4, ' ')}</span>
                  <span className="scan-code__text">{line || ' '}</span>
                </span>
              ))
            ) : !tree ? (
              <div className="scan-empty-upload">
                <IconBranch size={34} />
                <h2>Paste a GitHub repository link</h2>
                <p>Load a public repo to scan its files, generate an initial summary, and ask questions about the code.</p>
                <form className="scan-empty-upload__form" onSubmit={handleSubmit}>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onPaste={handlePaste}
                    placeholder="https://github.com/owner/repo"
                    spellCheck={false}
                    autoComplete="off"
                    disabled={status.state === 'loading'}
                    aria-label="GitHub repository URL"
                  />
                  <button
                    className="btn btn--primary"
                    type="submit"
                    disabled={status.state === 'loading' || !url.trim()}
                  >
                    {status.state === 'loading'
                      ? <><IconSpinner size={15} /> Loading...</>
                      : 'Scan repo'}
                  </button>
                </form>
              </div>
            ) : (
              <span className="scan-code-placeholder">Select a file from the tree to view its source.</span>
            )}
          </pre>
        </div>

        {/* Chat panel */}
        {chatOpen && (
          <aside className="scan-chat">
            <div className="scan-chat__header">
              <span className="scan-chat__title">
                <span className="scan-chat__title-dot" />
                Code Assistant
              </span>
              <button
                type="button"
                className="scan-chat__close"
                onClick={() => setChatOpen(false)}
                aria-label="Close chat"
              >
                <IconClose />
              </button>
            </div>

            <div className="scan-chat__messages">
              {messages.map((msg) => {
                const showFileRef = msg.file && msg.file !== selectedPath
                const filename = msg.file ? msg.file.split('/').pop() : null
                return (
                  <div key={msg.id} className={`chat-msg chat-msg--${msg.role}`}>
                    {showFileRef && (
                      <span className="chat-msg__file-ref">re: {filename}</span>
                    )}
                    <div className="chat-msg__bubble">{msg.content}</div>
                  </div>
                )
              })}

              {chatLoading && (
                <div className="chat-thinking">
                  <span /><span /><span />
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {showChips && (
              <div className="chat-chips">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    className="chat-chip"
                    onClick={() => sendMessage(chip)}
                    disabled={!token}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            <div className="scan-chat__input-area">
              <textarea
                className="scan-chat__textarea"
                rows={1}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                placeholder={token ? 'Ask about the code…' : 'Sign in to use the assistant'}
                disabled={!token || chatLoading}
              />
              <button
                type="button"
                className="scan-chat__send"
                onClick={() => sendMessage(chatInput)}
                disabled={!token || chatLoading || !chatInput.trim()}
                title={!token ? 'Sign in to use the assistant' : 'Send (Ctrl+Enter)'}
                aria-label="Send message"
              >
                <IconSend />
              </button>
            </div>
            <div className="scan-chat__hint">Ctrl+Enter to send</div>
          </aside>
        )}
      </div>
    </div>
  )
}
