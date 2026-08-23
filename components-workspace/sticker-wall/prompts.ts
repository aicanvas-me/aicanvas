import type { Platform } from '../../app/components/ComponentCard'

const SPEC = `Create a React client component named \`StickerWall\`, a full-viewport physical feedback wall where text cards and emoji stickers pile up, collide, and can be dragged/tossed with real physics. A centered input lets visitors submit a note that falls in from above and joins the pile.

Write this as a single self-contained 'use client' TypeScript file. Inline everything, no helper files. Default export \`StickerWall\`. No 'any' types.

## Dependencies
\`\`\`
npm install matter-js framer-motion
npm install -D @types/matter-js
\`\`\`
- Tailwind CSS v4 (CSS-based @theme inline, NOT v3 tailwind.config.ts)
- Must dynamic-import matter-js inside an effect so SSR doesn't break.

## Tuning constants (exact values)
\`\`\`ts
const GRAVITY_SCALE  = 0.0012
const RESTITUTION    = 0.05
const FRICTION       = 0.6
const FRICTION_AIR   = 0.02
const DENSITY        = 0.0015
const STICKER_CAP    = 60
const FADE_MS        = 250
const WALL_THICKNESS = 60
const TEXT_FONT_PX   = 15
const TEXT_MAX_WIDTH = 180
const TEXT_PAD_X     = 14
const TEXT_PAD_Y     = 10
const TEXT_LINE_H    = 20
const EMOJI_SIZE     = 72
const EMOJI_FONT_PX  = 42
const CARD_RADIUS    = 32
const BORDER_WIDTH   = 2
\`\`\`

## Palettes (exact)
\`\`\`ts
const PALETTE_DARK  = ['#FDE68A','#BBF7D0','#FBCFE8','#C7D2FE','#BAE6FD','#FED7AA']
const PALETTE_LIGHT = ['#F59E0B','#34D399','#F472B6','#A78BFA','#38BDF8','#FB923C']

const STICKER_TEXT_COLOR_DARK  = '#111827'   // used when isDark === true
const STICKER_TEXT_COLOR_LIGHT = '#FFFFFF'   // used when isDark === false
const BG_DARK  = '#0F0F12'
const BG_LIGHT = '#F5F1E8'
\`\`\`

## Seed content
10 text quotes:
\`['love the new layout','prompts are 🔥','found a tiny bug on hover','please add a search','this saved me hours','fonts feel just right','mobile nav could be bigger','the physics here rules','more components please','onboarding was smooth']\`

12 emoji stickers:
\`['👏','💡','🙌','👀','💬','✅','🔥','💯','🎉','❤️','🤔','⭐']\`

## Types
\`\`\`ts
type StickerKind = 'text' | 'emoji'
interface Sticker {
  body: Body
  kind: StickerKind
  content: string
  w: number
  h: number
  color: string
  lines: string[]       // pre-wrapped for text; [] for emoji
  createdAt: number
  fadeStart?: number
}
type BodyWithPlugin = Body & { plugin: { sticker?: Sticker } }
\`\`\`

## Theme detection
Inline a \`useIsomorphicLayoutEffect\` (= \`useLayoutEffect\` on the client, \`useEffect\` on the server).
- \`isDark\` state seeded during render: \`document.documentElement.classList.contains('dark')\` (guarded by \`typeof window\`).
- Effect: install a \`MutationObserver\` on \`document.documentElement\` watching \`attributeFilter: ['class']\`. On each change: \`setIsDark(document.documentElement.classList.contains('dark'))\`. Disconnect on cleanup.
- Keep an \`isDarkRef = useRef(isDark)\` kept in sync in a separate \`useIsomorphicLayoutEffect([isDark])\`. The canvas render loop reads \`isDarkRef.current\` so it never captures stale closure values.
- When \`isDark\` changes, re-assign each existing sticker's \`color\` field from the new palette (via a \`useEffect([isDark])\`). Keep \`paletteRef\` in sync too.

## Root layout
- Outer wrapper: \`flex h-full w-full items-center justify-center\` with inline \`style={{ background: bg }}\`. The component fills its parent, so the parent must define height (e.g. \`h-screen\` or \`h-[480px]\`). Do NOT use \`min-h-screen\`: the matter-js floor wall sits at the canvas bottom edge; a taller-than-visible canvas pushes bodies below the fold.
- Inside: a \`motion.div\` (containerRef) \`relative h-full w-full overflow-hidden\` with \`style={{ background: bg, touchAction: 'none' }}\`. Mount animation: \`initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, ease: 'easeOut' }}\`.
- Children: \`<canvas>\` absolute inset-0 (display block, 100% w/h) + \`<form>\` overlay.

## Form overlay
\`pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-5\`, paddingLeft/Right 16, paddingBottom '18vh'.

### Header (non-interactive, pointer-events-none, flex-col items-center gap-2 text-center)
- h2 "Feedback Wall": \`color: titleColor\`, \`fontSize: clamp(32px, 6vw, 56px)\`, fontWeight 800, letterSpacing -0.02em, lineHeight 1, margin 0.
  - \`titleColor\` = \`rgba(255,255,255,0.95)\` dark / \`rgba(17,24,39,0.95)\` light.
  - \`textShadow\` = \`0 2px 20px rgba(0,0,0,0.4)\` dark / \`0 2px 20px rgba(17,24,39,0.08)\` light.
- p subtitle "Drop a note, toss an emoji, drag anything around. Real physics, no rules. Just leave your mark on the wall.":
  - \`color: subtitleColor\` = \`rgba(255,255,255,0.7)\` / \`rgba(17,24,39,0.7)\`. 16px, weight 500, letterSpacing -0.005em, lineHeight 1.45, maxWidth 46ch.

### Input pill (pointer-events-auto)
\`flex w-full max-w-md items-center gap-2 rounded-full p-1\` class \`sticker-wall-pill\`.
- \`background\`: \`rgba(0,0,0,0.9)\` dark / \`rgba(255,255,255,0.9)\` light.
- \`border\`: 2px solid \`rgba(255,255,255,0.7)\` dark / \`rgba(17,24,39,0.12)\` light.
- \`boxShadow\`: \`0 6px 14px rgba(0,0,0,0.25), 0 2px 0 rgba(0,0,0,0.08)\` dark / \`0 6px 14px rgba(17,24,39,0.12), 0 2px 0 rgba(17,24,39,0.04)\` light.

CSS class rules (emit via a scoped \`<style>\` block, needed for pseudo-states):
\`\`\`css
.sticker-wall-pill {
  transition: background 180ms ease, border-color 180ms ease,
              transform 180ms ease, box-shadow 180ms ease;
}
.sticker-wall-pill:hover {
  background: <pillHoverBg> !important;   /* rgba(0,0,0,0.95) dark / rgba(255,255,255,0.95) light */
  border-color: <pillHoverBorder> !important; /* rgba(255,255,255,0.85) / rgba(17,24,39,0.6) */
  transform: translateY(-1px);
}
.sticker-wall-pill:focus-within {
  background: <pillFocusBg> !important;   /* rgba(0,0,0,1) / rgba(255,255,255,1) */
  border-color: <pillFocusBorder> !important; /* #FFFFFF / #111827 */
  transform: translateY(-1px) scale(1.015);
  box-shadow: <pillFocusShadow> !important;
  /* dark: 0 10px 24px rgba(0,0,0,0.3), 0 0 0 4px rgba(255,255,255,0.12) */
  /* light: 0 10px 24px rgba(17,24,39,0.15), 0 0 0 4px rgba(17,24,39,0.08) */
}
.sticker-wall-pill:active { transform: translateY(0) scale(0.99); }
\`\`\`

Inside the pill:
- \`<input type="text" maxLength={80} placeholder="Leave feedback…">\`: flex-1, transparent bg, px-4 py-2, text-sm (14px), weight 500, outline-none.
  - \`color\`: \`rgba(255,255,255,0.95)\` dark / \`rgba(17,24,39,0.95)\` light.
  - Placeholder color via \`.sticker-wall-input::placeholder { color: <placeholderColor>; }\` in the scoped style block.
    - \`placeholderColor\`: \`rgba(255,255,255,0.55)\` dark / \`rgba(17,24,39,0.5)\` light.

### Send button
\`<button type="submit">\`: class \`sticker-wall-send\`, \`flex items-center rounded-2xl px-5 py-2 text-sm tracking-wide\`.
- \`background\`: \`#8A9CF4\` (periwinkle, same in both themes).
- \`color\` (text): \`#111827\` dark / \`#FFFFFF\` light.
- \`border\`: 1px solid rgba(255,255,255,0.12).
- No base box-shadow on the button itself.

CSS for the Send button (in the same scoped \`<style>\` block):
\`\`\`css
.sticker-wall-send {
  transition: transform 120ms ease, box-shadow 120ms ease, filter 120ms ease;
  cursor: pointer;
}
.sticker-wall-send:hover {
  transform: translateY(-1px);
  filter: brightness(1.15);
}
.sticker-wall-send:active {
  transform: translateY(3px);
  filter: brightness(0.95);
}
\`\`\`

## Physics engine (matter-js, dynamic-imported)
Boot sequence inside a single \`useEffect([], [])\`: dynamic-import matter-js, then:
1. Create engine: \`Matter.Engine.create({ gravity: { x: 0, y: 1, scale: GRAVITY_SCALE } })\`; set \`engine.timing.timeScale = 0.6\`.
2. \`runner = Matter.Runner.create(); Matter.Runner.run(runner, engine)\`.
3. Call \`resize()\` (sets up canvas size) THEN create mouse:
   \`mouse = Matter.Mouse.create(canvas); mouse.pixelRatio = dpr;\`
4. MouseConstraint: \`Matter.MouseConstraint.create(engine, { mouse, constraint: { stiffness: 0.2, damping: 0.1, render: { visible: false } } })\`. Add to world.
5. Call \`seed()\` to populate initial stickers.
6. Install \`ResizeObserver\` on the container.
7. Start the \`requestAnimationFrame\` loop.

### Walls (invisible static bodies, 60px thick)
Four rectangles: top (above canvas), bottom (floor), left, right. Each extends ±WALL_THICKNESS on the cross-axis so corners overlap. Rebuild on every resize: remove old walls, create new ones.

### resize()
- Read \`container.clientWidth / clientHeight\` (fallback 480×480).
- Update \`dpr = Math.min(devicePixelRatio || 1, 2)\`.
- Set \`canvas.width = round(w * dpr); canvas.height = round(h * dpr);\` + \`canvas.style.width/height\`; reset transform \`ctx.setTransform(dpr,0,0,dpr,0,0)\`.
- Rebuild walls. Re-clamp out-of-bounds bodies to x ∈ [20, w-20], y ≤ h-20.
- \`mouse.pixelRatio = dpr\` (re-apply after resize so drag stays aligned on HiDPI).
- Store \`sizeRef.current = { w, h }\`.

### Seed algorithm
For each text quote \`i\`: color = \`palette[i % palette.length]\`, x = rand(100, max(120, w-100)), y = rand(80, max(120, h-120)), angular velocity ∈ [-0.05, 0.05], linear velocity x/y ∈ [-0.5, 0.5].
For each emoji \`i\`: color = \`palette[(i+3) % palette.length]\`, x = rand(80, max(100, w-80)), y same range, same velocities.

### Sticker cap & fade
When \`stickersRef.current.length > STICKER_CAP\`, find the first sticker with no \`fadeStart\` and set \`fadeStart = performance.now()\`. In the render loop, on each frame scan stickers in reverse: if \`now - fadeStart >= FADE_MS\`, call \`Composite.remove(world, body)\` and \`splice\` from the array.

### Word-wrap helper
\`function wrapText(ctx, text, maxWidth)\`: split on whitespace, greedy fit via \`ctx.measureText\`. If a single word exceeds maxWidth, push it as its own line. Returns \`string[]\`.

### measureTextCard
Set \`ctx.font = '600 15px ui-sans-serif, system-ui, -apple-system, Segoe UI, Manrope, sans-serif'\`. Compute lines via wrapText. \`w = max(70, round(longestLine + TEXT_PAD_X * 2))\`; \`h = max(40, round(lineCount * TEXT_LINE_H + TEXT_PAD_Y * 2))\`.

## Custom 2D canvas renderer (no Matter.Render)
Each frame via rAF:
1. \`ctx.setTransform(dpr,0,0,dpr,0,0)\`.
2. Fill canvas with \`BG_DARK\` or \`BG_LIGHT\` (from \`isDarkRef.current\`). Full clear, no trails.
3. Scan stickers in reverse for fade pruning (see Sticker cap section above).
4. For each sticker:
   - \`alpha = fadeStart ? max(0, 1 - dt/FADE_MS) : 1\`.
   - \`ctx.save(); ctx.globalAlpha = alpha; ctx.translate(body.position.x, body.position.y); ctx.rotate(body.angle);\`
   - **Card fill** (no drop shadow): \`ctx.fillStyle = sticker.color\`, draw \`roundedRect(ctx, -w/2, -h/2, w, h, CARD_RADIUS)\`, then \`ctx.fill()\`.
   - **Inner border**: \`ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = BORDER_WIDTH\`. Draw roundedRect inset by \`BORDER_WIDTH\` on each side with radius \`max(1, CARD_RADIUS - BORDER_WIDTH)\`, then \`ctx.stroke()\`.
   - **Content**:
     - text: \`ctx.fillStyle = isDarkRef.current ? STICKER_TEXT_COLOR_DARK : STICKER_TEXT_COLOR_LIGHT\`. Font 600 15px (same family). textAlign center, textBaseline middle. Draw pre-wrapped lines vertically centered (totalH = lineCount * TEXT_LINE_H; startY = -totalH/2 + TEXT_LINE_H/2).
     - emoji: font \`'42px ui-sans-serif, system-ui, -apple-system, Segoe UI, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'\`. textAlign center, textBaseline middle. Draw at (0, 2).
   - \`ctx.restore()\`.

\`roundedRect\` helper: draws a rounded rectangle path (no fill/stroke):
\`\`\`ts
function roundedRect(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}
\`\`\`

## Submit handler (form onSubmit)
- preventDefault. Trim input; if empty, return without clearing.
- Use \`measureTextCard\` on the shared canvas ctx to compute lines, w, h.
- Pick a random color from \`paletteRef.current\`. x = rand(80, max(100, W-80)), y = -30.
- Build body with the same physics opts + random angle ∈ [-0.25, 0.25]. Set angular velocity ∈ [-0.03, 0.03] and velocity x ∈ [-0.3, 0.3], y = 0.
- Attach \`(body as BodyWithPlugin).plugin = { sticker }\`, add to world, push to stickersRef.
- If array exceeds STICKER_CAP, fade the oldest non-fading sticker.
- Clear \`input.value\`.

## Cleanup (effect return)
- Set \`alive = false\`.
- \`cancelAnimationFrame(rafId)\`.
- \`ro.disconnect()\` (ResizeObserver).
- \`Matter.Runner.stop(runner); Matter.Composite.clear(world, false, true); Matter.Engine.clear(engine)\`.
- Null out \`matterRef\`, \`engineRef\`, \`worldRef\`, \`measureCtxRef\`; reset \`stickersRef.current = []\`.

## Mobile + a11y
- \`touchAction: 'none'\` on the motion wrapper prevents page scroll on touch-drag.
- matter-js Mouse handles touch events natively. No hover-only affordances.
- Input pill sits in the lower third of the viewport (paddingBottom 18vh), reachable by thumbs.
- Canvas is DPR-aware via ResizeObserver; never hardcoded dimensions.

## Typography
- Font family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Manrope, sans-serif.
- Weights: 800 (title), 700 (Send), 600 (sticker text), 500 (subtitle, input), 400 (body).
- Sizes: title clamp(32–56px), subtitle 16px, input 14px, sticker text 15px, emoji 42px.
`

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Before building, verify your project has the following setup:
- React / Next.js with TypeScript (strict)
- Tailwind CSS v4 (configured via CSS \`@theme inline\`, NOT \`tailwind.config.ts\`)

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

${SPEC}`,

  Lovable: SPEC,

  V0: `Before building, verify your project has the following setup:
- React / Next.js with TypeScript (strict)
- Tailwind CSS v4 (configured via CSS \`@theme inline\`, NOT \`tailwind.config.ts\`)

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

${SPEC}`,
}
