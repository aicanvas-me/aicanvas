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
 * Map a Paddle subscription object (a `subscription.*` webhook or a
 * `GET /subscriptions` reconcile read) to our `user_subscriptions` row fields.
 * The webhook handler and the daily reconcile job share it, so their status
 * mappings can never drift apart. Only fields the payload actually carries are
 * returned, so a partial event can never null out ids or period end when spread
 * onto a conditional upsert. `status` is undefined when Paddle's status isn't
 * one we model: treat that as "ignore".
 */
// `any`: a raw Paddle JSON payload, whose fields differ between the webhook
// and the reconcile read.
/* eslint-disable @typescript-eslint/no-explicit-any */
export function mapSubscriptionFields(data: any): SubscriptionRowFields {
  const out: SubscriptionRowFields = {}

  const status = PADDLE_STATUS[data?.status as string]
  if (status) out.status = status
  if (data?.customer_id) out.paddle_customer_id = data.customer_id
  if (data?.id) out.paddle_subscription_id = data.id

  // Prefer current_billing_period.ends_at, then top-level next_billed_at, then the
  // item-level one. A `subscription.created` event carries next_billed_at but no
  // current_billing_period, and a row with a null period grants premium with no
  // expiry backstop if a later cancel webhook is dropped. Both next_billed_at
  // locations are read because Paddle populates them independently. The
  // `&& periodEnd` guard rejects an empty string.
  const periodEnd: unknown =
    data?.current_billing_period?.ends_at ?? data?.next_billed_at ?? data?.items?.[0]?.next_billed_at
  if (typeof periodEnd === 'string' && periodEnd) out.current_period_end = periodEnd

  const interval = data?.items?.[0]?.price?.billing_cycle?.interval
  if (interval) out.plan = interval === 'year' ? 'annual' : 'monthly'

  return out
}
