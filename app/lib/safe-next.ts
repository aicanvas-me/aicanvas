// Open-redirect guard for any `?next=` parameter we honour after auth flows.
// `?next=https://evil.com` on the OAuth or email-confirmation callback would
// otherwise redirect a freshly-authenticated user off-site, a phishing vector.
// A valid target is a non-blank same-origin path: one leading `/`, never `//`
// (protocol-relative) and never `/\` (some browsers normalize that back to one).
// Control characters, spaces and backslashes are refused anywhere: the URL
// parser deletes tab, CR and LF, so `/<tab>/evil.com` would turn into
// `//evil.com` after this check. Whatever passes must still resolve on our own
// origin, and the RESOLVED path is what we return: `/..//evil.com` resolves to
// `//evil.com`, which a client-side navigation fallback could follow off-site.
// Anything else falls back to the supplied default.

const PROBE_ORIGIN = 'http://next.invalid'

export function safeNext(input: string | null | undefined, fallback = '/account'): string {
  if (!input || typeof input !== 'string') return fallback
  if (!input.startsWith('/')) return fallback
  if (input.startsWith('//') || input.startsWith('/\\')) return fallback
  for (let i = 0; i < input.length; i++) {
    const code = input.charCodeAt(i)
    // 0x00-0x20 = control characters and space, 0x7f = DEL, 0x5c = backslash
    if (code <= 0x20 || code === 0x7f || code === 0x5c) return fallback
  }
  let url: URL
  try {
    url = new URL(input, PROBE_ORIGIN)
  } catch {
    return fallback
  }
  if (url.origin !== PROBE_ORIGIN || url.pathname.startsWith('//')) return fallback
  return url.pathname + url.search + url.hash
}
