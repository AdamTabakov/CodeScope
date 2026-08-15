import assert from 'node:assert/strict'
import { afterEach, describe, it } from 'node:test'
import { loadRepository, parseGitHubUrl } from '../services/repositoryService.js'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

describe('repository service', () => {
  it('parses GitHub repository URLs with branch paths', () => {
    assert.deepEqual(parseGitHubUrl('github.com/openai/codex/tree/main/packages/cli'), {
      owner: 'openai',
      repo: 'codex',
      branch: 'main',
      subpath: 'packages/cli',
    })
  })

  it('loads a repository tree and returns code metrics', async () => {
    const calls = []
    globalThis.fetch = async (url) => {
      calls.push(url)
      const headers = new Headers({ 'x-ratelimit-remaining': '58', 'x-ratelimit-reset': '1800000000' })

      if (url === 'https://api.github.com/repos/acme/demo') {
        return Response.json({
          private: false,
          disabled: false,
          size: 12,
          default_branch: 'main',
          html_url: 'https://github.com/acme/demo',
        }, { headers })
      }

      if (url === 'https://api.github.com/repos/acme/demo/git/trees/main?recursive=1') {
        return Response.json({
          tree: [
            { type: 'blob', path: 'src/app.js' },
            { type: 'blob', path: 'src/styles.css' },
            { type: 'blob', path: 'dist/app.js' },
            { type: 'blob', path: 'logo.png' },
          ],
        }, { headers })
      }

      if (url === 'https://raw.githubusercontent.com/acme/demo/main/src/app.js') {
        return new Response('const answer = 42\nconsole.log(answer)\n', { headers })
      }

      if (url === 'https://raw.githubusercontent.com/acme/demo/main/src/styles.css') {
        return new Response('body {\n  margin: 0;\n}\n', { headers })
      }

      return new Response('', { status: 404, headers })
    }

    const result = await loadRepository('https://github.com/acme/demo')

    assert.equal(result.meta.fullName, 'acme/demo')
    assert.equal(result.metrics.repositoriesAnalyzed, 1)
    assert.equal(result.metrics.filesRetrieved, 2)
    assert.equal(result.metrics.totalFiles, 2)
    assert.equal(result.metrics.linesOfCode, 7)
    assert.deepEqual(result.metrics.languages, ['CSS', 'JavaScript'])
    assert.equal(result.metrics.apiCalls, 4)
    assert.equal(result.files[0].path, 'src/app.js')
    assert.equal(calls.length, 4)
  })
})
