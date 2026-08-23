/**
 * Capture Andromeda design-system component screenshots and upload them to
 * ImageKit under the `andromeda/` folder.
 *
 * Each component is rendered fit-scaled in a 1280×720 void frame by the
 * /andromeda-capture/<slug> route, so every card gets uniform 16:9 art.
 *
 * Usage: node scripts/screenshot-andromeda.mjs            — all components
 *        node scripts/screenshot-andromeda.mjs <slug>     — single component
 *
 * Requires the ideation dev server running (default http://localhost:3001)
 * and IMAGEKIT_PRIVATE_KEY in .env.local.
 */

import { chromium } from 'playwright'
import { mkdir, readFile, rm } from 'fs/promises'
import { readFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))


// Secrets come from .env.local when present; variables already in the
// environment win, the same precedence as before.
try {
  process.loadEnvFile('.env.local')
} catch {}

// ─── Config ───────────────────────────────────────────────────────────────────

// Slugs are the single source of truth in andromeda-meta.ts — parse them out so
// this list can never drift from the metadata the overview grid renders.
const META_PATH = path.join(__dirname, '../app/_lib/andromeda/andromeda-meta.ts')
const ALL_SLUGS = [
  ...readFileSync(META_PATH, 'utf8').matchAll(/slug:\s*'([^']+)'/g),
].map((m) => m[1])

const arg = process.argv[2]
const SLUGS = arg ? [arg] : ALL_SLUGS

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'
const IMAGEKIT_PRIVATE = process.env.IMAGEKIT_PRIVATE_KEY
if (!IMAGEKIT_PRIVATE) {
  console.error('Missing IMAGEKIT_PRIVATE_KEY. Add it to .env.local (private_… key from the ImageKit dashboard).')
  process.exit(1)
}
const IMAGEKIT_UPLOAD = 'https://upload.imagekit.io/api/v1/files/upload'
const IMAGEKIT_FOLDER = '/andromeda'
const TEMP_DIR = path.join(__dirname, '../.screenshots-tmp-andromeda')
const SETTLE_MS = 1800 // let scroll-gated charts reveal + animations settle

// ─── Per-component interactions ───────────────────────────────────────────────
// Run after the frame reports ready, before the screenshot. `frame` is the
// Playwright Locator for [data-capture-frame]; `page` is the page.

const INTERACTIONS = {
  // Drawer is closed by default (just a trigger button) — open it so the card
  // shows the panel. The panel portals to <body> and overlays the frame region.
  drawer: async (frame, page) => {
    await page.getByRole('button', { name: /open drawer/i }).click()
    await page.waitForTimeout(750) // slide-in spring
  },
  // Tooltip is hover-only — reveal one bubble so the card isn't just icons.
  tooltip: async (frame, page) => {
    await frame.locator('button').first().hover()
    await page.waitForTimeout(450)
  },
}

// ─── ImageKit upload ──────────────────────────────────────────────────────────

async function upload(localPath, fileName) {
  const fileData = await readFile(localPath)
  const base64 = fileData.toString('base64')
  const auth = Buffer.from(`${IMAGEKIT_PRIVATE}:`).toString('base64')

  const body = new FormData()
  body.append('file', `data:image/png;base64,${base64}`)
  body.append('fileName', fileName)
  body.append('folder', IMAGEKIT_FOLDER)
  body.append('useUniqueFileName', 'false')
  body.append('overwriteFile', 'true')

  const res = await fetch(IMAGEKIT_UPLOAD, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}` },
    body,
  })

  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  const { url } = await res.json()

  // Purge CDN cache so the new image is served immediately
  await fetch('https://api.imagekit.io/v1/files/purge', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  })

  return url
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await mkdir(TEMP_DIR, { recursive: true })

  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1280, height: 720 })

  // The dev-only devtools overlays (pufi/koko launcher buttons) are injected by
  // the root layout and would bleed into the corner of the shot. Block them.
  // (The branch badge is hidden by the capture page's own CSS.)
  await page.route('**/pufi.js', (r) => r.abort())
  await page.route('**/koko.js', (r) => r.abort())

  let ok = 0,
    fail = 0
  const results = []

  for (const slug of SLUGS) {
    const fileName = `${slug}.png`
    const localPath = path.join(TEMP_DIR, fileName)

    try {
      process.stdout.write(`  ${slug}... `)

      await page.goto(`${BASE_URL}/andromeda-capture/${slug}`, {
        waitUntil: 'load',
        timeout: 60_000,
      })
      await page.waitForSelector('[data-capture-ready]', { timeout: 30_000 })
      await page.waitForTimeout(SETTLE_MS)

      const frame = page.locator('[data-capture-frame]').first()

      if (INTERACTIONS[slug]) {
        await INTERACTIONS[slug](frame, page)
      }

      await frame.screenshot({ path: localPath })

      const url = await upload(localPath, fileName)
      console.log(`✓  ${url}`)
      results.push({ slug, url })
      ok++
    } catch (err) {
      console.log(`✗  ${err.message}`)
      results.push({ slug, error: err.message })
      fail++
    }
  }

  await browser.close()
  await rm(TEMP_DIR, { recursive: true, force: true })

  console.log(`\n${ok} uploaded, ${fail} failed → https://ik.imagekit.io/aitoolkit/andromeda/`)

  // Emit a slug→url map so the URLs can be wired straight into andromeda-meta.ts
  const map = Object.fromEntries(results.filter((r) => r.url).map((r) => [r.slug, r.url]))
  console.log('\nIMAGE_MAP_JSON=' + JSON.stringify(map))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
