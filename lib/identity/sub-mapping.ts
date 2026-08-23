import type { SubStatus } from './tier'

// Paddle `data.status` -> our SubStatus. Unknown statuses map to undefined so
// the caller can ignore the event (never guess a status from the event name).
const PADDLE_STATUS: Record<string, SubStatus> = {
  active: 'active',
  trialing: 'trialing',
  past_due: 'past_due',
  paused: 'paused',
  canceled: 'canceled',
}

export interface SubscriptionRowFields {
  status?: SubStatus
  paddle_customer_id?: string
  paddle_subscription_id?: string
  current_period_end?: string
  plan?: 'monthly' | 'annual'
}

/**
 * Map a Paddle SUBSCRIPTION object (from a `subscription.*` webhook OR a
 * `GET /subscriptions` reconcile read) to our `user_subscriptions` row fields.
 *
 * This is the SINGLE source of truth for the mapping: the webhook handler and
 * the daily reconcile job both call it, so the two copies can never drift into
 * two slightly-different status mappers (a classic billing bug). Only fields the
 * payload actually carries are returned, so a partial event can never null out
 * ids / period end when spread onto a conditional upsert.
 *
 * `status` is undefined when Paddle's status isn't one we model — callers should
 * treat that as "ignore".
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapSubscriptionFields(data: any): SubscriptionRowFields {
  const out: SubscriptionRowFields = {}

  const status = PADDLE_STATUS[data?.status as string]
  if (status) out.status = status
  if (data?.customer_id) out.paddle_customer_id = data.customer_id
  if (data?.id) out.paddle_subscription_id = data.id

  // Period end: prefer the authoritative current_billing_period.ends_at, then the
  // canonical top-level next_billed_at, then the item-level one. A `subscription
  // .created` event carries next_billed_at but NO current_billing_period — without
  // a fallback a created-only row would have a null period, and isPremiumNow(
  // 'active', null) grants premium with no expiry backstop (indefinite if a later
  // cancel webhook is dropped). We read BOTH next_billed_at locations because
  // Paddle populates them independently (top-level can be set when items[0] is
  // not). The `&& periodEnd` guard also rejects an empty string so a garbage
  // timestamp can never be persisted.
  const periodEnd: unknown =
    data?.current_billing_period?.ends_at ?? data?.next_billed_at ?? data?.items?.[0]?.next_billed_at
  if (typeof periodEnd === 'string' && periodEnd) out.current_period_end = periodEnd

  const interval = data?.items?.[0]?.price?.billing_cycle?.interval
  if (interval) out.plan = interval === 'year' ? 'annual' : 'monthly'

  return out
}
