// EMAIL SERVICE: send transactional email via Resend.
//
// Resend is used because it only needs an API key (no SMTP server) and can be
// called directly with fetch. If RESEND_API_KEY is not configured, the service
// falls back to logging the message so local development still works end-to-end.
//
// Setup (see backend/.env.example):
//   RESEND_API_KEY=re_...            # from https://resend.com/api-keys
//   EMAIL_FROM=CodeScope <onboarding@resend.dev>
//   APP_URL=https://your-domain.com  # base URL used to build verification links
//
// Note: until you add and verify a sending domain in Resend, emails can only be
// sent to your own account's inbox (Resend's "test sending" restriction).

import { config } from '../config/env.js'

const RESEND_ENDPOINT = 'https://api.resend.com/emails'

export function buildVerificationUrl(token) {
  const base = config.appUrl.replace(/\/+$/, '')
  return `${base}/verify?token=${encodeURIComponent(token)}`
}

export async function sendVerificationEmail({ to, username, token }) {
  const link = buildVerificationUrl(token)

  if (!config.resendApiKey) {
    // Dev fallback: no email provider configured — print the link so the flow
    // is still testable locally. Never expose this in production logs.
    console.log(`[email] (dev fallback) Verification for ${to}:\n  ${link}`)
    return { sent: false, link }
  }

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: config.emailFrom,
        to: [to],
        subject: 'Confirm your CodeScope account',
        html:
          `<div style="font-family:sans-serif;line-height:1.6;color:#1d2127">` +
          `<h2>Welcome to CodeScope, ${escapeHtml(username)}</h2>` +
          `<p>Please confirm your email address to activate your account.</p>` +
          `<p><a href="${escapeHtml(link)}" style="display:inline-block;padding:10px 18px;border-radius:6px;background:#2563eb;color:#ffffff;text-decoration:none">Verify my email</a></p>` +
          `<p>If the button doesn't work, paste this link into your browser:</p>` +
          `<p><code style="word-break:break-all">${escapeHtml(link)}</code></p>` +
          `<p style="color:#6f7783">If you didn't create this account, you can ignore this email.</p>` +
          `</div>`,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      console.error('[email] Resend send failed:', response.status, body.slice(0, 300))
      return { sent: false, link }
    }
    return { sent: true, link }
  } catch (err) {
    console.error('[email] Resend request failed:', err.message)
    return { sent: false, link }
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}