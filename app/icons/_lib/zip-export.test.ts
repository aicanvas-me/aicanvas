import { strFromU8, unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { buildSvg } from './svg'
import { buildIconZip, zipFileName, type IconZipInput } from './zip-export'

const MARKUP = {
  alpha: '<path d="M2 2L22 22" />',
  beta: '<circle cx="12" cy="12" r="5" />',
}

function input(overrides: Partial<IconZipInput> = {}): IconZipInput {
  return {
    style: 'line',
    format: 'svg',
    size: 20,
    strokeWidth: 1.75,
    absolute: false,
    colour: '#336699',
    names: ['alpha', 'beta'],
    markup: MARKUP,
    react: {
      base: 'export const IconBase = "base"\n',
      files: {
        'alpha.tsx': 'export const Alpha = "alpha"\n',
        'beta.tsx': 'export const Beta = "beta"\n',
      },
    },
    ...overrides,
  }
}

function unzip(bytes: Uint8Array) {
  return unzipSync(bytes)
}

function json(bytes: Uint8Array) {
  return JSON.parse(strFromU8(bytes)) as Record<string, unknown>
}

describe('buildIconZip', () => {
  it('writes only the requested SVGs and shared metadata in name order', async () => {
    const value = input()
    const files = unzip(await buildIconZip(value))

    expect(Object.keys(files)).toEqual(['svg/alpha.svg', 'svg/beta.svg', 'preset.json', 'README.txt'])
    expect(strFromU8(files['svg/alpha.svg'])).toBe(
      buildSvg(MARKUP.alpha, value.size, value.strokeWidth, value.colour, value.absolute),
    )
    expect(strFromU8(files['svg/beta.svg'])).toBe(
      buildSvg(MARKUP.beta, value.size, value.strokeWidth, value.colour, value.absolute),
    )

    const saved = json(files['preset.json'])
    expect(saved).toMatchObject({
      style: 'line',
      format: 'svg',
      size: 20,
      strokeWidth: 1.75,
      absoluteStrokeWidth: false,
      colour: '#336699',
      count: 2,
    })
    expect(new Date(saved.generatedAt as string).toISOString()).toBe(saved.generatedAt)
  })

  it.each(['solid', 'solid-duotone'] as const)(
    'keeps React sources byte-identical and nulls stroke settings for %s',
    async (style) => {
      const base = 'export const IconBase = "untouched"\n'
      const suffix = style === 'solid' ? 'solid' : 'solid-duotone'
      const alpha = `export const Alpha = "${style}"\n`
      const beta = `export const Beta = "${style}"\n`
      const files = unzip(
        await buildIconZip(
          input({
            style,
            format: 'react',
            names: ['alpha', 'beta'],
            react: {
              base,
              files: {
                [`beta-${suffix}.tsx`]: beta,
                [`alpha-${suffix}.tsx`]: alpha,
              },
            },
          }),
        ),
      )

      expect(Object.keys(files)).toEqual([
        'components/icons/IconBase.tsx',
        `components/icons/alpha-${suffix}.tsx`,
        `components/icons/beta-${suffix}.tsx`,
        'preset.json',
        'README.txt',
      ])
      expect(strFromU8(files['components/icons/IconBase.tsx'])).toBe(base)
      expect(strFromU8(files[`components/icons/alpha-${suffix}.tsx`])).toBe(alpha)
      expect(strFromU8(files[`components/icons/beta-${suffix}.tsx`])).toBe(beta)
      expect(json(files['preset.json'])).toMatchObject({
        style,
        format: 'react',
        size: 20,
        strokeWidth: null,
        absoluteStrokeWidth: null,
        colour: '#336699',
        count: 2,
      })
      expect(strFromU8(files['README.txt'])).not.toContain('\u2014')
    },
  )

  it('names archives by style and format', () => {
    expect(zipFileName('solid-duotone', 'svg')).toBe('aicanvas-icons-solid-duotone-svg.zip')
  })
})
