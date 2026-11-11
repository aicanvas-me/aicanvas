import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { ipFromHeaders } from '@/app/lib/quota'
import { rateLimiter } from '@/app/lib/rate-limit'
import { checkoutSignInEnabled } from '@/lib/flags'
import { prepareCheckoutSignIn } from '@/lib/identity/checkout-signin'

export const runtime = 'nodejs'

// The browser that just paid signed out asks here, every few seconds for half
// a minute, until it is signed in or told to use the email link. Every check
// lives in prepareCheckoutSignIn; a session alone never grants anything, and
// this route never writes access.
const rateLimited = rateLimiter(30)
const TXN_ID = /^txn_[a-z0-9]{10,64}$/i

export async function POST(req: NextRequest) {
  if (!checkoutSignInEnabled()) return NextResponse.json({ status: 'refused' })
  const ip = ipFromHeaders(req.headers) ?? 'unknown'
  if (rateLimited(ip)) return NextResponse.json({ status: 'refused' }, { status: 429 })

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) return NextResponse.json({ status: 'refused' })

  const { transactionId } = await req.json().catch(() => ({}))
  if (typeof transactionId !== 'string' || !TXN_ID.test(transactionId)) {
    return NextResponse.json({ error: 'missing transactionId' }, { status: 400 })
  }

  const out = await prepareCheckoutSignIn(createAdminClient(), transactionId)
  if (out.status !== 'ready') return NextResponse.json({ status: out.status })

  // Sets the session cookies on this response.
  const { error } = await supabase.auth.signInWithPassword({ email: out.email, password: out.password })
  if (error) {
    console.error('[checkout sign-in] sign-in failed:', error.message)
    return NextResponse.json({ status: 'refused' })
  }
  return NextResponse.json({ status: 'signed-in' })
}
