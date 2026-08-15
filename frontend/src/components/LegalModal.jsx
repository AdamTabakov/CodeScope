import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

const EFFECTIVE_DATE = 'August 14, 2026'

// ── Content ───────────────────────────────────────────────────────────────────

const PRIVACY = {
  title: 'Privacy Policy',
  updated: EFFECTIVE_DATE,
  sections: [
    {
      heading: '1. Introduction',
      body: `CodeScope ("we", "our", "us") provides an automated code analysis service (the "Service") that reads code, explains behaviour in plain English, flags potential issues, and scores complexity. This Privacy Policy describes what personal information we collect when you use the Service, how we use it, how we protect it, and the choices you have over your data.\n\nBy creating an account or using the Service you agree to this policy. If you do not agree, please do not use CodeScope.`,
    },
    {
      heading: '2. Information We Collect',
      subsections: [
        {
          label: 'a) Account information',
          text: 'When you register we collect your chosen username, your email address, and your password. Your password is immediately processed through bcrypt (work factor 12) before it is written to our database — the plain-text password is never stored or logged anywhere in our systems.',
        },
        {
          label: 'b) Scan content',
          text: 'Code snippets, file paths, and repository references you submit for analysis are processed to produce explanations, issue flags, and complexity scores. Scan submissions are stored and linked to your account so you can retrieve results later.\n\nDo not paste secrets, API keys, tokens, database credentials, private keys, or personally identifiable information belonging to other people into scans. Such data would be stored and is not protected by additional encryption beyond our standard database security.',
        },
        {
          label: 'c) Usage and technical data',
          text: 'Our servers automatically log standard HTTP metadata: IP address, request path, HTTP method, response status code, response time, and timestamp. This data is used solely for security monitoring, abuse prevention, and service reliability. It is not linked to your account profile for marketing or tracking purposes.',
        },
        {
          label: 'd) Browser and session data',
          text: 'After you sign in, an authentication token (JWT) is issued and held in your browser\'s session memory. This token contains your user ID, username, and role. It is not written to a cookie or to localStorage; it is cleared automatically when you close the tab or sign out.',
        },
      ],
    },
    {
      heading: '3. How We Use Your Information',
      body: `We use the information we collect to:\n\n• Create and authenticate your account\n• Process code you submit and return analysis results\n• Store scan results so you can retrieve and review them\n• Monitor service health and investigate security incidents\n• Send transactional communications (password-reset emails, security alerts)\n• Improve the accuracy and coverage of our analysis engine\n\nWe do not sell, rent, or share your personal information with third parties for advertising or marketing purposes. We do not use your code submissions to train or fine-tune models without your explicit opt-in consent.`,
    },
    {
      heading: '4. How We Protect Your Information',
      body: `• Passwords are hashed with bcrypt (work factor 12). We cannot recover or read your password.\n• Authentication uses short-lived signed JWTs that expire after one hour. Tokens are never stored server-side in a way that allows bulk extraction.\n• Database access is restricted to authenticated application processes; no public-facing database ports are exposed.\n• Transport layer security (TLS/HTTPS) encrypts all data in transit between your browser and our servers.\n• We follow the principle of least privilege: application components access only the data they require.`,
    },
    {
      heading: '5. Data Retention',
      body: `• Account data (username, email, password hash) is retained until you delete your account.\n• Scan results are retained for the lifetime of your account and deleted when you delete your account.\n• Server access logs are retained for up to 90 days for security and abuse-prevention purposes, then purged.\n• Deleted account data is removed from our primary database within 30 days. Backups containing the data are rotated out within 90 days of deletion.`,
    },
    {
      heading: '6. Your Rights',
      body: `Depending on your jurisdiction you may have the right to:\n\n• Access the personal data we hold about you\n• Receive a machine-readable copy of your data (data portability)\n• Correct inaccurate data associated with your account\n• Request deletion of your account and all associated personal data\n• Object to certain processing of your data\n\nTo exercise any of these rights, email privacy@codescope.io from the address associated with your account. We will respond within 30 days. For requests from EU residents under the GDPR, we will respond within the legally required timeframe.`,
    },
    {
      heading: '7. Cookies and Tracking',
      body: `CodeScope does not use advertising cookies, third-party analytics cookies, or tracking pixels. We do not embed third-party scripts that collect behavioural data. The only browser storage we use is in-memory session state (cleared on tab close) to hold your authentication token.`,
    },
    {
      heading: "8. Children's Privacy",
      body: `CodeScope is a developer tool intended for users aged 13 and over. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has created an account, contact privacy@codescope.io and we will promptly delete the account.`,
    },
    {
      heading: '9. Changes to This Policy',
      body: `We may update this Privacy Policy as the Service evolves. When we make material changes we will update the "last updated" date at the top of this document. Continued use of the Service after the effective date of a revised policy constitutes your acceptance of the changes.`,
    },
    {
      heading: '10. Contact',
      body: `For privacy-related questions or requests:\n\nEmail: privacy@codescope.io\n\nWe aim to respond to all privacy inquiries within 5 business days.`,
    },
  ],
}

const TERMS = {
  title: 'Terms of Service',
  updated: EFFECTIVE_DATE,
  sections: [
    {
      heading: '1. Acceptance of Terms',
      body: `By registering for a CodeScope account, accessing the Service, or clicking "Create account", you agree to be legally bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree to all of these Terms, you may not use the Service.\n\nIf you are using CodeScope on behalf of an organisation, you represent that you have the authority to bind that organisation to these Terms.`,
    },
    {
      heading: '2. Description of Service',
      body: `CodeScope provides automated static analysis of source code submitted by users. The Service generates plain-English explanations of code behaviour, identifies potential bugs and security issues, and produces complexity scores. All analysis is automated. Results are informational aids for developers and do not constitute professional legal, security, or engineering advice.`,
    },
    {
      heading: '3. Eligibility',
      body: `You must be at least 13 years of age to use CodeScope. By creating an account, you represent and warrant that you meet this age requirement and that the information you provide during registration is accurate and complete.`,
    },
    {
      heading: '4. Account Responsibility',
      body: `• You are solely responsible for maintaining the confidentiality of your username and password.\n• You are responsible for all activity that occurs under your account, whether or not authorised by you.\n• You must notify us immediately at security@codescope.io if you suspect any unauthorised access to your account.\n• You may not transfer your account to another person or share your credentials with others.\n• You may not create accounts through automated means or create accounts for other individuals without their explicit consent.`,
    },
    {
      heading: '5. Acceptable Use',
      body: `You agree to use CodeScope only for lawful purposes and in accordance with these Terms. You agree not to:\n\n• Submit code that you do not own or that you are not authorised to review, analyse, or share\n• Use the Service to identify vulnerabilities in systems, infrastructure, or applications that you do not own or have written permission to test\n• Attempt to bypass, circumvent, or defeat authentication mechanisms, rate limits, or access controls\n• Send automated requests to the Service in a volume or pattern that degrades availability for other users (scraping, DDoS, fuzzing)\n• Submit payloads specifically designed to exploit the analysis engine, the backend, or the database\n• Impersonate any person or entity or misrepresent your affiliation with any person or entity\n• Use the Service for any purpose that violates applicable local, national, or international law`,
    },
    {
      heading: '6. Scan Content and Your Code',
      body: `You retain all ownership rights in the code you submit. By submitting code for analysis, you grant CodeScope a limited, non-exclusive, royalty-free licence to process, analyse, store, and display that code solely to provide you with the analysis results.\n\nYou represent and warrant that:\n• You own or are authorised to submit any code you send to CodeScope\n• Your submissions do not violate the intellectual property rights of any third party\n• Your submissions do not contain malware, exploits, or payloads intended to harm our infrastructure\n\nDo not submit code containing secrets, credentials, private keys, personal data of third parties, or any information subject to confidentiality obligations. CodeScope is not responsible for any data contained in scan submissions.`,
    },
    {
      heading: '7. Analysis Results and Disclaimers',
      body: `Scan results are generated by automated tools and are provided "as is" without warranty of any kind. CodeScope:\n\n• Does not guarantee the accuracy, completeness, or fitness for a particular purpose of any analysis output\n• Does not warrant that all bugs, security vulnerabilities, or code quality issues will be detected\n• Is not a substitute for professional security audits, penetration testing, code review by qualified engineers, or legal advice\n\nYou are solely responsible for evaluating scan results and for any decisions you make based on them. Do not ship changes to production based solely on automated scan output without appropriate human review.`,
    },
    {
      heading: '8. Intellectual Property',
      body: `CodeScope, its logo, design, user interface, and underlying technology are owned by or licensed to us and are protected by copyright, trademark, and other intellectual property laws. These Terms do not grant you any right to use our name, logo, or other proprietary materials beyond what is necessary to use the Service as described.`,
    },
    {
      heading: '9. Termination',
      body: `Either party may terminate the account relationship at any time. You may delete your account through the account settings. We reserve the right to suspend or terminate any account — with or without notice — that we reasonably believe has violated these Terms, poses a security risk, or is being used fraudulently.\n\nUpon termination, your right to use the Service ceases immediately. Provisions of these Terms that by their nature should survive termination will continue to apply.`,
    },
    {
      heading: '10. Limitation of Liability',
      body: `To the maximum extent permitted by applicable law, CodeScope and its operators shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation loss of profits, data, or business opportunities, arising out of or related to your use of or inability to use the Service.\n\nIn no event shall our total liability for all claims relating to the Service exceed the amount you paid us (if any) in the twelve months preceding the claim.`,
    },
    {
      heading: '11. Governing Law and Disputes',
      body: `These Terms are governed by and construed in accordance with applicable law. Any dispute arising from these Terms or your use of the Service shall first be addressed by contacting legal@codescope.io. If a dispute cannot be resolved informally, both parties agree to submit to the jurisdiction of the relevant courts.`,
    },
    {
      heading: '12. Changes to Terms',
      body: `We may revise these Terms at any time. When we make material changes we will update the "last updated" date. Your continued use of the Service following the effective date of revised Terms constitutes your acceptance of those Terms. If you do not agree to the revised Terms, you must stop using the Service.`,
    },
    {
      heading: '13. Contact',
      body: `For questions about these Terms:\n\nEmail: legal@codescope.io\n\nWe aim to respond to all legal inquiries within 5 business days.`,
    },
  ],
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function LegalModal({ page, onClose }) {
  const [tab, setTab] = useState(page ?? 'privacy')
  const scrollRef = useRef(null)

  // Sync tab when the caller switches between privacy / terms
  useEffect(() => {
    if (page) setTab(page)
  }, [page])

  // Reset scroll to top when tab changes
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [tab])

  // Close on Escape
  useEffect(() => {
    if (!page) return undefined
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [page, onClose])

  if (!page) return null

  const doc = tab === 'privacy' ? PRIVACY : TERMS

  return (
    <div
      className="legal-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="legal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="legal-modal__header">
          <div className="legal-modal__tabs" role="tablist" aria-label="Legal document">
            <button
              role="tab"
              aria-selected={tab === 'privacy'}
              className={`legal-tab ${tab === 'privacy' ? 'legal-tab--active' : ''}`}
              onClick={() => setTab('privacy')}
            >
              Privacy Policy
            </button>
            <button
              role="tab"
              aria-selected={tab === 'terms'}
              className={`legal-tab ${tab === 'terms' ? 'legal-tab--active' : ''}`}
              onClick={() => setTab('terms')}
            >
              Terms of Service
            </button>
          </div>
          <button
            className="legal-modal__close"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="legal-modal__scroll" ref={scrollRef}>
          <p className="legal-updated">Last updated: {doc.updated}</p>
          <h2 id="legal-modal-title" className="legal-doc-title">{doc.title}</h2>

          {doc.sections.map((section) => (
            <div key={section.heading} className="legal-section">
              <h3 className="legal-section__heading">{section.heading}</h3>

              {section.body && (
                <div className="legal-section__body">
                  {section.body.split('\n').map((line, i) =>
                    line.trim() === '' ? (
                      <br key={i} />
                    ) : (
                      <p key={i}>{line}</p>
                    )
                  )}
                </div>
              )}

              {section.subsections?.map((sub) => (
                <div key={sub.label} className="legal-subsection">
                  <p className="legal-subsection__label">{sub.label}</p>
                  <div className="legal-section__body">
                    {sub.text.split('\n').map((line, i) =>
                      line.trim() === '' ? (
                        <br key={i} />
                      ) : (
                        <p key={i}>{line}</p>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
