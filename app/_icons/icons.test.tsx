// @vitest-environment jsdom
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { IconProvider } from './IconBase'
import { Check } from './icons/check'
import { Search } from './icons/search'

// The site runs the icon set's React package unchanged (scripts/site-icons.mjs
// copies it from the vault). Empty placeholders do not implement its geometry
// or CSS stroke behavior, so only exercise these contracts with the package.
const fromVault = readFileSync(join(__dirname, 'IconBase.tsx'), 'utf8').includes('export function createIcon')

function render(element: ReactNode) {
  const container = document.createElement('div')
  container.innerHTML = renderToStaticMarkup(element)
  return container
}

describe.skipIf(!fromVault)('the icon package a customer installs', () => {
  it('keeps the runtime and every icon server-safe without context', () => {
    const files = ['IconBase.tsx', ...readdirSync(join(__dirname, 'icons')).filter((f) => f.endsWith('.tsx')).map((f) => `icons/${f}`)]
    expect(files.length).toBeGreaterThan(1)
    for (const file of files) {
      expect(readFileSync(join(__dirname, file), 'utf8'), file).not.toMatch(/use client|createContext|useContext/)
    }
  })

  it('uses the inherited CSS stroke default however the size is set', () => {
    for (const el of [<Search key="d" />, <Search key="p" size={16} />, <Search key="c" className="size-4" />, <Check key="check" />]) {
      const container = render(el)
      expect(container.querySelector('svg')?.style.strokeWidth).toBe('var(--aic-icon-stroke, 1.515)')
      const stroked = container.querySelectorAll<SVGElement>('path:not([stroke="none"]), circle:not([stroke="none"])')
      expect(stroked.length).toBeGreaterThan(0)
      for (const child of stroked) expect(child.style.vectorEffect).toBe('')
    }
  })

  it('maps each named weight to its stroke, none landing on a whole pixel at 16px', () => {
    const strokes = { thin: '0.7575', light: '1.13625', regular: '1.515', bold: '1.89375', extrabold: '2.2725' } as const
    for (const [weight, stroke] of Object.entries(strokes)) {
      expect(render(<Search weight={weight as keyof typeof strokes} />).querySelector('svg')?.style.strokeWidth).toBe(stroke)
      expect((Number(stroke) * 16) / 24 % 1).not.toBe(0)
    }
  })

  it('provides the weight default through a display: contents span', () => {
    const container = render(
      <IconProvider weight="light">
        <Search />
      </IconProvider>,
    )
    const provider = container.querySelector('span')
    expect(provider?.style.display).toBe('contents')
    expect(provider?.style.getPropertyValue('--aic-icon-stroke')).toBe('1.13625')
    expect(provider?.querySelector('svg')).not.toBeNull()
  })

  it('hides a bare icon from screen readers and names one that carries a title', () => {
    expect(renderToStaticMarkup(<Search />)).toContain('aria-hidden="true"')
    const titled = renderToStaticMarkup(
      <Search>
        <title>Search documents</title>
      </Search>,
    )
    expect(titled).not.toContain('aria-hidden')
    expect(titled).toContain('role="img"')
  })

  it('keeps solid heart geometry out of the Line icon module', () => {
    const line = readFileSync(join(__dirname, 'icons/heart.tsx'), 'utf8')
    const solid = readFileSync(join(__dirname, 'icons/heart-solid.tsx'), 'utf8')
    const paths = Array.from(solid.matchAll(/["']d["']\s*:\s*["']([^"']+)["']/g), ([, path]) => path)
    expect(paths.length).toBeGreaterThan(0)
    for (const path of paths) expect(line).not.toContain(path)
  })
})
