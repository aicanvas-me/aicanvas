import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Before writing any code, verify the project has Tailwind CSS v4, TypeScript, and React set up. If missing, use the shadcn CLI to scaffold them.

Build a single-file React component called \`StackTower\` with \`'use client'\` at the top. Install dependency: \`framer-motion\`.

---

## Concept

A vertical column of 12 stacked text rows that reads as a 3D cylinder rotating around its vertical axis, built entirely from 2D CSS transforms (translateX + skewX + scale). The rotation "travels" down the stack because each row's phase is offset from the one above. Hover any row to highlight it in an orange accent; motion rhythm is untouched.

---

## Layout & theme

Single full-viewport container: \`flex min-h-screen w-full items-center justify-center overflow-hidden\`. Background inline-styled per theme. Inside it, a centred flex column capped at \`width: 'min(92vw, 620px)'\` holds the 12 rows.

**Dual theme, inverted palette, raw hex only:**
- Dark: bg \`#0A0A0A\`, fg \`#EFEEE6\`, dim (back-face) \`#3A3936\`
- Light: bg \`#EFEEE6\`, fg \`#0A0A0A\`, dim \`#C7C3B8\`
- Hover accent (both themes): \`#F16D14\` (warm orange)

Detect theme via \`element.closest('[data-card-theme]')\` first (for isolated card previews), falling back to \`document.documentElement.classList.contains('dark')\`. Walk up the ancestor chain with a MutationObserver watching \`class\` and \`data-card-theme\` so the component reacts when any ancestor toggles.

---

## Content

Top-of-file constants:
\`\`\`ts
const WORDS = ['STACK', 'TOWER'] as const
const ROW_COUNT = 12
\`\`\`
Row \`i\` renders \`WORDS[i % 2]\`. Each row uses Manrope-ish heavy display sans (\`var(--font-sans)\` with system fallbacks), \`fontWeight: 900\`, \`fontSize: 'clamp(1.75rem, 9vw, 4.5rem)'\`, \`lineHeight: 0.92\`, \`letterSpacing: '-0.03em'\`, \`whiteSpace: 'nowrap'\`, centred.

---

## The rotation math

Each row owns a Framer Motion \`MotionValue<number>\` called \`phase\`. All phases advance at **exactly the same rate**. Hover does NOT modulate speed. Per-row "where am I on the cylinder" is derived from a fixed offset:

\`\`\`ts
const SECONDS_PER_CYCLE = 5
const AMPLITUDE_PX = 22
const rowOffset = rowIndex * 0.35 // radians, rotation travels down the stack
\`\`\`

Per frame, each row reads its phase and computes:

\`\`\`ts
const local = phase * Math.PI * 2 + rowOffset
const scaleX = 0.55 + 0.45 * Math.cos(local)          // 0.10 → 1.00 → 0.10
const shiftX = Math.sin(local) * AMPLITUDE_PX         // horizontal swing
const skewX  = Math.sin(local) * 6                    // degrees, barrel
const boost  = 1 + hoverAccent * 0.10                 // hover scale pop
transform = \`translateX(\${shiftX}px) skewX(\${skewX}deg) scale(\${Math.max(0.08, scaleX) * boost}, \${boost})\`
\`\`\`

Colour is a \`cos\`-driven mix between \`dim\` and \`fg\` so "front-facing" rows look bright and "back-facing" rows look dim. Hover then blends the whole thing toward \`#F16D14\`:

\`\`\`ts
const tt   = (Math.cos(local) + 1) / 2     // 0..1, 1 = full front
const base = mix(dim, fg, tt)              // sRGB hex lerp
const col  = hoverAccent < 0.002 ? base : mix(base, accent, hoverAccent)
\`\`\`

Write a tiny \`mix(a, b, t)\` helper that parses \`#RRGGBB\` with \`parseInt(hex.slice(1), 16)\`, lerps each channel, and returns a padded hex string.

---

## Central animation loop

One \`useAnimationFrame\` in the parent, NOT one per row. Children subscribe to per-row MotionValues via \`useTransform\`; the parent owns phase advancement and hover easing.

\`\`\`ts
const HOVER_EASE_RATE = 10 // 1/s

useAnimationFrame((t) => {
  const dtSec    = (t - prevTs) / 1000
  const phaseDt  = dtSec / SECONDS_PER_CYCLE
  const alpha    = 1 - Math.exp(-HOVER_EASE_RATE * dtSec)  // frame-rate independent
  const hov      = hoveredIndexRef.current
  for (let i = 0; i < ROW_COUNT; i++) {
    phases[i].set(phases[i].get() + phaseDt)              // rate is always 1
    const target = i === hov ? 1 : 0
    hoverEased[i] += (target - hoverEased[i]) * alpha
    hovers[i].set(hoverEased[i])
  }
})
\`\`\`

Create the per-row MotionValues with \`useMemo(() => Array.from({length: ROW_COUNT}, () => motionValue(0)), [])\`, the plain \`motionValue\` factory, not the hook.

---

## Hover tracking: critical for smoothness

Store the hovered row index in a **ref**, not state:

\`\`\`ts
const hoveredIndexRef = useRef<number | null>(null)
const handleEnter = (i) => { hoveredIndexRef.current = i }
const handleLeave = (i) => { if (hoveredIndexRef.current === i) hoveredIndexRef.current = null }
\`\`\`

This is load-bearing: using \`useState\` here re-renders the whole stack on every hover change, which visibly hiccups the rotation. Refs avoid that.

Each row wraps its \`<motion.div>\` in an outer pointer-target \`<div>\` with \`width: 100%\`, \`display: flex\`, \`justifyContent: 'center'\`, \`cursor: 'pointer'\`, \`touchAction: 'none'\`, and handlers \`onPointerEnter/Leave/Down/Up/Cancel\`. The outer div stays a stable rectangle even when the inner \`<motion.div>\` scales down to 0.08×, so hover targeting never fails.

---

## Top + bottom fades

Two absolutely-positioned fade \`<div>\`s at \`top: 0\` and \`bottom: 0\`, each 22% tall, with a linear gradient from bg-solid to transparent, give the "infinite cylinder" feel. \`pointerEvents: 'none'\` so they don't block hover.

---

## Reduced motion

Respect \`(prefers-reduced-motion: reduce)\`: when set, freeze every row's phase at \`0.2 + rowIndex * 0.03\` so the stagger is visible but nothing moves.

---

## Cleanup

Every \`MutationObserver\` disconnected on unmount. No other listeners or RAFs to clean. Framer Motion handles \`useAnimationFrame\` cleanup automatically.

The whole component is one file with a default export.`,

  Lovable: `Build a single-file React component called \`StackTower\`. Install dependency: \`framer-motion\`.

---

## Concept

12 stacked text rows reading as a rotating 3D cylinder — pure 2D transforms (translateX + skewX + scale). Hover highlights one row in orange without changing its motion.

---

## Layout & theme

Root: \`flex min-h-screen w-full items-center justify-center overflow-hidden\`, bg per theme. Inner column: \`width: 'min(92vw, 620px)'\`, centred flex column of rows. No Tailwind design tokens inside — raw hex only.

**Dual theme (inverted):**
- Dark: bg \`#0A0A0A\`, fg \`#EFEEE6\`, dim \`#3A3936\`
- Light: bg \`#EFEEE6\`, fg \`#0A0A0A\`, dim \`#C7C3B8\`
- Hover accent (both): \`#F16D14\`

Detect theme via \`closest('[data-card-theme]')\` then \`html.classList.contains('dark')\`. MutationObserver on the ancestor chain.

---

## Rows

\`WORDS = ['STACK', 'TOWER']\`, \`ROW_COUNT = 12\`, row \`i\` renders \`WORDS[i%2]\`. \`fontWeight: 900\`, \`fontSize: 'clamp(1.75rem, 9vw, 4.5rem)'\`, \`lineHeight: 0.92\`, \`letterSpacing: '-0.03em'\`, \`whiteSpace: 'nowrap'\`, centred.

---

## The math

Per-row \`phase\` MotionValue, all advancing at the same rate (hover does NOT slow anything):

\`\`\`
SECONDS_PER_CYCLE = 5, AMPLITUDE_PX = 22, rowOffset = rowIndex * 0.35
local  = phase * 2π + rowOffset
scaleX = 0.55 + 0.45 * cos(local)
shiftX = sin(local) * 22
skewX  = sin(local) * 6°
boost  = 1 + hoverAccent * 0.10
transform = translateX(shiftX) skewX(skewX) scale(max(0.08, scaleX) * boost, boost)
\`\`\`

Colour: \`mix(dim, fg, (cos(local)+1)/2)\` base, then blended toward accent by \`hoverAccent\`. Write a \`mix(a, b, t)\` helper — sRGB hex lerp.

---

## Central loop

ONE \`useAnimationFrame\` in the parent advances every row's phase by \`dtSec / SECONDS_PER_CYCLE\` and eases every row's hover accent via \`alpha = 1 - exp(-10 * dtSec)\`. MotionValues with \`useMemo(() => Array.from({length:12}, () => motionValue(0)), [])\`.

---

## Hover tracking

Store \`hoveredIndex\` in a **ref**, not state — state re-renders the stack every hover and visibly stutters the rotation. Each row has an outer pointer-target \`<div>\` (\`width: 100%\`, flex-centered, \`cursor: pointer\`, \`touchAction: none\`) with \`onPointerEnter/Leave/Down/Up/Cancel\`. Inner \`<motion.div>\` carries transform + color.

---

## Top + bottom fades

Two \`pointer-events: none\` gradient divs at top/bottom (22% tall each, solid-bg → transparent) for the "infinite cylinder" feel.

---

## Reduced motion

\`(prefers-reduced-motion: reduce)\` → freeze each row at \`phase = 0.2 + rowIndex * 0.03\`.`,

  V0: `Single-file \`StackTower\` component. Install: \`framer-motion\`.

## Theme
- Dark: bg \`#0A0A0A\`, fg \`#EFEEE6\`, dim \`#3A3936\`
- Light: bg \`#EFEEE6\`, fg \`#0A0A0A\`, dim \`#C7C3B8\`
- Hover accent: \`#F16D14\`
- Detect via \`closest('[data-card-theme]')\` then \`html.dark\`; MutationObserver on ancestor chain.

## Layout
Root \`min-h-screen w-full flex items-center justify-center overflow-hidden\`, bg per theme. Inner column \`width: min(92vw, 620px)\`. Raw hex only.

## Rows
\`WORDS=['STACK','TOWER']\`, \`ROW_COUNT=12\`, row \`i\` = \`WORDS[i%2]\`. \`fontWeight: 900\`, \`fontSize: clamp(1.75rem, 9vw, 4.5rem)\`, \`lineHeight: 0.92\`, \`letterSpacing: -0.03em\`, nowrap, centred.

## Math (per row)
\`SECONDS_PER_CYCLE=5\`, \`AMPLITUDE_PX=22\`, \`rowOffset = i * 0.35\`.
\`\`\`
local  = phase*2π + rowOffset
scaleX = 0.55 + 0.45*cos(local)
shiftX = sin(local)*22
skewX  = sin(local)*6°
boost  = 1 + hoverAccent*0.10
transform = translateX(shiftX) skewX(skewX) scale(max(0.08, scaleX)*boost, boost)
color  = mix( mix(dim, fg, (cos(local)+1)/2), accent, hoverAccent )
\`\`\`
\`mix(a, b, t)\` = sRGB hex lerp.

## Central RAF
One \`useAnimationFrame\` in parent. Per-row MotionValues via \`useMemo(() => Array.from({length:12}, () => motionValue(0)), [])\`. All phases advance at SAME rate (hover does NOT slow anything). Hover eased with \`alpha = 1 - exp(-10*dtSec)\`.

## Hover
Store \`hoveredIndex\` in **ref** (not state — state re-renders stutter rotation). Outer pointer-target \`<div>\` per row (\`width:100%\`, flex-centered, \`cursor:pointer\`, \`touchAction:none\`, full pointer event set). Inner \`<motion.div>\` carries transform + color.

## Fades
Two pointer-events-none gradient divs at top/bottom (22% tall, bg-solid → transparent) for infinite-cylinder effect.

## Reduced motion
Freeze each row at \`phase = 0.2 + i*0.03\`.`,
}
