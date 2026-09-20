/**
 * Shoot the Andromeda TEMPLATE posters and upload them to ImageKit under
 * `andromeda/templates/`.
 *
 * Every template is shot twice, once per theme, and each shot is laid on a mat
 * (see THEMES for the colour and why). The poster is a 1920×1080 canvas; the
 * shot fills that size
 * and sits 100px in from the top-left, so it bleeds off the right and bottom
 * edges. Each poster carries its theme before the extension, `_dark` or
 * `_light`. An upload overwrites a file of the same name, so neither one ever
 * lands on the name an older, single-theme poster is still served from.
 *
 * The floating TemplateChrome toolbar (Back / name / Install) is hidden so
 * only the dashboard shows. Template routes work in dev OR prod (no
 * capture-route guard), and prod has no dev overlays — so the default
 * localhost:3001 is fine.
 *
 * Usage: node scripts/screenshot-andromeda-templates.mjs            — every one
 *        node scripts/screenshot-andromeda-templates.mjs <slug>     — one
 *        add --dry to keep the posters in .screenshots-tmp-templates/ and
 *        upload nothing
 */

import { chromium } from 'playwright'
import { mkdir, rm, writeFile } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { uploadToImageKit } from './lib/imagekit.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))


// Secrets come from .env.local when present; variables already in the
// environment win, the same precedence as before.
try {
  process.loadEnvFile('.env.local')
} catch {}

// `system` picks the route family, `file` is the name the shot is uploaded
// under. Both default to the Legacy route and the bare `<slug>.png` the first
// four have always used, so those four keep the exact URLs already in the art
// maps. A Pro-only template has no Legacy route to shoot and carries the
// `_pro` filename its own maps expect.
const TEMPLATES = [
  { slug: 'mission-control' },
  { slug: 'service-order' },
  { slug: 'resource-planning' },
  { slug: 'signal-room' },
  { slug: 'city-operations', system: 'andromeda-pro', file: 'City_operations_pro.png' },
  { slug: 'sign-in', system: 'andromeda-pro', file: 'Sign_in_pro.png' },
]

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const arg = args.find((a) => !a.startsWith('--'))
const LIST = arg ? TEMPLATES.filter((t) => t.slug === arg) : TEMPLATES

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'
const IMAGEKIT_PRIVATE = process.env.IMAGEKIT_PRIVATE_KEY
if (!IMAGEKIT_PRIVATE && !DRY) {
  console.error('Missing IMAGEKIT_PRIVATE_KEY. Add it to .env.local.')
  process.exit(1)
}
const IMAGEKIT_FOLDER = '/andromeda/templates'
const TEMP_DIR = path.join(__dirname, '../.screenshots-tmp-templates')
const VIEWPORT = { width: 1600, height: 900 } // the width the templates lay out in
const CANVAS = { width: 1920, height: 1080 } // the poster
// The shot renders at the canvas size exactly, so nothing is resampled.
const SCALE = CANVAS.width / VIEWPORT.width
const OFFSET = 100 // how far the shot sits in from the top-left of the canvas
const SETTLE_MS = 3000 // let charts reveal + animations settle
const PAINT_MS = 3000 // a map's last tiles are in, give it time to draw them
// The site reads the `theme` cookie server-side, so the cookie alone picks the
// theme of a shot.
//
// The mat is Andromeda's neutral 600 read in the shot's OWN theme: the dark
// ladder's 600 behind a dark shot, the light ladder's 600 behind a light one.
// That is one rule, not two colours. The ladder already inverts with the theme,
// so a single step lands dark-grey on a near-black screenshot and light-grey on
// a near-white one, and the mat opposes its shot in both without ever being
// told to. One pair for every poster, Pro and Legacy alike — the posters sit
// side by side in the same grid, so a mat that changed per system would read as
// an accident. Literal values, because a baked PNG cannot carry a token.
const THEMES = [
  { theme: 'dark', suffix: '_dark', mat: 'oklch(0.320 0.002 286.2)' },
  { theme: 'light', suffix: '_light', mat: 'oklch(0.874 0.002 286.2)' },
]

// Lay a shot on its mat: a second, empty page the size of the poster, the mat
// as its background and the shot as an image pushed in from the top-left.
async function matPoster(browser, shot, mat, localPath) {
  const context = await browser.newContext({ viewport: CANVAS, deviceScaleFactor: 1 })
  const page = await context.newPage()
  await page.setContent(
    `<body style="margin:0;overflow:hidden;background:${mat}">` +
      `<img src="data:image/png;base64,${shot.toString('base64')}" style="position:absolute;` +
      `left:${OFFSET}px;top:${OFFSET}px;width:${CANVAS.width}px;height:${CANVAS.height}px"></body>`,
    { waitUntil: 'load' },
  )
  await writeFile(localPath, await page.screenshot({ type: 'png' }))
  await context.close()
}

async function main() {
  await mkdir(TEMP_DIR, { recursive: true })

  const browser = await chromium.launch()

  let ok = 0,
    fail = 0

  for (const { theme, suffix, mat } of THEMES) {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: SCALE,
    })
    await context.addCookies([{ name: 'theme', value: theme, url: BASE_URL }])
    const page = await context.newPage()

    // Block the dev-only devtools overlays (pufi/koko launcher buttons) so they
    // can't bleed into the shot when the server is in dev mode.
    await page.route('**/pufi.js', (r) => r.abort())
    await page.route('**/koko.js', (r) => r.abort())

    for (const t of LIST) {
      const fileName = (t.file ?? `${t.slug}.png`).replace(/\.png$/, `${suffix}.png`)
      const localPath = path.join(TEMP_DIR, fileName)
      try {
        process.stdout.write(`  ${t.slug} (${theme})... `)
        await page.goto(
          // `frame=1` is the shell's own bare-payload mode, the one the mobile
          // preview iframe uses: the template renders with no top bar at all,
          // which is a cleaner shot than hiding the bar after the fact.
          `${BASE_URL}/design-systems/${t.system ?? 'andromeda'}/templates/${t.slug}?frame=1`,
          { waitUntil: 'load', timeout: 60_000 },
        )
        await page.waitForTimeout(SETTLE_MS)
        // A map asks for its tiles only once it has booted, and in light it
        // draws twice (the dark style first, then the repaint). So the quiet
        // network is waited for AFTER the settle, then one beat for the paint.
        await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})
        await page.waitForTimeout(PAINT_MS)
        // Hide the floating template toolbar (Back / name / Install) and the
        // dev branch badge so the shot is just the dashboard.
        await page.addStyleTag({
          content:
            '[role="toolbar"][aria-label$="actions"]{display:none!important}' +
            '[data-dev-overlay],.fixed.bottom-2.left-2{display:none!important}' +
            'nextjs-portal{display:none!important}',
        })
        await page.waitForTimeout(200)
        await matPoster(browser, await page.screenshot({ type: 'png' }), mat, localPath)
        if (DRY) {
          console.log(`✓  ${localPath}`)
        } else {
          const url = await uploadToImageKit({
            localPath,
            fileName,
            privateKey: IMAGEKIT_PRIVATE,
            folder: IMAGEKIT_FOLDER,
          })
          console.log(`✓  ${url}`)
        }
        ok++
      } catch (err) {
        console.log(`✗  ${err.message}`)
        fail++
      }
    }
    await context.close()
  }

  await browser.close()
  if (DRY) {
    console.log(`\n${ok} shot, ${fail} failed, nothing uploaded → ${TEMP_DIR}`)
    return
  }
  await rm(TEMP_DIR, { recursive: true, force: true })

  console.log(`\n${ok} uploaded, ${fail} failed → https://ik.imagekit.io/aitoolkit/andromeda/templates/`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
