/**
 * Capture the four Andromeda TEMPLATE dashboards (clean, full-resolution,
 * lossless) and upload them to ImageKit under `andromeda/templates/`.
 *
 * These are raw source shots — NOT wired into any card and NOT served through
 * an ImageKit transform, so the base URL is the uncompressed original.
 *
 * Captured at 2× for a crisp source you can edit. The floating TemplateChrome
 * toolbar (Back / name / Install) is hidden so only the dashboard shows.
 * Template routes work in dev OR prod (no capture-route guard), and prod has no
 * dev overlays — so the default localhost:3001 is fine.
 *
 * Usage: node scripts/screenshot-andromeda-templates.mjs            — all four
 *        node scripts/screenshot-andromeda-templates.mjs <slug>     — one
 */

import { chromium } from 'playwright'
import { mkdir, readFile, rm } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))


// Secrets come from .env.local when present; variables already in the
// environment win, the same precedence as before.
try {
  process.loadEnvFile('.env.local')
} catch {}

const TEMPLATES = [
  { slug: 'mission-control' },
  { slug: 'service-order' },
  { slug: 'resource-planning' },
  { slug: 'signal-room' },
]

const arg = process.argv[2]
const LIST = arg ? TEMPLATES.filter((t) => t.slug === arg) : TEMPLATES

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'
const IMAGEKIT_PRIVATE = process.env.IMAGEKIT_PRIVATE_KEY
if (!IMAGEKIT_PRIVATE) {
  console.error('Missing IMAGEKIT_PRIVATE_KEY. Add it to .env.local.')
  process.exit(1)
}
const IMAGEKIT_UPLOAD = 'https://upload.imagekit.io/api/v1/files/upload'
const IMAGEKIT_FOLDER = '/andromeda/templates'
const TEMP_DIR = path.join(__dirname, '../.screenshots-tmp-templates')
const VIEWPORT = { width: 1600, height: 900 }
const SCALE = 2 // 2× → 3200×1800 lossless PNG
const SETTLE_MS = 3000 // let charts reveal + animations settle

// Upload the raw PNG. No transform params, so the base URL serves the
// uncompressed original.
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

  await fetch('https://api.imagekit.io/v1/files/purge', {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  return url
}

async function main() {
  await mkdir(TEMP_DIR, { recursive: true })

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
  })
  const page = await context.newPage()

  // Block the dev-only devtools overlays (pufi/koko launcher buttons) so they
  // can't bleed into the shot when the server is in dev mode.
  await page.route('**/pufi.js', (r) => r.abort())
  await page.route('**/koko.js', (r) => r.abort())

  let ok = 0,
    fail = 0
  const results = []

  for (const t of LIST) {
    const fileName = `${t.slug}.png`
    const localPath = path.join(TEMP_DIR, fileName)
    try {
      process.stdout.write(`  ${t.slug}... `)
      await page.goto(
        `${BASE_URL}/design-systems/andromeda/templates/${t.slug}`,
        { waitUntil: 'load', timeout: 60_000 },
      )
      await page.waitForTimeout(SETTLE_MS)
      // Hide the floating template toolbar (Back / name / Install) and the
      // dev branch badge so the shot is just the dashboard.
      await page.addStyleTag({
        content:
          '[role="toolbar"][aria-label$="actions"]{display:none!important}' +
          '[data-dev-overlay],.fixed.bottom-2.left-2{display:none!important}' +
          'nextjs-portal{display:none!important}',
      })
      await page.waitForTimeout(200)
      await page.screenshot({ path: localPath, type: 'png' })
      const url = await upload(localPath, fileName)
      console.log(`✓  ${url}`)
      results.push({ slug: t.slug, url })
      ok++
    } catch (err) {
      console.log(`✗  ${err.message}`)
      fail++
    }
  }

  await browser.close()
  await rm(TEMP_DIR, { recursive: true, force: true })

  console.log(`\n${ok} uploaded, ${fail} failed → https://ik.imagekit.io/aitoolkit/andromeda/templates/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
