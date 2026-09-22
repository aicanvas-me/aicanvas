/**
 * Renders the Supabase Auth email templates from the SAME shell the app's
 * own emails use, so the two can never drift apart again. The templates live in
 * the Supabase dashboard, not in this repo, so this script only WRITES HTML to
 * a directory; uploading it is a separate, deliberate step.
 *
 *   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/render-auth-emails.mjs <out-dir>
 *
 * Each file is named after its Supabase template key, and every template keeps
 * the variables Supabase substitutes into it ({{ .ConfirmationURL }}, or
 * {{ .Token }} for reauthentication). Losing one would break sign-in, so they
 * are all asserted here before a single file is written.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { emailShell, emailText } from '../app/lib/email/shell.ts'

const body = (text) =>
  `<p ${emailText('secondary', 'margin:0;font-size:15px;line-height:1.6;')}>${text}</p>`

const URL_VAR = '{{ .ConfirmationURL }}'

export const AUTH_EMAILS = {
  confirmation: {
    subject: 'Confirm your email',
    html: emailShell({
      title: 'Confirm your email',
      heading: 'Confirm your email',
      bodyHtml: body(
        'Welcome to AI Canvas. Confirm your email to activate your account, then start dropping components straight into your projects.',
      ),
      button: { label: 'Confirm email', url: URL_VAR },
      footerNoteHtml: "If you didn't sign up for AI Canvas, you can safely ignore this email.",
    }),
  },
  magic_link: {
    subject: 'Sign in to AI Canvas',
    html: emailShell({
      title: 'Sign in to AI Canvas',
      heading: 'Sign in to AI Canvas',
      bodyHtml: body(
        "Here's your sign-in link. It gets you into AI Canvas in one click, expires in 1 hour, and works once.",
      ),
      button: { label: 'Sign in', url: URL_VAR },
      footerNoteHtml: "If you didn't request this link, you can safely ignore this email.",
    }),
  },
  recovery: {
    subject: 'Reset your password',
    html: emailShell({
      title: 'Reset your password',
      heading: 'Reset your password',
      bodyHtml: body(
        'We got a request to reset your AI Canvas password. Choose a new one with the button below. This link expires in 1 hour.',
      ),
      button: { label: 'Reset password', url: URL_VAR },
      footerNoteHtml:
        "If you didn't request a password reset, you can safely ignore this email. Your password won't change.",
    }),
  },
  email_change: {
    subject: 'Confirm your new email',
    html: emailShell({
      title: 'Confirm your new email',
      heading: 'Confirm your new email',
      bodyHtml: body(
        'You asked to change the email on your AI Canvas account from <strong>{{ .Email }}</strong> to <strong>{{ .NewEmail }}</strong>. Confirm below to finish the change.',
      ),
      button: { label: 'Confirm new email', url: URL_VAR },
      footerNoteHtml:
        "If you didn't request this change, reset your password immediately. Someone else may have access to your account.",
    }),
  },
  invite: {
    subject: 'You have been invited to AI Canvas',
    html: emailShell({
      title: 'You have been invited to AI Canvas',
      heading: 'You have been invited',
      bodyHtml: body(
        'Someone invited you to create an account on AI Canvas. Accept the invitation to set up your account and start dropping components straight into your projects.',
      ),
      button: { label: 'Accept the invitation', url: URL_VAR },
      footerNoteHtml: "If you weren't expecting this invitation, you can safely ignore this email.",
    }),
  },
  reauthentication: {
    subject: 'Confirm it is you',
    html: emailShell({
      title: 'Confirm it is you',
      heading: 'Confirm it is you',
      bodyHtml: body(
        'Enter this code to confirm the change you just started. It expires shortly, and you can ignore this email if it was not you.',
      ),
      code: '{{ .Token }}',
      footerNoteHtml:
        "If you didn't request this, you can safely ignore this email and your account stays unchanged.",
    }),
  },

  // Security notifications. Supabase sends these AFTER the fact, so they carry
  // no token and their buttons point at ordinary pages rather than a
  // {{ .ConfirmationURL }}. Only the two enabled in the project are defined
  // here; the other five notification templates stay off.
  password_changed_notification: {
    subject: 'Your password was changed',
    html: emailShell({
      title: 'Your password was changed',
      heading: 'Your password was changed',
      bodyHtml: body(
        "The password on your AI Canvas account ({{ .Email }}) was just changed. If this was you, you're all set. If not, reset it now and secure your account.",
      ),
      button: { label: 'Reset your password', url: 'https://aicanvas.me/account/forgot-password' },
    }),
  },
  email_changed_notification: {
    subject: 'Your account email was changed',
    html: emailShell({
      title: 'Your account email was changed',
      heading: 'Your account email was changed',
      bodyHtml: body(
        "The email on your AI Canvas account ({{ .OldEmail }}) was changed to {{ .Email }}. If you didn't do this, contact us right away.",
      ),
      button: { label: 'Contact us', url: 'https://aicanvas.me/contact' },
    }),
  },
}

/** Every variable Supabase substitutes into a template. Losing one silently
 *  breaks that email, so each is asserted before anything is written. */
const REQUIRED_VARS = {
  confirmation: [URL_VAR],
  magic_link: [URL_VAR],
  recovery: [URL_VAR],
  email_change: [URL_VAR, '{{ .Email }}', '{{ .NewEmail }}'],
  invite: [URL_VAR],
  reauthentication: ['{{ .Token }}'],
  password_changed_notification: ['{{ .Email }}'],
  email_changed_notification: ['{{ .OldEmail }}', '{{ .Email }}'],
}

export function renderAuthEmails(outDir) {
  // Assert every template FIRST, so a failure on the last one cannot leave a
  // half-written directory that looks complete enough to push.
  for (const [key, { html }] of Object.entries(AUTH_EMAILS)) {
    for (const need of REQUIRED_VARS[key]) {
      if (!html.includes(need)) throw new Error(`${key}: lost ${need}`)
    }
  }
  mkdirSync(outDir, { recursive: true })
  for (const [key, { subject, html }] of Object.entries(AUTH_EMAILS)) {
    writeFileSync(join(outDir, `${key}.html`), html)
    writeFileSync(join(outDir, `${key}.subject.txt`), subject)
    console.log(`${key.padEnd(18)} ${html.length} chars, keeps ${REQUIRED_VARS[key].join(' ')}`)
  }
  console.log(`\nwrote ${Object.keys(AUTH_EMAILS).length} templates to ${outDir}`)
}

// CLI half: only when run directly, so importing AUTH_EMAILS cannot exit the process.
// argv[1] is absent under `node -e`, where nothing is being run directly.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const outDir = process.argv[2]
  if (!outDir) {
    console.error('usage: node scripts/render-auth-emails.mjs <out-dir>')
    process.exit(1)
  }
  renderAuthEmails(outDir)
}
