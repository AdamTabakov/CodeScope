import { useEffect, useRef, useState } from 'react'

const EFFECTIVE_DATE = 'August 14, 2026'

// ── Content ───────────────────────────────────────────────────────────────────

const PRIVACY = {
  title: 'Privacy Policy',
  updated: EFFECTIVE_DATE,
  sections: [
    {
      heading: 'Introduction',
      body: `CodeScope ("CodeScope", "we", "our", or "us") provides an automated code analysis service (the "Service") that analyzes source code and repositories, explains code behavior in plain English, identifies potential issues, and provides code complexity analysis.\n\nThis Privacy Policy explains what information we collect, how we use it, how information is processed through third-party services, how long we retain information, and the choices available to you when using CodeScope.\n\nBy using CodeScope, you acknowledge the practices described in this Privacy Policy. If you do not agree with these practices, please do not use the Service.`,
    },
    {
      heading: '1. Information We Collect',
      subsections: [
        {
          label: 'a) Account Information',
          text: 'When you create an account, we collect:\n\n• Username\n• Email address\n• Password\n\nPasswords are processed using bcrypt with a work factor of 12 before being stored in our database. Plain-text passwords are not stored or intentionally logged by CodeScope.\n\nWe may also store account-related information necessary to authenticate users and enforce account permissions.',
        },
        {
          label: 'b) Repository and Scan Information',
          text: 'When you submit code or request an analysis, CodeScope may process:\n\n• Source code\n• File contents\n• File paths\n• Repository URLs\n• Repository metadata\n• Information necessary to perform the requested analysis\n\nCode submitted for analysis is transmitted to CodeScope\'s servers for processing.\n\nFor repository-based analysis, CodeScope may retrieve repository information and source files from GitHub or another supported repository provider.\n\nCodeScope processes this information solely for purposes related to providing the requested analysis and operating the Service.\n\nSaved projects\n\nWhen you scan a repository, CodeScope may save a project to your account containing the repository URL and metadata, the file list, analysis metrics, and your chat history (questions and answers) so you can reopen it later. Source-code file contents themselves are not permanently stored — they are re-fetched from GitHub when you reopen a project. You can delete a saved project at any time from your dashboard.',
        },
        {
          label: 'c) AI Processing',
          text: 'To generate certain analysis results, relevant code and associated information may be transmitted to Google\'s Gemini API.\n\nGoogle processes information submitted through its API according to its applicable terms and privacy practices.\n\nCodeScope does not intentionally use submitted code to train or fine-tune artificial intelligence models.',
        },
        {
          label: 'd) Usage and Technical Information',
          text: 'When you use CodeScope, our infrastructure may automatically process technical information associated with requests, including:\n\n• IP address\n• Request path\n• HTTP method\n• Response status\n• Response time\n• Timestamp\n• Basic error and diagnostic information\n\nThis information is used for:\n\n• Security monitoring\n• Abuse prevention\n• Troubleshooting\n• Service reliability\n• Detecting and investigating suspicious activity\n\nWe do not use this information for behavioral advertising.',
        },
        {
          label: 'e) Browser Storage',
          text: 'CodeScope uses browser-side storage for certain functionality.\n\nTo keep you signed in across page loads, your authentication token and a minimal account profile (username, email, role) are stored in your browser\'s localStorage. This session data is removed when you sign out and is not used for tracking or advertising.\n\nCodeScope may also store recently scanned repository URLs in your browser\'s localStorage so that previously accessed repositories can be displayed in the application\'s recent-scans interface.\n\nThese locally stored items remain on your device unless removed by you or cleared by your browser.\n\nCodeScope does not intentionally use localStorage to store passwords or complete source-code submissions.',
        },
      ],
    },
    {
      heading: '2. How We Use Information',
      body: `We use information we collect to:\n\n• Create and manage user accounts\n• Authenticate users\n• Provide requested code analysis\n• Retrieve repositories requested by users\n• Generate AI-assisted analysis\n• Return analysis results\n• Send account-related communications, including verification emails where applicable\n• Maintain and improve the reliability of the Service\n• Detect and prevent abuse, fraud, and unauthorized access\n• Investigate security incidents\n• Comply with applicable legal obligations\n\nWe do not sell personal information.\n\nWe do not use submitted source code for advertising purposes.\n\nWe do not intentionally use submitted source code to train or fine-tune AI models.`,
    },
    {
      heading: '3. How We Share Information',
      body: `We do not sell, rent, or share personal information with third parties for their own advertising purposes.\n\nInformation may be processed by service providers that help us operate CodeScope.\n\nThese providers may process information on our behalf for purposes such as:\n\n• Cloud hosting\n• Database infrastructure\n• Repository access\n• AI-powered analysis\n• Email delivery\n• Security and service reliability\n\nThese providers may process information according to their own terms and privacy policies.\n\nCurrent Third-Party Services\n\nCodeScope may use third-party services including:\n\n• Cloudflare — used for frontend hosting, content delivery, and related infrastructure.\n• Render — used to host CodeScope\'s backend application.\n• MongoDB — used to store account and application data.\n• GitHub — used to retrieve repository information and source code when a repository is analyzed through GitHub.\n• Google Gemini — used to process relevant code and generate AI-assisted analysis.\n• Resend — used to send account-related emails, including verification emails.\n\nThe specific information transmitted to each provider depends on the functionality being used.`,
    },
    {
      heading: '4. Code Retention',
      body: `CodeScope does not permanently store source-code file contents on its application servers.\n\nWhen an analysis is completed, the resulting information is returned to the user\'s browser. If you have an account, CodeScope may save a project containing the repository URL and metadata, the file list, analysis metrics, and your chat history (questions and answers) so you can reopen it later. Saved projects and chat history can be deleted at any time from your dashboard, and are removed when your account is deleted.\n\nHowever, code and related information may temporarily exist in application memory, network infrastructure, processing systems, logs, caches, or third-party services as necessary to provide the requested functionality, maintain security, or comply with applicable legal obligations.\n\nThird-party providers may maintain information according to their own retention policies and applicable agreements.\n\nBecause of this, users should not submit passwords, API keys, private keys, authentication tokens, database credentials, confidential information, or other sensitive information unless they are authorized to do so and understand the associated risks.`,
    },
    {
      heading: '5. Account Data Retention',
      body: `Account information, including your username, email address, and password hash, may be retained for as long as your account remains active.\n\nWe may retain limited information after account termination where reasonably necessary to:\n\n• Comply with legal obligations\n• Prevent fraud or abuse\n• Resolve disputes\n• Maintain security\n• Enforce our agreements\n\nInformation that is no longer required for these purposes may be deleted or anonymized.`,
    },
    {
      heading: '6. Server Logs',
      body: `CodeScope\'s infrastructure may retain technical logs for security, abuse prevention, troubleshooting, and reliability purposes.\n\nThese logs may include IP addresses, request information, timestamps, response information, and diagnostic information.\n\nWe intend to retain routine server logs for no longer than reasonably necessary for these purposes, with a target retention period of up to 90 days where technically and operationally feasible.\n\nSecurity or incident-related information may be retained for longer when reasonably necessary to investigate or respond to an incident or comply with legal obligations.`,
    },
    {
      heading: '7. Security',
      body: `We use reasonable technical and organizational measures designed to protect information processed by CodeScope.\n\nThese measures may include:\n\n• Password hashing using bcrypt\n• Signed authentication tokens with expiration\n• HTTPS/TLS encryption for data transmitted between clients and our servers\n• Access controls\n• Least-privilege application permissions\n• Restricted database access\n• Server-side authentication and authorization\n• Security monitoring and abuse prevention\n\nNo Internet-based service can guarantee absolute security.\n\nYou are responsible for maintaining the security of your account credentials and for reviewing information before submitting it to CodeScope.`,
    },
    {
      heading: '8. Authentication',
      body: `CodeScope uses signed JSON Web Tokens (JWTs) for authentication.\n\nAuthentication tokens are designed to expire after a longer session window (currently up to 30 days). While you are signed in, the token and a minimal account profile are stored in your browser's localStorage so you stay signed in across page loads; both are cleared when you sign out.\n\nYou should sign out when using CodeScope on a shared or publicly accessible device.`,
    },
    {
      heading: '9. Cookies and Tracking',
      body: `CodeScope does not intentionally use advertising cookies, tracking pixels, or third-party advertising trackers.\n\nCodeScope may use technically necessary browser storage required for application functionality.\n\nThis includes in-memory authentication state and localStorage used to maintain a list of recently scanned repository URLs.\n\nWe do not use these mechanisms to create advertising profiles or sell behavioral information.\n\nThird-party infrastructure providers may independently use technically necessary mechanisms as described in their own policies.`,
    },
    {
      heading: '10. Your Privacy Rights',
      body: `Depending on where you live, you may have legal rights relating to your personal information.\n\nThese rights may include the ability to:\n\n• Request access to personal information we hold about you\n• Request correction of inaccurate information\n• Request deletion of personal information\n• Request information about how your personal information is processed\n• Object to or restrict certain processing activities\n• Withdraw consent where processing is based on consent\n• Request a copy of certain personal information\n\nThe availability of these rights depends on applicable law and the circumstances of the request.\n\nCodeScope may need to verify your identity before fulfilling certain requests.\n\nWhere CodeScope is legally required to provide a mechanism for privacy requests, we will provide an appropriate mechanism for submitting those requests.`,
    },
    {
      heading: '11. Account Deletion',
      body: `CodeScope does not currently provide a self-service account deletion feature.\n\nWe intend to implement a self-service account deletion mechanism in a future version of the Service. Once implemented, users will be able to request deletion of their account and associated personal information through the Service.\n\nUntil that functionality is available, there is no mechanism for submitting account or data deletion requests.\n\nWhen an account is deleted, we will delete or anonymize associated personal information where reasonably possible and where we are not required to retain it for legal, security, fraud-prevention, or other legitimate purposes.\n\nThis includes saved projects and chat history associated with the account.`,
    },
    {
      heading: '12. International Processing',
      body: `CodeScope and its service providers may process information on servers located outside your province, territory, state, or country.\n\nAs a result, your information may be subject to the laws of jurisdictions where CodeScope or its service providers operate.\n\nBy using the Service, you acknowledge that information may be processed in jurisdictions other than your own, subject to applicable privacy laws.`,
    },
    {
      heading: "13. Children's Privacy",
      body: `CodeScope is intended for users aged 13 and older.\n\nWe do not knowingly collect personal information from children under 13.\n\nIf we become aware that an account was created by a child under 13, we will take reasonable steps to delete the account and associated personal information where required by applicable law.`,
    },
    {
      heading: '14. Third-Party Links and Services',
      body: `CodeScope may contain links to or integrations with third-party services.\n\nThese third parties operate independently from CodeScope and may have their own privacy policies, terms, security practices, and data-retention practices.\n\nCodeScope is not responsible for the privacy practices of third-party services that it does not control.\n\nYou should review the applicable policies of third-party services before providing them with information.`,
    },
    {
      heading: '15. Data Breaches and Security Incidents',
      body: `Despite reasonable security measures, no system is completely secure.\n\nIf CodeScope experiences a security incident involving personal information, we will respond in accordance with applicable legal requirements and take reasonable steps to investigate, contain, and remediate the incident.\n\nWhere required by law, affected users or regulatory authorities will be notified.`,
    },
    {
      heading: '16. Changes to This Privacy Policy',
      body: `We may update this Privacy Policy as CodeScope develops or as applicable laws and data-processing practices change.\n\nWhen we make material changes, we will update the "Last updated" date at the beginning of this policy.\n\nWhere required by applicable law, we may provide additional notice of material changes.\n\nYour continued use of CodeScope after an updated Privacy Policy becomes effective constitutes acknowledgment of the updated policy to the extent permitted by applicable law.`,
    },
    {
      heading: '17. Contact and Privacy Requests',
      body: `Privacy-related request mechanisms are not implemented yet. CodeScope does not currently provide a mechanism for submitting privacy-related requests.\n\nWe intend to implement such mechanisms in a future version of the Service. Until then, there is no mechanism for submitting privacy-related requests.`,
    },
  ],
}

const TERMS = {
  title: 'Terms of Service',
  updated: EFFECTIVE_DATE,
  sections: [
    {
      heading: '1. Acceptance of Terms',
      body: `These Terms of Service ("Terms") govern your access to and use of CodeScope ("CodeScope", "Service", "we", "us", or "our").\n\nBy creating an account, accessing the Service, submitting code for analysis, connecting a repository, or otherwise using CodeScope, you agree to these Terms and our Privacy Policy.\n\nIf you do not agree to these Terms, you must not access or use the Service.\n\nIf you use CodeScope on behalf of an organization, you represent that you have the authority to accept these Terms on that organization's behalf.`,
    },
    {
      heading: '2. Description of the Service',
      body: `CodeScope provides automated software analysis tools that may analyze source code and repositories to provide:\n\n• Plain-English explanations of code behavior\n• Potential bugs and security issues\n• Code quality observations\n• Complexity analysis and scores\n• Other automated development insights\n\nCodeScope uses automated systems, including artificial intelligence and third-party services, to generate analysis.\n\nThe Service is provided as a development aid and does not constitute professional software engineering, cybersecurity, legal, or other professional advice.`,
    },
    {
      heading: '3. Eligibility',
      body: `You must be at least 13 years old to use CodeScope.\n\nBy using the Service, you represent that:\n\n• You meet the applicable minimum age requirement\n• You have the legal capacity to agree to these Terms\n• Information you provide to us is accurate and complete\n• You will comply with all applicable laws and regulations\n\nIf you are using CodeScope on behalf of an organization, you additionally represent that you are authorized to bind that organization to these Terms.`,
    },
    {
      heading: '4. Accounts',
      body: `Certain features require you to create an account.\n\nYou are responsible for:\n\n• Providing accurate account information\n• Maintaining the confidentiality of your credentials\n• Keeping your password secure\n• All activity occurring through your account\n\nYou may not:\n\n• Share your account credentials with another person\n• Transfer your account to another person\n• Create accounts through automated means without authorization\n• Impersonate another person or entity\n• Use another person's account without permission\n\nWe may suspend or terminate accounts that violate these Terms or create security, legal, or operational risks.`,
    },
    {
      heading: '5. Acceptable Use',
      body: `You may use CodeScope only for lawful purposes and in accordance with these Terms.\n\nYou must not:\n\n• Submit code that you do not own or have authorization to analyze\n• Use CodeScope to analyze systems or applications without appropriate authorization\n• Attempt to bypass authentication, rate limits, access controls, or other security mechanisms\n• Attempt to gain unauthorized access to CodeScope or its infrastructure\n• Interfere with or disrupt the Service\n• Conduct scraping, denial-of-service attacks, fuzzing, or other activity that may degrade the Service\n• Upload malware or code designed to compromise CodeScope or its infrastructure\n• Attempt to exploit vulnerabilities in CodeScope\n• Reverse engineer or attempt to extract proprietary components of the Service except where permitted by applicable law\n• Circumvent usage restrictions\n• Use the Service to violate applicable laws or regulations\n• Impersonate another person or entity\n• Upload content that infringes another person's intellectual property or other rights\n\nWe reserve the right to investigate suspected violations and take appropriate action.`,
    },
    {
      heading: '6. Code and Repository Content',
      body: `You retain ownership of the source code and other content you submit to CodeScope.\n\nBy submitting code or connecting a repository, you grant CodeScope a limited, non-exclusive, worldwide, royalty-free license to access, process, transmit, and analyze that content solely as necessary to provide the requested Service.\n\nThis license does not transfer ownership of your code to CodeScope.\n\nYou represent and warrant that you have the necessary rights and permissions to submit or authorize access to the content you provide.\n\nRepository access\n\nIf you connect a third-party repository, including a GitHub repository, you authorize CodeScope to access the repository information and contents necessary to perform the analysis you request.\n\nYou may revoke repository access through the relevant third-party platform.\n\nSensitive information\n\nYou should not submit secrets or sensitive information unnecessarily, including:\n\n• Passwords\n• API keys\n• Private keys\n• Authentication tokens\n• Database credentials\n• Personal information belonging to other individuals\n• Confidential information you are not authorized to disclose\n\nYou are responsible for reviewing content before submitting it to CodeScope.`,
    },
    {
      heading: '7. Code Processing and Third-Party Services',
      body: `To provide CodeScope, submitted code and related information may be processed by third-party infrastructure and service providers.\n\nThese providers may include services used for:\n\n• Cloud hosting\n• Database storage\n• Repository access\n• Artificial intelligence analysis\n• Application monitoring and security\n\nThird-party providers process information according to their own terms and privacy policies and our instructions or agreements with them, where applicable.\n\nWhere CodeScope sends code or related information to an AI provider for analysis, that processing occurs solely to provide the requested analysis and subject to the applicable provider configuration and agreements.\n\nDetails about information collected and third-party services used by CodeScope are described in our Privacy Policy.`,
    },
    {
      heading: '8. Analysis Results',
      body: `CodeScope analysis results are generated automatically and may contain errors, omissions, false positives, or false negatives.\n\nCodeScope does not guarantee that its analysis will:\n\n• Identify every vulnerability\n• Identify every bug\n• Correctly classify every issue\n• Produce complete or accurate results\n• Detect security problems\n• Produce optimal recommendations\n\nAnalysis results are provided for informational purposes only.\n\nYou are responsible for reviewing and validating analysis results before relying on them.\n\nYou should not deploy security-sensitive or production changes solely on the basis of CodeScope's automated analysis.`,
    },
    {
      heading: '9. Intellectual Property',
      body: `CodeScope, including its software, interface, branding, logo, design, documentation, and underlying technology, is owned by or licensed to CodeScope and is protected by applicable intellectual property laws.\n\nExcept as expressly permitted by these Terms, you may not:\n\n• Copy or reproduce CodeScope\n• Redistribute the Service\n• Sell or sublicense the Service\n• Modify proprietary components\n• Remove proprietary notices\n• Use CodeScope branding without permission\n• Attempt to obtain source code from proprietary components\n\nNothing in these Terms transfers ownership of CodeScope's intellectual property to you.`,
    },
    {
      heading: '10. User Feedback',
      body: `If you voluntarily provide feedback, suggestions, feature requests, or other recommendations regarding CodeScope, you grant us permission to use that feedback without restriction or compensation to you.\n\nThis does not grant us ownership of your source code or other content submitted for analysis.`,
    },
    {
      heading: '11. Service Availability',
      body: `We attempt to keep CodeScope available and operational, but we do not guarantee that the Service will:\n\n• Always be available\n• Be uninterrupted\n• Be error-free\n• Be secure at all times\n• Be free from bugs or defects\n• Remain unchanged\n\nThe Service may occasionally be unavailable because of:\n\n• Maintenance\n• Updates\n• Infrastructure failures\n• Third-party service outages\n• Security incidents\n• Network failures\n• Events outside our reasonable control\n\nWe may modify, suspend, or discontinue portions of the Service at any time.`,
    },
    {
      heading: '12. Free and Paid Features',
      body: `CodeScope may provide free and paid features.\n\nWe may introduce, modify, or discontinue pricing, usage limits, features, or subscription plans.\n\nIf paid features are introduced, applicable pricing and billing terms will be presented before you are charged.\n\nUnless otherwise stated, fees are non-refundable except where required by applicable law or expressly provided by our refund policy.`,
    },
    {
      heading: '13. Account Suspension and Termination',
      body: `You may stop using CodeScope at any time.\n\nWe may suspend or terminate your access if we reasonably believe that:\n\n• You violated these Terms\n• Your use creates a security risk\n• Your use violates applicable law\n• Your account is being used fraudulently\n• Your activity threatens the availability or integrity of the Service\n\nWhere appropriate and reasonably practicable, we may provide notice before termination.\n\nUpon termination, your right to use the Service ends immediately.\n\nCertain provisions of these Terms that are intended to survive termination will remain in effect, including provisions concerning intellectual property, disclaimers, limitations of liability, and dispute resolution.`,
    },
    {
      heading: '14. Account and Data Deletion',
      body: `CodeScope may provide account deletion functionality as the Service develops.\n\nCodeScope does not currently provide self-service account deletion and does not currently provide a contact method for deletion requests.\n\nDeletion, when available, may be subject to:\n\n• Legal requirements\n• Security requirements\n• Fraud prevention\n• Backup retention periods\n• Technical limitations\n\nSaved projects and their chat history can be deleted directly from your dashboard at any time.\n\nOur Privacy Policy describes how personal information and other data are retained and deleted.`,
    },
    {
      heading: '15. Privacy',
      body: `Your use of CodeScope is also governed by our Privacy Policy.\n\nThe Privacy Policy explains:\n\n• What information we collect\n• How we use information\n• How repository content is processed\n• How information is shared with service providers\n• How long information is retained\n• Your privacy rights\n\nIf there is a conflict between these Terms and the Privacy Policy concerning privacy matters, the Privacy Policy controls to the extent required by applicable law.`,
    },
    {
      heading: '16. Security',
      body: `We take reasonable measures designed to protect CodeScope and information processed through the Service.\n\nHowever, no online service or method of transmission can be guaranteed to be completely secure.\n\nYou are responsible for:\n\n• Protecting your account credentials\n• Using strong and unique passwords\n• Reviewing code before submitting it\n• Avoiding unnecessary submission of secrets\n• Maintaining appropriate security practices for connected third-party accounts`,
    },
    {
      heading: '17. Third-Party Services',
      body: `CodeScope may integrate with or rely upon third-party services, including repository hosting platforms, cloud infrastructure providers, databases, and AI services.\n\nThird-party services may have their own terms, privacy policies, availability limitations, and security practices.\n\nCodeScope is not responsible for the availability, functionality, or policies of third-party services that are outside our reasonable control.`,
    },
    {
      heading: '18. Disclaimer of Warranties',
      body: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CODESCOPE IS PROVIDED "AS IS" AND "AS AVAILABLE."\n\nWE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, RELIABILITY, AND AVAILABILITY.\n\nWE DO NOT WARRANT THAT:\n\n• THE SERVICE WILL BE UNINTERRUPTED\n• THE SERVICE WILL BE ERROR-FREE\n• THE SERVICE WILL BE SECURE\n• ANALYSIS RESULTS WILL BE ACCURATE\n• ALL VULNERABILITIES WILL BE IDENTIFIED\n• ALL BUGS WILL BE DETECTED\n• THE SERVICE WILL MEET YOUR PARTICULAR REQUIREMENTS\n\nSome jurisdictions do not permit certain warranty exclusions. To the extent such exclusions are prohibited, they will apply only to the maximum extent permitted by applicable law.`,
    },
    {
      heading: '19. Limitation of Liability',
      body: `TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, CODESCOPE AND ITS OPERATORS WILL NOT BE LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, REVENUE, DATA, GOODWILL, BUSINESS OPPORTUNITIES, OR OTHER INTANGIBLE LOSSES ARISING FROM OR RELATED TO YOUR USE OF THE SERVICE.\n\nTO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THE TOTAL LIABILITY OF CODESCOPE AND ITS OPERATORS FOR CLAIMS ARISING FROM OR RELATED TO THE SERVICE WILL NOT EXCEED THE GREATER OF:\n\n• THE AMOUNT YOU PAID TO CODESCOPE FOR THE SERVICE DURING THE TWELVE MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM; OR\n• CAD $1\n\nNothing in these Terms excludes or limits liability that cannot legally be excluded or limited under applicable law.`,
    },
    {
      heading: '20. Indemnification',
      body: `To the maximum extent permitted by applicable law, you agree to defend, indemnify, and hold harmless CodeScope and its operators from claims, damages, liabilities, losses, and expenses arising from:\n\n• Your violation of these Terms\n• Your misuse of the Service\n• Your violation of another person's rights\n• Your submission of content that you did not have permission to submit\n• Your violation of applicable laws or regulations\n\nThis section does not apply to the extent that a claim results from CodeScope's own unlawful conduct or negligence where such limitation is prohibited by law.`,
    },
    {
      heading: '21. Changes to the Service',
      body: `We may modify, update, suspend, or discontinue features of CodeScope at any time.\n\nWe may also change these Terms from time to time.\n\nWhen we make material changes, we will update the "Last updated" date and, where reasonably appropriate, provide additional notice.\n\nYour continued use of CodeScope after updated Terms become effective constitutes acceptance of the updated Terms, to the extent permitted by applicable law.\n\nIf you do not agree to updated Terms, you must stop using the Service.`,
    },
    {
      heading: '22. Governing Law',
      body: `These Terms are governed by the laws applicable in the jurisdiction in which CodeScope is operated, except to the extent that applicable law requires otherwise.\n\nNothing in these Terms limits rights or remedies that you may have under mandatory consumer protection or other applicable laws.`,
    },
    {
      heading: '23. Severability',
      body: `If any provision of these Terms is determined to be invalid or unenforceable, that provision will be enforced to the maximum extent permitted by law, and the remaining provisions will remain in full force and effect.`,
    },
    {
      heading: '24. Entire Agreement',
      body: `These Terms, together with the Privacy Policy and any additional terms applicable to specific CodeScope features, constitute the entire agreement between you and CodeScope concerning your use of the Service, except where otherwise required by applicable law.`,
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
