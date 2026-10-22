// ─── renewal-thanks-cadence ───────────────────────────────────────────────────
// Which renewals get the thank-you email. Annual plans: every renewal. Monthly
// plans: the next renewal of anyone never thanked, then once a year (12 months
// after the last thank-you), because the same note twelve times a year reads as
// a template.
//
// The anchor is the last thank-you itself (`renewal_thanks_sent_for`, the start
// of the billing period it was sent in), not the subscription's start date, so
// subscribers whose first renewal came before the email existed still get one.
// Months are counted in UTC calendar months from that period start to the start
// of the period now ending, so day-of-month drift (Jan 31 -> Feb 28) still
// counts as one. A stored value that is not a date is a skip: a missed
// thank-you costs nothing.

export function isThankYouRenewal(opts: {
  plan: 'monthly' | 'annual'
  lastThankedFor: unknown
  periodStart: string
}): boolean {
  if (opts.plan === 'annual') return true
  const period = new Date(opts.periodStart)
  if (Number.isNaN(period.getTime())) return false
  if (opts.lastThankedFor === undefined || opts.lastThankedFor === null) return true
  if (typeof opts.lastThankedFor !== 'string') return false
  const last = new Date(opts.lastThankedFor)
  if (Number.isNaN(last.getTime())) return false
  const months =
    (period.getUTCFullYear() - last.getUTCFullYear()) * 12 + (period.getUTCMonth() - last.getUTCMonth())
  return months >= 12
}
