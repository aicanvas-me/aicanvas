import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/app/lib/supabase/admin'
import { paddleApiBase } from '@/app/lib/paddle/server'
import { mapSubscriptionFields } from '@/lib/identity/sub-mapping'
import { renewalThanksEmail } from '@/app/lib/email/messages'
import { CONTACT_FROM } from '@/app/lib/config'

export const runtime = 'nodejs'
export const maxDuration = 60

/**
 * Daily thank-you to every subscriber whose plan renews the day after tomorrow
 * (UTC date), so it lands roughly two days (38 to 63 hours) before the charge.
 * The email names no date, only "the next few days", which stays true in every
 * timezone.
 *
 * The database only nominates candidates; Paddle decides. Each candidate's LIVE
 * subscription is read, and the email goes out only when it is active, has no
 * scheduled change (a pending cancel or pause lives only in Paddle, never in our
 * row) and its next charge falls on the target date. Anything unclear is a skip:
 * a missed thank-you costs nothing, a "renews soon" sent to someone who
 * cancelled does.
 *
 * This is not a transactional email (it thanks and asks for feedback), so it
 * only goes to someone whose Product updates toggle reads on: a
 * newsletter_subscribers row that is 'soft' or 'subscribed'. 'unsubscribed' is
 * the site-wide "never mail again" line (the toggle, Brevo unsubscribes,
 * bounces and complaints), and no row reads as off on the settings page, so
 * both skip. A failed lookup skips too.
 *
 * Sending is off unless RENEWAL_THANKS_SEND=1. Without it the job only logs who
 * would get the email, so the list can be checked before anyone is written to.
 *
 * Send-once per renewal: `renewal_thanks_sent_for` in user_metadata holds the
 * start of the billing period already thanked for (it stays put if the billing
 * date is moved, unlike next_billed_at), claimed BEFORE sending (same
 * discipline as premium_welcome_sent in the Paddle webhook), so a re-run never
 * doubles up.
 *
 * Secured by CRON_SECRET, like the reconcile cron. Never touches
 * user_subscriptions or entitlement: it reads, then emails.
 */
const MAX_ROWS = 500

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return NextResponse.json({ error: 'cron not configured' }, { status: 503 })
  if (req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const paddleKey = process.env.PADDLE_API_KEY
  const resendKey = process.env.RESEND_API_KEY
  if (!paddleKey || !resendKey) return NextResponse.json({ error: 'not configured' }, { status: 503 })
  const send = process.env.RENEWAL_THANKS_SEND === '1'

  const now = new Date()
  const target = new Date(now.getTime() + 2 * 86_400_000).toISOString().slice(0, 10)

  const admin = createAdminClient()

  // Pre-filter on our cached period end with a wide window; Paddle's
  // next_billed_at below is what actually decides.
  const { data: rows, error } = await admin
    .from('user_subscriptions')
    .select('user_id, paddle_subscription_id')
    .eq('status', 'active')
    .not('paddle_subscription_id', 'is', null)
    .gte('current_period_end', now.toISOString())
    .lte('current_period_end', new Date(now.getTime() + 4 * 86_400_000).toISOString())
    .limit(MAX_ROWS)
  if (error) {
    console.error('[renewal-thanks] list failed:', error)
    return NextResponse.json({ error: 'list failed' }, { status: 500 })
  }

  let candidates = 0, sent = 0, wouldSend = 0, skipped = 0, failed = 0
  for (const row of rows ?? []) {
    candidates++
    try {
      const res = await fetch(`${paddleApiBase()}/subscriptions/${row.paddle_subscription_id}`, {
        headers: { Authorization: `Bearer ${paddleKey}` },
        signal: AbortSignal.timeout(10_000),
      })
      if (!res.ok) { failed++; continue }
      const sub = (await res.json().catch(() => null) as { data?: Record<string, unknown> } | null)?.data
      if (!sub) { failed++; continue }

      const nextBilledAt = typeof sub.next_billed_at === 'string' ? sub.next_billed_at : ''
      if (sub.status !== 'active' || sub.scheduled_change || nextBilledAt.slice(0, 10) !== target) {
        skipped++; continue
      }

      const period = sub.current_billing_period as { starts_at?: unknown } | null | undefined
      const periodKey = typeof period?.starts_at === 'string' ? period.starts_at : nextBilledAt

      const { data: { user }, error: userErr } = await admin.auth.admin.getUserById(row.user_id)
      if (userErr) { console.error('[renewal-thanks] user read failed', row.user_id, userErr); failed++; continue }
      if (!user?.email || user.user_metadata?.renewal_thanks_sent_for === periodKey) {
        skipped++; continue
      }

      // Same rule as the Product updates toggle: no row reads as off. Checked by
      // account and by address, since a row can outlive an email change.
      const [byUser, byEmail] = await Promise.all([
        admin.from('newsletter_subscribers').select('status').eq('user_id', row.user_id),
        admin.from('newsletter_subscribers').select('status').eq('email', user.email.toLowerCase()),
      ])
      if (byUser.error || byEmail.error) {
        console.error('[renewal-thanks] opt-out read failed', row.user_id, byUser.error ?? byEmail.error)
        failed++; continue
      }
      const statuses = [...(byUser.data ?? []), ...(byEmail.data ?? [])].map(r => r.status)
      if (!statuses.length || statuses.includes('unsubscribed')) { skipped++; continue }

      if (!send) {
        console.log('[renewal-thanks] would send', row.user_id, nextBilledAt)
        wouldSend++; continue
      }

      // Claim first, send only if the claim persisted.
      const { error: flagErr } = await admin.auth.admin.updateUserById(row.user_id, {
        user_metadata: { ...(user.user_metadata ?? {}), renewal_thanks_sent_for: periodKey },
      })
      if (flagErr) { console.error('[renewal-thanks] flag write failed', row.user_id, flagErr); failed++; continue }

      const mail = renewalThanksEmail({ plan: mapSubscriptionFields(sub).plan ?? 'monthly' })
      const sendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        signal: AbortSignal.timeout(10_000),
        headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: CONTACT_FROM, to: [user.email], subject: mail.subject, html: mail.html }),
      })
      if (!sendRes.ok) {
        console.error('[renewal-thanks] send failed', row.user_id, 'status', sendRes.status)
        failed++; continue
      }
      sent++
    } catch (e) {
      console.error('[renewal-thanks] error for', row.user_id, e)
      failed++
    }
  }

  console.log(`[renewal-thanks] target=${target} send=${send} candidates=${candidates} sent=${sent} wouldSend=${wouldSend} skipped=${skipped} failed=${failed}`)
  return NextResponse.json({ ok: true, target, send, candidates, sent, wouldSend, skipped, failed })
}
