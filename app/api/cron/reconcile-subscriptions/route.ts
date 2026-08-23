import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { paddleApiBase } from '@/app/lib/paddle/server'
import { mapSubscriptionFields } from '@/lib/identity/sub-mapping'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Daily reconcile — the "open the bank statement once a day" safety net.
 *
 * Webhooks are the primary, real-time path; Paddle retries failed ones for ~3
 * days. But if delivery is exhausted (a multi-day endpoint outage) a paying
 * customer's cached row can stay stale forever — there is no self-heal without
 * this. Once a day we re-pull each non-terminal subscription's LIVE state from
 * Paddle (the source of truth) and repair our cache to match, so a missed
 * webhook can't permanently strand anyone.
 *
 * Secured by CRON_SECRET: Vercel Cron sends it as `Authorization: Bearer <secret>`.
 * Never throws on a Paddle hiccup — it just logs and retries tomorrow.
 */
const MAX_ROWS = 500 // far above current volume; logged (never silently truncated) if exceeded

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'cron not configured' }, { status: 503 })
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const apiKey = process.env.PADDLE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'paddle not configured' }, { status: 503 })

  const admin = createAdminClient()

  // Only non-terminal rows can drift in a way that wrongs a customer (an
  // active/trialing/past_due/paused sub whose renewal or cancel webhook was
  // missed). Terminal 'canceled'/'none' rows need no live check. Must have a
  // subscription id to query Paddle by.
  const { data: rows, error } = await admin
    .from('user_subscriptions')
    .select('user_id, paddle_subscription_id, last_event_at, status')
    .in('status', ['active', 'trialing', 'past_due', 'paused'])
    .not('paddle_subscription_id', 'is', null)
    .limit(MAX_ROWS + 1)
  if (error) {
    console.error('[reconcile] list failed:', error)
    return NextResponse.json({ error: 'list failed' }, { status: 500 })
  }
  const list = rows ?? []
  if (list.length > MAX_ROWS) {
    console.error(`[reconcile] >${MAX_ROWS} active rows — reconciling first ${MAX_ROWS} only; raise MAX_ROWS / add paging`)
  }
  const batch = list.slice(0, MAX_ROWS)

  let checked = 0, repaired = 0, fresh = 0, skipped = 0, failed = 0
  for (const row of batch) {
    checked++
    try {
      const res = await fetch(`${paddleApiBase()}/subscriptions/${row.paddle_subscription_id}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10_000), // a hang counts as failed, retried tomorrow
      })
      if (res.status === 429 || res.status >= 500) { failed++; continue } // transient — retry tomorrow
      if (!res.ok) { skipped++; continue }                                 // 404 etc — don't guess, leave as-is
      const sub = (await res.json().catch(() => null) as { data?: Record<string, unknown> } | null)?.data
      if (!sub) { failed++; continue }

      const fields = mapSubscriptionFields(sub)
      if (!fields.status) { skipped++; continue } // unmodeled status — ignore

      // Ordering: never let a read OLDER than the last applied event overwrite
      // newer state. Paddle's subscription.updated_at is the modified-instant.
      // CRITICAL — re-read last_event_at HERE, immediately before writing, NOT
      // against the pre-loop snapshot: a multi-second Paddle round-trip happened
      // since the snapshot, during which a webhook (e.g. a cancel) could have
      // landed. Deciding against the fresh value closes that TOCTOU window so our
      // older read can't clobber a newer webhook. Same discipline the webhook +
      // checkout/completed writers already use.
      const subUpdated = typeof sub.updated_at === 'string' ? sub.updated_at : undefined
      const { data: cur } = await admin
        .from('user_subscriptions')
        .select('last_event_at')
        .eq('user_id', row.user_id)
        .maybeSingle()
      if (subUpdated && cur?.last_event_at &&
          new Date(cur.last_event_at).getTime() >= new Date(subUpdated).getTime()) {
        fresh++; continue // a newer event landed during the Paddle fetch — don't overwrite it
      }

      const patch: Record<string, unknown> = {
        user_id: row.user_id,
        updated_at: new Date().toISOString(),
        ...(subUpdated ? { last_event_at: subUpdated } : {}),
        ...fields,
      }
      const { error: upErr } = await admin
        .from('user_subscriptions')
        .upsert(patch, { onConflict: 'user_id' })
      if (upErr) { console.error('[reconcile] upsert failed', row.user_id, upErr); failed++; continue }
      repaired++
    } catch (e) {
      console.error('[reconcile] error for', row.user_id, e)
      failed++
    }
  }

  console.log(`[reconcile] checked=${checked} repaired=${repaired} fresh=${fresh} skipped=${skipped} failed=${failed}`)
  return NextResponse.json({ ok: true, checked, repaired, fresh, skipped, failed })
}
