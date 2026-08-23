/**
 * Capture component screenshots and upload them to ImageKit.
 * Usage: npm run screenshot            — all components
 *        npm run screenshot -- <slug>  — single component
 *
 * Requires dev server running at localhost:3000
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

// ─── Config ───────────────────────────────────────────────────────────────────

const ALL_SLUGS = [
  'wave-lines',
  'distortion-grid',
  'grid-lines',
  'bubble-field',
  'noise-bg',
  'pill-toggle',
  'mark-toggle',
  'taga-toggle',
  'blind-pull-toggle',
  'x-grid',
  'radial-toolbar',
  'dot-grid',
  'charging-widget',
  'runway-loader',
  'flip-calendar',
  'glitch-button',
  'traveldeck',
  'text-blur-reveal',
  'particle-sphere',
  'polaroid-stack',
  'text-layout',
  'sphere-lines',
  'magnetic-dots',
  'elastic-string',
  'breathing-blob',
  'particle-constellation',
  'scramble-text',
  'neon-clock',
  'torus-knot',
  'noise-field',
  'glass-notification',
  'glass-toggle',
  'glass-music-player',
  'emoji-burst',
  'glass-navbar',
  'glass-tags',
  'glass-card',
  'glass-sidebar',
  'glass-toast',
  'glass-search-bar',
  'glass-tab-bar',
  'glass-modal',
  'glass-dock',
  'glass-slider',
  'glass-user-menu',
  'glass-stepper',
  'glass-progress',
  'glass-ai-compose',
  'andromeda-button',
  'meet-the-crew',
  'ai-job-cards',
  'task-cards',
  'danger-stripes',
  'sticker-wall',
  'peel-corner-reveal',
  'jar-of-emotions',
  'responsive-letters',
  'good-vibes',
  'playful',
  'wild-morph',
  'orbit',
  'halo-type',
  'slice-type',
  'stack-tower',
  'ripple-type',
  'radial-cards',
  'new-project-modal',
  'signature-pad',
  'tilted-coverflow',
  'crypto-swap',
  'mood-tracker',
  'delete-button',
  'expanding-tabs',
  'diamond-grid',
]

const arg   = process.argv[2]
const SLUGS = arg ? [arg] : ALL_SLUGS

const BASE_URL         = process.env.BASE_URL || 'http://localhost:3000'
const IMAGEKIT_PRIVATE = process.env.IMAGEKIT_PRIVATE_KEY
if (!IMAGEKIT_PRIVATE) {
  console.error('Missing IMAGEKIT_PRIVATE_KEY. Add it to .env.local (private_… key from the ImageKit dashboard).')
  process.exit(1)
}
const IMAGEKIT_UPLOAD  = 'https://upload.imagekit.io/api/v1/files/upload'
const TEMP_DIR         = path.join(__dirname, '../.screenshots-tmp')
const SETTLE_MS        = 2500

// ─── Per-component interactions ───────────────────────────────────────────────
// Called after the page settles, before the screenshot.
// `preview` is the Playwright Locator for [data-card-theme].

const INTERACTIONS = {
  // Scroll Wipe Gallery — framed block. The box loads the block in an iframe of
  // its own now, so the wait is for a second document to boot and its photos to
  // arrive, not for a poster to hand over. Deliberately no hover: the pointer
  // anywhere on the box raises the "Click for full view" pill, and it bakes
  // straight into the shot.
  'scroll-wipe-gallery': async (preview, page) => {
    await page.waitForTimeout(3400)
  },

  // 3D Product Card — wait for the .glb to load + reveal in, then hover the
  // centre so the card tilts to its display floor and the product lifts.
  '3d-product-card': async (preview, page) => {
    await page.waitForTimeout(1800)
    const box = await preview.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(900)
  },

  // Toggles — click once to put them in the ON state
  'pill-toggle':       async (preview) => {
    await preview.locator('button').first().click()
    await preview.page().waitForTimeout(600)
  },
  'mark-toggle':       async (preview) => {
    await preview.locator('button').first().click()
    await preview.page().waitForTimeout(600)
  },
  'taga-toggle':       async (preview) => {
    await preview.locator('button').first().click()
    await preview.page().waitForTimeout(600)
  },
  'blind-pull-toggle': async (preview) => {
    await preview.locator('button').first().click()
    await preview.page().waitForTimeout(600)
  },

  // Grids — move mouse to centre to trigger the hover glow / warp
  'wave-lines':   hoverCenter,
  // Grid Lines — hover off-centre so the lens warp's bend is visible (centre = symmetric)
  'grid-lines':   async (preview, page) => {
    const box = await preview.boundingBox()
    await page.mouse.move(box.x + box.width * 0.62, box.y + box.height * 0.42)
    await page.waitForTimeout(900)
  },
  'bubble-field': hoverCenter,
  'noise-bg':     hoverCenter,
  'x-grid':       hoverCenter,
  'dot-grid':     hoverCenter,
  'distortion-grid':    hoverCenter,
  'sphere-lines': hoverCenter,

  // Button — hover to trigger the glitch effect
  'glitch-button': async (preview, page) => {
    const box = await preview.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(400)
  },

  // Polaroid stack — click to fan the cards out
  'polaroid-stack': async (preview) => {
    await preview.locator('div[style]').first().click()
    await preview.page().waitForTimeout(700)
  },

  // Text Blur Reveal — wait for CTA button to appear (1300ms) + extra settle
  'text-blur-reveal': async (preview, page) => {
    await page.waitForTimeout(1800)
  },

  // Travel deck — hover over the middle card to lift it
  'traveldeck': async (preview, page) => {
    const box = await preview.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(400)
  },

  // New components — hover center to show active state
  'magnetic-dots':          hoverCenter,
  'elastic-string':         hoverCenter,
  'breathing-blob':         hoverCenter,
  'particle-constellation': hoverCenter,
  'torus-knot':             hoverCenter,
  'noise-field':            hoverCenter,

  // Scramble text — hover to trigger decryption in progress
  'scramble-text': async (preview, page) => {
    const box = await preview.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(200)
  },

  // Neon clock — hover to intensify glow
  'neon-clock': async (preview, page) => {
    const box = await preview.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(500)
  },

  // Glass toggle — no interaction needed, default states look good
  'glass-toggle': async (preview) => {
    await preview.page().waitForTimeout(400)
  },

  // Glass music player — click play then wait for vinyl to spin
  'glass-music-player': async (preview) => {
    await preview.page().waitForTimeout(800)
    await preview.locator('button').nth(3).click() // play button
    await preview.page().waitForTimeout(600)
  },

  // Glass navbar — hover over a nav item to show liquid pill
  'glass-navbar': async (preview, page) => {
    await preview.page().waitForTimeout(600)
    const btn = preview.locator('button').nth(1)
    const box = await btn.boundingBox()
    if (box) await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await preview.page().waitForTimeout(400)
  },

  // Glass tags — hover center to show glowing state
  'glass-tags': hoverCenter,

  // Glass card — hover center to trigger 3D tilt and glare
  'glass-card': hoverCenter,

  // Emoji burst — click once to show mid-burst
  'emoji-burst': async (preview) => {
    await preview.page().waitForTimeout(400)
    await preview.locator('button').first().click()
    await preview.page().waitForTimeout(180)
  },

  // Glass toast — click a trigger button to show a toast
  'glass-toast': async (preview, page) => {
    await preview.page().waitForTimeout(400)
    await preview.locator('button').first().click()
    await preview.page().waitForTimeout(800)
  },

  // Glass search bar — click to activate and show the dropdown
  'glass-search-bar': async (preview, page) => {
    await preview.page().waitForTimeout(400)
    const input = preview.locator('input').first()
    await input.click()
    await preview.page().waitForTimeout(800)
  },

  // Glass AI Compose — click textarea to activate glow
  'glass-ai-compose': async (preview, page) => {
    await preview.page().waitForTimeout(400)
    const textarea = preview.locator('textarea').first()
    await textarea.click()
    await preview.page().waitForTimeout(600)
  },

  // Glass sidebar — click the toggle button to expand the sidebar
  'glass-sidebar': async (preview, page) => {
    // Click the toggle button to expand the sidebar
    await page.click('button[aria-label="Expand sidebar"]')
    await page.waitForTimeout(600) // wait for spring animation to settle
  },

  // Task Cards — wait for progress bar animation then hover the front card
  'task-cards': async (preview, page) => {
    await preview.page().waitForTimeout(1800) // let progress bar count up
    const box = await preview.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await preview.page().waitForTimeout(300)
  },

  // AI Job Cards — hover the front card of the first stack to lift it
  'ai-job-cards': async (preview, page) => {
    await preview.page().waitForTimeout(600)
    const box = await preview.boundingBox()
    // Hover over the front card in the first column (left third)
    await page.mouse.move(box.x + box.width * 0.17, box.y + box.height * 0.45)
    await preview.page().waitForTimeout(400)
  },

  // Danger Stripes — hover over the middle stripe to trigger jitter
  'danger-stripes': async (preview, page) => {
    const box = await preview.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.47)
    await preview.page().waitForTimeout(300)
  },

  // Sticker Wall — let the physics simulation settle so stickers form a natural pile
  'sticker-wall': async (preview) => {
    await preview.page().waitForTimeout(3500)
  },

  // Jar of Emotions — wait for physics to settle, then click a couple of buttons
  'jar-of-emotions': async (preview, page) => {
    await preview.page().waitForTimeout(2000)
    const box = await preview.boundingBox()
    // Click the first button (roughly left side of button row, near bottom)
    await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.88)
    await preview.page().waitForTimeout(400)
    await page.mouse.click(box.x + box.width * 0.55, box.y + box.height * 0.88)
    await preview.page().waitForTimeout(800)
  },

  // Good Vibes — hover center to show letters becoming bold and scaled
  'good-vibes': hoverCenter,

  // Playful — hover center to show letters jumping, dropping, and rotating
  'playful': hoverCenter,

  // Stack Tower — hover a central row so the orange accent + scale pop is captured
  'stack-tower': async (preview, page) => {
    const box = await preview.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(500) // wait for hover accent to ease in
  },

  // Slice Type — catch mid-reveal: words partially open, bg mid-inversion
  'slice-type': async (preview, page) => {
    const box = await preview.boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.waitForTimeout(420) // ~half-way through the spring
  },

  // Ripple Type — click the fan to toggle ON, wait for ramp-up + a few morph cycles
  'ripple-type': async (preview, page) => {
    await preview.locator('[aria-label="Toggle fan"]').first().click()
    await page.waitForTimeout(1400) // 1s ramp + 0.4s of peak-amplitude morph
  },
  'radial-cards': async (preview, page) => {
    // Let the bouquet rotate for a moment, then click the first card (Steps)
    await page.waitForTimeout(1200)
    const cards = preview.locator('[style*="transformOrigin: \\"0% 100%\\""]')
    const first = cards.first()
    if (await first.count() > 0) {
      await first.click()
      await page.waitForTimeout(900) // wait for engage spring to settle
    }
  },

  // New Project Modal — click the pill to open the modal so the screenshot
  // shows the full feature (inputs, swatches, Private toggle, Create button).
  // The modal is fixed-positioned to the viewport so it overlays the preview.
  'new-project-modal': async (preview, page) => {
    await preview.locator('button').first().click()
    await page.waitForTimeout(700) // let the morph spring settle
  },

  // Delete Button — click the default pill to morph into the "Cancel
  // Deletion" countdown pill, then capture quickly (well under the 5s
  // countdown / 2.8s auto-reset) so the shot shows the undo + countdown
  // state, not the plain idle red button.
  'delete-button': async (preview, page) => {
    await preview.locator('button').first().click()
    await page.waitForTimeout(500) // let the morph spring settle, still mid-countdown
  },

  // Signature Pad — click pill to open modal, then draw a signature on canvas
  // so the screenshot shows the whole feature in its filled state. The modal
  // is taller than new-project-modal, so center the preview in the viewport
  // first — otherwise the fixed-position modal escapes the preview's bounds.
  'signature-pad': async (preview, page) => {
    await preview.evaluate((el) => el.scrollIntoView({ block: 'center' }))
    await page.waitForTimeout(250)
    await preview.locator('button').first().click()
    await page.waitForTimeout(700)

    const canvas = preview.locator('canvas').first()
    const box = await canvas.boundingBox()
    if (!box) return

    const startX = box.x + box.width * 0.28
    const baseY = box.y + box.height * 0.6

    await page.mouse.move(startX, baseY)
    await page.mouse.down()
    const steps = 36
    for (let i = 1; i <= steps; i++) {
      const t = i / steps
      const x = startX + box.width * 0.46 * t
      const y =
        baseY +
        Math.sin(t * Math.PI * 3.2) * 14 -
        t * 6 +
        Math.sin(t * Math.PI * 9) * 2
      await page.mouse.move(x, y, { steps: 4 })
    }
    await page.mouse.up()
    await page.waitForTimeout(350)
  },

  // Expanding Tabs — default state is just Inbox active, which reads like a
  // static pill. Click the Calendar tab so the shot shows the morph feature
  // itself: an expanded icon+label pill next to a collapsed icon-only circle.
  'expanding-tabs': async (preview) => {
    await preview.locator('button').nth(1).click()
    await preview.page().waitForTimeout(600) // let the spring morph settle
  },

  // Diamond Grid — not an interaction, a timing wait. Nothing here answers the
  // pointer. It runs a 64s loop and only reaches its ~15-concurrent steady
  // state long after SETTLE_MS, so a plain shot lands ~2.5s into a cold loop
  // with one or two sparks barely off the origin. Wait out the rest of the
  // component's own STATIC_TIME_MS, the frame its author picked as
  // representative and the one reduced-motion users are served.
  'diamond-grid': async (preview, page) => {
    await page.waitForTimeout(27000 - SETTLE_MS)
  },

  // Magnetic Logo Cluster — the pack's own entry (150 icons * 12ms stagger +
  // spring settle) finishes at ~2700ms, so a plain SETTLE_MS shot lands mid
  // fly-in at best and never reaches the scripted "ghost cursor" sweep that
  // starts 400ms later and demonstrates the actual magnet/curl interaction.
  // Wait past entry + into the sweep's midpoint, where the invisible cursor
  // is near center and the most icons are visibly bent and trailing.
  'magnetic-logo-cluster': async (preview, page) => {
    await page.waitForTimeout(3900 - SETTLE_MS)
  },

  // Fluid Simulation Hero — a timing wait, not an interaction. The arrival
  // ignites the fluid from a point and blooms it into the resting composition
  // over intro.duration = 2.4s, while the type staggers in until ~1.72s (last
  // delay ~1.1s + 620ms fade). SETTLE_MS alone fires mid-bloom and bakes a
  // half-formed surface into the card, so wait out the full bloom plus a
  // margin for the mass to settle into its steady filament-rich state. If
  // intro.duration changes, change this number with it.
  // Deliberately no hover: the hero hides the system cursor and draws its own
  // lens wherever the pointer is, so any pointer position bakes the lens in.
  'fluid-simulation-hero': async (preview, page) => {
    await page.waitForTimeout(5600 - SETTLE_MS)
  },
}

async function hoverCenter(preview, page) {
  const box = await preview.boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.waitForTimeout(800)
}

// ─── ImageKit upload ──────────────────────────────────────────────────────────

async function upload(localPath, fileName) {
  const fileData = await readFile(localPath)
  const base64   = fileData.toString('base64')
  const auth     = Buffer.from(`${IMAGEKIT_PRIVATE}:`).toString('base64')

  const body = new FormData()
  body.append('file', `data:image/png;base64,${base64}`)
  body.append('fileName', fileName)
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
  const page    = await browser.newPage()
  await page.setViewportSize({ width: 1440, height: 900 })

  let ok = 0, fail = 0

  for (const slug of SLUGS) {
    const fileName  = `${slug}.png`
    const localPath = path.join(TEMP_DIR, fileName)

    try {
      process.stdout.write(`  ${slug}... `)

      await page.goto(`${BASE_URL}/components/${slug}`, {
        waitUntil: 'load',
        timeout: 60_000,
      })
      // Dev-only chrome pinned to the viewport lands INSIDE the preview box we
      // crop, so it bakes into the corner of the card. Two of them: the branch
      // pill (which carries data-dev-overlay for this) and Next's own dev-tools
      // button. Framed block previews load a route of this same site in an
      // iframe, so the badge renders a second time in there and the iframe is
      // what we are shooting. Dev is the only thing we ever shoot, so this can
      // never be a production concern, only a poster one.
      const hideDevChrome = '[data-dev-overlay], nextjs-portal { display: none !important }'
      await page.addStyleTag({ content: hideDevChrome })
      page.on('frameattached', async (f) => {
        try { await f.addStyleTag({ content: hideDevChrome }) } catch {}
      })
      for (const f of page.frames()) {
        if (f !== page.mainFrame()) {
          try { await f.addStyleTag({ content: hideDevChrome }) } catch {}
        }
      }
      await page.waitForTimeout(SETTLE_MS)

      const preview = page.locator('[data-card-theme]').first()

      // Run any component-specific interaction before shooting
      if (INTERACTIONS[slug]) {
        await INTERACTIONS[slug](preview, page)
      }

      await preview.screenshot({ path: localPath })

      const url = await upload(localPath, fileName)
      console.log(`✓  ${url}`)
      ok++
    } catch (err) {
      console.log(`✗  ${err.message}`)
      fail++
    }
  }

  await browser.close()
  await rm(TEMP_DIR, { recursive: true, force: true })

  console.log(`\n${ok} uploaded, ${fail} failed → https://ik.imagekit.io/aitoolkit/`)
}

main().catch((err) => { console.error(err); process.exit(1) })
