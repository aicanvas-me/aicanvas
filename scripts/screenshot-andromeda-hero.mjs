/**
 * Shoot Andromeda Pro hero card art: one pose per component (poses.tsx in
 * app/andromeda-capture/[slug]/hero/), centered on the themed ground, in light
 * AND dark. Every shot is 1280×720 pixels; a pose's size comes from the
 * device scale factor, so portalled bubbles scale with it and stay sharp.
 *
 * Each pose is measured first (its painted ink, popups included), shifted so the
 * ink sits dead centre, and its scale capped so the ink stays inside SAFE: a grid
 * card that crops the art to 16:10 still shows the whole component with room on
 * every side. After each shot the ink is measured again and any tight or
 * off-centre shot is listed at the end.
 *
 * Local only: PNGs land in OUT_DIR as <slug>-<theme>.png, plus report.json.
 *
 * Usage: node scripts/screenshot-andromeda-hero.mjs [slug ...]   (no slug = all)
 * Env:   BASE_URL (default http://localhost:3001), OUT_DIR (default .screenshots-hero)
 */

import { chromium } from 'playwright'
import { mkdir, writeFile } from 'fs/promises'
import { readFileSync } from 'fs'
import path from 'path'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'
const OUT_DIR = path.resolve(process.env.OUT_DIR || '.screenshots-hero')
const W = 1280
const H = 720
const SETTLE_MS = 1800
// The ink box may fill at most this share of the frame.
const SAFE = { w: 0.8, h: 0.72 }
// A finished shot is flagged under these margins (px) or this far off centre.
const MIN_MARGIN = { x: 100, y: 70 }
const MAX_OFFSET = 40

// Preferred device scale: small controls zoom in; the fit can only lower it.
const DEFAULT_SCALE = 2.5
const SCALE = {
  button: 3,
  badge: 3.5,
  toggle: 3,
  tooltip: 3,
  avatar: 4,
  tag: 4,
  spinner: 4,
  'icon-button': 3.5,
  'nav-item': 3.5,
  suggestion: 3.5,
  // Shown as a framed screen (HeroFrame), so its scale is set, never fitted.
  drawer: 1.5,
  combobox: 2.6,
  'date-range-picker': 1.8,
}
const FIT_SKIP = new Set(['drawer'])

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
  drawer: async (page) => {
    await page.getByRole('button', { name: /open right/i }).click()
    await page.waitForTimeout(750)
  },
  popover: async (page) => {
    await page.locator('[data-capture-frame] button').first().click()
    await page.waitForTimeout(600)
  },
  cube: async (page) => {
    await page.waitForTimeout(1200)
  },
}

// The union of everything that paints, clipped by its overflow ancestors. The
// frame's own ground, full-viewport layers (scrims) and anything wholly off
// screen (text measurers) do not count as ink; a part-visible box does, so a
// cut-off component still reads as tight. Also returns the pose wrapper's box.
function measureInk() {
  const frame = document.querySelector('[data-capture-frame]')
  const vw = innerWidth
  const vh = innerHeight
  const clear = /^(transparent|rgba\(0, 0, 0, 0\))$/
  let L = Infinity, T = Infinity, R = -Infinity, B = -Infinity
  const clip = (el, r) => {
    let { left, top, right, bottom } = r
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a)
      if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue
      const c = a.getBoundingClientRect()
      left = Math.max(left, c.left); top = Math.max(top, c.top)
      right = Math.min(right, c.right); bottom = Math.min(bottom, c.bottom)
    }
    return { left, top, right, bottom }
  }
  const add = (el, r) => {
    const c = clip(el, r)
    if (c.right - c.left < 1 || c.bottom - c.top < 1) return
    if (c.right <= 0 || c.bottom <= 0 || c.left >= vw || c.top >= vh) return
    L = Math.min(L, c.left); T = Math.min(T, c.top); R = Math.max(R, c.right); B = Math.max(B, c.bottom)
  }
  for (const el of document.body.querySelectorAll('*')) {
    if (el === frame || /^(STYLE|SCRIPT|NOSCRIPT|TEMPLATE|LINK|META)$/.test(el.tagName)) continue
    if (el.closest('[data-dev-overlay],nextjs-portal')) continue
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue
    const r = el.getBoundingClientRect()
    if (r.width >= vw * 0.98 && r.height >= vh * 0.98) continue
    const cs = getComputedStyle(el)
    const tag = el.tagName.toLowerCase()
    const inSvg = tag !== 'svg' && el.closest('svg')
    const border = ['Top', 'Right', 'Bottom', 'Left'].some(
      (s) => parseFloat(cs[`border${s}Width`]) > 0 && !clear.test(cs[`border${s}Color`]),
    )
    const paints =
      /^(svg|img|canvas|video|input|textarea)$/.test(tag) ||
      !clear.test(cs.backgroundColor) || cs.backgroundImage !== 'none' || border
    if (paints && !inSvg) add(el, r)
    for (const n of el.childNodes) {
      if (n.nodeType !== 3 || !n.textContent.trim()) continue
      const range = document.createRange()
      range.selectNodeContents(n)
      add(el, range.getBoundingClientRect())
    }
  }
  const pose = frame.firstElementChild.getBoundingClientRect()
  return { L, T, R, B, vw, vh, pw: pose.width, ph: pose.height }
}

const META = readFileSync(path.resolve('app/_lib/andromeda-pro/andromeda-meta.ts'), 'utf8')
const ALL = [...META.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1])
const SLUGS = process.argv.slice(2).length ? process.argv.slice(2) : ALL

async function open(browser, slug, theme, s, shift = { dx: 0, dy: 0 }) {
  const context = await browser.newContext({
    viewport: { width: Math.round(W / s), height: Math.round(H / s) },
    deviceScaleFactor: s,
  })
  await context.addCookies([{ name: 'theme', value: theme, url: BASE_URL }])
  const page = await context.newPage()
  await page.route('**/pufi.js', (r) => r.abort())
  await page.route('**/koko.js', (r) => r.abort())
  await page.goto(`${BASE_URL}/andromeda-capture/${slug}/hero?scale=${s}&dx=${shift.dx}&dy=${shift.dy}`, { waitUntil: 'load', timeout: 90_000 })
  await page.waitForSelector('[data-capture-ready]', { timeout: 30_000 })
  await page.waitForTimeout(SETTLE_MS)
  if (INTERACTIONS[slug]) await INTERACTIONS[slug](page)
  return { context, page }
}

await mkdir(OUT_DIR, { recursive: true })
const browser = await chromium.launch()
const report = []

for (const slug of SLUGS) {
  try {
    // Probe at 1:1: centre the ink, and cap the preferred scale so the ink fits
    // SAFE and the pose's own box still fits the smaller viewport.
    const probe = await open(browser, slug, 'dark', 1)
    const ink = await probe.page.evaluate(measureInk)
    await probe.context.close()
    const fit = Math.min(
      (W * SAFE.w) / (ink.R - ink.L), (H * SAFE.h) / (ink.B - ink.T),
      (W * 0.98) / ink.pw, (H * 0.98) / ink.ph,
    )
    const pref = SCALE[slug] ?? DEFAULT_SCALE
    const s = Math.round((FIT_SKIP.has(slug) ? pref : Math.min(pref, fit)) * 100) / 100
    const shift = FIT_SKIP.has(slug)
      ? { dx: 0, dy: 0 }
      : { dx: Math.round(ink.vw / 2 - (ink.L + ink.R) / 2), dy: Math.round(ink.vh / 2 - (ink.T + ink.B) / 2) }

    for (const theme of ['dark', 'light']) {
      const { context, page } = await open(browser, slug, theme, s, shift)
      const m = await page.evaluate(measureInk)
      await page.screenshot({ path: path.join(OUT_DIR, `${slug}-${theme}.png`) })
      await context.close()
      const margin = {
        left: Math.round(m.L * s), right: Math.round((m.vw - m.R) * s),
        top: Math.round(m.T * s), bottom: Math.round((m.vh - m.B) * s),
      }
      const issues = []
      if (Math.min(margin.left, margin.right) < MIN_MARGIN.x) issues.push('tight x')
      if (Math.min(margin.top, margin.bottom) < MIN_MARGIN.y) issues.push('tight y')
      if (Math.abs(margin.left - margin.right) / 2 > MAX_OFFSET) issues.push('off-centre x')
      if (Math.abs(margin.top - margin.bottom) / 2 > MAX_OFFSET) issues.push('off-centre y')
      report.push({ slug, theme, scale: s, shift, margin, issues })
      console.log(`${issues.length ? '!' : '✓'} ${slug} ${theme} @${s} ${JSON.stringify(margin)} ${issues.join(', ')}`)
    }
  } catch (err) {
    report.push({ slug, error: err.message.split('\n')[0] })
    console.log(`✗ ${slug}: ${err.message.split('\n')[0]}`)
  }
}

await browser.close()
await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
const flagged = report.filter((r) => r.error || r.issues?.length)
console.log(`\n${report.filter((r) => !r.error).length} shots, ${flagged.length} flagged → ${OUT_DIR}`)
