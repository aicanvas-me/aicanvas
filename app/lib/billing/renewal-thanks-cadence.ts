// ─── renewal-thanks-cadence ───────────────────────────────────────────────────
// Which renewals get the thank-you email. Annual plans: every renewal. Monthly
// plans: the first renewal, then once a year (12, 24, ... months in), because
// the same note twelve times a year reads as a template.
//
// Months are counted in UTC calendar months from Paddle's `started_at` to the
// upcoming `next_billed_at`, so day-of-month drift (Jan 31 -> Feb 28) still
// counts as one. No usable start date is a skip: a missed thank-you costs
// nothing.

export function isThankYouRenewal(opts: {
  plan: 'monthly' | 'annual'
  startedAt: unknown
  nextBilledAt: string
}): boolean {
  if (opts.plan === 'annual') return true
  if (typeof opts.startedAt !== 'string') return false
  const start = new Date(opts.startedAt)
  const next = new Date(opts.nextBilledAt)
  if (Number.isNaN(start.getTime()) || Number.isNaN(next.getTime())) return false
  const months =
    (next.getUTCFullYear() - start.getUTCFullYear()) * 12 + (next.getUTCMonth() - start.getUTCMonth())
  return months === 1 || (months > 0 && months % 12 === 0)
}
