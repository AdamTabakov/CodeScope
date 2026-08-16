const MAX_FILE_COUNT = 800
const MAX_REPO_SIZE_KB = 102400

// Binary file extensions to ignore when loading repository files
const BINARY_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.ico', '.webp', '.bmp', '.tiff',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.zip', '.tar', '.gz', '.rar', '.7z', '.bin',
  '.mp3', '.mp4', '.wav', '.avi', '.mov', '.mkv',
  '.ttf', '.woff', '.woff2', '.eot', '.otf',
  '.exe', '.dll', '.so', '.dylib', '.obj',
  '.pyc', '.pyo', '.class', '.o',
])
// Common directory prefixes to ignore when loading repository files
const IGNORE_PREFIXES = [
  '.git/', 'node_modules/', '.next/', 'dist/', 'build/',
  '.venv/', '__pycache__/', 'coverage/',
]
//  Mapping of file extensions to programming languages for language detection
const LANGUAGE_BY_EXTENSION = new Map([
  ['.js', 'JavaScript'], ['.jsx', 'JavaScript'], ['.mjs', 'JavaScript'], ['.cjs', 'JavaScript'],
  ['.ts', 'TypeScript'], ['.tsx', 'TypeScript'],
  ['.py', 'Python'], ['.java', 'Java'], ['.go', 'Go'], ['.rs', 'Rust'],
  ['.c', 'C'], ['.h', 'C/C++'], ['.cpp', 'C++'], ['.cc', 'C++'], ['.cxx', 'C++'], ['.hpp', 'C++'],
  ['.cs', 'C#'], ['.php', 'PHP'], ['.rb', 'Ruby'], ['.swift', 'Swift'], ['.kt', 'Kotlin'],
  ['.html', 'HTML'], ['.css', 'CSS'], ['.scss', 'SCSS'], ['.json', 'JSON'],
  ['.md', 'Markdown'], ['.yml', 'YAML'], ['.yaml', 'YAML'], ['.xml', 'XML'],
  ['.sql', 'SQL'], ['.sh', 'Shell'], ['.ps1', 'PowerShell'],
])

// Helper function to extract the file extension from a path
function extensionOf(path) {
  const dot = path.lastIndexOf('.')
  return dot === -1 ? '' : path.slice(dot).toLowerCase()
}

// Helper function to determine if a file is binary based on its extension
function isBinary(path) {
  return BINARY_EXTENSIONS.has(extensionOf(path))
}
// Helper function to determine if a path should be ignored based on common directory prefixes
function shouldIgnore(path) {
  return IGNORE_PREFIXES.some((prefix) => path.startsWith(prefix))
}
// Helper function to parse a GitHub repository URL and extract owner, repo, branch, and subpath
export function parseGitHubUrl(raw) {
  if (!raw || typeof raw !== 'string') {
    throw new Error('GitHub repository URL is required.')
  }
  // Normalize the URL by trimming whitespace and removing trailing slashes
  const normalized = raw.trim().replace(/\/+$/, '')
  const withProtocol =
    normalized.startsWith('http://') || normalized.startsWith('https://')
      ? normalized
      : `https://${normalized}`
  // Validate that the URL is a GitHub URL and extract its components
  const parsed = new URL(withProtocol)
  if (parsed.hostname.toLowerCase() !== 'github.com') {
    throw new Error('Only public GitHub repo URLs are supported (https://github.com/owner/repo).')
  }
  // Split the pathname into parts and filter out empty segments
  const parts = parsed.pathname.split('/').filter(Boolean)
  if (parts.length < 2) {
    throw new Error('Use the full repo URL, e.g. https://github.com/owner/repo.')
  }
  // Find the index of the branch or blob segment to extract branch and subpath information
  const branchIdx = parts.findIndex((part) => part === 'tree' || part === 'blob')
  return {
    owner: parts[0],
    repo: parts[1].replace(/\.git$/i, ''),
    branch: branchIdx >= 0 ? parts[branchIdx + 1] : null,
    subpath: branchIdx >= 0 ? parts.slice(branchIdx + 2).join('/') : '',
  }
}
// Helper function to fetch JSON data from the GitHub API with rate limit tracking and error handling
async function githubJson(url, metrics) {
  metrics.apiCalls += 1
  const started = performance.now()
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'CodeScope',
    },
  })
  metrics.githubMs += performance.now() - started
  metrics.rateLimitRemaining = response.headers.get('x-ratelimit-remaining')
  metrics.rateLimitReset = response.headers.get('x-ratelimit-reset')
  // Handle specific HTTP status codes for GitHub API responses
  if (response.status === 403) {
    throw new Error('GitHub rate limit reached. Try again later.')
  }
  if (response.status === 404) {
    throw new Error('Repository not found or is private.')
  }
  if (!response.ok) {
    throw new Error(`GitHub request failed (${response.status}).`)
  }

  return response.json()
}

//
async function githubText(url, metrics) {
  metrics.apiCalls += 1
  const started = performance.now()
  const response = await fetch(url, { headers: { 'User-Agent': 'CodeScope' } })
  metrics.githubMs += performance.now() - started
  metrics.rateLimitRemaining = response.headers.get('x-ratelimit-remaining') ?? metrics.rateLimitRemaining
  metrics.rateLimitReset = response.headers.get('x-ratelimit-reset') ?? metrics.rateLimitReset

  if (!response.ok) return ''
  return response.text()
}

function buildTree(paths) {
  const root = { type: 'folder', name: 'repo', path: 'repo', children: [] }

  for (const filePath of paths) {
    const parts = filePath.split('/').filter(Boolean)
    let cur = root

    parts.forEach((part, index) => {
      const isLeaf = index === parts.length - 1
      const nodePath = parts.slice(0, index + 1).join('/')
      let node = cur.children.find((child) => child.name === part)

      if (!node) {
        node = { type: isLeaf ? 'file' : 'folder', name: part, path: nodePath, children: isLeaf ? undefined : [] }
        cur.children.push(node)
      }
      cur = node
    })
  }

  const sort = (node) => {
    if (!node.children) return
    node.children.sort((a, b) => {
      const folderWeight = (item) => (item.type === 'folder' ? 0 : 1)
      return folderWeight(a) - folderWeight(b) || a.name.localeCompare(b.name)
    })
    node.children.forEach(sort)
  }

  sort(root)
  return root
}

// Load Repository
export async function loadRepository(repoUrl) {
  const started = performance.now()
  const metrics = { apiCalls: 0, githubMs: 0, rateLimitRemaining: null, rateLimitReset: null }
  const { owner, repo, branch: urlBranch, subpath } = parseGitHubUrl(repoUrl)
  const repoInfo = await githubJson(`https://api.github.com/repos/${owner}/${repo}`, metrics)

  // If error with repo
  if (repoInfo.private) throw new Error('Private repositories are not supported. Only public repos can be loaded.')
  if (repoInfo.disabled) throw new Error('This repository has been disabled on GitHub.')
  if (repoInfo.size > MAX_REPO_SIZE_KB) {
    throw new Error(`Repository is too large (${Math.round(repoInfo.size / 1024)}MB). Maximum is 100MB.`)
  }

  const branch = urlBranch || repoInfo.default_branch || 'main'
  const treeData = await githubJson(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    metrics,
  )
  // Filter the paths
  let paths = treeData.tree
    .filter((entry) => entry.type === 'blob' && !shouldIgnore(entry.path) && !isBinary(entry.path))
    .map((entry) => entry.path)
    .filter((path) => !subpath || path === subpath || path.startsWith(`${subpath}/`))
    .map((path) => (subpath ? path.replace(`${subpath}/`, '').replace(subpath, '') : path))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))

  const totalFiles = paths.length
  if (paths.length > MAX_FILE_COUNT) paths = paths.slice(0, MAX_FILE_COUNT)
  if (paths.length === 0) throw new Error('No source files found. Try a different path or branch.')

  const files = []
  let linesOfCode = 0
  const languages = new Set()

  let nextIndex = 0
  async function loadNextFile() {
    while (nextIndex < paths.length) {
      const path = paths[nextIndex]
      nextIndex += 1

      const language = LANGUAGE_BY_EXTENSION.get(extensionOf(path)) ?? 'Other'
      languages.add(language)
      const encodedPath = path.split('/').map(encodeURIComponent).join('/')
      const rawText = await githubText(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodedPath}`, metrics)
      const lineCount = rawText ? rawText.split('\n').length : 0
      linesOfCode += lineCount
      files.push({ path, language, lineCount, content: rawText.slice(0, 50000) })
    }
  }

  const workerCount = Math.min(12, paths.length)
  await Promise.all(Array.from({ length: workerCount }, loadNextFile))
  files.sort((a, b) => a.path.localeCompare(b.path))

  for (const path of paths) {
    const language = LANGUAGE_BY_EXTENSION.get(extensionOf(path)) ?? 'Other'
    languages.add(language)
  }

  return {
    meta: { owner, repo, branch, fullName: `${owner}/${repo}`, url: repoInfo.html_url },
    tree: buildTree(paths),
    files,
    metrics: {
      repositoriesAnalyzed: 1,
      filesRetrieved: paths.length,
      totalFiles,
      linesOfCode,
      languages: [...languages].sort(),
      languagesSupported: LANGUAGE_BY_EXTENSION.size,
      apiCalls: metrics.apiCalls,
      githubFetchMs: Math.round(metrics.githubMs),
      processingMs: Math.round(performance.now() - started),
      rateLimitRemaining: metrics.rateLimitRemaining,
      rateLimitReset: metrics.rateLimitReset,
      truncated: totalFiles > MAX_FILE_COUNT,
    },
  }
}
