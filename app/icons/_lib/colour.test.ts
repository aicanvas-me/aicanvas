import { describe, it, expect } from 'vitest'
import { contrast, hexToOklch, normalizeHex, oklchToHex } from './colour'
import { COLOUR_SWATCHES, DARK_PREVIEW_COLOUR, DARK_TILE, LIGHT_PREVIEW_COLOUR, LIGHT_TILE } from './constants'

describe('normalizeHex', () => {
  it('accepts 3 or 6 digits, with or without #, and uppercases', () => {
    expect(normalizeHex('abc')).toBe('#AABBCC')
    expect(normalizeHex('#3e7bfa')).toBe('#3E7BFA')
    expect(normalizeHex(' 3E7BFA ')).toBe('#3E7BFA')
  })

  it('rejects anything else', () => {
    expect(normalizeHex('#12g')).toBe(null)
    expect(normalizeHex('1234')).toBe(null)
    expect(normalizeHex('')).toBe(null)
  })
})

describe('OKLCH round trip', () => {
  it('gives back the same hex for presets and both theme inks', () => {
    for (const hex of [...COLOUR_SWATCHES.map((swatch) => swatch.hex), DARK_PREVIEW_COLOUR, LIGHT_PREVIEW_COLOUR, '#000000', '#FFFFFF']) {
      expect(oklchToHex(hexToOklch(hex))).toBe(hex)
    }
  })

  it('maps an out-of-gamut colour into sRGB instead of clipping its hue away', () => {
    const hex = oklchToHex({ l: 0.6, c: 0.4, h: 262 })
    expect(normalizeHex(hex)).toBe(hex)
    expect(Math.abs(hexToOklch(hex).h - 262)).toBeLessThan(3)
  })
})

describe('swatches', () => {
  it('each preset reads at 3:1 or more on both the light and the dark tile', () => {
    for (const { hex } of COLOUR_SWATCHES) {
      expect(contrast(hex, LIGHT_TILE)).toBeGreaterThanOrEqual(3)
      expect(contrast(hex, DARK_TILE)).toBeGreaterThanOrEqual(3)
    }
  })
})
