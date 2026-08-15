const legalContent = {
  privacy: {
    title: 'Privacy Policy',
    eyebrow: 'Data handling',
    body: [
      'CodeScope should only collect the account, repository, and scan data needed to provide code explanations and issue reports.',
      'Do not paste secrets into scans. Production storage should encrypt sensitive records, limit employee access, and keep audit logs for repository connections.',
      'Session credentials are returned to the browser after login. Store them only for the active session unless you later add a hardened refresh-token flow.',
    ],
  },
  terms: {
    title: 'Terms of Service',
    eyebrow: 'Usage terms',
    body: [
      'Use CodeScope only on code you own or are authorized to review.',
      'Scan results are developer aids. Review security findings before shipping changes and do not treat automated output as a substitute for human review.',
      'Do not attempt to disrupt the service, bypass authentication, overload scan endpoints, or submit malicious payloads.',
    ],
  },
}

export default function LegalPage({ page, onClose }) {
  if (!page) return null

  const content = legalContent[page]

  return (
    <div className="legal-overlay" role="presentation" onMouseDown={onClose}>
      <section
        className="legal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-heading"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="icon-close" type="button" aria-label="Close legal panel" onClick={onClose}>
          <span />
          <span />
        </button>
        <p className="eyebrow">{content.eyebrow}</p>
        <h2 id="legal-heading">{content.title}</h2>
        {content.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>
    </div>
  )
}
