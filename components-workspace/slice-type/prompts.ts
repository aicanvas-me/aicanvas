import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Before writing any code, verify the project has Tailwind CSS v4, TypeScript, and React set up. If missing, use the shadcn CLI to scaffold them.

Build a single-file React component called \`SliceType\` with \`'use client'\` at the top. Install dependency: \`framer-motion\`.

---

## Concept

A typographic magic trick using two words that share a tail skeleton: \`LIGHT\` and \`NIGHT\`. At rest you see one ambiguous hybrid word: the top half of LIGHT fused with the bottom half of NIGHT. The shared I/G/H/T letters align seamlessly; only the L/N leading glyph forms an ambiguous splice at the midline. On hover, the top word lifts up and the bottom word sinks down, both fully revealed. Simultaneously, the background inverts from dark to light, and NIGHT becomes LIGHT.

---

## Always dark at rest: no theme prop

The component is always in **NIGHT mode at rest** (dark background, light text) regardless of the site's global theme. On hover it inverts to **LIGHT mode** in sync with the word reveal. Do not use a theme toggle or detect the global dark class.

\`\`\`ts
const DARK_BG = '#0A0A0A'
const LIGHT_BG = '#EFEEE6'
const DARK_FG = '#EFEEE6'
const LIGHT_FG = '#0A0A0A'
\`\`\`

Drive background and text color from the same \`engageSmooth\` MotionValue using a \`mix(a, b, t)\` sRGB hex lerp:
\`\`\`ts
const bgColor = useTransform(engageSmooth, (e) => mix(DARK_BG, LIGHT_BG, e))
const fgColor = useTransform(engageSmooth, (e) => mix(DARK_FG, LIGHT_FG, e))
\`\`\`
Set these on the root \`<motion.div>\` as \`backgroundColor: bgColor, color: fgColor\`. All text elements use \`color: 'inherit'\`.

---

## Layout

Root: \`<motion.div>\` with \`flex min-h-screen w-full items-center justify-center overflow-hidden\`, \`touchAction: 'none'\`, \`cursor: 'pointer'\`, and the animated bg/fg colors.

Inside, a single \`<div ref={containerRef} className="relative">\` that holds everything:

1. **Spacer**: an invisible \`<span>\` rendering \`NIGHT\` (the wider word) to set the container width.
2. **Top word wrapper**: a \`<motion.div>\` with \`position: absolute; inset: 0\` carrying the clip-path and vertical lift. Inside it:
   - \`<motion.span ref={lRef}>\` for the **L**, with \`position: absolute; top: 0; left: 0\` and an animated \`x\`.
   - \`<span ref={ightRef}>\` for **IGHT**, with \`position: absolute; top: 0; right: 0\`.
3. **Bottom word**: a \`<motion.span>\` with \`position: absolute; inset: 0; textAlign: 'right'\` carrying its own clip-path and vertical shift. Renders \`NIGHT\`.

---

## Typography

\`\`\`ts
const sharedTextStyle: React.CSSProperties = {
  fontFamily: 'var(--font-sans), ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif',
  fontWeight: 900,
  fontSize: 'clamp(3.5rem, 18vw, 11rem)',
  lineHeight: 0.92,
  letterSpacing: '-0.04em',
  color: 'inherit',
  whiteSpace: 'nowrap',
  userSelect: 'none',
}
\`\`\`

---

## Engagement and animation

\`\`\`ts
const OPEN_OFFSET = 0.65 // fraction of element height, how far words travel apart
const engage = useMotionValue(0)
const engageSmooth = useSpring(engage, { stiffness: 140, damping: 18, mass: 0.9 })
\`\`\`

**Top word clip + lift:**
\`\`\`ts
const topClip = useTransform(engageSmooth, (e) => \`inset(0 0 \${50 * (1 - e)}% 0)\`)
const topY    = useTransform(engageSmooth, (e) => \`\${-OPEN_OFFSET * 100 * e}%\`)
\`\`\`

**Bottom word clip + sink:**
\`\`\`ts
const botClip = useTransform(engageSmooth, (e) => \`inset(\${50 * (1 - e)}% 0 0 0)\`)
const botY    = useTransform(engageSmooth, (e) => \`\${OPEN_OFFSET * 100 * e}%\`)
\`\`\`

---

## The L alignment trick

The L and IGHT are **separate absolutely-positioned elements**, not a single text run. At rest:
- L is pinned at \`left: 0\` (same x as NIGHT's N). This merges L's top-half vertical stroke with N's bottom-half vertical into one continuous line.
- IGHT is pinned at \`right: 0\`. Its characters match NIGHT's IGHT exactly.
- Real layout space exists between L and IGHT, equal to N's width minus L's width.

On hover the L translates right to its natural touching-IGHT position so the word reads LIGHT.

**Measure L's natural position dynamically** (font-size is fluid):
\`\`\`ts
const naturalLeftMV = useMotionValue(0)

useLayoutEffect(() => {
  const measure = () => {
    const cRect = containerRef.current!.getBoundingClientRect()
    const lRect = lRef.current!.getBoundingClientRect()
    const iRect = ightRef.current!.getBoundingClientRect()
    const ightLeft = iRect.left - cRect.left
    naturalLeftMV.set(Math.max(0, ightLeft - lRect.width))
  }
  measure()
  const ro = new ResizeObserver(measure)
  ro.observe(containerRef.current!)
  return () => ro.disconnect()
}, [])
\`\`\`

**L's x-translate** includes a tiny nudge to compensate for font side-bearing:
\`\`\`ts
const L_REST_NUDGE_PX = -1.5
const lX = useTransform(
  [engageSmooth, naturalLeftMV],
  ([e, natural]) => \`\${L_REST_NUDGE_PX * (1 - e) + (natural as number) * (e as number)}px\`,
)
\`\`\`

---

## Intro teaser (once on mount)

After 700ms, play one open-and-close cycle so users discover the interaction:
\`\`\`ts
const INTRO_DELAY_MS = 700, INTRO_HOLD_MS = 1100, INTRO_PEAK = 0.7, INTRO_DURATION_S = 0.9
\`\`\`
Use \`animate(engage, INTRO_PEAK, { duration: INTRO_DURATION_S, ease: [0.22, 1, 0.36, 1] })\`, await it, hold, then close. Skip if \`prefers-reduced-motion\` is set.

---

## Pointer events

Set on the root motion.div: \`onPointerEnter/Leave/Down/Up/Cancel\` → \`engage.set(1)\` or \`engage.set(0)\`.

---

## sRGB hex lerp helper

\`\`\`ts
function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16)
  const ar = (pa >> 16) & 255, ag = (pa >> 8) & 255, ab = pa & 255
  const br = (pb >> 16) & 255, bg = (pb >> 8) & 255, bb = pb & 255
  const r = Math.round(ar + (br - ar) * t)
  const g = Math.round(ag + (bg - ag) * t)
  const bl = Math.round(ab + (bb - ab) * t)
  return \`#\${((r << 16) | (g << 8) | bl).toString(16).padStart(6, '0')}\`
}
\`\`\`

Single file, default export, no external fonts needed.`,

  Lovable: `Build a single-file React component called \`SliceType\`. Install: \`framer-motion\`.

---

## Concept

Two words — \`LIGHT\` and \`NIGHT\` — share the tail \`IGHT\`. At rest you see a hybrid: top half of LIGHT clipped at midline + bottom half of NIGHT clipped at midline. The shared letters align; only L and N collide at the seam. Hover reveals both words by lifting the top and sinking the bottom, while the background inverts from dark to light.

---

## Colors (always NIGHT at rest — no theme detection)

\`\`\`
DARK_BG='#0A0A0A'  LIGHT_BG='#EFEEE6'
DARK_FG='#EFEEE6'  LIGHT_FG='#0A0A0A'
\`\`\`

Drive both colors from \`engageSmooth\` via \`useTransform\` + sRGB hex lerp \`mix(a,b,t)\`. Set on root \`<motion.div>\` as \`backgroundColor\` and \`color\`. All text children use \`color: 'inherit'\`.

---

## Layout

Root: \`motion.div\` — \`flex min-h-screen w-full items-center justify-center overflow-hidden\`, pointer + touch events, animated bg/fg.

Relative container inside (sized by invisible NIGHT spacer):
1. **Top word \`motion.div\`** with clip-path + vertical lift — contains:
   - **L** \`motion.span\` at \`position: absolute; left: 0\` — animated \`x\` from rest-nudge to natural position next to IGHT.
   - **IGHT** \`span\` at \`position: absolute; right: 0\`.
2. **Bottom NIGHT** \`motion.span\` — \`position: absolute; inset: 0; textAlign: right\` — clip-path + vertical sink.

Font: \`fontWeight: 900\`, \`fontSize: clamp(3.5rem, 18vw, 11rem)\`, \`lineHeight: 0.92\`, \`letterSpacing: -0.04em\`, \`color: inherit\`.

---

## Animation

\`engageSmooth = useSpring(engage, { stiffness: 140, damping: 18, mass: 0.9 })\`

- Top clip: \`inset(0 0 \${50*(1-e)}% 0)\` — top lift: \`\${-65*e}%\`
- Bottom clip: \`inset(\${50*(1-e)}% 0 0 0)\` — bottom sink: \`\${65*e}%\`

**L's x**: Measure IGHT's left and L's width via \`ResizeObserver\`. Natural left = ightLeft − lWidth.
\`lX = L_REST_NUDGE_PX*(1-e) + naturalLeft*e\` where \`L_REST_NUDGE_PX = -1.5\`.

Intro teaser (once, 700ms delay): animate to 0.7, hold 1100ms, close. Skip if \`prefers-reduced-motion\`.`,

  V0: `Single-file \`SliceType\` component. Install: \`framer-motion\`.

## Concept
LIGHT / NIGHT dual-lexicon illusion. Clip top half of LIGHT + bottom half of NIGHT at same position. Shared IGHT letters align. L/N collide at seam = ambiguous hybrid. Hover: words lift/sink apart + bg inverts dark→light.

## Colors — always NIGHT at rest, no theme detection
\`DARK_BG='#0A0A0A' LIGHT_BG='#EFEEE6' DARK_FG='#EFEEE6' LIGHT_FG='#0A0A0A'\`
Both driven by \`engageSmooth\` via \`useTransform\` + sRGB hex lerp. Root \`motion.div\` gets \`backgroundColor\` + \`color\` MotionValues. All text: \`color: inherit\`.

## Layout
Root: \`motion.div\` flex min-h-screen centered, pointer events, animated colors.
Inside: relative container (sized by hidden NIGHT spacer).
1. Top \`motion.div\` (inset:0, clipPath, y lift) →
   - L: \`motion.span\` absolute left:0, animated \`x\`
   - IGHT: \`span\` absolute right:0
2. Bottom: \`motion.span\` absolute inset:0 textAlign:right, clipPath, y sink. Renders NIGHT.

Font: weight 900, \`clamp(3.5rem,18vw,11rem)\`, lineHeight 0.92, letterSpacing -0.04em, color inherit.

## Animation
\`\`\`
OPEN_OFFSET=0.65
engageSmooth = useSpring(engage, {stiffness:140, damping:18, mass:0.9})
topClip = inset(0 0 \${50*(1-e)}% 0)   topY = \${-65*e}%
botClip = inset(\${50*(1-e)}% 0 0 0)   botY = \${65*e}%
\`\`\`

## L alignment
L absolute at left:0. Measure natural position: ResizeObserver on container, compute \`ightLeft - lWidth\`, store in MotionValue \`naturalLeftMV\`.
\`lX = -1.5*(1-e) + naturalLeft*e\` (the -1.5 nudge corrects font side-bearing).

## Intro teaser
After 700ms: animate(engage, 0.7, 0.9s ease-out), hold 1100ms, close. Skip on prefers-reduced-motion.

## Pointer events
Root: onPointerEnter/Down → engage.set(1). onPointerLeave/Up/Cancel → engage.set(0).`,
}
