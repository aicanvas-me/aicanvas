// Open-redirect guard for any `?next=` parameter we honour after auth flows.
// `?next=https://evil.com` on the OAuth or email-confirmation callback would
// otherwise redirect a freshly-authenticated user off-site, a phishing vector.
// A valid target is a non-blank same-origin path: one leading `/`, never `//`
// (protocol-relative) and never `/\` (some browsers normalize that back to one).
// Anything else falls back to the supplied default.

export function safeNext(input: string | null | undefined, fallback = '/account'): string {
  if (!input || typeof input !== 'string') return fallback
  if (!input.startsWith('/')) return fallback
  if (input.startsWith('//') || input.startsWith('/\\')) return fallback
  return input
}
