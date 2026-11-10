import { describe, it, expect } from 'vitest'
import { buildLookup, type GateManifest } from './manifest'
import { classifyContent } from './content-type'

// Mirrors the real generator output shape (registry-data/_manifest.json).
// Regression for the launch-blocking bug where designSystemSlugs was built
// from a registry flag nothing set, classifying every design-system
// component as a free standalone.
const LEGACY_TEMPLATES = [
  'andromeda-mission-control',
  'andromeda-service-order',
  'andromeda-resource-planning',
  'andromeda-signal-room',
]
const PRO_TEMPLATES = [
  'andromeda-pro-ai-chat',
  'andromeda-pro-city-operations',
  'andromeda-pro-fintech-landing',
  'andromeda-pro-mission-control',
  'andromeda-pro-resource-planning',
  'andromeda-pro-service-order',
  'andromeda-pro-sign-in',
  'andromeda-pro-sign-up',
  'andromeda-pro-signal-room',
]

const manifest: GateManifest = {
  systemSlugs: ['andromeda', 'andromeda-pro'],
  paidSystemSlugs: ['andromeda-pro'],
  designSystemSlugs: ['andromeda-alert', 'andromeda-card', 'andromeda-table'],
  templateSlugs: [...LEGACY_TEMPLATES, ...PRO_TEMPLATES],
  premiumSlugs: ['aurora-pricing-table'],
  brainSlugs: ['andromeda-brain'],
}

describe('buildLookup + classifyContent (manifest-driven gate)', () => {
  const lookup = buildLookup(manifest)

  it('individual design-system components classify as design-system-component (recognized via the manifest, free-metered, never bare standalone)', () => {
    expect(classifyContent('andromeda-alert', lookup)).toBe('design-system-component')
    expect(classifyContent('andromeda-card.json', lookup)).toBe('design-system-component')
  })

  it('every Andromeda Legacy template takes the free lane, including signal-room', () => {
    for (const t of LEGACY_TEMPLATES) {
      expect(classifyContent(t, lookup), t).toBe('design-system-component')
    }
  })

  it('every Andromeda Pro template stays premium, including its signal-room', () => {
    for (const t of PRO_TEMPLATES) {
      expect(classifyContent(t, lookup), t).toBe('template')
    }
  })

  it('a manifest with no paidSystemSlugs key still gates every Pro template', () => {
    const old = buildLookup({ ...manifest, paidSystemSlugs: undefined })
    for (const t of PRO_TEMPLATES) {
      expect(classifyContent(t, old), t).toBe('template')
    }
  })

  it('the everything bundle is premium, the free system\'s components bundle is not', () => {
    expect(classifyContent('andromeda-all', lookup)).toBe('design-system')
    expect(classifyContent('andromeda', lookup)).toBe('design-system-component')
  })

  it('a premium standalone from the manifest gates as premium-standalone', () => {
    expect(classifyContent('aurora-pricing-table', lookup)).toBe('premium-standalone')
  })

  it('a brain item from the manifest gates as brain; absent key builds and gates nothing', () => {
    expect(classifyContent('andromeda-brain', lookup)).toBe('brain')
    const noBrains = buildLookup({ ...manifest, brainSlugs: undefined })
    expect(classifyContent('andromeda-brain', noBrains)).toBe('standalone')
  })

  it('a manifest with no premiumSlugs key still builds (defensive ?? [])', () => {
    const legacy = buildLookup({
      systemSlugs: ['andromeda'],
      designSystemSlugs: [],
      templateSlugs: [],
    } as unknown as GateManifest)
    expect(classifyContent('aurora-pricing-table', legacy)).toBe('standalone')
  })

  it('meta files stay meta', () => {
    expect(classifyContent('registry', lookup)).toBe('meta')
    expect(classifyContent('aicanvas-mcp', lookup)).toBe('meta')
    // the free token foundation is meta — uncounted, never gated (c3a3a1e)
    expect(classifyContent('andromeda-tokens', lookup)).toBe('meta')
  })
})
