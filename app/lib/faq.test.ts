import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { SITE_FAQ } from './faq'

// Every app route as a list of segments, route groups dropped.
function routes(dir: string, segs: string[] = []): string[][] {
  const out: string[][] = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (!statSync(full).isDirectory()) {
      if (/^page\.(tsx|ts)$/.test(name)) out.push(segs)
      continue
    }
    if (name.startsWith('_') || name.startsWith('@')) continue
    out.push(...routes(full, /^\(.*\)$/.test(name) ? segs : [...segs, name]))
  }
  return out
}

const APP_ROUTES = routes(join(__dirname, '..'))

function resolves(href: string): boolean {
  const parts = href.split(/[?#]/)[0].split('/').filter(Boolean)
  return APP_ROUTES.some(
    (r) => r.length === parts.length && r.every((s, i) => s === parts[i] || /^\[[^.]+\]$/.test(s)),
  )
}

describe('SITE_FAQ', () => {
  it('every link label appears in its answer', () => {
    for (const f of SITE_FAQ) for (const l of f.links ?? []) expect(f.a, f.id).toContain(l.label)
  })

  it('every internal link points at a real page', () => {
    for (const f of SITE_FAQ)
      for (const l of f.links ?? []) if (l.href.startsWith('/')) expect(resolves(l.href), `${f.id} ${l.href}`).toBe(true)
  })

  it('no question or answer carries an em dash', () => {
    for (const f of SITE_FAQ) expect(`${f.q} ${f.a}`, f.id).not.toContain('—')
  })
})
