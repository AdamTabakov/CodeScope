import { loadRepository } from './services/repositoryService.js'

const REPO_URL = 'https://github.com/acme/demo'

// runBenchmark by running loadRepository multiple times and measuring performance.
async function runBenchmark(iterations = 3) {
  let totalMs = 0
  let totalApiCalls = 0

  for (let i = 0; i < iterations; i++) {
    const started = performance.now()
    const result = await loadRepository(REPO_URL)
    const elapsed = performance.now() - started
    totalMs += elapsed
    totalApiCalls += result.metrics.apiCalls
  }

  const avgMs = totalMs / iterations
  const avgApiCalls = totalApiCalls / iterations

  // output info
  console.log(`\nBenchmark: loadRepository('${REPO_URL}')`)
  console.log(`  Iterations: ${iterations}`)
  console.log(`  Average time: ${avgMs.toFixed(0)}ms`)
  console.log(`  Average API calls: ${avgApiCalls.toFixed(1)}`)
  console.log(
    `  Rate limit remaining: ${result.metrics.rateLimitRemaining || 'N/A'}`,
  )
}

runBenchmark(3).catch((err) => {
  console.error('Benchmark failed:', err.message)
  process.exit(1)
})
