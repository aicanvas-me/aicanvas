import { describe, it, expect } from 'vitest'
import { buildLookup, type GateManifest } from './manifest'
import { classifyContent } from './content-type'

// Mirrors the real generator output shape (registry-data/_manifest.json).
// Regression for the launch-blocking bug where designSystemSlugs was built
// from a registry flag nothing set, classifying every design-system
// component as a free standalone.
const manifest: GateManifest = {
  systemSlugs: ['andromeda'],
  designSystemSlugs: ['andromeda-alert', 'andromeda-card', 'andromeda-table'],
  templateSlugs: [
    'andromeda-mission-control',
    'andromeda-service-order',
    'andromeda-resource-planning',
    'andromeda-signal-room',
  ],
  premiumSlugs: ['aurora-pricing-table'],
  brainSlugs: ['andromeda-brain'],
}

describe('buildLookup + classifyContent (manifest-driven gate)', () => {
  const lookup = buildLookup(manifest)

  it('individual design-system components classify as design-system-component (recognized via the manifest, free-metered, never bare standalone)', () => {
    expect(classifyContent('andromeda-alert', lookup)).toBe('design-system-component')
    expect(classifyContent('andromeda-card.json', lookup)).toBe('design-system-component')
  })

  it('every template is gated, including signal-room', () => {
    for (const t of manifest.templateSlugs) {
      expect(classifyContent(t, lookup)).toBe('template')
    }
  })

  it('the everything bundle is premium, the free system\'s components bundle is not', () => {
    expect(classifyContent('andromeda-all', lookup)).toBe('design-system')
    expect(classifyContent('andromeda', lookup)).toBe('design-system-component')
  })

  it('the name-colliding free standalone stays standalone', () => {
    expect(classifyContent('andromeda-button', lookup)).toBe('standalone')
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
