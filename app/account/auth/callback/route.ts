import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { safeNext } from '../../../lib/safe-next'
import { maybeSendWelcome, setRecoveryMarker } from '../../../lib/auth/post-sign-in'

// OAuth callback, and the landing page for email links sent before the email
// templates switched to /account/auth/confirm. Exchanges the PKCE code for a
// session, then redirects to `next` (guarded against open-redirect abuse by
// `safeNext`). Any failure path surfaces a code via `?error=…` on the sign-in
// page so the form can show what went wrong instead of leaving the user
// staring at an unchanged screen.
//
// A PKCE code only works in the browser that asked for it. That is fine for
// OAuth (same tab), and is exactly why email links no longer come here.
//
// Recovery flow marker: when the requested `next` is the reset-password page,
// this was a recovery link (see post-sign-in.ts for the marker itself).

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = safeNext(searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(`${origin}/account/sign-in?error=missing_code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    const reason = encodeURIComponent(error.message ?? 'callback_failed')
    return NextResponse.redirect(`${origin}/account/sign-in?error=callback_failed&reason=${reason}`)
  }

  // Fire-once welcome for genuinely new (post-launch) accounts. Self-guarded and
  // never throws, so it can't break sign-in.
  await maybeSendWelcome(supabase)

  const response = NextResponse.redirect(`${origin}${next}`)

  // If the caller is heading to /account/reset-password, this was a recovery
  // flow — drop a one-shot marker the reset page can trust. The cookie path
  // pins it to the reset page so it never bleeds elsewhere.
  if (next.startsWith('/account/reset-password')) setRecoveryMarker(response)

  return response
}
