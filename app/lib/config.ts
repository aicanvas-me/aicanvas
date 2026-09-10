export const GITHUB_URL = 'https://github.com/aicanvas-me/aicanvas'
export const X_URL = 'https://x.com/uiNerd'
export const SITE_URL = 'https://aicanvas.me'
// Shown on the legal pages; forwards to CONTACT_INBOX via Porkbun forwarding.
export const CONTACT_EMAIL = 'contact@aicanvas.me'

// Where contact-form submissions land: the form sends here directly, no hop.
export const CONTACT_INBOX = 'aicanvas.me@gmail.com'

// Sender for the website contact form. The aicanvas.me domain is verified in
// Resend, so any @aicanvas.me address is a valid sender.
export const CONTACT_FROM = 'AI Canvas <contact@aicanvas.me>'

// Sender for lifecycle emails; matches the from-address Supabase auth emails use.
export const NOREPLY_FROM = 'AI Canvas <noreply@aicanvas.me>'
