#!/usr/bin/env node
// Builds the /icons page data from the icon set's vault checkout. The icons
// live only in the vault, so the output is gitignored, like the injected
// premium components. ICONS_LOCAL_PATH points at the vault's icons/ folder.
//
//   app/icons/_data/icons.generated.json    every icon: name, category, tags, added, isNew
//   public/icons-data/<style>.json          name -> inner SVG markup, one file per style
import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const SRC = process.env.ICONS_LOCAL_PATH ?? join(homedir(), 'aicanvas-premium-icon-library/icons')
const ROOT = new URL('..', import.meta.url).pathname
const STYLES = { line: 'svg', duotone: 'svg-duotone', solid: 'svg-solid', 'solid-duotone': 'svg-solid-duotone' }

const metaOf = (name) => {
  const src = readFileSync(join(SRC, 'src', `${name}.mjs`), 'utf8')
  const m = src.match(/export const meta = (\{[^\n]*\})/)
  if (!m) throw new Error(`no meta line in ${name}.mjs`)
  return Function(`return (${m[1]})`)()
}

// First commit that added each line SVG: one git pass, newest first, so the
// last date seen for a file is its first add.
const added = {}
let date = ''
for (const line of execFileSync('git', ['-C', SRC, 'log', '--diff-filter=A', '--format=@%ad', '--date=short', '--name-only', '--', 'svg/'], { encoding: 'utf8', maxBuffer: 64 << 20 }).split('\n')) {
  if (line.startsWith('@')) date = line.slice(1)
  else if (line.startsWith('icons/svg/') || line.startsWith('svg/')) added[line.split('/').pop().replace(/\.svg$/, '')] = date
}

const fresh = new Set(JSON.parse(readFileSync(join(SRC, 'batch-4.json'), 'utf8')).icons.map((i) => i.name))
const names = readdirSync(join(SRC, 'svg')).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)).sort()

const index = names.map((name) => {
  const { tags = [], category } = metaOf(name)
  return { name, category, tags, added: added[name] ?? null, isNew: fresh.has(name) }
})

mkdirSync(join(ROOT, 'app/icons/_data'), { recursive: true })
writeFileSync(join(ROOT, 'app/icons/_data/icons.generated.json'), JSON.stringify(index))

mkdirSync(join(ROOT, 'public/icons-data'), { recursive: true })
for (const [style, dir] of Object.entries(STYLES)) {
  const out = {}
  for (const name of names) {
    const svg = readFileSync(join(SRC, dir, `${name}.svg`), 'utf8')
    out[name] = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\s*\n\s*/g, '').trim()
  }
  writeFileSync(join(ROOT, `public/icons-data/${style}.json`), JSON.stringify(out))
}
console.log(`icons-data: ${names.length} icons, ${Object.keys(STYLES).length} styles`)
