import { describe, it, expect } from 'vitest'
import { agentPrompt, ALL_ICONS_INSTALL, iconImportLine, iconInstallCommand, iconJsxLine, PREMIUM_ICON_INSTALL_NOTE } from './constants'
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

describe('buildSvg: every style, size, weight, absolute and colour', () => {
  for (const style of STYLES)
    for (const size of [16, 24, 40, 64])
      for (const strokeWidth of [1, 1.5, 2, 3])
        for (const absolute of [true, false])
          for (const colour of [null, '#E5484D']) {
            const svg = buildSvg(MARKUP[style], size, strokeWidth, colour, absolute)
            it(`${style} ${size}px stroke ${strokeWidth} absolute ${absolute} colour ${colour}`, () => {
              expect(svg).toContain(`width="${size}" height="${size}"`)
              expect(strokeOf(svg)).toBeCloseTo(absolute ? (strokeWidth * 24) / size : strokeWidth, 4)
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
  it('leaves absoluteStrokeWidth out when on (the default) and writes it when off', () => {
    expect(iconJsxLine('image-sparkle', 40, 1.5, 'line', true)).toBe('<ImageSparkle size={40} strokeWidth={1.5} />')
    expect(iconJsxLine('image-sparkle', 40, 1.5, 'line', false)).toBe('<ImageSparkle size={40} strokeWidth={1.5} absoluteStrokeWidth={false} />')
  })
  it('carries the picked colour, and none when nothing is picked', () => {
    expect(iconJsxLine('image-sparkle', 24, 2, 'duotone', true, '#E5484D')).toBe('<ImageSparkleDuotone size={24} strokeWidth={2} color="#E5484D" />')
    expect(iconJsxLine('image-sparkle', 24, 2, 'solid-duotone', true, null)).not.toContain('color=')
  })
  it('leaves the line weight out for the solid styles, which do not take it', () => {
    expect(iconJsxLine('image-sparkle', 48, 1.5, 'solid', false, '#E5484D')).toBe('<ImageSparkleSolid size={48} color="#E5484D" />')
    expect(iconJsxLine('image-sparkle', 48, 1.5, 'solid-duotone', true)).toBe('<ImageSparkleSolidDuotone size={48} />')
    expect(agentPrompt('image-sparkle', 48, 1.5, 'solid', false)).not.toContain('strokeWidth 1.5')
  })
  it('uses a separate component for each style without a variant prop', () => {
    expect(iconJsxLine('x', 24, 2, 'line')).toBe('<X size={24} strokeWidth={2} />')
    expect(iconJsxLine('x', 24, 2, 'duotone')).toBe('<XDuotone size={24} strokeWidth={2} />')
    expect(iconJsxLine('x', 24, 2, 'solid')).toBe('<XSolid size={24} />')
    expect(iconJsxLine('x', 24, 2, 'solid-duotone')).toBe('<XSolidDuotone size={24} />')
    for (const style of STYLES) expect(iconJsxLine('x', 24, 2, style)).not.toContain('variant=')
  })
  it('agent text carries size, weight, absolute and colour', () => {
    const text = agentPrompt('image-sparkle', 64, 3, 'duotone', false, '#2A9461')
    expect(text).toContain('64px')
    expect(text).toContain('strokeWidth 3')
    expect(text).toContain('absoluteStrokeWidth off')
    expect(text).toContain('in #2A9461')
    expect(text).toContain('<ImageSparkleDuotone size={64} strokeWidth={3} absoluteStrokeWidth={false} color="#2A9461" />')
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
    const prompt = agentPrompt('image-sparkle', 24, 2, style)
    expect(prompt).toContain(install)
    expect(prompt).toContain(importLine)
    expect(prompt).toContain(iconJsxLine('image-sparkle', 24, 2, style))
    expect(prompt).not.toContain('variant=')
    expect(prompt.includes(PREMIUM_ICON_INSTALL_NOTE)).toBe(style !== 'line')
  })
  it('defaults to Line for markdown and installs the full Line set', () => {
    expect(iconInstallCommand('search')).toBe('npx shadcn@latest add https://aicanvas.me/r/icon-search.json')
    expect(iconImportLine('search')).toBe("import { Search } from '@/components/icons/search'")
    expect(ALL_ICONS_INSTALL).toBe('npx shadcn@latest add https://aicanvas.me/r/icons.json')
  })
})
