#!/usr/bin/env node
// Builds the /icons page data from the icon set's vault checkout. The icons
// live only in the vault, so the output is gitignored, like the injected
// premium components. It runs in the dev and build chains right after
// inject-premium. The source, first that has icons/svg: ICONS_LOCAL_PATH (the
// icons/ folder), PREMIUM_LOCAL_PATH/icons, then the icon-library worktree.
// With none it writes empty data, so the pages build and list no icons.
//
//   app/icons/_data/icons.generated.json    every icon: name, category, tags, added, isNew
//   public/icons-data/<style>.json          name -> inner SVG markup, one file per style
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { iconSourceCandidates } from './lib/icon-source.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const STYLES = { line: 'svg', duotone: 'svg-duotone', solid: 'svg-solid', 'solid-duotone': 'svg-solid-duotone' }

const SRC = iconSourceCandidates(ROOT).find((dir) => existsSync(join(dir, 'svg')))

if (!SRC) {
  mkdirSync(join(ROOT, 'app/icons/_data'), { recursive: true })
  writeFileSync(join(ROOT, 'app/icons/_data/icons.generated.json'), '[]')
  mkdirSync(join(ROOT, 'public/icons-data'), { recursive: true })
  for (const style of Object.keys(STYLES)) writeFileSync(join(ROOT, `public/icons-data/${style}.json`), '{}')
  console.warn('icons-data: no icon source found, /icons builds empty')
  process.exit(0)
}

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
// A kept copy (.icons-source) is not a git checkout: no Added dates then.
let log = ''
try {
  log = execFileSync('git', ['-C', SRC, 'log', '--diff-filter=A', '--format=@%ad', '--date=short', '--name-only', '--', 'svg/'], { encoding: 'utf8', maxBuffer: 64 << 20, stdio: ['ignore', 'pipe', 'ignore'] })
} catch {}
for (const line of log.split('\n')) {
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
