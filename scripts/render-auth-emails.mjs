/**
 * Renders the six Supabase Auth email templates from the SAME shell the app's
 * own emails use, so the two can never drift apart again. The templates live in
 * the Supabase dashboard, not in this repo, so this script only WRITES HTML to
 * a directory; pushing it to Supabase is the guarded devtools script's job
 * (~/.aicanvas-devtools/supabase/auth-templates.mjs push <dir>).
 *
 *   node scripts/render-auth-emails.mjs <out-dir>
 *
 * Each file is named after its Supabase template key, and every template keeps
 * the variable Supabase substitutes into it ({{ .ConfirmationURL }}, or
 * {{ .Token }} for reauthentication). Losing that variable would break sign-in,
 * so the push script asserts it again before sending anything.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
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
}

const REQUIRED_VAR = { reauthentication: '{{ .Token }}' }

const outDir = process.argv[2]
if (!outDir) {
  console.error('usage: node scripts/render-auth-emails.mjs <out-dir>')
  process.exit(1)
}
mkdirSync(outDir, { recursive: true })

for (const [key, { subject, html }] of Object.entries(AUTH_EMAILS)) {
  const need = REQUIRED_VAR[key] ?? URL_VAR
  if (!html.includes(need)) throw new Error(`${key}: lost ${need}`)
  writeFileSync(join(outDir, `${key}.html`), html)
  writeFileSync(join(outDir, `${key}.subject.txt`), subject)
  console.log(`${key.padEnd(18)} ${html.length} chars, keeps ${need}`)
}
console.log(`\nwrote ${Object.keys(AUTH_EMAILS).length} templates to ${outDir}`)
