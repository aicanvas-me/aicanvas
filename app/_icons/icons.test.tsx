import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { IconProvider } from './Icon'
import { Check } from './icons/check'
import { Search } from './icons/search'

// The site runs the icon set's React package unchanged (scripts/site-icons.mjs
// copies it from the vault), so these are what a customer gets. Each case broke
// once: a server component crashed on any icon, a class-set size thinned the
// line, a nested provider dropped the outer defaults, a <title> stayed hidden.
const fromVault = readFileSync(join(__dirname, 'Icon.tsx'), 'utf8').includes('export function createIcon')

describe.skipIf(!fromVault)('the icon package a customer installs', () => {
  it('marks Icon.tsx and every icon file as client modules, so a server component can render them', () => {
    const files = ['Icon.tsx', ...readdirSync(join(__dirname, 'icons')).map((f) => `icons/${f}`)]
    for (const f of files) expect(readFileSync(join(__dirname, f), 'utf8').startsWith(`'use client'`), f).toBe(true)
  })

  it('keeps the line at 1.5px however the size is set', () => {
    for (const el of [<Search key="p" size={16} />, <Search key="c" className="size-4" />, <Check key="d" />]) {
      const html = renderToStaticMarkup(el)
      expect(html).toContain('stroke-width="1.5"')
      expect(html.match(/<(path|circle) /g)?.length).toBe(html.match(/vector-effect="non-scaling-stroke"/g)?.length)
    }
  })

  it('scales the line with the size when absolute stroke is off', () => {
    const html = renderToStaticMarkup(<Search size={48} absoluteStrokeWidth={false} />)
    expect(html).toContain('stroke-width="1.5"')
    expect(html).not.toContain('vector-effect')
  })

  it('lets a nested provider change only what it sets', () => {
    const html = renderToStaticMarkup(
      <IconProvider size={32} color="red" className="a">
        <IconProvider variant="duotone" className="b">
          <Search />
        </IconProvider>
      </IconProvider>,
    )
    expect(html).toContain('width="32"')
    expect(html).toContain('color="red"')
    expect(html).toContain('class="aic-icon aic-icon-search a b"')
    expect(html).toContain('opacity=".12"')
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
})
