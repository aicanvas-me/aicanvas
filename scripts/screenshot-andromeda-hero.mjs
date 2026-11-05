/**
 * Shoot Andromeda hero card art: one pose per component, centered on the themed
 * ground, in light AND dark. Pro poses live in poses.tsx under
 * app/andromeda-capture/[slug]/hero/, Legacy poses in legacy-poses.tsx under
 * .../legacy/ (SYSTEM=legacy). Every shot is 1280×720 pixels; a pose's size comes from the
 * device scale factor, so portalled bubbles scale with it and stay sharp.
 *
 * Each pose is measured first (the pixels it paints, popups included), shifted so
 * that ink sits dead centre, and its scale capped so it stays inside SAFE: a grid
 * card that crops the art to 16:10 still shows the whole component with room on
 * every side. After each shot the pixels are measured again; a shot that is
 * tight, off centre, empty, small, or a different size in light and dark is
 * flagged, so only flagged shots and the contact sheets need a human look.
 *
 * Local only: PNGs land in OUT_DIR as <slug>-<theme>.png, plus report.json and
 * sheet-NN.png (8 components per sheet, dark beside light).
 *
 * Usage: node scripts/screenshot-andromeda-hero.mjs [slug ...]   (no slug = all)
 * Env:   BASE_URL (default http://localhost:3001), WORKERS (default 4, components
 *        shot at once), SYSTEM (unset = Pro; legacy = Andromeda Legacy),
 *        OUT_DIR (default .screenshots-hero, or .screenshots-hero-legacy for Legacy)
 */

import { chromium } from 'playwright'
import { mkdir, rm, writeFile } from 'fs/promises'
import { readFileSync } from 'fs'
import path from 'path'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'
const LEGACY = process.env.SYSTEM === 'legacy'
const OUT_DIR = path.resolve(process.env.OUT_DIR || (LEGACY ? '.screenshots-hero-legacy' : '.screenshots-hero'))
const W = 1280
const H = 720
const SETTLE_MS = 1800
// The ink box may fill at most this share of the frame.
const SAFE = { w: 0.8, h: 0.72 }
// A finished shot is flagged under these margins (px) or this far off centre.
const MIN_MARGIN = { x: 100, y: 70 }
const MAX_OFFSET = 40
// Flagged as small when the ink is under this share of BOTH frame sides, and as a
// theme mismatch when light and dark ink differ by more than this (px): a popup
// that opened in one theme only.
const SMALL = 0.15
const THEME_DIFF = 60
const WORKERS = Number(process.env.WORKERS) || 4

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
const LEGACY_SCALE = {
  button: 3,
  badge: 5,
  toggle: 3,
  tooltip: 3,
  avatar: 6,
  tag: 4,
  spinner: 8,
  'icon-button': 5,
  'nav-item': 3,
  checkbox: 3.5,
  radio: 3,
  drawer: 1.5,
  'date-range-picker': 2.4,
}
const SCALES = LEGACY ? LEGACY_SCALE : SCALE
const FIT_SKIP = new Set(['drawer'])
// Measured by its elements only: a faint stray pixel at its edge pulls it off centre.
const DOM_ONLY = new Set(['tabs'])
// Scrolling bands: reduced motion holds them as one still, complete row.
const STILL = new Set(LEGACY ? [] : ['logo-cloud', 'marquee'])

// Open-on-capture steps, run after the frame reports ready. Panels with a
// static-open prop use it in poses.tsx instead.
const INTERACTIONS = LEGACY ? {
  tooltip: async (page) => {
    await page.locator('[data-capture-frame] button').first().hover()
    await page.waitForTimeout(450)
  },
  drawer: async (page) => {
    await page.getByRole('button', { name: /open drawer/i }).click()
    await page.waitForTimeout(750)
  },
  // The snake's keyframes never run in the headless page, so three perimeter
  // cells are pinned to the lit colour.
  spinner: async (page) => {
    await page.evaluate(() => {
      const cells = document.querySelector('[data-capture-frame] [role=status]').children
      for (const i of [0, 1, 2]) {
        cells[i].style.animation = 'none'
        cells[i].style.background = 'var(--andromeda-spinner-bright)'
      }
    })
  },
  planet: async (page) => {
    await page.waitForTimeout(2500)
  },
} : {
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
    if (el.closest('[data-dev-overlay],nextjs-portal,.sr-only')) continue
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

// The box of every pixel that differs from the ground, read off a screenshot
// taken with the dot grid off. It sees what DOM boxes miss (panels drawn by
// pseudo-elements, shadows, canvas art) and ignores invisible boxes they count.
// Returned in CSS px.
async function measurePixels(page) {
  const frame = page.locator('[data-capture-frame]')
  const grid = await frame.evaluate((f) => f.style.backgroundImage)
  await frame.evaluate((f) => { f.style.backgroundImage = 'none' })
  const png = (await page.screenshot()).toString('base64')
  await frame.evaluate((f, g) => { f.style.backgroundImage = g }, grid)
  return page.evaluate(async (src) => {
    const img = new Image()
    img.src = `data:image/png;base64,${src}`
    await img.decode()
    const c = document.createElement('canvas')
    c.width = img.width
    c.height = img.height
    const g = c.getContext('2d')
    g.drawImage(img, 0, 0)
    const d = g.getImageData(0, 0, c.width, c.height).data
    const at = (i) => [d[i], d[i + 1], d[i + 2]]
    const ground = at(0)
    let L = Infinity, T = Infinity, R = -Infinity, B = -Infinity
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const p = at((y * c.width + x) * 4)
        if (Math.max(...p.map((v, k) => Math.abs(v - ground[k]))) <= 4) continue
        if (x < L) L = x
        if (x > R) R = x
        if (y < T) T = y
        if (y > B) B = y
      }
    }
    const k = devicePixelRatio
    return { L: L / k, T: T / k, R: (R + 1) / k, B: (B + 1) / k }
  }, png)
}

const META = readFileSync(path.resolve(`app/_lib/${LEGACY ? 'andromeda' : 'andromeda-pro'}/andromeda-meta.ts`), 'utf8')
const ALL = [...META.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1])
const SLUGS = process.argv.slice(2).length ? process.argv.slice(2) : ALL

async function open(browser, slug, theme, s, shift = { dx: 0, dy: 0 }) {
  const context = await browser.newContext({
    viewport: { width: Math.round(W / s), height: Math.round(H / s) },
    deviceScaleFactor: s,
    reducedMotion: STILL.has(slug) ? 'reduce' : 'no-preference',
  })
  await context.addCookies([{ name: 'theme', value: theme, url: BASE_URL }])
  const page = await context.newPage()
  await page.route('**/pufi.js', (r) => r.abort())
  await page.route('**/koko.js', (r) => r.abort())
  await page.goto(`${BASE_URL}/andromeda-capture/${slug}/${LEGACY ? 'legacy' : 'hero'}?scale=${s}&dx=${shift.dx}&dy=${shift.dy}`, { waitUntil: 'load', timeout: 90_000 })
  await page.waitForSelector('[data-capture-ready]', { timeout: 30_000 })
  await page.waitForTimeout(SETTLE_MS)
  if (INTERACTIONS[slug]) await INTERACTIONS[slug](page)
  return { context, page }
}

async function shoot(browser, slug) {
  const out = []
  try {
    // Probe at 1:1: centre the ink, and cap the preferred scale so the ink fits
    // SAFE and the pose's own box still fits the smaller viewport.
    // Both themes: light adds drop shadows that dark does not paint.
    let ink
    for (const theme of ['dark', 'light']) {
      const probe = await open(browser, slug, theme, 1)
      const m = await probe.page.evaluate(measureInk)
      const px = await measurePixels(probe.page)
      await probe.context.close()
      if (px.R > px.L && !DOM_ONLY.has(slug)) Object.assign(m, { L: px.L, T: px.T, R: px.R, B: px.B })
      ink = ink
        ? { ...ink, L: Math.min(ink.L, m.L), T: Math.min(ink.T, m.T), R: Math.max(ink.R, m.R), B: Math.max(ink.B, m.B) }
        : m
    }
    const fit = Math.min(
      (W * SAFE.w) / (ink.R - ink.L), (H * SAFE.h) / (ink.B - ink.T),
      (W * 0.98) / ink.pw, (H * 0.98) / ink.ph,
    )
    const pref = SCALES[slug] ?? DEFAULT_SCALE
    const s = Math.round((FIT_SKIP.has(slug) ? pref : Math.min(pref, fit)) * 100) / 100
    let shift = FIT_SKIP.has(slug)
      ? { dx: 0, dy: 0 }
      : { dx: Math.round(ink.vw / 2 - (ink.L + ink.R) / 2), dy: Math.round(ink.vh / 2 - (ink.T + ink.B) / 2) }

    // Legacy: art that paints differently at the final scale (a canvas, say) is nudged
    // once by its measured offset and reshot.
    for (let pass = 0; pass < (LEGACY ? 2 : 1); pass++) {
    out.length = 0
    for (const theme of ['dark', 'light']) {
      const { context, page } = await open(browser, slug, theme, s, shift)
      const m = await page.evaluate(measureInk)
      const px = await measurePixels(page)
      if (px.R > px.L && !DOM_ONLY.has(slug)) Object.assign(m, { L: px.L, T: px.T, R: px.R, B: px.B })
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
      const iw = (m.R - m.L) * s
      const ih = (m.B - m.T) * s
      if (!(iw > 4 && ih > 4)) issues.push('empty')
      else if (iw < W * SMALL && ih < H * SMALL) issues.push('small')
      out.push({ slug, theme, scale: s, shift, margin, ink: { w: Math.round(iw), h: Math.round(ih) }, issues })
    }
    const g = out[0].margin
    const fix = { dx: Math.round((g.right - g.left) / 2 / s), dy: Math.round((g.bottom - g.top) / 2 / s) }
    if (FIT_SKIP.has(slug) || (Math.abs(fix.dx) * s <= MAX_OFFSET && Math.abs(fix.dy) * s <= MAX_OFFSET)) break
    shift = { dx: shift.dx + fix.dx, dy: shift.dy + fix.dy }
    }
    const [d, l] = out
    if (Math.abs(d.ink.w - l.ink.w) > THEME_DIFF || Math.abs(d.ink.h - l.ink.h) > THEME_DIFF) {
      d.issues.push('theme mismatch')
      l.issues.push('theme mismatch')
    }
  } catch (err) {
    out.push({ slug, error: err.message.split('\n')[0] })
  }
  for (const e of out) {
    console.log(e.error
      ? `✗ ${e.slug}: ${e.error}`
      : `${e.issues.length ? '!' : '✓'} ${e.slug} ${e.theme} @${e.scale} ${JSON.stringify(e.margin)} ${e.issues.join(', ')}`)
  }
  return out
}

// Contact sheets for the human look: 8 components each, dark beside light.
async function sheets(browser, slugs) {
  const page = await browser.newPage({ viewport: { width: 976, height: 400 } })
  const html = path.join(OUT_DIR, '_sheet.html')
  for (let i = 0; i < slugs.length; i += 8) {
    const rows = slugs.slice(i, i + 8).map((slug) =>
      `<div style="font:600 18px system-ui;color:#fff;margin:6px 4px">${slug}</div>` +
      `<div style="display:flex;gap:8px;margin-bottom:10px"><img src="${slug}-dark.png" width=480><img src="${slug}-light.png" width=480></div>`,
    ).join('')
    await writeFile(html, `<body style="margin:4px;background:#777">${rows}</body>`)
    await page.goto(`file://${html}`)
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(OUT_DIR, `sheet-${String(i / 8 + 1).padStart(2, '0')}.png`), fullPage: true })
  }
  await rm(html)
  await page.close()
}

await mkdir(OUT_DIR, { recursive: true })
const browser = await chromium.launch()
const queue = [...SLUGS]
const done = new Map()
await Promise.all(Array.from({ length: Math.min(WORKERS, queue.length) }, async () => {
  for (let slug = queue.shift(); slug; slug = queue.shift()) done.set(slug, await shoot(browser, slug))
}))
const report = SLUGS.flatMap((slug) => done.get(slug))
await sheets(browser, SLUGS.filter((slug) => !done.get(slug).some((e) => e.error)))
await browser.close()
await writeFile(path.join(OUT_DIR, 'report.json'), JSON.stringify(report, null, 2))
const flagged = report.filter((r) => r.error || r.issues?.length)
console.log(`\n${report.filter((r) => !r.error).length} shots, ${flagged.length} flagged → ${OUT_DIR}`)
