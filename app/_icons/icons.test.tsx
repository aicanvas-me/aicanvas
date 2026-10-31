import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Check, Search } from '.'

// The site runs the icon set's React package unchanged (scripts/site-icons.mjs
// copies it from the vault), so these are what a customer gets. Both broke once:
// a server component crashed on any icon, and a class-set size thinned the line.
const vault = join(__dirname, 'vault')

describe.skipIf(!existsSync(vault))('the icon package a customer installs', () => {
  it('marks every icon file and Icon.tsx as client modules, so a server component can render them', () => {
    const files = ['Icon.tsx', ...readdirSync(join(vault, 'icons')).map((f) => `icons/${f}`)]
    for (const f of files) expect(readFileSync(join(vault, f), 'utf8').startsWith(`'use client'`), f).toBe(true)
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
})
