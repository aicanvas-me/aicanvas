import { strFromU8, unzipSync } from 'fflate'
import { describe, expect, it } from 'vitest'
import { buildSvg } from './svg'
import { iconComponentName, iconFileName, takesStroke } from './icon-utils'
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
    weight: 'light',
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
      buildSvg(MARKUP.alpha, value.size, value.weight, value.colour, value.style),
    )
    expect(strFromU8(files['svg/beta.svg'])).toBe(
      buildSvg(MARKUP.beta, value.size, value.weight, value.colour, value.style),
    )

    const saved = json(files['preset.json'])
    expect(saved).toMatchObject({
      style: 'line',
      format: 'svg',
      size: 20,
      weight: 'light',
      colour: '#336699',
      count: 2,
    })
    expect(saved).not.toHaveProperty('strokeWidth')
    expect(saved).not.toHaveProperty('absoluteStrokeWidth')
    expect(strFromU8(files['README.txt'])).toContain('Preset: line style, 20px, light weight, colour #336699.')
    expect(new Date(saved.generatedAt as string).toISOString()).toBe(saved.generatedAt)
  })

  it.each(['line', 'duotone', 'solid', 'solid-duotone'] as const)(
    'keeps React sources byte-identical and omits SVG settings for %s',
    async (style) => {
      const base = 'export const IconBase = "untouched"\n'
      const alphaFile = `${iconFileName('alpha', style)}.tsx`
      const betaFile = `${iconFileName('beta', style)}.tsx`
      const alpha = `export const Alpha = "${style}"\n`
      const beta = `export const Beta = "${style}"\n`
      const files = unzip(
        await buildIconZip(
          input({
            style,
            format: 'react',
            size: 48,
            weight: 'extrabold',
            colour: '#abcdef',
            names: ['alpha', 'beta'],
            react: {
              base,
              files: {
                [betaFile]: beta,
                [alphaFile]: alpha,
              },
            },
          }),
        ),
      )

      expect(Object.keys(files)).toEqual([
        'components/icons/IconBase.tsx',
        `components/icons/${alphaFile}`,
        `components/icons/${betaFile}`,
        'preset.json',
        'README.txt',
      ])
      expect(strFromU8(files['components/icons/IconBase.tsx'])).toBe(base)
      expect(strFromU8(files[`components/icons/${alphaFile}`])).toBe(alpha)
      expect(strFromU8(files[`components/icons/${betaFile}`])).toBe(beta)
      const saved = json(files['preset.json'])
      expect(saved).toEqual({
        style,
        format: 'react',
        count: 2,
        generatedAt: expect.any(String),
      })
      expect(new Date(saved.generatedAt as string).toISOString()).toBe(saved.generatedAt)
      const readme = strFromU8(files['README.txt'])
      expect(readme).not.toContain('\u2014')
      expect(readme).not.toMatch(/Preset:|48px|extrabold|#abcdef/)
      expect(readme).toContain(`Style: ${style}. Count: 2 icons.`)
      expect(readme).toContain(`import { ${iconComponentName('search', style)} } from '@/components/icons/${iconFileName('search', style)}'`)
      expect(readme).toContain(`<${iconComponentName('search', style)} size={24}${takesStroke(style) ? ' weight="bold"' : ''} color="#336699" />`)
      expect(readme).toContain('Weight applies only to Line and Duotone; solid styles have a fixed weight.')
      expect(readme).toContain('<IconProvider> from IconBase sets defaults')
    },
  )

  it('names archives by style and format', () => {
    expect(zipFileName('solid-duotone', 'svg')).toBe('aicanvas-icons-solid-duotone-svg.zip')
  })
})
