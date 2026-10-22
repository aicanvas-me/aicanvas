import { describe, it, expect } from 'vitest'
import { isThankYouRenewal } from './renewal-thanks-cadence'

const THANKED = '2026-09-16T09:00:00Z'
const monthly = (periodStart: string, lastThankedFor: unknown = THANKED) =>
  isThankYouRenewal({ plan: 'monthly', lastThankedFor, periodStart })

describe('isThankYouRenewal', () => {
  it('thanks a monthly plan never thanked before, whatever renewal it is', () => {
    expect(isThankYouRenewal({ plan: 'monthly', lastThankedFor: undefined, periodStart: '2026-09-16T09:00:00Z' })).toBe(true)
    expect(monthly('2026-09-24T20:54:03Z', null)).toBe(true)
  })

  it('skips the monthly renewals 1 to 11 periods after a thank-you', () => {
    for (let m = 1; m <= 11; m++) {
      const period = new Date(Date.UTC(2026, 8 + m, 16, 9)).toISOString()
      expect(monthly(period), `month ${m}`).toBe(false)
    }
  })

  it('thanks a monthly plan again 12 months after the last thank-you', () => {
    expect(monthly('2027-09-16T09:00:00Z')).toBe(true)
  })

  it('still thanks one that is past due for it (more than 12 months)', () => {
    expect(monthly('2027-11-16T09:00:00Z')).toBe(true)
  })

  it('counts a short month as one month (Jan 31 to Feb 28)', () => {
    expect(monthly('2028-02-28T09:00:00Z', '2027-02-28T09:00:00Z')).toBe(true)
    expect(monthly('2028-01-31T09:00:00Z', '2027-02-28T09:00:00Z')).toBe(false)
  })

  it('thanks every annual renewal, thanked before or not', () => {
    expect(isThankYouRenewal({ plan: 'annual', lastThankedFor: THANKED, periodStart: '2026-10-16T09:00:00Z' })).toBe(true)
    expect(isThankYouRenewal({ plan: 'annual', lastThankedFor: undefined, periodStart: '2027-09-16T09:00:00Z' })).toBe(true)
  })

  it('skips a monthly plan whose stored thank-you is not a date', () => {
    expect(monthly('2027-10-16T09:00:00Z', 'not a date')).toBe(false)
    expect(monthly('2027-10-16T09:00:00Z', 42)).toBe(false)
  })

  it('skips when the period start is not a date', () => {
    expect(monthly('')).toBe(false)
    expect(isThankYouRenewal({ plan: 'monthly', lastThankedFor: undefined, periodStart: '' })).toBe(false)
  })
})
