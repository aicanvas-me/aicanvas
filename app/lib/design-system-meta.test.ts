import { describe, it, expect } from 'vitest'
import { DESIGN_SYSTEMS } from '../../scripts/lib/design-systems.config.mjs'
import { DESIGN_SYSTEM_META } from './design-system-meta'

describe('DESIGN_SYSTEM_META', () => {
  // The template bar shows a free system's Install command to everyone, so its
  // paid flag must match the registry's own paidToInstall, or a Pro template
  // would offer free visitors an install the gate answers with a placeholder.
  it('marks a system paid exactly when the registry config does', () => {
    for (const meta of Object.values(DESIGN_SYSTEM_META)) {
      const config = DESIGN_SYSTEMS.find((ds: { slug: string }) => ds.slug === meta.slug)
      expect(config, meta.slug).toBeDefined()
      expect(meta.paid, meta.slug).toBe(config?.paidToInstall === true)
    }
  })
})
