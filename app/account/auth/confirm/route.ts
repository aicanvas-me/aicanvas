import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { createVerifyClient } from '../../../lib/supabase/verify'
import { safeNext } from '../../../lib/safe-next'
import { maybeSendWelcome, setRecoveryMarker } from '../../../lib/auth/post-sign-in'
import { destinationFor, isEmailLinkType, kindFor, nextFromRedirectTo } from '../../../lib/auth/email-link'

// ─── /account/auth/confirm ───────────────────────────────────────────────────
// Where every sign-in, password-reset and sign-up email link lands.
//
// GET  never touches the token. It reads the link, works out where the user
//      is heading, and hands over to /account/auth/continue, a page with one
//      Continue button. Mail scanners (Outlook Safe Links and the like) open
//      links with GET, so they can no longer use up a one-time link before the
//      user clicks it, and a link someone else mailed you cannot sign you into
//      their account without you pressing Continue.
// POST is the Continue button. Same-origin only. It verifies the token on our
//      server (verifyOtp with the token hash), which needs nothing stored in
//      the browser, so the link works in any browser or device.

function redirectTo(origin: string, path: string) {
  // 303: the browser follows with GET, never re-POSTs the form.
  return NextResponse.redirect(new URL(path, origin), 303)
}

export async function GET(request: NextRequest) {
  const { origin } = request.nextUrl
  // Parse the URL exactly as it arrived: nextFromRedirectTo reads the raw tail.
  const url = new URL(request.url)
  const tokenHash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type')
  if (!tokenHash || !isEmailLinkType(type)) {
    return redirectTo(origin, '/account/sign-in?error=link_invalid')
  }

  const params = new URLSearchParams({
    token_hash: tokenHash,
    type,
    kind: kindFor(type, url.searchParams.get('kind')),
    next: nextFromRedirectTo(url.search, origin),
  })
  return redirectTo(origin, `/account/auth/continue?${params}`)
}

// Login-CSRF guard: only the Continue form on our own page may verify. Browsers
// send Origin on every POST; Sec-Fetch-Site covers the rare one that omits it.
function isSameOrigin(request: NextRequest): boolean {
  const sent = request.headers.get('origin')
  if (sent) return sent === request.nextUrl.origin
  return request.headers.get('sec-fetch-site') === 'same-origin'
}

export async function POST(request: NextRequest) {
  const { origin } = request.nextUrl
  if (!isSameOrigin(request)) {
    return redirectTo(origin, '/account/sign-in?error=link_invalid')
  }

  const form = await request.formData()
  const tokenHash = form.get('token_hash')
  const type = form.get('type')
  const next = safeNext(typeof form.get('next') === 'string' ? (form.get('next') as string) : null)
  if (typeof tokenHash !== 'string' || !tokenHash || !isEmailLinkType(type)) {
    return redirectTo(origin, '/account/sign-in?error=link_invalid')
  }
  const destination = destinationFor(type, next)

  const supabase = await createVerifyClient(request.headers)
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })

  if (error) {
    // A link that already worked (a second click, a back button) fails here
    // because tokens are single-use. If this browser already holds a session,
    // the user is where they meant to be: send them on. The reset page checks
    // its own marker, so a recovery second click cannot skip that gate.
    const {
      data: { user },
    } = await (await createClient()).auth.getUser()
    if (user) return redirectTo(origin, destination)

    if (type === 'recovery') {
      return redirectTo(origin, '/account/forgot-password?error=link_expired')
    }
    return redirectTo(origin, `/account/sign-in?error=link_expired&next=${encodeURIComponent(next)}`)
  }

  // Fire-once welcome for genuinely new (post-launch) accounts. Self-guarded and
  // never throws, so it can't break sign-in.
  await maybeSendWelcome(supabase)

  const response = redirectTo(origin, destination)
  // The marker follows the verified TYPE, never the destination: only a
  // recovery token can open the reset form without the current password.
  if (type === 'recovery') setRecoveryMarker(response)
  return response
}
