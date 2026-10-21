import { describe, it, expect } from 'vitest'
import { isThankYouRenewal } from './renewal-thanks-cadence'

const START = '2026-09-16T09:00:00Z'
const monthly = (nextBilledAt: string, startedAt: unknown = START) =>
  isThankYouRenewal({ plan: 'monthly', startedAt, nextBilledAt })

describe('isThankYouRenewal', () => {
  it('thanks a monthly plan before its first renewal', () => {
    expect(monthly('2026-10-16T09:00:00Z')).toBe(true)
  })

  it('skips monthly renewals 2 to 11', () => {
    for (let m = 2; m <= 11; m++) {
      const next = new Date(Date.UTC(2026, 8 + m, 16, 9)).toISOString()
      expect(monthly(next), `month ${m}`).toBe(false)
    }
  })

  it('thanks a monthly plan again at 12 and 24 months', () => {
    expect(monthly('2027-09-16T09:00:00Z')).toBe(true)
    expect(monthly('2028-09-16T09:00:00Z')).toBe(true)
  })

  it('skips month 13', () => {
    expect(monthly('2027-10-16T09:00:00Z')).toBe(false)
  })

  it('counts a short month as one month (Jan 31 to Feb 28)', () => {
    expect(monthly('2027-02-28T09:00:00Z', '2027-01-31T09:00:00Z')).toBe(true)
  })

  it('thanks every annual renewal, start date or not', () => {
    expect(isThankYouRenewal({ plan: 'annual', startedAt: START, nextBilledAt: '2027-09-16T09:00:00Z' })).toBe(true)
    expect(isThankYouRenewal({ plan: 'annual', startedAt: null, nextBilledAt: '2028-09-16T09:00:00Z' })).toBe(true)
  })

  it('skips a monthly plan with no usable start date', () => {
    expect(isThankYouRenewal({ plan: 'monthly', startedAt: undefined, nextBilledAt: '2026-10-16T09:00:00Z' })).toBe(false)
    expect(monthly('2026-10-16T09:00:00Z', null)).toBe(false)
    expect(monthly('2026-10-16T09:00:00Z', 'not a date')).toBe(false)
  })

  it('skips when next_billed_at is not a date', () => {
    expect(monthly('')).toBe(false)
  })
})
