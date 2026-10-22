import { safeNext } from '../safe-next'

// Parsing for the links in our auth emails. The Supabase templates link to
// /account/auth/confirm?token_hash=…&type=…&redirect_to={{ .RedirectTo }}, so
// the token is verified on our server and the link works in any browser (a
// PKCE link only works in the browser that asked for it).

// The only link types the templates send, as Supabase documents them for
// token-hash links: `email` for the magic-link and sign-up templates (it
// verifies either, including the confirmation email an unconfirmed user gets
// when they ask for a magic link) and `recovery` for password reset. Anything
// else is refused, so a hand-edited link cannot reach a verify type we never send.
export const EMAIL_LINK_TYPES = ['email', 'recovery'] as const
export type EmailLinkType = (typeof EMAIL_LINK_TYPES)[number]

export function isEmailLinkType(value: unknown): value is EmailLinkType {
  return typeof value === 'string' && (EMAIL_LINK_TYPES as readonly string[]).includes(value)
}

// Which email the link came from, for the Continue page's wording only. The
// sign-up template adds `kind=signup`; it never changes how the link verifies.
export type EmailLinkKind = 'signin' | 'signup' | 'recovery'

export function kindFor(type: EmailLinkType, kind: string | null | undefined): EmailLinkKind {
  if (type === 'recovery') return 'recovery'
  return kind === 'signup' ? 'signup' : 'signin'
}

// Where the user goes after a successful verify. A recovery link always lands
// on the reset page, whatever its redirect said.
export function destinationFor(type: EmailLinkType, next: string): string {
  return type === 'recovery' ? '/account/reset-password' : next
}

const CALLBACK_PATH = '/account/auth/callback'

/**
 * Recovers the `next` path from a confirm link's query string.
 *
 * `{{ .RedirectTo }}` is the URL the app passed when it asked for the email,
 * always `<origin>/account/auth/callback?next=<encoded path>`. Supabase renders
 * templates with Go's html/template, which query-escapes it inside the href, but
 * a raw (unescaped) copy must parse the same way, so `redirect_to` is the LAST
 * parameter and is read as the raw tail of the query: decoded once only when
 * it is escaped, never twice. That keeps a `next` holding `&`, `+` or `%2F`
 * intact. Anything that is not our own callback URL on this origin (a missing
 * redirect, the Site URL fallback, another host) goes to /account.
 */
export function nextFromRedirectTo(search: string, origin: string): string {
  const match = /(?:^\?|&)redirect_to=/.exec(search)
  if (!match) return '/account'
  let raw = search.slice(match.index + match[0].length)
  if (/^https?%3a/i.test(raw)) {
    try {
      raw = decodeURIComponent(raw)
    } catch {
      return '/account'
    }
  }
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return '/account'
  }
  if (url.origin !== origin || url.pathname !== CALLBACK_PATH) return '/account'
  return safeNext(url.searchParams.get('next'))
}
