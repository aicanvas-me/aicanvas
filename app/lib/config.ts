export const GITHUB_URL = 'https://github.com/aicanvas-me/aicanvas'
export const X_URL = 'https://x.com/uiNerd'
export const SITE_URL = 'https://aicanvas.me'
// The one-sentence answer to "what is AI Canvas?". The homepage FAQ, the /faq
// page and the Organization structured data all quote it, so answer engines
// read the same definition wherever they look.
export const AI_CANVAS_DEFINITION =
  'AI Canvas is a React component library and design system platform for AI coding agents: design systems with the rules your agent follows, plus standalone components, all installed as editable source with shadcn or MCP.'
// Shown on the legal pages; forwards to CONTACT_INBOX via Porkbun forwarding.
export const CONTACT_EMAIL = 'contact@aicanvas.me'

// Where contact-form submissions land: the form sends here directly, no hop.
export const CONTACT_INBOX = 'aicanvas.me@gmail.com'

// Sender for the website contact form. The aicanvas.me domain is verified in
// Resend, so any @aicanvas.me address is a valid sender.
export const CONTACT_FROM = 'AI Canvas <contact@aicanvas.me>'

// Sender for lifecycle emails; matches the from-address Supabase auth emails use.
export const NOREPLY_FROM = 'AI Canvas <noreply@aicanvas.me>'
