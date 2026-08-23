import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Root element: className="relative min-h-screen w-full overflow-hidden"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named \`GridLines\`. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed canvas of a dot grid connected by horizontal and vertical lines. The cursor does TWO things: (1) it brightens nearby dots and segments via a Gaussian halo, and (2) it bulges the grid outward via a lens influence that peaks at mid-distance and fades at the cursor itself and at the edge of R. The grid visibly warps like a magnifying lens as lines bend through the displaced dots.

Constants:
\`\`\`
SPACING      = 20
RADIUS_FRAC  = 0.30   // hover radius = fraction of max(cw, ch)
LENS_FRAC    = 0.06   // lens push strength = fraction of R
BASE_A       = 0.13   // resting dot opacity (dark)
PEAK_A       = 0.95
LINE_A_DARK  = 0.07   // resting line opacity dark
LINE_A_LIGHT = 0.12   // resting line opacity light
\`\`\`

Types:
\`\`\`
type Dot = { x: number; y: number; b: number; l: number; px: number; py: number }
type Segment = { a: Dot; b: Dot }
\`\`\`
\`x,y\` = rest position; \`b\` = smoothed brightness; \`l\` = smoothed lens influence; \`px,py\` = current displaced position recomputed each frame.

Build: cols = floor(cw/SPACING)+2, rows = floor(ch/SPACING)+2, ox = (cw%SPACING)/2, oy = (ch%SPACING)/2. Create a 2D grid array for neighbour lookup. Each dot starts with b=0, l=0, px=x, py=y. Build hSegs (c+1<cols) and vSegs (r+1<rows) from the grid.

Per-frame loop:
\`\`\`
R         = RADIUS_FRAC * max(cw, ch)
r2        = R * R
lensPush  = LENS_FRAC * R
dotRGB    = isDark ? '255,255,255' : '28,25,22'
baseA     = isDark ? BASE_A : 0.22
lineRestA = isDark ? LINE_A_DARK : LINE_A_LIGHT
\`\`\`

Pass 1, per dot:
\`\`\`
dx = d.x - mx; dy = d.y - my
dist2 = dx*dx + dy*dy
dist  = Math.sqrt(dist2)

// Brightness: Gaussian halo
tgtB = dist2 < r2 ? Math.exp(-dist2 / (r2 * 0.45)) : 0
d.b += (tgtB > d.b ? 0.16 : 0.07) * (tgtB - d.b)
if d.b < 0.004: d.b = 0

// Lens: sin(πt) bell curve peaking at mid-distance
tgtL = dist < R ? Math.sin(Math.PI * (dist / R)) : 0
d.l += (tgtL > d.l ? 0.18 : 0.08) * (tgtL - d.l)
if d.l < 0.004: d.l = 0

// Displaced position: pushed outward along the cursor→dot ray
if dist > 0.5 and d.l > 0.004:
  push = lensPush * d.l
  ux = dx / dist; uy = dy / dist
  d.px = d.x + ux * push
  d.py = d.y + uy * push
else:
  d.px = d.x
  d.py = d.y
\`\`\`

Pass 2, draw lines through displaced dot positions:
\`\`\`
for seg in [...hSegs, ...vSegs]:
  segB  = (seg.a.b + seg.b.b) / 2
  lineA = lineRestA + (PEAK_A - lineRestA) * segB
  strokeStyle = rgba(dotRGB, lineA.toFixed(3))
  lineWidth   = 0.5 + segB * 0.6
  beginPath; moveTo(seg.a.px, seg.a.py); lineTo(seg.b.px, seg.b.py); stroke
\`\`\`

Pass 3, draw dots on top at displaced positions:
\`\`\`
for d in dots:
  alpha = baseA + (PEAK_A - baseA) * d.b
  sz    = 1 + d.b * 2.2
  fillStyle = rgba(dotRGB, alpha.toFixed(2))
  fillRect(d.px - sz/2, d.py - sz/2, sz, sz)
\`\`\`

Standard DPR canvas setup. ResizeObserver on canvas.parentElement rebuilds grid. Mouse handlers on outer div write {x: clientX - canvasRect.left, y: clientY - canvasRect.top}; onMouseLeave/onTouchEnd clears to null. Sentinel -99999.

Theme detection: walk containerRef.closest('[data-card-theme]'), fallback documentElement. MutationObserver on both. Mirror into isDarkRef + isDark state.

JSX: outer div relative h-full w-full overflow-hidden, bg '#110F0C' dark / '#F5F1EA' light. Canvas absolute inset-0 width/height 100%. Centered pointer-events-none overlay:
- "Grid Lines": fontSize 22, fontWeight 700, letterSpacing -0.02em, color rgba(255,255,255,0.45) dark / rgba(28,25,22,0.45) light
- "hover to illuminate": fontSize 11, fontWeight 600, textTransform uppercase, letterSpacing 0.12em, color rgba(255,255,255,0.18) dark / rgba(28,25,22,0.22) light

Cleanup: alive=false, cancelAnimationFrame, ro.disconnect, observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,

  'Lovable': `Create a React client component named \`GridLines\`. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed canvas of a dot grid connected by horizontal and vertical lines. The cursor does TWO things: (1) it brightens nearby dots and segments via a Gaussian halo, and (2) it bulges the grid outward via a lens influence that peaks at mid-distance and fades at the cursor itself and at the edge of R — the grid visibly warps like a magnifying lens as lines bend through the displaced dots.

Constants:
\`\`\`
SPACING      = 20
RADIUS_FRAC  = 0.30   // hover radius = fraction of max(cw, ch)
LENS_FRAC    = 0.06   // lens push strength = fraction of R
BASE_A       = 0.13   // resting dot opacity (dark)
PEAK_A       = 0.95
LINE_A_DARK  = 0.07   // resting line opacity dark
LINE_A_LIGHT = 0.12   // resting line opacity light
\`\`\`

Types:
\`\`\`
type Dot = { x: number; y: number; b: number; l: number; px: number; py: number }
type Segment = { a: Dot; b: Dot }
\`\`\`
\`x,y\` = rest position; \`b\` = smoothed brightness; \`l\` = smoothed lens influence; \`px,py\` = current displaced position recomputed each frame.

Build: cols = floor(cw/SPACING)+2, rows = floor(ch/SPACING)+2, ox = (cw%SPACING)/2, oy = (ch%SPACING)/2. Create a 2D grid array for neighbour lookup. Each dot starts with b=0, l=0, px=x, py=y. Build hSegs (c+1<cols) and vSegs (r+1<rows) from the grid.

Per-frame loop:
\`\`\`
R         = RADIUS_FRAC * max(cw, ch)
r2        = R * R
lensPush  = LENS_FRAC * R
dotRGB    = isDark ? '255,255,255' : '28,25,22'
baseA     = isDark ? BASE_A : 0.22
lineRestA = isDark ? LINE_A_DARK : LINE_A_LIGHT
\`\`\`

Pass 1 — per dot:
\`\`\`
dx = d.x - mx; dy = d.y - my
dist2 = dx*dx + dy*dy
dist  = Math.sqrt(dist2)

// Brightness — Gaussian halo
tgtB = dist2 < r2 ? Math.exp(-dist2 / (r2 * 0.45)) : 0
d.b += (tgtB > d.b ? 0.16 : 0.07) * (tgtB - d.b)
if d.b < 0.004: d.b = 0

// Lens — sin(πt) bell curve peaking at mid-distance
tgtL = dist < R ? Math.sin(Math.PI * (dist / R)) : 0
d.l += (tgtL > d.l ? 0.18 : 0.08) * (tgtL - d.l)
if d.l < 0.004: d.l = 0

// Displaced position — pushed outward along the cursor→dot ray
if dist > 0.5 and d.l > 0.004:
  push = lensPush * d.l
  ux = dx / dist; uy = dy / dist
  d.px = d.x + ux * push
  d.py = d.y + uy * push
else:
  d.px = d.x
  d.py = d.y
\`\`\`

Pass 2 — draw lines through displaced dot positions:
\`\`\`
for seg in [...hSegs, ...vSegs]:
  segB  = (seg.a.b + seg.b.b) / 2
  lineA = lineRestA + (PEAK_A - lineRestA) * segB
  strokeStyle = rgba(dotRGB, lineA.toFixed(3))
  lineWidth   = 0.5 + segB * 0.6
  beginPath; moveTo(seg.a.px, seg.a.py); lineTo(seg.b.px, seg.b.py); stroke
\`\`\`

Pass 3 — draw dots on top at displaced positions:
\`\`\`
for d in dots:
  alpha = baseA + (PEAK_A - baseA) * d.b
  sz    = 1 + d.b * 2.2
  fillStyle = rgba(dotRGB, alpha.toFixed(2))
  fillRect(d.px - sz/2, d.py - sz/2, sz, sz)
\`\`\`

Standard DPR canvas setup. ResizeObserver on canvas.parentElement rebuilds grid. Mouse handlers on outer div write {x: clientX - canvasRect.left, y: clientY - canvasRect.top}; onMouseLeave/onTouchEnd clears to null. Sentinel -99999.

Theme detection: walk containerRef.closest('[data-card-theme]'), fallback documentElement. MutationObserver on both. Mirror into isDarkRef + isDark state.

JSX: outer div relative h-full w-full overflow-hidden, bg '#110F0C' dark / '#F5F1EA' light. Canvas absolute inset-0 width/height 100%. Centered pointer-events-none overlay:
- "Grid Lines" — fontSize 22, fontWeight 700, letterSpacing -0.02em, color rgba(255,255,255,0.45) dark / rgba(28,25,22,0.45) light
- "hover to illuminate" — fontSize 11, fontWeight 600, textTransform uppercase, letterSpacing 0.12em, color rgba(255,255,255,0.18) dark / rgba(28,25,22,0.22) light

Cleanup: alive=false, cancelAnimationFrame, ro.disconnect, observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,

  'V0': `Create a React client component named \`GridLines\`. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed canvas of a dot grid connected by horizontal and vertical lines. The cursor does TWO things: (1) it brightens nearby dots and segments via a Gaussian halo, and (2) it bulges the grid outward via a lens influence that peaks at mid-distance and fades at the cursor itself and at the edge of R — the grid visibly warps like a magnifying lens as lines bend through the displaced dots.

Constants:
\`\`\`
SPACING      = 20
RADIUS_FRAC  = 0.30   // hover radius = fraction of max(cw, ch)
LENS_FRAC    = 0.06   // lens push strength = fraction of R
BASE_A       = 0.13   // resting dot opacity (dark)
PEAK_A       = 0.95
LINE_A_DARK  = 0.07   // resting line opacity dark
LINE_A_LIGHT = 0.12   // resting line opacity light
\`\`\`

Types:
\`\`\`
type Dot = { x: number; y: number; b: number; l: number; px: number; py: number }
type Segment = { a: Dot; b: Dot }
\`\`\`
\`x,y\` = rest position; \`b\` = smoothed brightness; \`l\` = smoothed lens influence; \`px,py\` = current displaced position recomputed each frame.

Build: cols = floor(cw/SPACING)+2, rows = floor(ch/SPACING)+2, ox = (cw%SPACING)/2, oy = (ch%SPACING)/2. Create a 2D grid array for neighbour lookup. Each dot starts with b=0, l=0, px=x, py=y. Build hSegs (c+1<cols) and vSegs (r+1<rows) from the grid.

Per-frame loop:
\`\`\`
R         = RADIUS_FRAC * max(cw, ch)
r2        = R * R
lensPush  = LENS_FRAC * R
dotRGB    = isDark ? '255,255,255' : '28,25,22'
baseA     = isDark ? BASE_A : 0.22
lineRestA = isDark ? LINE_A_DARK : LINE_A_LIGHT
\`\`\`

Pass 1 — per dot:
\`\`\`
dx = d.x - mx; dy = d.y - my
dist2 = dx*dx + dy*dy
dist  = Math.sqrt(dist2)

// Brightness — Gaussian halo
tgtB = dist2 < r2 ? Math.exp(-dist2 / (r2 * 0.45)) : 0
d.b += (tgtB > d.b ? 0.16 : 0.07) * (tgtB - d.b)
if d.b < 0.004: d.b = 0

// Lens — sin(πt) bell curve peaking at mid-distance
tgtL = dist < R ? Math.sin(Math.PI * (dist / R)) : 0
d.l += (tgtL > d.l ? 0.18 : 0.08) * (tgtL - d.l)
if d.l < 0.004: d.l = 0

// Displaced position — pushed outward along the cursor→dot ray
if dist > 0.5 and d.l > 0.004:
  push = lensPush * d.l
  ux = dx / dist; uy = dy / dist
  d.px = d.x + ux * push
  d.py = d.y + uy * push
else:
  d.px = d.x
  d.py = d.y
\`\`\`

Pass 2 — draw lines through displaced dot positions:
\`\`\`
for seg in [...hSegs, ...vSegs]:
  segB  = (seg.a.b + seg.b.b) / 2
  lineA = lineRestA + (PEAK_A - lineRestA) * segB
  strokeStyle = rgba(dotRGB, lineA.toFixed(3))
  lineWidth   = 0.5 + segB * 0.6
  beginPath; moveTo(seg.a.px, seg.a.py); lineTo(seg.b.px, seg.b.py); stroke
\`\`\`

Pass 3 — draw dots on top at displaced positions:
\`\`\`
for d in dots:
  alpha = baseA + (PEAK_A - baseA) * d.b
  sz    = 1 + d.b * 2.2
  fillStyle = rgba(dotRGB, alpha.toFixed(2))
  fillRect(d.px - sz/2, d.py - sz/2, sz, sz)
\`\`\`

Standard DPR canvas setup. ResizeObserver on canvas.parentElement rebuilds grid. Mouse handlers on outer div write {x: clientX - canvasRect.left, y: clientY - canvasRect.top}; onMouseLeave/onTouchEnd clears to null. Sentinel -99999.

Theme detection: walk containerRef.closest('[data-card-theme]'), fallback documentElement. MutationObserver on both. Mirror into isDarkRef + isDark state.

JSX: outer div relative h-full w-full overflow-hidden, bg '#110F0C' dark / '#F5F1EA' light. Canvas absolute inset-0 width/height 100%. Centered pointer-events-none overlay:
- "Grid Lines" — fontSize 22, fontWeight 700, letterSpacing -0.02em, color rgba(255,255,255,0.45) dark / rgba(28,25,22,0.45) light
- "hover to illuminate" — fontSize 11, fontWeight 600, textTransform uppercase, letterSpacing 0.12em, color rgba(255,255,255,0.18) dark / rgba(28,25,22,0.22) light

Cleanup: alive=false, cancelAnimationFrame, ro.disconnect, observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,
}
