import { useEffect, useState } from 'react'
import LegalPage from './LegalPage.jsx'
import LoginForm from './LoginForm.jsx'
import ScanDemo from './ScanDemo.jsx'

const steps = [
  {
    number: '01',
    title: 'Paste code or connect a repo',
    text: 'Drop in a snippet, point CodeScope at a branch, or scan the pull request you are already reviewing.',
  },
  {
    number: '02',
    title: 'The scan runs',
    text: 'It traces behavior, checks risky paths, and measures complexity without asking you to configure a rulebook first.',
  },
  {
    number: '03',
    title: 'Get notes, flags, and a score',
    text: 'Read a plain-English explanation, review bug and security flags, and see what parts are hard to maintain.',
  },
]

const catchItems = [
  {
    title: 'Bugs & edge cases',
    text: 'Null paths, missing awaits, off-by-one logic, unsafe assumptions, and brittle branching.',
  },
  {
    title: 'Security flags',
    text: 'Injection risks, leaked secrets, weak validation, unsafe parsing, and authorization gaps.',
  },
  {
    title: 'Complexity',
    text: 'A scannable score with the functions, loops, and conditions that drive it up.',
  },
  {
    title: 'Style/readability',
    text: 'Naming, intent, duplication, and structure notes that help the next developer move faster.',
  },
]

const repoSections = [
  ['Frontend', 'React routes, scanner view, login modal, legal pages'],
  ['Backend', 'Express API, auth boundary, scan queue, report assembly'],
  ['DB', 'Users, repositories, scan history, issue fingerprints'],
  ['AI', 'Parser workers, model notes, rule checks, complexity scoring'],
]

export default function Homepage({ onLogin }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const [legalPage, setLegalPage] = useState(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const openLogin = () => {
    setMenuOpen(false)
    setLoginOpen(true)
  }

  const openLegal = (page) => {
    setMenuOpen(false)
    setLegalPage(page)
  }

  return (
    <>
      <header className={`site-header ${scrolled ? 'site-header--solid' : ''}`}>
        <a className="wordmark" href="#top" aria-label="CodeScope home">
          <span className="wordmark__mark">CS</span>
          CodeScope
        </a>

        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="site-nav" className={`site-nav ${menuOpen ? 'site-nav--open' : ''}`}>
          <a href="#product" onClick={() => setMenuOpen(false)}>
            Product
          </a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
            How it works
          </a>
          <a href="#docs" onClick={() => setMenuOpen(false)}>
            Docs
          </a>
          <div className="auth-actions">
            <button className="login-link login-link--button" type="button" onClick={openLogin}>
              Log in
            </button>
            <a className="button button--small" href="/scan" onClick={() => setMenuOpen(false)}>
              Start scanning
              <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
        </nav>
      </header>

      <main id="top">
        <section className="hero section-shell" id="product">
          <div className="hero__copy">
            <p className="eyebrow">Code diagnostics without the drama</p>
            <h1>Understand the shape of a codebase before it becomes a problem.</h1>
            <p className="hero__lead">
              CodeScope reads the repo, highlights real risks, and gives you a structured view of behavior,
              complexity, and the parts worth inspecting first.
            </p>
            <div className="hero__actions">
              <a className="button" href="/scan">
                Start scanning
                <span aria-hidden="true">-&gt;</span>
              </a>
              <a className="button button--ghost" href="/demo">
                Watch demo
              </a>
            </div>
            <div className="hero__meta" aria-label="Product qualities">
              <div className="hero__stat">
                <strong>Repo-aware</strong>
                <span>readable by default</span>
              </div>
              <div className="hero__stat">
                <strong>Review-first</strong>
                <span>signals you can act on fast</span>
              </div>
              <div className="hero__stat">
                <strong>Plain language</strong>
                <span>explains the shape of the code</span>
              </div>
            </div>
          </div>

          <ScanDemo />
        </section>

        <section className="repo-map section-shell" aria-labelledby="repo-heading">
          <div className="section-heading section-heading--wide">
            <p className="eyebrow">Repository map</p>
            <h2 id="repo-heading">A full repo comes back as a readable system breakdown.</h2>
          </div>
          <div className="repo-console">
            <div className="repo-console__header">
              <span>repo://inventory-platform</span>
              <strong>explained instantly</strong>
            </div>
            <div className="repo-grid">
              {repoSections.map(([label, text]) => (
                <article className="repo-card" key={label}>
                  <span>{label}</span>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="process section-shell" id="how-it-works" aria-labelledby="how-heading">
          <div className="section-heading">
            <p className="eyebrow">How it works</p>
            <h2 id="how-heading">Paste, scan, review. No setup ceremony.</h2>
          </div>
          <div className="steps">
            {steps.map((step) => (
              <article className="step" key={step.number}>
                <span className="step__number">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="catches section-shell" id="docs" aria-labelledby="catches-heading">
          <div className="section-heading section-heading--wide">
            <p className="eyebrow">What it catches</p>
            <h2 id="catches-heading">Signals you can act on during review.</h2>
          </div>
          <div className="catch-grid">
            {catchItems.map((item) => (
              <article className="catch-card" key={item.title}>
                <span className="catch-card__pulse" aria-hidden="true" />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="final-cta section-shell" aria-labelledby="cta-heading">
          <div>
            <p className="eyebrow">Ready when the diff is not obvious</p>
            <h2 id="cta-heading">Give CodeScope the code. Get the explanation, flags, and complexity score back.</h2>
          </div>
          <div className="final-cta__actions">
            <button className="login-link login-link--button" type="button" onClick={openLogin}>
              Log in
            </button>
            <a className="button" href="/scan">
              Start scanning
              <span aria-hidden="true">-&gt;</span>
            </a>
          </div>
        </section>
      </main>

      <footer className="site-footer section-shell">
        <a className="wordmark" href="#top" aria-label="CodeScope home">
          <span className="wordmark__mark">CS</span>
          CodeScope
        </a>
        <div className="footer-links">
          <a href="/docs">Docs</a>
          <button type="button" onClick={() => openLegal('privacy')}>
            Privacy
          </button>
          <button type="button" onClick={() => openLegal('terms')}>
            Terms
          </button>
        </div>
      </footer>

      <LoginForm open={loginOpen} onClose={() => setLoginOpen(false)} onOpenLegal={openLegal} onLogin={onLogin} />
      <LegalPage page={legalPage} onClose={() => setLegalPage(null)} />
    </>
  )
}
