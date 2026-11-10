import type { Tier } from '../registry/entitlement'

export type SubStatus =
  | 'none' | 'active' | 'trialing' | 'past_due' | 'paused' | 'canceled'

const PREMIUM_STATUSES: ReadonlySet<SubStatus> = new Set(['active', 'trialing'])

/** Statuses where a Paddle subscription still exists and can bill or be managed. */
export const LIVE_SUB_STATUSES: string[] = ['active', 'trialing', 'past_due', 'paused']

/**
 * Pure: is this subscription state premium RIGHT NOW? Status alone is not
 * enough — if the final `canceled` webhook is ever dropped, a stale `active`
 * row would otherwise grant premium forever. A known period end in the past
 * revokes regardless of status (belt and suspenders; null period = trust the
 * status, the webhook fills it on the first real event).
 */
export function isPremiumNow(
  status: SubStatus,
  currentPeriodEnd: string | null,
  now: Date = new Date(),
): boolean {
  if (!PREMIUM_STATUSES.has(status)) return false
  if (currentPeriodEnd && new Date(currentPeriodEnd).getTime() < now.getTime()) return false
  return true
}

/** Pure: maps account + subscription state to a tier. */
export function deriveTier(input: {
  hasUser: boolean
  status: SubStatus
  currentPeriodEnd?: string | null
}): Tier {
  if (!input.hasUser) return 'anonymous'
  return isPremiumNow(input.status, input.currentPeriodEnd ?? null) ? 'premium' : 'free'
}
