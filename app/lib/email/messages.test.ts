import { describe, expect, it } from 'vitest'
import { renewalThanksEmail } from './messages'

describe('renewalThanksEmail', () => {
  it('names the plan without a calendar date', () => {
    const { subject, html } = renewalThanksEmail({ plan: 'annual' })
    expect(subject).toBe('A quick thank you from AI Canvas')
    expect(html).toContain('Your annual plan renews in the next few days.')
    expect(html).not.toContain('tomorrow')
    expect(html).toContain('href="https://aicanvas.me/account/settings"')
  })

  it('keeps the letter after the button', () => {
    const { html } = renewalThanksEmail({ plan: 'monthly' })
    const button = html.indexOf('See what your support built lately')
    expect(button).toBeGreaterThan(html.indexOf('just wanted to say thank you'))
    expect(html.indexOf('What should I build next?')).toBeGreaterThan(button)
  })
})
