import { useEffect, useRef, useState } from 'react'
import { useScroll, useSpring, useTransform } from 'motion/react'
import CardFlip from '../components/kokonutui/card-flip'
import { CardContainer, CardBody, CardItem } from '../components/ui/3d-card'
import { GoogleGeminiEffect } from '../components/ui/google-gemini-effect'

// ── Code snippets ──────────────────────────────────────────────────────────────
// Each line is an array of { t: text, c: CSS-class } tokens.
// Empty array = blank line. Token classes come from index.css .t-* rules.

const SNIPPETS = [
  {
    id: 'js-auth',
    lang: 'JS',
    file: 'middleware/authenticate.js',
    lines: [
      [{ t: '// middleware/authenticate.js', c: 't-comment' }],
      [
        { t: 'export async function ', c: 't-keyword' },
        { t: 'authenticate', c: 't-fn' },
        { t: '(req, res, next) {', c: 't-plain' },
      ],
      [
        { t: "  const ", c: 't-keyword' },
        { t: 'token', c: 't-plain' },
        { t: ' = req.headers.authorization', c: 't-param' },
        { t: "?.split(' ')[", c: 't-plain' },
        { t: '1', c: 't-number' },
        { t: ']', c: 't-plain' },
      ],
      [
        { t: '  if (', c: 't-plain' },
        { t: '!token', c: 't-warn' },
        { t: ') return res.status(', c: 't-plain' },
        { t: '401', c: 't-number' },
        { t: ').json({', c: 't-plain' },
        { t: ' error: ', c: 't-plain' },
        { t: "'No token'", c: 't-string' },
        { t: ' })', c: 't-plain' },
      ],
      [],
      [{ t: '  try {', c: 't-plain' }],
      [
        { t: '    const ', c: 't-keyword' },
        { t: 'payload', c: 't-plain' },
        { t: ' = jwt', c: 't-tag' },
        { t: '.verify(token, process.env', c: 't-plain' },
        { t: '.JWT_SECRET', c: 't-param' },
        { t: ')', c: 't-plain' },
      ],
      [
        { t: '    req.user', c: 't-plain' },
        { t: ' = ', c: 't-op' },
        { t: 'await ', c: 't-keyword' },
        { t: 'User', c: 't-tag' },
        { t: '.findById(payload.sub)', c: 't-plain' },
      ],
      [{ t: '    next()', c: 't-fn' }],
      [{ t: '  } catch {', c: 't-plain' }],
      [
        { t: '    res.status(', c: 't-plain' },
        { t: '401', c: 't-number' },
        { t: ').json({ error: ', c: 't-plain' },
        { t: "'Invalid token'", c: 't-string' },
        { t: ' })', c: 't-plain' },
      ],
      [{ t: '  }', c: 't-plain' }],
      [{ t: '}', c: 't-plain' }],
    ],
  },
  {
    id: 'py-pipeline',
    lang: 'PY',
    file: 'processors/data_pipeline.py',
    lines: [
      [{ t: '# processors/data_pipeline.py', c: 't-comment' }],
      [
        { t: 'async def ', c: 't-keyword' },
        { t: 'process_batch', c: 't-fn' },
        { t: '(items: ', c: 't-plain' },
        { t: 'list', c: 't-tag' },
        { t: '[dict]) -> ', c: 't-plain' },
        { t: 'list', c: 't-tag' },
        { t: '[Result]:', c: 't-plain' },
      ],
      [{ t: '    results = []', c: 't-plain' }],
      [
        { t: '    async for ', c: 't-keyword' },
        { t: 'chunk', c: 't-plain' },
        { t: ' in ', c: 't-keyword' },
        { t: 'stream_chunks', c: 't-fn' },
        { t: '(items, size=', c: 't-plain' },
        { t: '100', c: 't-number' },
        { t: '):',c: 't-plain' },
      ],
      [
        { t: '        validated', c: 't-plain' },
        { t: ' = [', c: 't-plain' },
        { t: 'validate_item', c: 't-fn' },
        { t: '(i) for i in chunk]', c: 't-plain' },
      ],
      [
        { t: '        enriched', c: 't-plain' },
        { t: ' = ', c: 't-op' },
        { t: 'await ', c: 't-keyword' },
        { t: 'enrich_async', c: 't-fn' },
        { t: '(validated)', c: 't-plain' },
      ],
      [{ t: '        results.extend(enriched)', c: 't-plain' }],
      [{ t: '    return ', c: 't-keyword' }, { t: 'results', c: 't-plain' }],
    ],
  },
  {
    id: 'ts-hook',
    lang: 'TS',
    file: 'hooks/useRepository.ts',
    lines: [
      [{ t: '// hooks/useRepository.ts', c: 't-comment' }],
      [
        { t: 'export function ', c: 't-keyword' },
        { t: 'useRepository', c: 't-fn' },
        { t: '(repoId: ', c: 't-plain' },
        { t: 'string', c: 't-tag' },
        { t: ') {', c: 't-plain' },
      ],
      [
        { t: '  const ', c: 't-keyword' },
        { t: '[data, setData]', c: 't-plain' },
        { t: ' = useState<', c: 't-fn' },
        { t: 'Repo', c: 't-tag' },
        { t: ' | null>(', c: 't-plain' },
        { t: 'null', c: 't-keyword' },
        { t: ')', c: 't-plain' },
      ],
      [
        { t: '  const ', c: 't-keyword' },
        { t: '[loading, setLoading]', c: 't-plain' },
        { t: ' = useState<', c: 't-fn' },
        { t: 'boolean', c: 't-tag' },
        { t: '>(', c: 't-plain' },
        { t: 'true', c: 't-keyword' },
        { t: ')', c: 't-plain' },
      ],
      [],
      [
        { t: '  useEffect', c: 't-fn' },
        { t: '(() => {', c: 't-plain' },
      ],
      [
        { t: '    fetchRepo', c: 't-fn' },
        { t: '(repoId)', c: 't-plain' },
      ],
      [
        { t: '      .then', c: 't-fn' },
        { t: '(setData)', c: 't-plain' },
      ],
      [
        { t: '      .finally', c: 't-fn' },
        { t: '(() => setLoading(', c: 't-plain' },
        { t: 'false', c: 't-keyword' },
        { t: '))', c: 't-plain' },
      ],
      [{ t: '  }, [repoId])', c: 't-plain' }],
      [],
      [
        { t: '  return ', c: 't-keyword' },
        { t: '{ data, loading }', c: 't-plain' },
      ],
      [{ t: '}', c: 't-plain' }],
    ],
  },
  {
    id: 'go-handler',
    lang: 'GO',
    file: 'handlers/scan.go',
    lines: [
      [{ t: '// handlers/scan.go', c: 't-comment' }],
      [
        { t: 'func ', c: 't-keyword' },
        { t: '(h *Handler) ', c: 't-param' },
        { t: 'CreateScan', c: 't-fn' },
        { t: '(w http.ResponseWriter, r *http.Request) {', c: 't-plain' },
      ],
      [
        { t: '  var ', c: 't-keyword' },
        { t: 'body ScanRequest', c: 't-tag' },
      ],
      [
        { t: '  if ', c: 't-keyword' },
        { t: 'err', c: 't-plain' },
        { t: ' := json', c: 't-tag' },
        { t: '.NewDecoder(r.Body)', c: 't-plain' },
        { t: '.Decode', c: 't-fn' },
        { t: '(&body); err != ', c: 't-plain' },
        { t: 'nil', c: 't-keyword' },
        { t: ' {', c: 't-plain' },
      ],
      [
        { t: '    http', c: 't-tag' },
        { t: '.Error(w, ', c: 't-plain' },
        { t: '"invalid payload"', c: 't-string' },
        { t: ', ', c: 't-plain' },
        { t: '400', c: 't-number' },
        { t: ')', c: 't-plain' },
      ],
      [{ t: '    return', c: 't-keyword' }],
      [{ t: '  }', c: 't-plain' }],
      [
        { t: '  scan, err', c: 't-plain' },
        { t: ' := h.service', c: 't-param' },
        { t: '.Queue', c: 't-fn' },
        { t: '(r.Context(), body)', c: 't-plain' },
      ],
      [
        { t: '  if ', c: 't-keyword' },
        { t: 'err != ', c: 't-plain' },
        { t: 'nil', c: 't-keyword' },
        { t: ' {', c: 't-plain' },
      ],
      [
        { t: '    h.log', c: 't-param' },
        { t: '.Error(', c: 't-fn' },
        { t: '"queue failed"', c: 't-string' },
        { t: ', ', c: 't-plain' },
        { t: '"err"', c: 't-string' },
        { t: ', err)', c: 't-plain' },
      ],
      [
        { t: '    http', c: 't-tag' },
        { t: '.Error(w, ', c: 't-plain' },
        { t: '"internal error"', c: 't-string' },
        { t: ', ', c: 't-plain' },
        { t: '500', c: 't-number' },
        { t: ')', c: 't-plain' },
      ],
      [{ t: '    return', c: 't-keyword' }],
      [{ t: '  }', c: 't-plain' }],
      [
        { t: '  json', c: 't-tag' },
        { t: '.NewEncoder(w)', c: 't-plain' },
        { t: '.Encode', c: 't-fn' },
        { t: '(scan)', c: 't-plain' },
      ],
      [{ t: '}', c: 't-plain' }],
    ],
  },
  {
    id: 'rust-scorer',
    lang: 'RS',
    file: 'src/analysis/scorer.rs',
    lines: [
      [{ t: '// src/analysis/scorer.rs', c: 't-comment' }],
      [
        { t: 'pub fn ', c: 't-keyword' },
        { t: 'complexity_score', c: 't-fn' },
        { t: '(ast: &', c: 't-plain' },
        { t: 'Ast', c: 't-tag' },
        { t: ') -> ', c: 't-plain' },
        { t: 'u32', c: 't-tag' },
        { t: ' {', c: 't-plain' },
      ],
      [
        { t: '  ast', c: 't-param' },
        { t: '.functions()', c: 't-fn' },
      ],
      [
        { t: '    .filter', c: 't-fn' },
        { t: '(|f| !f.is_trivial())', c: 't-plain' },
      ],
      [
        { t: '    .map', c: 't-fn' },
        { t: '(|f| {', c: 't-plain' },
      ],
      [
        { t: '      f.branches()', c: 't-fn' },
        { t: ' * ', c: 't-op' },
        { t: '2', c: 't-number' },
      ],
      [
        { t: '        + f.loops()', c: 't-fn' },
        { t: ' * ', c: 't-op' },
        { t: '3', c: 't-number' },
      ],
      [
        { t: '        + f.nesting_depth()', c: 't-fn' },
      ],
      [{ t: '    })', c: 't-plain' }],
      [
        { t: '    .sum::<', c: 't-fn' },
        { t: 'u32', c: 't-tag' },
        { t: '>()', c: 't-plain' },
      ],
      [
        { t: '    .min(', c: 't-fn' },
        { t: '100', c: 't-number' },
        { t: ')', c: 't-plain' },
      ],
      [{ t: '}', c: 't-plain' }],
    ],
  },
]

const FEATURES = [
  {
    title: 'Smart Analysis',
    desc: 'Traces behavior across the entire codebase. Not just the file you paste.',
    subtitle: 'The whole repo, not just one file.',
    description:
      'CodeScope walks the entire repository and explains what the code actually does — how modules connect, what each file is responsible for, and where the important logic lives.',
    features: [
      'Full repository tracing',
      'Plain-English explanations',
      'File & folder overview',
      'Architecture summary',
    ],
  },
  {
    title: 'Issue Detection',
    desc: 'Surfaces injection risks, missing guards, unverified tokens, and logic gaps.',
    subtitle: 'Real risks a reviewer would spot.',
    description:
      'Flags unvalidated input, missing authorization checks, unverified tokens, and logic paths that can silently fail — before they bite in production.',
    features: [
      'Injection & input risks',
      'Missing authorization guards',
      'Unverified token usage',
      'Silent-failure logic gaps',
    ],
  },
  {
    title: 'Instant Scores',
    desc: 'Complexity scores with the exact functions and loops that drive them up.',
    subtitle: 'Know exactly what is complex and why.',
    description:
      'Every repository gets an instant complexity score, broken down to the exact functions and loops pushing it up. No rulebook setup required.',
    features: [
      'Instant complexity score',
      'Per-function breakdown',
      'Loop & branch drivers',
      'Zero configuration',
    ],
  },
]

// Cap stagger so long snippets don't feel sluggish
const MAX_STAGGER_IDX = 12

function CodeLine({ tokens, lineNum, lineIdx }) {
  return (
    <div className="t-line" style={{ '--line-idx': Math.min(lineIdx, MAX_STAGGER_IDX) }}>
      <span className="t-dim">{String(lineNum).padStart(2, '\u00a0')}</span>
      {tokens.length === 0
        ? '\u00a0'
        : tokens.map((tok, i) => (
            <span key={i} className={tok.c}>
              {tok.t}
            </span>
          ))}
    </div>
  )
}

const INTERVAL_MS = 6000
const EXIT_MS = 190   // how long the exit animation plays before content swaps

export default function Home({ navigate, openLegal }) {
  const heroRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const [phase, setPhase] = useState('enter')  // 'enter' | 'exit'
  const [progressKey, setProgressKey] = useState(0)
  const activeIdxRef = useRef(0)
  const exitTimerRef = useRef(null)
  const intervalRef = useRef(null)

  // As the hero scrolls past, the background line art draws itself in.
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end end'] })
  const spring = useSpring(scrollYProgress, { stiffness: 60, damping: 20, restDelta: 0.001 })
  const pathLengths = [
    useTransform(spring, [0, 0.6], [0, 1]),
    useTransform(spring, [0.1, 0.7], [0, 1]),
    useTransform(spring, [0.2, 0.8], [0, 1]),
    useTransform(spring, [0.3, 0.9], [0, 1]),
    useTransform(spring, [0.4, 1], [0, 1]),
  ]

  // Two-phase transition: exit old → swap content → enter new
  const switchTo = (newIdx) => {
    clearTimeout(exitTimerRef.current)
    setPhase('exit')
    exitTimerRef.current = setTimeout(() => {
      activeIdxRef.current = newIdx
      setActiveIdx(newIdx)
      setProgressKey((k) => k + 1)
      setPhase('enter')
    }, EXIT_MS)
  }

  useEffect(() => {
    const tick = () => switchTo((activeIdxRef.current + 1) % SNIPPETS.length)
    intervalRef.current = setInterval(tick, INTERVAL_MS)
    return () => {
      clearInterval(intervalRef.current)
      clearTimeout(exitTimerRef.current)
    }
  }, [])

  const handleDotClick = (i) => {
    // Reset the auto-advance timer so it doesn't fire immediately after a manual pick
    clearInterval(intervalRef.current)
    switchTo(i)
    intervalRef.current = setInterval(
      () => switchTo((activeIdxRef.current + 1) % SNIPPETS.length),
      INTERVAL_MS,
    )
  }

  const snippet = SNIPPETS[activeIdx]
  const snippetClass = `code-snippet code-snippet--${phase}`

  return (
    <div className="home-page">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bg" aria-hidden="true">
          <GoogleGeminiEffect pathLengths={pathLengths} />
        </div>

        <div className="hero-inner">
        <div className="hero-badge">
          AI-powered code diagnostics
        </div>

        <h1 className="hero-title">
          Understand any codebase
          <span className="hero-title-line2"> before it breaks.</span>
        </h1>

        <p className="hero-lead">
          CodeScope reads your repo, explains behavior in plain English, flags real risks, and
          scores complexity, without any rulebook setup.
        </p>

        <div className="hero-actions">
          <button className="btn btn--primary" onClick={() => navigate('signup')}>
            Get started free
          </button>
          <button className="btn btn--ghost" onClick={() => navigate('login')}>
            Sign in
          </button>
        </div>

        {/* ── Code Slideshow ───────────────────────────────────────── */}
        <CardContainer containerClassName="w-full py-0">
          <CardBody className="h-auto w-full max-w-[680px]">
            <CardItem translateZ="60" className="w-full">
              <div className="code-terminal">
                <div className="terminal-chrome">
                  <span className="terminal-dot terminal-dot--red" />
                  <span className="terminal-dot terminal-dot--yellow" />
                  <span className="terminal-dot terminal-dot--green" />
                  <span className="terminal-title">{snippet.file}</span>
                  <span className="terminal-lang-badge">{snippet.lang}</span>
                </div>

                <div className="terminal-body">
                  <div className={snippetClass}>
                    {snippet.lines.map((tokens, i) => (
                      <CodeLine key={i} tokens={tokens} lineNum={i + 1} lineIdx={i} />
                    ))}
                  </div>
                </div>

                {/* Thin progress bar — drains over INTERVAL_MS, resets on each swap */}
                <div className="terminal-progress">
                  <div
                    key={progressKey}
                    className="terminal-progress__fill"
                    style={{ '--progress-duration': `${INTERVAL_MS}ms` }}
                  />
                </div>

                <div className="slideshow-dots" role="tablist" aria-label="Code snippet selector">
                  {SNIPPETS.map((s, i) => (
                    <button
                      key={s.id}
                      role="tab"
                      aria-selected={i === activeIdx}
                      aria-label={`Snippet ${i + 1}: ${s.file}`}
                      className={`slideshow-dot ${i === activeIdx ? 'slideshow-dot--active' : ''}`}
                      onClick={() => handleDotClick(i)}
                    />
                  ))}
                </div>
              </div>
            </CardItem>
          </CardBody>
        </CardContainer>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="features">
        <div className="features-grid">
          {FEATURES.map((feature) => (
            <CardFlip
              key={feature.title}
              title={feature.title}
              subtitle={feature.subtitle}
              description={feature.description}
              features={feature.features}
              actionLabel="Try it free"
              onAction={() => navigate('signup')}
            />
          ))}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="home-footer">
        <span>&copy; {new Date().getFullYear()} CodeScope &mdash; Code scanning in plain English</span>
        <span className="home-footer__links">
          <button type="button" className="legal-inline-link" onClick={() => openLegal('privacy')}>
            Privacy Policy
          </button>
          <span aria-hidden="true">&middot;</span>
          <button type="button" className="legal-inline-link" onClick={() => openLegal('terms')}>
            Terms of Service
          </button>
        </span>
      </footer>
    </div>
  )
}
