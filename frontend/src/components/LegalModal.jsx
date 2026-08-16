import { useEffect, useRef, useState } from 'react'

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
          text: 'When you register we collect your chosen username, your email address, and your password. Your password is immediately processed through bcrypt (work factor 12) before it is written to our database. The plain-text password is never stored or logged anywhere in our systems.',
        },
        {
          label: 'b) Scan content',
          text: 'Code snippets, file paths, and repository references you submit for analysis are transmitted to our servers, processed to produce explanations, issue flags, and complexity scores, and the results are returned to your browser.\n\nTo analyse a repository we fetch it from the public GitHub API, and to generate AI explanations we send the relevant code to the OpenAI API. Both of these are third-party services with their own data handling practices, which we do not control.\n\nScan results are not stored on our servers. They exist only in the memory of your browser session and are lost when you close the page. We do not currently provide a way to retrieve past scans.\n\nDo not paste secrets, API keys, tokens, database credentials, private keys, or personally identifiable information belonging to other people into scans, because that data is transmitted to the third-party services above.',
        },
        {
          label: 'c) Usage and technical data',
          text: 'Our servers automatically log standard HTTP metadata: IP address, request path, HTTP method, response status code, response time, and timestamp. This data is used solely for security monitoring, abuse prevention, and service reliability. It is not linked to your account profile for marketing or tracking purposes.',
        },
        {
          label: 'd) Browser and session data',
          text: 'After you sign in, an authentication token (JWT) is issued and held in your browser\'s memory. This token contains your user ID, username, and role. It is not written to a cookie; it is cleared automatically when you close the tab or sign out. We also store a small list of recently scanned repository URLs in your browser\'s localStorage so the "recent scans" list can be shown on your dashboard.',
        },
      ],
    },
    {
      heading: '3. How We Use Your Information',
      body: `We use the information we collect to:\n\n• Create and authenticate your account\n• Process code you submit and return analysis results\n• Send account verification emails\n• Monitor service health and investigate security incidents\n\nWe do not sell, rent, or share your personal information with third parties for advertising or marketing purposes. We do not use your code submissions to train or fine-tune models.`,
    },
    {
      heading: '4. How We Protect Your Information',
      body: `• Passwords are hashed with bcrypt (work factor 12). We cannot recover or read your password.\n• Authentication uses short-lived signed JWTs that expire after one hour. Tokens are never stored server-side in a way that allows bulk extraction.\n• Database access is restricted to authenticated application processes; no public-facing database ports are exposed.\n• Transport layer security (TLS/HTTPS) encrypts all data in transit between your browser and our servers.\n• We follow the principle of least privilege: application components access only the data they require.`,
    },
    {
      heading: '5. Data Retention',
      body: `• Account data (username, email, password hash) is retained for as long as your account exists.\n• Scan results are not stored on our servers, so there is nothing to retain or delete on our end.\n• Server access logs are retained for up to 90 days for security and abuse-prevention purposes, then purged.\n• We do not currently offer a self-service account deletion feature. If you want your account data removed, contact us through whatever contact channel CodeScope makes available at that time, and we will act on your request as required by law.`,
    },
    {
      heading: '6. Your Rights',
      body: `Depending on your jurisdiction you may have rights that include: accessing the personal data we hold about you, receiving a copy of your data, correcting inaccurate data, or requesting deletion of your account and data.\n\nBecause CodeScope does not currently provide a dedicated contact address, we are not yet able to guarantee a response to requests to exercise these rights. We will implement a mechanism for such requests in a future version of the Service. Until then, we do not make any representation that we can process data-subject requests.`,
    },
    {
      heading: '7. Cookies and Tracking',
      body: `CodeScope does not use advertising cookies, third-party analytics cookies, or tracking pixels. We do not embed third-party scripts that collect behavioural data. The browser storage we use is in-memory session state (cleared on tab close) to hold your authentication token, plus a small list of recently scanned repository URLs in localStorage.`,
    },
    {
      heading: "8. Children's Privacy",
      body: `CodeScope is a developer tool intended for users aged 13 and over. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has created an account, contact us through whatever contact channel CodeScope makes available at that time, and we will take reasonable steps to delete the account as required by law.`,
    },
    {
      heading: '9. Changes to This Policy',
      body: `We may update this Privacy Policy as the Service evolves. When we make material changes we will update the "last updated" date at the top of this document. Continued use of the Service after the effective date of a revised policy constitutes your acceptance of the changes.`,
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
      body: `• You are solely responsible for maintaining the confidentiality of your username and password.\n• You are responsible for all activity that occurs under your account, whether or not authorised by you.\n• You should notify us if you suspect any unauthorised access to your account, through whatever contact channel CodeScope makes available at that time.\n• You may not transfer your account to another person or share your credentials with others.\n• You may not create accounts through automated means or create accounts for other individuals without their explicit consent.`,
    },
    {
      heading: '5. Acceptable Use',
      body: `You agree to use CodeScope only for lawful purposes and in accordance with these Terms. You agree not to:\n\n• Submit code that you do not own or that you are not authorised to review, analyse, or share\n• Use the Service to identify vulnerabilities in systems, infrastructure, or applications that you do not own or have written permission to test\n• Attempt to bypass, circumvent, or defeat authentication mechanisms, rate limits, or access controls\n• Send automated requests to the Service in a volume or pattern that degrades availability for other users (scraping, DDoS, fuzzing)\n• Submit payloads specifically designed to exploit the analysis engine, the backend, or the database\n• Impersonate any person or entity or misrepresent your affiliation with any person or entity\n• Use the Service for any purpose that violates applicable local, national, or international law`,
    },
    {
      heading: '6. Scan Content and Your Code',
      body: `You retain all ownership rights in the code you submit. By submitting code for analysis, you grant CodeScope a limited, non-exclusive, royalty-free licence to process and analyse that code solely to provide you with the analysis results. CodeScope does not store your submissions or display them to other users.\n\nYou represent and warrant that:\n• You own or are authorised to submit any code you send to CodeScope\n• Your submissions do not violate the intellectual property rights of any third party\n• Your submissions do not contain malware, exploits, or payloads intended to harm our infrastructure\n\nDo not submit code containing secrets, credentials, private keys, personal data of third parties, or any information subject to confidentiality obligations. CodeScope is not responsible for any data contained in scan submissions.`,
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
      body: `Either party may terminate the account relationship at any time. We reserve the right to suspend or terminate any account, with or without notice, that we reasonably believe has violated these Terms, poses a security risk, or is being used fraudulently. CodeScope does not currently offer a self-service account deletion feature; if you wish to stop using the Service you may simply stop using it.\n\nUpon termination, your right to use the Service ceases immediately. Provisions of these Terms that by their nature should survive termination will continue to apply.`,
    },
    {
      heading: '10. Limitation of Liability',
      body: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL CODESCOPE OR ITS OPERATORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION LOSS OF PROFITS, DATA, REVENUE, GOODWILL, OR BUSINESS OPPORTUNITIES, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.\n\nIN NO EVENT SHALL OUR TOTAL CUMULATIVE LIABILITY FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THE SERVICE, WHETHER IN CONTRACT, TORT, OR OTHERWISE, EXCEED THE GREATER OF (i) THE AMOUNT YOU PAID US (IF ANY) IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM, OR (ii) ONE HUNDRED DOLLARS ($100).\n\nTHE FOREGOING LIMITATIONS APPLY EVEN IF ANY REMEDY SET FORTH HEREIN FAILS OF ITS ESSENTIAL PURPOSE. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OR LIMITATION OF CERTAIN DAMAGES, SO SOME OF THE ABOVE LIMITATIONS MAY NOT APPLY TO YOU.`,
    },
    {
      heading: '11. Disclaimer of Warranties',
      body: `THE SERVICE, INCLUDING ALL CONTENT, ANALYSIS RESULTS, AND OUTPUT, IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, WHETHER EXPRESS, IMPLIED, OR STATUTORY. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CODESCOPE DISCLAIMS ALL WARRANTIES, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND ACCURACY OR COMPLETENESS OF ANY ANALYSIS RESULTS.\n\nWE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, OR THAT ANY ANALYSIS OUTPUT WILL BE CORRECT, COMPLETE, OR RELIABLE. ALL ANALYSIS RESULTS ARE AUTOMATED AND INFORMATIONAL ONLY, AND YOU USE THEM AT YOUR OWN RISK.`,
    },
    {
      heading: '12. Governing Law and Disputes',
      body: `These Terms are governed by and construed in accordance with applicable law. Any dispute arising from these Terms or your use of the Service shall first be addressed through whatever contact channel CodeScope makes available at that time. If a dispute cannot be resolved informally, both parties agree to submit to the jurisdiction of the relevant courts.`,
    },
    {
      heading: '13. Changes to Terms',
      body: `We may revise these Terms at any time. When we make material changes we will update the "last updated" date. Your continued use of the Service following the effective date of revised Terms constitutes your acceptance of those Terms. If you do not agree to the revised Terms, you must stop using the Service.`,
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
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
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
