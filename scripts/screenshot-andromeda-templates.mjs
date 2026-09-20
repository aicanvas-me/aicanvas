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
 *        ...mjs andromeda-pro/signal-room   — one, in one system only
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

// `system` picks the route family, `file` is the base name the shot is uploaded
// under, before the theme suffix. Both are spelled out for every template,
// because the two systems name their art differently: Pro carries a `_pro`
// tail, Legacy does not. Four templates exist in both systems and are shot
// twice, once per system. Sign In is Pro-only; there is no Legacy route.
//
// NEVER put a space in one of these names. ImageKit rewrites a space to an
// underscore on upload, so the file would land under a name no art map spells,
// and every card using it would 404. Legacy's ORIGINAL art does have spaces
// (`Mission control.png`) because it was uploaded by hand, not through here.
const TEMPLATES = [
  { slug: 'mission-control', file: 'Mission_control.png' },
  { slug: 'service-order', file: 'Service_order.png' },
  { slug: 'resource-planning', file: 'Resource_planning.png' },
  { slug: 'signal-room', file: 'Signal_Room.png' },
  { slug: 'city-operations', system: 'andromeda-pro', file: 'City_operations_pro.png' },
  { slug: 'sign-in', system: 'andromeda-pro', file: 'Sign_in_pro.png' },
  { slug: 'signal-room', system: 'andromeda-pro', file: 'Signal_Room_pro.png' },
  { slug: 'mission-control', system: 'andromeda-pro', file: 'Mission_control_pro.png' },
  { slug: 'service-order', system: 'andromeda-pro', file: 'Service_order_pro.png' },
  { slug: 'resource-planning', system: 'andromeda-pro', file: 'Resource_planning_pro.png' },
]

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const arg = args.find((a) => !a.startsWith('--'))
// A bare slug shoots that template in EVERY system that has it; `<system>/<slug>`
// narrows it to one, for when only one system's art needs redoing.
const LIST = arg
  ? TEMPLATES.filter((t) => t.slug === arg || `${t.system ?? 'andromeda'}/${t.slug}` === arg)
  : TEMPLATES

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
// The mat is an Andromeda neutral read in the shot's OWN theme, so it always
// opposes the screenshot: dark-grey behind a near-black shot, light-grey behind
// a near-white one. The two steps were chosen by eye and do NOT match, because
// the themes do not need the same push: a near-black shot separates on 600,
// while a near-white one needs 800 before the edge reads. One pair for every
// poster, Pro and Legacy alike — the posters sit side by side in the same grid,
// so a mat that changed per system would read as an accident. Literal values,
// because a baked PNG cannot carry a token.
const THEMES = [
  { theme: 'dark', suffix: '_dark', mat: 'oklch(0.320 0.002 286.2)' }, // dark neutral 600
  { theme: 'light', suffix: '_light', mat: 'oklch(0.785 0.002 286.2)' }, // light neutral 800
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
        process.stdout.write(`  ${t.system ?? 'andromeda'}/${t.slug} (${theme})... `)
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
