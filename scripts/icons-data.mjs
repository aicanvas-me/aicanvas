#!/usr/bin/env node
// Builds the /icons page data from the icon set's vault checkout. The icons
// live only in the vault, so the output is gitignored, like the injected
// premium components. It runs in the dev and build chains right after
// inject-premium. The source, first that has icons/svg: ICONS_LOCAL_PATH (the
// icons/ folder), PREMIUM_LOCAL_PATH/icons, then the .icons-source copy inject keeps.
// With none it writes empty data, so the pages build and list no icons.
//
//   app/icons/_data/icons.generated.json    every icon: name, category, tags, added (added-dates.json), isNew
//   public/icons-data/line.json             name -> inner SVG markup, the free style
//   .icons-data/<style>.json                the same for each paid style, served only to Premium
//                                           by app/icons/style-data/[style]/route.ts
//   public/icons-preview/<style>/<name>.png raster previews of the paid styles, no vectors
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { iconSourceCandidates, readAddedDates } from './lib/icon-source.mjs'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const STYLES = { line: 'svg', duotone: 'svg-duotone', solid: 'svg-solid', 'solid-duotone': 'svg-solid-duotone' }
const PREVIEW_PX = 192
const dataFile = (style) => (style === 'line' ? join(ROOT, 'public/icons-data/line.json') : join(ROOT, `.icons-data/${style}.json`))

// Paid markup never stays public: drop the files earlier builds wrote there.
for (const style of Object.keys(STYLES)) if (style !== 'line') rmSync(join(ROOT, `public/icons-data/${style}.json`), { force: true })
rmSync(join(ROOT, 'public/icons-preview'), { recursive: true, force: true })
mkdirSync(join(ROOT, 'public/icons-data'), { recursive: true })
mkdirSync(join(ROOT, '.icons-data'), { recursive: true })

const SRC = iconSourceCandidates(ROOT).find((dir) => existsSync(join(dir, 'svg')))

if (!SRC) {
  mkdirSync(join(ROOT, 'app/icons/_data'), { recursive: true })
  writeFileSync(join(ROOT, 'app/icons/_data/icons.generated.json'), '[]')
  for (const style of Object.keys(STYLES)) writeFileSync(dataFile(style), '{}')
  console.warn('icons-data: no icon source found, /icons builds empty')
  process.exit(0)
}

const metaOf = (name) => {
  const src = readFileSync(join(SRC, 'src', `${name}.mjs`), 'utf8')
  const m = src.match(/export const meta = (\{[^\n]*\})/)
  if (!m) throw new Error(`no meta line in ${name}.mjs`)
  return Function(`return (${m[1]})`)()
}

const fresh = new Set(JSON.parse(readFileSync(join(SRC, 'batch-4.json'), 'utf8')).icons.map((i) => i.name))
const names = readdirSync(join(SRC, 'svg')).filter((f) => f.endsWith('.svg')).map((f) => f.slice(0, -4)).sort()
const added = readAddedDates(SRC, names)

const index = names.map((name) => {
  const { tags = [], category } = metaOf(name)
  return { name, category, tags, added: added[name] ?? null, isNew: fresh.has(name) }
})

mkdirSync(join(ROOT, 'app/icons/_data'), { recursive: true })
writeFileSync(join(ROOT, 'app/icons/_data/icons.generated.json'), JSON.stringify(index))

// A missing sharp fails the build: without previews the paid styles would show blank.
const { default: sharp } = await import('sharp')
for (const [style, dir] of Object.entries(STYLES)) {
  const out = {}
  if (style !== 'line') mkdirSync(join(ROOT, `public/icons-preview/${style}`), { recursive: true })
  await Promise.all(names.map(async (name) => {
    const svg = readFileSync(join(SRC, dir, `${name}.svg`), 'utf8')
    out[name] = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').replace(/\s*\n\s*/g, '').trim()
    if (style === 'line') return
    // White on transparent: the page tints it through a CSS mask, so the colour picker still works.
    const sized = svg.replaceAll('currentColor', '#fff').replace(/width="24" height="24"/, `width="${PREVIEW_PX}" height="${PREVIEW_PX}"`)
    await sharp(Buffer.from(sized)).png({ compressionLevel: 9 }).toFile(join(ROOT, `public/icons-preview/${style}/${name}.png`))
  }))
  writeFileSync(dataFile(style), JSON.stringify(Object.fromEntries(names.map((name) => [name, out[name]]))))
}
console.log(`icons-data: ${names.length} icons, ${Object.keys(STYLES).length} styles, ${names.length * 3} paid previews`)
