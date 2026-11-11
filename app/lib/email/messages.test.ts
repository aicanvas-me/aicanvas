import { describe, expect, it } from 'vitest'
import { renewalThanksEmail, agentConnectedEmail } from './messages'

describe('renewalThanksEmail', () => {
  it('names the plan without a calendar date', () => {
    const { subject, html } = renewalThanksEmail({ plan: 'annual' })
    expect(subject).toBe('A quick thank you from AI Canvas')
    expect(html).toContain('Your annual plan renews in the next few days.')
    expect(html).not.toContain('tomorrow')
    expect(html).toContain('href="https://aicanvas.me/account/settings"')
    expect(html).toContain('Switch off Product updates there, free and anytime.')
  })

  it('keeps the letter after the button', () => {
    const { html } = renewalThanksEmail({ plan: 'monthly' })
    const button = html.indexOf('See what your support built lately')
    expect(button).toBeGreaterThan(html.indexOf('just wanted to say thank you'))
    expect(html.indexOf('What should I build next?')).toBeGreaterThan(button)
  })
})

describe('agentConnectedEmail', () => {
  it('says an AI agent connected, escapes its self-given name, and links to the settings section', () => {
    const { subject, html } = agentConnectedEmail({ agentName: '<b>Claude</b>' })
    expect(subject).toBe('An AI agent connected to your AI Canvas account')
    expect(html).toContain('&lt;b&gt;Claude&lt;/b&gt;')
    expect(html).not.toContain('<b>Claude</b>')
    expect(html).toContain('https://aicanvas.me/account/settings#ai-agents')
    expect(html).not.toContain('while your browser was in')
  })

  it('never names where the agent or the browser signed in from', () => {
    const { html } = agentConnectedEmail({ agentName: 'x' })
    expect(html).not.toMatch(/signed in from|your browser was in/)
  })
})
