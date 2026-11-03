import { describe, it, expect } from 'vitest'
import { agentPrompt, ALL_ICONS_INSTALL, iconImportLine, iconInstallCommand, iconJsxLine, PREMIUM_ICON_INSTALL_NOTE } from './constants'
import type { IconWeight } from './icon-utils'
import { buildSvg } from './svg'
import type { IconStyle } from './types'

// One drawing per style, as the icon data carries them: lines take the
// stroke from the <svg>, tints and solids are filled paths.
const MARKUP: Record<IconStyle, string> = {
  line: '<path d="M4 4L20 20" /><circle cx="12" cy="12" r="3" />',
  duotone: '<path d="M4 4H20V20Z" fill="currentColor" stroke="none" opacity=".12" /><path d="M4 4L20 20" />',
  solid: '<path d="M4 4H20V20Z" fill="currentColor" stroke="none" />',
  'solid-duotone': '<path d="M4 4H20V20Z" fill="currentColor" stroke="none" opacity=".5" /><path d="M8 8H12V12Z" fill="currentColor" stroke="none" />',
}
const STYLES = Object.keys(MARKUP) as IconStyle[]
const strokeOf = (svg: string) => Number(svg.match(/stroke-width="([\d.]+)"/)?.[1])
// IconBase's weights in viewBox units: the same at every size, so the line scales with it.
const STROKES: Record<IconWeight, number> = { thin: 0.7575, light: 1.13625, regular: 1.515, bold: 2.2725 }
const WEIGHTS = Object.keys(STROKES) as IconWeight[]

describe('buildSvg: every style, size, weight and colour', () => {
  for (const style of STYLES)
    for (const size of [16, 24, 40, 64])
      for (const weight of WEIGHTS)
        for (const colour of [null, '#E5484D']) {
          const svg = buildSvg(MARKUP[style], size, weight, colour)
          it(`${style} ${size}px ${weight} colour ${colour}`, () => {
            expect(svg).toContain(`width="${size}" height="${size}"`)
            expect(strokeOf(svg)).toBe(STROKES[weight])
            if (colour) {
              // the pick is in every stroke and fill, nothing left on currentColor
              expect(svg).not.toContain('currentColor')
              expect(svg).toContain(`stroke="${colour}"`)
              if (style !== 'line') expect(svg).toContain(`fill="${colour}"`)
            } else {
              expect(svg).not.toMatch(/#[0-9A-F]{6}/i)
              expect(svg).not.toContain(' color=')
            }
            // the drawing itself is untouched: same paths, same opacities
            expect(svg.replaceAll(colour ?? 'currentColor', 'currentColor')).toContain(MARKUP[style])
          })
        }
})

describe('React line and agent text', () => {
  it('leaves weight out at regular (the default) and writes it otherwise', () => {
    expect(iconJsxLine('image-sparkle', 40, 'regular', 'line')).toBe('<ImageSparkle size={40} />')
    expect(iconJsxLine('image-sparkle', 40, 'thin', 'line')).toBe('<ImageSparkle size={40} weight="thin" />')
    expect(iconJsxLine('image-sparkle', 40, 'light', 'line')).toBe('<ImageSparkle size={40} weight="light" />')
    expect(iconJsxLine('image-sparkle', 40, 'bold', 'line')).toBe('<ImageSparkle size={40} weight="bold" />')
    for (const weight of WEIGHTS) expect(iconJsxLine('image-sparkle', 40, weight, 'line')).not.toContain('strokeWidth')
  })
  it('carries the picked colour, and none when nothing is picked', () => {
    expect(iconJsxLine('image-sparkle', 24, 'bold', 'duotone', '#E5484D')).toBe('<ImageSparkleDuotone size={24} weight="bold" color="#E5484D" />')
    expect(iconJsxLine('image-sparkle', 24, 'bold', 'solid-duotone', null)).not.toContain('color=')
  })
  it('leaves the line weight out for the solid styles, which do not take it', () => {
    expect(iconJsxLine('image-sparkle', 48, 'bold', 'solid', '#E5484D')).toBe('<ImageSparkleSolid size={48} color="#E5484D" />')
    expect(iconJsxLine('image-sparkle', 48, 'thin', 'solid-duotone')).toBe('<ImageSparkleSolidDuotone size={48} />')
    expect(agentPrompt('image-sparkle', 48, 'bold', 'solid')).not.toContain('bold')
  })
  it('uses a separate component for each style without a variant prop', () => {
    expect(iconJsxLine('x', 24, 'regular', 'line')).toBe('<X size={24} />')
    expect(iconJsxLine('x', 24, 'regular', 'duotone')).toBe('<XDuotone size={24} />')
    expect(iconJsxLine('x', 24, 'regular', 'solid')).toBe('<XSolid size={24} />')
    expect(iconJsxLine('x', 24, 'regular', 'solid-duotone')).toBe('<XSolidDuotone size={24} />')
    for (const style of STYLES) expect(iconJsxLine('x', 24, 'regular', style)).not.toContain('variant=')
  })
  it('agent text carries size, weight and colour', () => {
    const text = agentPrompt('image-sparkle', 64, 'bold', 'duotone', '#2A9461')
    expect(text).toContain('64px')
    expect(text).toContain('in the bold weight')
    expect(text).toContain('in #2A9461')
    expect(text).toContain('<ImageSparkleDuotone size={64} weight="bold" color="#2A9461" />')
    expect(text).not.toContain('strokeWidth')
  })
  it('agent text says nothing of the weight at regular', () => {
    expect(agentPrompt('image-sparkle', 24, 'regular', 'line')).not.toContain('weight')
  })
})

describe('icon registry install and import strings', () => {
  const cases: [IconStyle, string, string][] = [
    ['line', '', 'ImageSparkle'],
    ['duotone', '-duotone', 'ImageSparkleDuotone'],
    ['solid', '-solid', 'ImageSparkleSolid'],
    ['solid-duotone', '-solid-duotone', 'ImageSparkleSolidDuotone'],
  ]
  it.each(cases)('matches the %s registry item and package export', (style, suffix, component) => {
    const install = `npx shadcn@latest add https://aicanvas.me/r/icon-image-sparkle${suffix}.json`
    const importLine = `import { ${component} } from '@/components/icons/image-sparkle${suffix}'`
    expect(iconInstallCommand('image-sparkle', style)).toBe(install)
    expect(iconImportLine('image-sparkle', style)).toBe(importLine)
    const prompt = agentPrompt('image-sparkle', 24, 'regular', style)
    expect(prompt).toContain(install)
    expect(prompt).toContain(importLine)
    expect(prompt).toContain(iconJsxLine('image-sparkle', 24, 'regular', style))
    expect(prompt).not.toContain('variant=')
    expect(prompt.includes(PREMIUM_ICON_INSTALL_NOTE)).toBe(style !== 'line')
  })
  it('defaults to Line for markdown and installs the full Line set', () => {
    expect(iconInstallCommand('search')).toBe('npx shadcn@latest add https://aicanvas.me/r/icon-search.json')
    expect(iconImportLine('search')).toBe("import { Search } from '@/components/icons/search'")
    expect(ALL_ICONS_INSTALL).toBe('npx shadcn@latest add https://aicanvas.me/r/icons.json')
  })
})
