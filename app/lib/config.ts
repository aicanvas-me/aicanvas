export const GITHUB_URL = 'https://github.com/uiNerd16/aicanvas'
export const X_URL = 'https://x.com/uiNerd'
export const SITE_URL = 'https://aicanvas.me'
// Public-facing contact address shown on the legal pages (Impressum, Privacy,
// Terms). Mail sent to it forwards to CONTACT_INBOX via Porkbun email forwarding.
export const CONTACT_EMAIL = 'contact@aicanvas.me'

// Where contact-form submissions are actually delivered: the project Gmail. The
// form sends here directly (no forwarding hop) for reliability.
export const CONTACT_INBOX = 'aicanvas.me@gmail.com'

// Sender for the website contact form (app/api/contact). The aicanvas.me domain
// is verified in Resend, so any @aicanvas.me address is a valid sender. Messages
// are delivered to CONTACT_INBOX with reply_to set to the visitor, so replying
// in Gmail goes back to them. See app/api/contact/route.ts.
export const CONTACT_FROM = 'AI Canvas <contact@aicanvas.me>'

// Sender for system / lifecycle emails we send ourselves (welcome, etc.). Matches
// the from-address Supabase auth emails use, so they read as one product voice.
export const NOREPLY_FROM = 'AI Canvas <noreply@aicanvas.me>'
