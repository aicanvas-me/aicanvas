import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { ipFromHeaders } from '@/app/lib/quota'
import { rateLimiter } from '@/app/lib/rate-limit'

export const runtime = 'nodejs'

// ─── /api/auth/login-hint ─────────────────────────────────────────────────────
// After a failed password sign-in, the form asks here whether the email is a
// Google-OAuth-only account. If so it shows "use Sign in with Google" instead of
// a dead-end "wrong password" message. The endpoint returns ONLY 'google' | null
// (provider info, no account details), via a service-role-only RPC.
//
// This intentionally reveals provider info, which is a mild account-enumeration
// signal, so it's throttled. Best-effort per-instance limit (mirrors /api/contact);
// add Cloudflare Turnstile here if/when we want a hard wall (verifyTurnstile already
// exists in the codebase). On throttle we just return null → the form falls back to
// the generic error, so an abuser learns nothing.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const rateLimited = rateLimiter(20)

export async function POST(req: NextRequest) {
  const ip = ipFromHeaders(req.headers) ?? 'unknown'
  if (rateLimited(ip)) return NextResponse.json({ provider: null })

  const body = await req.json().catch(() => null)
  const email = body && typeof body.email === 'string' ? body.email.trim() : ''
  if (!EMAIL_RE.test(email) || email.length > 200) return NextResponse.json({ provider: null })

  try {
    const admin = createAdminClient()
    const { data, error } = await admin.rpc('account_login_hint', { p_email: email })
    if (error) return NextResponse.json({ provider: null })
    return NextResponse.json({ provider: data === 'google' ? 'google' : null })
  } catch {
    return NextResponse.json({ provider: null })
  }
}
