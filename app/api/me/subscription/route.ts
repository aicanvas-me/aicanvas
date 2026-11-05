import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { paddleApiBase } from '@/app/lib/paddle/server'
import { mapSubscriptionFields } from '@/lib/identity/sub-mapping'
import { isPremiumNow, type SubStatus } from '@/lib/identity/tier'
import { LIVE_SUB_STATUSES } from '@/lib/identity/lifetime'

export const runtime = 'nodejs'

/**
 * Display details for the signed-in user's subscription, read LIVE from
 * Paddle so there is no stored copy to go stale (renew date and a scheduled
 * cancel are always current). Session-only like /api/me/entitlement — no
 * token/Bearer. Read-only: this route never writes to Supabase or Paddle.
 *
 * Returns DISPLAY FIELDS ONLY — never Paddle ids. Every read failure returns
 * { subscription: null, unavailable: true } so the account page degrades to the
 * plain status line instead of showing a guess, and can tell "none" from
 * "unknown". A live row we do not read details for (paused, or a period end
 * already passed) is "unknown" too: the portal can still manage it.
 */
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ subscription: null }, { status: 401 })

    // RLS owner-read. Only currently-premium users trigger a Paddle read.
    const { data: row, error } = await supabase
      .from('user_subscriptions')
      .select('paddle_subscription_id, status, current_period_end')
      .eq('user_id', user.id)
      .maybeSingle()
    if (error) return NextResponse.json({ subscription: null, unavailable: true })
    if (!row?.paddle_subscription_id) return NextResponse.json({ subscription: null })
    if (!isPremiumNow(row.status as SubStatus, row.current_period_end ?? null)) {
      return LIVE_SUB_STATUSES.includes(row.status as string)
        ? NextResponse.json({ subscription: null, unavailable: true })
        : NextResponse.json({ subscription: null })
    }

    const apiKey = process.env.PADDLE_API_KEY
    if (!apiKey) return NextResponse.json({ subscription: null, unavailable: true })

    const res = await fetch(`${paddleApiBase()}/subscriptions/${row.paddle_subscription_id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return NextResponse.json({ subscription: null, unavailable: true })
    const j = await res.json()
    const data = j?.data

    // Same mapper the webhook handler and reconcile cron use — plan/period
    // parsing cannot drift from the rest of the billing pipeline.
    const mapped = mapSubscriptionFields(data)
    const rawStart = data?.started_at ?? data?.first_billed_at
    const startedAt = typeof rawStart === 'string' && rawStart ? rawStart : null
    // A scheduled cancel OR pause means "renews <date>" would be false.
    const action = data?.scheduled_change?.action
    const scheduledChange = action === 'cancel' || action === 'pause' ? action : null

    return NextResponse.json({
      subscription: {
        plan: mapped.plan ?? null,
        periodEnd: mapped.current_period_end ?? null,
        scheduledChange,
        startedAt,
      },
    })
  } catch {
    return NextResponse.json({ subscription: null, unavailable: true })
  }
}
