import { describe, it, expect, vi } from 'vitest'

// The manifest read is the only boundary: throwing is the production degraded
// path (missing or unreadable manifest), returning it is a healthy build.
const readFileSync = vi.fn()
vi.mock('node:fs', () => ({ readFileSync: (...args: unknown[]) => readFileSync(...args) }))

import { classifyPremium, installTier } from './premium-gate'

const PREMIUM = 'Premium, requires an AI Canvas token'
const LEGACY_TEMPLATE = 'andromeda-signal-room'
const PRO_TEMPLATE = 'andromeda-pro-signal-room'

const manifest = JSON.stringify({
  systemSlugs: ['andromeda', 'andromeda-pro'],
  paidSystemSlugs: ['andromeda-pro'],
  designSystemSlugs: ['andromeda-badge', 'andromeda-pro-badge'],
  templateSlugs: [LEGACY_TEMPLATE, PRO_TEMPLATE],
  premiumSlugs: [],
  brainSlugs: ['andromeda-brain', 'andromeda-pro-brain'],
})

// Order matters: a healthy read is cached for the module's life, a degraded one never is.
describe('installTier + classifyPremium for templates', () => {
  it('a degraded lookup keeps every template premium, Legacy included', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    readFileSync.mockImplementation(() => {
      throw new Error('ENOENT')
    })

    for (const slug of [LEGACY_TEMPLATE, PRO_TEMPLATE, 'andromeda-mission-control']) {
      expect(installTier(slug), slug).toBe(PREMIUM)
      expect(classifyPremium(slug).isPremium, slug).toBe(true)
    }
  })

  it('a Legacy template installs on a free account and is not premium, like a Legacy component', () => {
    readFileSync.mockImplementation(() => manifest)

    expect(installTier(LEGACY_TEMPLATE)).toBe('free account')
    expect(installTier(LEGACY_TEMPLATE)).toBe(installTier('andromeda-badge'))
    expect(classifyPremium(LEGACY_TEMPLATE)).toEqual({ contentType: 'design-system-component', isPremium: false })
  })

  it('a Pro template stays Premium', () => {
    expect(installTier(PRO_TEMPLATE)).toBe(PREMIUM)
    expect(classifyPremium(PRO_TEMPLATE)).toEqual({ contentType: 'template', isPremium: true })
  })
})
