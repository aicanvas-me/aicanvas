/**
 * Shoot Andromeda Pro hero card art: one pose per component (poses.tsx in
 * app/andromeda-capture/[slug]/hero/), centered on the themed ground, in light
 * AND dark. Every shot is 1280×720 pixels; a pose's size comes from the
 * device scale factor below, so portalled bubbles scale with it and stay sharp.
 *
 * Local only: PNGs land in OUT_DIR as <slug>-<theme>.png. Nothing is uploaded.
 *
 * Usage: node scripts/screenshot-andromeda-hero.mjs [slug ...]
 * Env:   BASE_URL (default http://localhost:3001), OUT_DIR (default .screenshots-hero)
 */

import { chromium } from 'playwright'
import { mkdir } from 'fs/promises'
import path from 'path'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'
const OUT_DIR = path.resolve(process.env.OUT_DIR || '.screenshots-hero')
const W = 1280
const H = 720
const SETTLE_MS = 1200

// Device scale per pose: small controls zoom in, open panels zoom less to fit.
const DEFAULT_SCALE = 2.5
const SCALE = {
  button: 3,
  badge: 3.5,
  toggle: 3,
  tooltip: 3,
  combobox: 2.6,
  'date-range-picker': 1.8,
}

// Open-on-capture steps, run after the frame reports ready. Panels with a
// static-open prop use it in poses.tsx instead.
const INTERACTIONS = {
  combobox: async (page) => {
    await page.locator('[data-capture-frame] input').first().click()
    await page.keyboard.type('a')
    await page.waitForTimeout(450)
  },
  tooltip: async (page) => {
    await page.locator('[data-capture-frame] button').first().hover()
    await page.waitForTimeout(450)
  },
}

const SLUGS = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ['button', 'combobox', 'toggle', 'checkbox', 'slider', 'tooltip', 'badge', 'input', 'gauge', 'date-range-picker']

await mkdir(OUT_DIR, { recursive: true })
const browser = await chromium.launch()
let ok = 0

for (const slug of SLUGS) {
  const s = SCALE[slug] ?? DEFAULT_SCALE
  for (const theme of ['dark', 'light']) {
    const context = await browser.newContext({
      viewport: { width: Math.round(W / s), height: Math.round(H / s) },
      deviceScaleFactor: s,
      reducedMotion: 'reduce',
    })
    await context.addCookies([{ name: 'theme', value: theme, url: BASE_URL }])
    const page = await context.newPage()
    await page.route('**/pufi.js', (r) => r.abort())
    await page.route('**/koko.js', (r) => r.abort())
    const file = path.join(OUT_DIR, `${slug}-${theme}.png`)
    try {
      await page.goto(`${BASE_URL}/andromeda-capture/${slug}/hero?scale=${s}`, { waitUntil: 'load', timeout: 90_000 })
      await page.waitForSelector('[data-capture-ready]', { timeout: 30_000 })
      await page.waitForTimeout(SETTLE_MS)
      if (INTERACTIONS[slug]) await INTERACTIONS[slug](page)
      await page.screenshot({ path: file })
      console.log(`✓ ${slug} ${theme}`)
      ok++
    } catch (err) {
      console.log(`✗ ${slug} ${theme}: ${err.message.split('\n')[0]}`)
    }
    await context.close()
  }
}

await browser.close()
console.log(`\n${ok} of ${SLUGS.length * 2} shots → ${OUT_DIR}`)
