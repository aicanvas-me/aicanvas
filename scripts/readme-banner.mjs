/**
 * Renders the README banner and the GitHub social preview to JPEG.
 *
 * The art is a tilted field of real component screenshots behind the headline,
 * built here so the banner can be re-rendered when the site's story or palette
 * moves. Monochrome on purpose: the site accent is neutral ink, and a hue on a
 * GitHub canvas would date the image the moment the accent changes.
 *
 *   node scripts/readme-banner.mjs            # banner + social preview
 *   node scripts/readme-banner.mjs banner     # one of them, by name
 */
import { chromium } from 'playwright'
import { mkdir, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'assets')
const SCALE = 2

const T = {
  bg: '#0E0E0F',
  tile: '#2D2D2E',
  ink: '#F4F4FA',
  muted: '#9B9B9E',
}

// Screenshots carry the field. Wide, high-contrast pieces first: at 50% opacity
// behind a vignette, a busy card reads as texture and a pale one reads as a hole.
const TILES = [
  'glass-music-player', 'task-cards', 'tilted-coverflow', 'crypto-swap', 'meet-the-crew', 'glass-dock', 'ai-job-cards',
  'glass-ai-compose', 'polaroid-stack', 'slide-deck', 'glass-modal', 'particle-sphere', 'product-card-deck', 'neon-clock',
  'scroll-wipe-gallery', 'glass-navbar', 'signature-pad', 'flip-calendar', 'glass-notification', 'charging-widget', 'glass-slider',
  'voice-chat-pill', 'glass-tags', 'radial-toolbar', 'glass-card', 'dot-grid', 'glass-toggle', 'runway-loader',
  'glass-tab-bar', 'glass-progress', 'emoji-burst', 'scramble-text', 'magnetic-dots', 'sphere-lines', 'glitch-button',
  'text-blur-reveal', 'noise-field', 'particle-constellation', 'wave-lines', 'grid-lines', 'bubble-field',
  'floating-cards', 'distortion-grid',
]

const SHOTS = [
  { file: 'readme-banner', width: 1600, height: 640, head: 72, sub: 25, chip: 44 },
  { file: 'social-preview', width: 1280, height: 640, head: 64, sub: 23, chip: 42 },
]

const page = (s, font) => `<!doctype html><meta charset="utf-8"><style>
  @font-face { font-family: Manrope; src: url('data:font/woff2;base64,${font}') format('woff2'); font-weight: 200 800; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: ${s.width}px; height: ${s.height}px; background: ${T.bg}; overflow: hidden;
         font-family: Manrope, sans-serif; -webkit-font-smoothing: antialiased; }
  .stage { position: relative; width: 100%; height: 100%; }
  .field { position: absolute; inset: -42% -12%; display: grid; gap: ${Math.round(s.width / 96)}px;
           grid-template-columns: repeat(9, 1fr); transform: rotate(-9deg) scale(1.04); }
  /* Catalog cards, not bare screenshots: component art is shot on sand-950, so a
     field of raw images reads as black. The card surface is what makes a wall. */
  .card { background: #1B1B1C; border: 1px solid ${T.tile}; border-radius: ${Math.round(s.width / 130)}px;
          padding: ${Math.round(s.width / 190)}px; display: flex; flex-direction: column; gap: ${Math.round(s.width / 230)}px; }
  .card img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border-radius: ${Math.round(s.width / 200)}px;
              filter: brightness(1.16) saturate(1.06); }
  .card i { display: block; height: ${Math.round(s.width / 240)}px; width: 58%; background: #4A4A4D; border-radius: 99px; }
  .card u { display: block; height: ${Math.round(s.width / 300)}px; width: 86%; background: #333335; border-radius: 99px; }
  /* The plate the headline sits on. Tight centre, bright edges: the field has to
     stay legible as component art, or the banner is a black rectangle. */
  .veil { position: absolute; inset: 0; background:
    radial-gradient(62% 76% at 50% 50%, rgba(14,14,15,.96) 0%, rgba(14,14,15,.92) 44%, rgba(14,14,15,.58) 72%, rgba(14,14,15,.12) 100%); }
  .edge { position: absolute; inset: 0; background:
    linear-gradient(90deg, ${T.bg} 0%, rgba(14,14,15,0) 11%, rgba(14,14,15,0) 89%, ${T.bg} 100%),
    linear-gradient(180deg, ${T.bg} 0%, rgba(14,14,15,0) 15%, rgba(14,14,15,0) 85%, ${T.bg} 100%); }
  /* Light from above and a hairline rim: the lit-panel rule, so the plate reads
     as a surface rather than a flat fill. */
  .lift { position: absolute; inset: 0; background:
    linear-gradient(180deg, rgba(244,244,250,.07) 0%, rgba(244,244,250,0) 42%); }
  .rim { position: absolute; inset: 0; box-shadow: inset 0 1px 0 rgba(244,244,250,.10); }
  .center { position: absolute; inset: 0; display: flex; flex-direction: column;
            align-items: center; justify-content: center; gap: ${Math.round(s.height / 26)}px; text-align: center; }
  .pills { display: flex; gap: ${Math.round(s.chip / 4)}px; }
  .pill { display: inline-flex; align-items: center; gap: ${Math.round(s.chip / 5)}px;
          height: ${s.chip}px; padding: 0 ${Math.round(s.chip * 0.46)}px; border-radius: ${s.chip}px;
          background: ${T.ink}; color: #1B1B1C; font-size: ${Math.round(s.chip * 0.41)}px; font-weight: 700;
          letter-spacing: -0.01em; white-space: nowrap; }
  .pill svg { width: ${Math.round(s.chip * 0.4)}px; height: ${Math.round(s.chip * 0.4)}px; }
  .ghost { background: rgba(244,244,250,.05); color: ${T.ink}; border: 1px solid rgba(244,244,250,.16);
           font-weight: 600; font-size: ${Math.round(s.chip * 0.38)}px; }
  h1 { font-size: ${s.head}px; font-weight: 800; line-height: 1.04; letter-spacing: -0.035em; color: ${T.ink}; }
  h1 span { color: ${T.muted}; }
  p { font-size: ${s.sub}px; font-weight: 500; color: ${T.muted}; letter-spacing: -0.01em; }
  .mark { display: flex; align-items: center; gap: ${Math.round(s.chip * 0.3)}px;
          margin-top: ${Math.round(s.height / 40)}px; }
  .mark svg { width: ${Math.round(s.chip * 0.62)}px; height: auto; }
  .mark b { font-size: ${Math.round(s.chip * 0.46)}px; font-weight: 700; color: ${T.ink}; letter-spacing: -0.01em; }
</style>
<div class="stage">
  <div class="field">${TILES.map((t) => `<div class="card"><img src="https://ik.imagekit.io/aitoolkit/${t}.png?tr=w-460,q-80,f-jpg" /><i></i><u></u></div>`).join('')}</div>
  <div class="veil"></div><div class="edge"></div><div class="lift"></div><div class="rim"></div>
  <div class="center">
    <div class="pills">
      <span class="pill">${check('#1B1B1C')}Open source</span>
      <span class="pill">${check('#1B1B1C')}MIT components</span>
    </div>
    <h1>AI agents finally design<br><span>badass interfaces</span></h1>
    <p>Design systems, components and icons, installed as real source with one command.</p>
    <div class="pills">
      <span class="pill ghost">shadcn registry</span>
      <span class="pill ghost">MCP server</span>
      <span class="pill ghost">A prompt per component</span>
    </div>
    <div class="mark">${MARK}<b>AI Canvas</b></div>
  </div>
</div>`

function check(fill) {
  return `<svg viewBox="0 0 24 24" fill="none"><path d="M20 6 9 17l-5-5" stroke="${fill}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
}

// The real mark, read from public/ so the lockup can never drift from the site's.
const MARK = (await readFile(join(ROOT, 'public/ai-canvas-icon-mono.svg')))
  .toString()
  .replace(/<style>[\s\S]*?<\/style>/, `<style>.m{fill:${T.ink}}</style>`)

const want = process.argv[2]
const font = (await readFile(join(ROOT, 'app/_fonts/manrope/latin.woff2'))).toString('base64')
await mkdir(OUT, { recursive: true })

const shots = SHOTS.filter((x) => !want || x.file.includes(want))
if (!shots.length) {
  console.error(`readme-banner: no shot matches "${want}". Names: ${SHOTS.map((s) => s.file).join(', ')}`)
  process.exit(1)
}

const browser = await chromium.launch()
try {
  for (const s of shots) {
    const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: SCALE })
    const p = await ctx.newPage()
    // networkidle resolves on a 404 too, and a missing tile is a blank card in a
    // committed JPEG. Collect the failures and refuse to write instead.
    const bad = []
    p.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`) })
    p.on('requestfailed', (r) => bad.push(`failed ${r.url()}`))
    await p.setContent(page(s, font), { waitUntil: 'networkidle' })
    const blank = await p.$$eval('.card img', (els) => els.filter((e) => !e.naturalWidth).length)
    if (bad.length || blank) {
      console.error(`readme-banner: ${blank} tile(s) did not render${bad.length ? ':\n  ' + bad.join('\n  ') : ''}`)
      process.exit(1)
    }
    await p.screenshot({ path: join(OUT, `${s.file}.jpg`), type: 'jpeg', quality: 86 })
    await ctx.close()
    console.log(`readme-banner: assets/${s.file}.jpg (${s.width}x${s.height} at ${SCALE}x, ${TILES.length} tiles)`)
  }
} finally {
  await browser.close()
}
