import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '../../../lib/supabase/server'
import { createAdminClient } from '../../../lib/supabase/admin'
import { safeNext } from '../../../lib/safe-next'
import { welcomeEmail } from '../../../lib/email/messages'
import { NOREPLY_FROM } from '../../../lib/config'

// OAuth + email-confirmation callback. Exchanges the recovery / OAuth code
// for a session, then redirects to `next` (guarded against open-redirect
// abuse by `safeNext`). Any failure path surfaces a code via `?error=…` on
// the sign-in page so the form can show what went wrong instead of leaving
// the user staring at an unchanged screen.
//
// Recovery flow marker: when the requested `next` is the reset-password
// page, we set a short-lived HTTP-only cookie so the reset page knows the
// session came from a recovery email — without needing to inspect the JWT
// (Supabase doesn't reliably stamp `amr: recovery` in every project setup).
// The cookie is scoped to `/account/reset-password` and expires in 10
// minutes so a stale signed-in user who navigates directly to the reset URL
// is correctly denied (the original P0 we shipped).

const RECOVERY_COOKIE = 'ac_recovery_session'
const RECOVERY_COOKIE_MAX_AGE = 600 // 10 minutes

// Welcome email guard. Accounts created BEFORE this timestamp never receive a
// welcome — this is what keeps every existing user out of it. Set it to the
// deploy moment. The callback fires on every login (OAuth, magic link, saved
// confirmation links, password recovery), so the date gate plus the one-time
// `welcome_sent` metadata flag together ensure: existing users → never; a new
// post-launch account → exactly once.
const WELCOME_LAUNCH_ISO = '2026-06-25T00:00:00Z'

async function maybeSendWelcome(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.email || typeof user.created_at !== 'string') return
    const createdMs = Date.parse(user.created_at)
    // Unparseable date → err on the side of NOT sending (never risk emailing an
    // existing user whose timestamp we can't read).
    if (Number.isNaN(createdMs) || createdMs < Date.parse(WELCOME_LAUNCH_ISO)) return // existing user
    if (user.user_metadata?.welcome_sent) return // already welcomed

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) return

    // Claim the send FIRST: set the once-only flag, THEN send. A second concurrent
    // callback then sees the flag and skips, and a send failure can never produce a
    // duplicate on the next login. The signup-confirm code is single-use, so only
    // one callback ever gets here per confirmation anyway; this covers the residual
    // (e.g. a post-launch user re-logging in before an earlier failed send marked).
    // Trade-off: if the send below fails, the user simply misses the welcome —
    // strictly preferable to ever double-sending. Done via the admin client so we
    // don't mutate the session cookies mid-callback.
    const admin = createAdminClient()
    const { error: markErr } = await admin.auth.admin.updateUserById(user.id, {
      user_metadata: { ...(user.user_metadata ?? {}), welcome_sent: true },
    })
    if (markErr) return // couldn't claim the flag → don't send; a later login retries

    const mail = welcomeEmail()
    // This send sits on the sign-in redirect, so it gets a short cap: a slow
    // Resend costs at most three seconds of sign-in, never the sign-in itself.
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(3_000),
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: NOREPLY_FROM, to: [user.email], subject: mail.subject, html: mail.html }),
    })
  } catch (e) {
    console.error('[callback] welcome email failed (non-fatal):', e)
  }
}

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
  if (next.startsWith('/account/reset-password')) {
    response.cookies.set(RECOVERY_COOKIE, '1', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: RECOVERY_COOKIE_MAX_AGE,
      path: '/account/reset-password',
    })
  }

  return response
}
