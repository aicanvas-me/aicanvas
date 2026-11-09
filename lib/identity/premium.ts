import type { SupabaseClient } from '@supabase/supabase-js'
import { isPremiumNow, type SubStatus } from './tier'

export interface PremiumState {
  premium: boolean
  /** A live Lifetime row exists (a purchase or a gift not revoked). null = the
   *  Lifetime read failed and the subscription alone proved premium. */
  lifetime: boolean | null
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
 * tables). A read that proves premium wins even when the other read failed, so
 * one table being down never locks out a customer the other one proves paid. A
 * free answer needs both reads: if either failed it THROWS, never coerced to free.
 */
export async function getPremiumForUser(client: Pick<SupabaseClient, 'from'>, userId: string): Promise<PremiumState> {
  const [sub, life] = await Promise.all([
    client.from('user_subscriptions').select('status, current_period_end').eq('user_id', userId).maybeSingle(),
    client.from('user_lifetime_access').select('granted_at, revoked_at').eq('user_id', userId),
  ])
  const lifetime = life.error
    ? null
    : ((life.data ?? []) as { granted_at: string | null; revoked_at: string | null }[]).some(isLifetimeLive)
  const subPremium = !sub.error && sub.data
    ? isPremiumNow(sub.data.status as SubStatus, sub.data.current_period_end ?? null)
    : false
  if (subPremium || lifetime) return { premium: true, lifetime }
  if (sub.error) throw sub.error
  if (life.error) throw life.error
  return { premium: false, lifetime: false }
}
