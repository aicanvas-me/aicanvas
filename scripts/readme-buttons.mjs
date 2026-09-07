/**
 * Renders the README badge chips and the site button to PNG.
 *
 * GitHub cannot style a shields.io badge the way our README needs (rounded
 * corners, a hairline divider, an icon, Manrope), so the chips are authored as
 * HTML here and screenshotted at 3x. Output lands in assets/readme-buttons/
 * and is referenced from README.md at its 1x height.
 *
 *   node scripts/readme-buttons.mjs          # render every chip
 *   node scripts/readme-buttons.mjs mit      # render one, by file name
 */
import { chromium } from 'playwright'
import { mkdir, writeFile, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'assets', 'readme-buttons')
const SCALE = 3

// Monochrome only. The olive accent is the site's, not the README's: on a
// GitHub canvas these chips have to read as chrome, not as a brand statement.
const T = {
  bg: '#0D0D0F',
  border: '#3A3D42',
  label: '#9CA0A6',
  value: '#FFFFFF',
}

/** @type {{file: string, label?: string, value: string, icon?: boolean, height: number}[]} */
const CHIPS = [
  { file: 'btn-site', value: 'aicanvas.me', icon: true, height: 60 },
  { file: 'btn-license', label: 'License', value: 'MIT', height: 46 },
  { file: 'btn-components', label: 'Components', value: '80+ Free', height: 46 },
  { file: 'btn-registry', label: 'Registry', value: '@aicanvas', height: 46 },
  { file: 'btn-agents', label: 'Agents', value: 'Claude • Codex • Cursor', height: 46 },
  { file: 'btn-github', label: 'GitHub', value: 'aicanvas-me', height: 46 },
]

// The components chip carries the only value that moves. It reads "80+", which can
// only ever understate, so it stays true as the catalog grows; re-run this script
// when the next round number is worth claiming.

const css = (h) => `
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: transparent; }
  .chip {
    display: inline-flex; align-items: center;
    height: ${h}px; padding: 0 ${Math.round(h * 0.42)}px; gap: ${Math.round(h * 0.34)}px;
    background: ${T.bg};
    border: 1px solid ${T.border};
    border-radius: ${Math.round(h * 0.24)}px;
    font-family: Manrope, sans-serif;
    white-space: nowrap;
  }
  .label {
    color: ${T.label};
    font-size: ${Math.round(h * 0.24)}px; font-weight: 600;
    letter-spacing: 0.13em; text-transform: uppercase;
  }
  .rule { width: 1px; height: ${Math.round(h * 0.46)}px; background: ${T.border}; }
  .value { color: ${T.value}; font-size: ${Math.round(h * 0.37)}px; font-weight: 700; letter-spacing: -0.01em; }
  .icon { height: ${Math.round(h * 0.46)}px; width: auto; display: block; }
`

const html = (chip, iconSvg) => `<!doctype html><html><head><meta charset="utf-8"><style>${css(chip.height)}</style></head><body>
  <div class="chip">
    ${chip.icon ? `<span class="icon">${iconSvg}</span>` : `<span class="label">${chip.label}</span>`}
    <span class="rule"></span>
    <span class="value">${chip.value}</span>
  </div>
</body></html>`

/**
 * The brand mark, olive gradient and dark facets exactly as the site paints it.
 * The chips around it are monochrome so the icon is the only colour in the row.
 */
async function brandMark() {
  return (await readFile(join(ROOT, 'public', 'ai-canvas-icon.svg'), 'utf8'))
    .replace(/<\?xml[^>]*\?>/g, '')
    .replace(/<svg /, '<svg style="height:100%;width:auto;display:block" ')
}

async function main() {
  const only = process.argv[2]
  const targets = only ? CHIPS.filter((c) => c.file.includes(only)) : CHIPS
  if (!targets.length) throw new Error(`no chip matches "${only}"`)

  const iconSvg = await brandMark()

  await mkdir(OUT, { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage({ deviceScaleFactor: SCALE })

  for (const chip of targets) {
    await page.setContent(html(chip, iconSvg), { waitUntil: 'networkidle' })
    await page.evaluate(() => document.fonts.ready)
    const el = await page.locator('.chip')
    const buf = await el.screenshot({ omitBackground: true })
    await writeFile(join(OUT, `${chip.file}.png`), buf)
    const { width } = await el.boundingBox()
    console.log(`${chip.file}.png  ${Math.round(width)}x${chip.height} @${SCALE}x`)
  }

  await browser.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
