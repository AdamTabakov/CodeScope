import { useState } from 'react'

const STORAGE_KEY = 'codescope:cookie-consent'

function readConsent() {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

// Lightweight cookie / local-storage consent banner. CodeScope stores no
// advertising or tracking cookies, but we surface a clear choice and persist
// it so returning users aren't nagged on every visit.
export default function CookieBanner({ openLegal }) {
  const [visible, setVisible] = useState(() => readConsent() === null)

  const choose = (value) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value)
    } catch {
      /* storage unavailable — just dismiss for this session */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="cookie-banner" role="region" aria-label="Cookie consent">
      <p className="cookie-banner__text">
        CodeScope stores only what's needed to keep you signed in and remember your recent scans.
        We don't use advertising or tracking cookies. See our{' '}
        <button type="button" className="legal-inline-link" onClick={() => openLegal('privacy')}>
          Privacy Policy
        </button>{' '}
        for details.
      </p>

      <div className="cookie-banner__actions">
        <button type="button" className="btn btn--primary" onClick={() => choose('accepted')}>
          Accept
        </button>
        <button type="button" className="btn btn--ghost" onClick={() => choose('declined')}>
          Decline
        </button>
      </div>
    </div>
  )
}