import 'server-only'
import type { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAdminClient } from '../supabase/admin'
import { welcomeEmail } from '../email/messages'
import { NOREPLY_FROM } from '../config'

// What happens right after an email link or OAuth code becomes a session.
// Shared by /account/auth/callback (OAuth + links sent before the switch to
// token links) and /account/auth/confirm (email links), so both behave the same.

// Recovery flow marker: when a session came from a password-recovery email we
// set a short-lived HTTP-only cookie so the reset page knows it, without
// needing to inspect the JWT (Supabase doesn't reliably stamp `amr: recovery`
// in every project setup). The cookie is scoped to `/account/reset-password`
// and expires in 10 minutes, so a stale signed-in user who navigates directly
// to the reset URL is correctly denied.
export const RECOVERY_COOKIE = 'ac_recovery_session'
const RECOVERY_COOKIE_MAX_AGE = 600 // 10 minutes

export function setRecoveryMarker(response: NextResponse): void {
  response.cookies.set(RECOVERY_COOKIE, '1', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: RECOVERY_COOKIE_MAX_AGE,
    path: '/account/reset-password',
  })
}

// Welcome email guard. Accounts created BEFORE this timestamp never receive a
// welcome — this is what keeps every existing user out of it. The callback and
// the confirm route fire on every login (OAuth, magic link, confirmation links,
// password recovery), so the date gate plus the one-time `welcome_sent`
// metadata flag together ensure: existing users → never; a new post-launch
// account → exactly once.
export const WELCOME_LAUNCH_ISO = '2026-06-25T00:00:00Z'

export async function maybeSendWelcome(supabase: Pick<SupabaseClient, 'auth'>): Promise<void> {
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
    console.error('[auth] welcome email failed (non-fatal):', e)
  }
}
