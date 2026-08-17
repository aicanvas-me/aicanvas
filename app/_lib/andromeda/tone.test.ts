// The floor under Andromeda's "the data picks the tone" law (Gauge,
// ProgressBar, MetricChart). It lives here rather than beside utils.ts because
// vitest.config.ts only collects lib/, app/ and scripts/ — and because
// utils.ts imports ../../tokens extensionless, which plain node cannot resolve,
// so the sibling *.selfcheck.mjs pattern does not work for this one.
//
// The whole point of the helper is that ONE prop carries the direction, so the
// case that matters is the asymmetry: the same numbers mean opposite things
// depending on which of warning/fault is larger. Boundaries are inclusive, so
// they are asserted exactly on the line, not near it.
import { describe, expect, it } from 'vitest'
import { V2_COMPONENT_NAMES } from '../../lib/andromeda-v2.generated'
import { toneFromValue } from '../../lib/andromeda-v2-helpers.generated'

// The helper is vault-authored, so a checkout without it has nothing to assert.
// An empty V2_COMPONENT_NAMES is exactly that build, and the shim hands out an
// inert stub there — skip rather than fail a fork for code it cannot have.
describe.skipIf(V2_COMPONENT_NAMES.length === 0)('toneFromValue', () => {
  it('reads fault-above-warning as high-is-bad', () => {
    const high = { warning: 70, fault: 90 } // CPU, memory, storage
    expect(toneFromValue(69, high)).toBe(null)
    expect(toneFromValue(70, high)).toBe('warning') // inclusive
    expect(toneFromValue(89, high)).toBe('warning')
    expect(toneFromValue(90, high)).toBe('fault') // inclusive
    expect(toneFromValue(100, high)).toBe('fault')
  })

  it('reads fault-below-warning as low-is-bad', () => {
    const low = { warning: 30, fault: 15 } // fuel, O2, battery
    expect(toneFromValue(31, low)).toBe(null)
    expect(toneFromValue(30, low)).toBe('warning') // inclusive
    expect(toneFromValue(16, low)).toBe('warning')
    expect(toneFromValue(15, low)).toBe('fault') // inclusive
    expect(toneFromValue(0, low)).toBe('fault')
  })

  it('gives the identical reading opposite verdicts in the two directions', () => {
    expect(toneFromValue(20, { warning: 70, fault: 90 })).toBe(null)
    expect(toneFromValue(20, { warning: 30, fault: 15 })).toBe('warning')
  })

  it('hands the decision back to the caller when it cannot judge', () => {
    const high = { warning: 70, fault: 90 }
    expect(toneFromValue(50, undefined)).toBe(null)
    expect(toneFromValue(50, {})).toBe(null)
    expect(toneFromValue(50, { warning: 70 })).toBe(null) // half a range is not a range
    expect(toneFromValue(NaN, high)).toBe(null)
    expect(toneFromValue(undefined as unknown as number, high)).toBe(null)
  })
})
