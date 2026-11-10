import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { getPremiumForUser } from '@/lib/identity/premium'

export const runtime = 'nodejs'

/**
 * Returns the SIGNED-IN caller's real tier for client UI (pricing page,
 * badges). Session-only on purpose: this is a "who am I" endpoint, so it must
 * not honor ?token=/Bearer — that would turn any leaked token into an
 * unauthenticated premium-status oracle. Errors are 503 (distinct from
 * anonymous) so the UI can show an unknown state instead of mislabeling a
 * premium user as free. `lifetime` tells the UI to show "You have Lifetime"
 * instead of a buy button.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ tier: 'anonymous' })

    // RLS restricts both reads to the caller's own rows. An unproven free answer
    // throws into the 503 below, and so does an unknown Lifetime: a guess of "no"
    // would offer the buy button to someone who already owns it.
    const { premium, lifetime } = await getPremiumForUser(supabase, user.id)
    if (lifetime === null) throw new Error('Lifetime read failed')
    return NextResponse.json({ tier: premium ? 'premium' : 'free', lifetime })
  } catch {
    return NextResponse.json({ tier: null }, { status: 503 })
  }
}
