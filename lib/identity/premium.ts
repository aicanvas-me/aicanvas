import type { SupabaseClient } from '@supabase/supabase-js'
import { isPremiumNow, type SubStatus } from './tier'

export interface PremiumState {
  premium: boolean
  /** A live Lifetime row exists (a purchase or a gift not revoked). */
  lifetime: boolean
}

/** Pure: a Lifetime row is live once granted and never revoked. A row with no
 *  granted_at is a tombstone (a refund arrived before the purchase). */
export function isLifetimeLive(row: { granted_at: string | null; revoked_at: string | null }): boolean {
  return row.granted_at != null && row.revoked_at == null
}

/**
 * THE premium check: a premium subscription OR a live Lifetime row. Every
 * premium decision goes through here so a Lifetime holder can never be read as
 * free by one path and premium by another (a guard test fails on any other
 * user_subscriptions read outside the billing writers).
 *
 * Works with the admin client or a session client (RLS lets the owner read both
 * tables). Either read failing THROWS, never coerced to free: a failed read must
 * not downgrade a paying customer, and callers already turn the throw into a
 * retryable 503 or a fail-closed paywall.
 */
export async function getPremiumForUser(client: Pick<SupabaseClient, 'from'>, userId: string): Promise<PremiumState> {
  const [sub, life] = await Promise.all([
    client.from('user_subscriptions').select('status, current_period_end').eq('user_id', userId).maybeSingle(),
    client.from('user_lifetime_access').select('granted_at, revoked_at').eq('user_id', userId),
  ])
  if (sub.error) throw sub.error
  if (life.error) throw life.error
  const lifetime = ((life.data ?? []) as { granted_at: string | null; revoked_at: string | null }[]).some(isLifetimeLive)
  const subPremium = sub.data
    ? isPremiumNow(sub.data.status as SubStatus, sub.data.current_period_end ?? null)
    : false
  return { premium: subPremium || lifetime, lifetime }
}
