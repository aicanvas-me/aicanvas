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

Create a React client component named \`NoiseBg\`.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed canvas noise field: sparse random dots that subtly brighten near the cursor, with thin connecting lines drawn between lit neighbours. Centred overlay label "Noise" and small caps hint "hover to illuminate".

## Constants
- DENSITY = 1 / 120
- MAX_DOTS = 3000
- RADIUS = 200 (hover influence)
- NEIGHBOUR_D = 35 (max distance for connection line)
- BASE_A_DARK = 0.18, BASE_A_LIGHT = 0.28
- PEAK_A = 0.14

Types: Dot = { x, y, b } (b = brightness). Pair = [Dot, Dot].

## Build (on mount + ResizeObserver)
DPR canvas setup: ctx.setTransform(dpr,0,0,dpr,0,0). Generate count = min(round(cw*ch*DENSITY), MAX_DOTS) dots with random x,y, b=0. Cache neighbour pairs: nested loop i<j, if dx²+dy² < NEIGHBOUR_D², push pair.

## Per frame
clearRect. mx,my from mouseRef else -99999. r2 = RADIUS² .
dotRGB = isDark ? '255,255,255' : '28,25,22'; baseA = isDark ? 0.18 : 0.28.

For each dot:
- dist2 = (d.x-mx)² + (d.y-my)²
- tgt = dist2 < r2 ? exp(-dist2 / (RADIUS² * 0.25)) : 0
- d.b += (tgt > d.b ? 0.16 : 0.07) * (tgt - d.b); if d.b < 0.004, d.b = 0
- alpha = baseA + (PEAK_A - baseA) * d.b
- sz = 0.8 + d.b * 0.6
- fillStyle rgba(\${dotRGB},\${alpha.toFixed(2)}); fillRect(x-sz/2, y-sz/2, sz, sz)

For each pair [a,b]: if a.b<0.05 || b.b<0.05 skip. lineAlpha = min(a.b,b.b)*0.10; strokeStyle rgba; lineWidth 0.5; beginPath moveTo(a) lineTo(b) stroke.

## Theme
Detect via closest('[data-card-theme]').classList.contains('dark'), fallback documentElement. Both useState isDark (for bg/labels) and isDarkRef (for RAF closure). MutationObserver on both elements.

## JSX
Root div relative h-full w-full overflow-hidden, inline background dark '#110F0C' / light '#F5F1EA', mouse/touch handlers. Canvas absolute inset-0 100%/100%. Overlay pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 with two spans:
- "Noise": color dark rgba(255,255,255,0.45) / light rgba(28,25,22,0.45), fontSize 22, fontWeight 700, letterSpacing -0.02em
- "hover to illuminate": color dark rgba(255,255,255,0.18) / light rgba(28,25,22,0.22), fontSize 11, fontWeight 600, textTransform uppercase, letterSpacing 0.12em

Cleanup: alive flag, cancelAnimationFrame, ResizeObserver.disconnect, observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,

  'Lovable': `Create a React client component named \`NoiseBg\`.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed canvas noise field: sparse random dots that subtly brighten near the cursor, with thin connecting lines drawn between lit neighbours. Centred overlay label "Noise" and small caps hint "hover to illuminate".

## Constants
- DENSITY = 1 / 120
- MAX_DOTS = 3000
- RADIUS = 200 (hover influence)
- NEIGHBOUR_D = 35 (max distance for connection line)
- BASE_A_DARK = 0.18, BASE_A_LIGHT = 0.28
- PEAK_A = 0.14

Types: Dot = { x, y, b } (b = brightness). Pair = [Dot, Dot].

## Build (on mount + ResizeObserver)
DPR canvas setup: ctx.setTransform(dpr,0,0,dpr,0,0). Generate count = min(round(cw*ch*DENSITY), MAX_DOTS) dots with random x,y, b=0. Cache neighbour pairs: nested loop i<j, if dx²+dy² < NEIGHBOUR_D², push pair.

## Per frame
clearRect. mx,my from mouseRef else -99999. r2 = RADIUS² .
dotRGB = isDark ? '255,255,255' : '28,25,22'; baseA = isDark ? 0.18 : 0.28.

For each dot:
- dist2 = (d.x-mx)² + (d.y-my)²
- tgt = dist2 < r2 ? exp(-dist2 / (RADIUS² * 0.25)) : 0
- d.b += (tgt > d.b ? 0.16 : 0.07) * (tgt - d.b); if d.b < 0.004, d.b = 0
- alpha = baseA + (PEAK_A - baseA) * d.b
- sz = 0.8 + d.b * 0.6
- fillStyle rgba(\${dotRGB},\${alpha.toFixed(2)}); fillRect(x-sz/2, y-sz/2, sz, sz)

For each pair [a,b]: if a.b<0.05 || b.b<0.05 skip. lineAlpha = min(a.b,b.b)*0.10; strokeStyle rgba; lineWidth 0.5; beginPath moveTo(a) lineTo(b) stroke.

## Theme
Detect via closest('[data-card-theme]').classList.contains('dark'), fallback documentElement. Both useState isDark (for bg/labels) and isDarkRef (for RAF closure). MutationObserver on both elements.

## JSX
Root div relative h-full w-full overflow-hidden, inline background dark '#110F0C' / light '#F5F1EA', mouse/touch handlers. Canvas absolute inset-0 100%/100%. Overlay pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 with two spans:
- "Noise" — color dark rgba(255,255,255,0.45) / light rgba(28,25,22,0.45), fontSize 22, fontWeight 700, letterSpacing -0.02em
- "hover to illuminate" — color dark rgba(255,255,255,0.18) / light rgba(28,25,22,0.22), fontSize 11, fontWeight 600, textTransform uppercase, letterSpacing 0.12em

Cleanup: alive flag, cancelAnimationFrame, ResizeObserver.disconnect, observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,

  'V0': `Create a React client component named \`NoiseBg\`.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed canvas noise field: sparse random dots that subtly brighten near the cursor, with thin connecting lines drawn between lit neighbours. Centred overlay label "Noise" and small caps hint "hover to illuminate".

## Constants
- DENSITY = 1 / 120
- MAX_DOTS = 3000
- RADIUS = 200 (hover influence)
- NEIGHBOUR_D = 35 (max distance for connection line)
- BASE_A_DARK = 0.18, BASE_A_LIGHT = 0.28
- PEAK_A = 0.14

Types: Dot = { x, y, b } (b = brightness). Pair = [Dot, Dot].

## Build (on mount + ResizeObserver)
DPR canvas setup: ctx.setTransform(dpr,0,0,dpr,0,0). Generate count = min(round(cw*ch*DENSITY), MAX_DOTS) dots with random x,y, b=0. Cache neighbour pairs: nested loop i<j, if dx²+dy² < NEIGHBOUR_D², push pair.

## Per frame
clearRect. mx,my from mouseRef else -99999. r2 = RADIUS² .
dotRGB = isDark ? '255,255,255' : '28,25,22'; baseA = isDark ? 0.18 : 0.28.

For each dot:
- dist2 = (d.x-mx)² + (d.y-my)²
- tgt = dist2 < r2 ? exp(-dist2 / (RADIUS² * 0.25)) : 0
- d.b += (tgt > d.b ? 0.16 : 0.07) * (tgt - d.b); if d.b < 0.004, d.b = 0
- alpha = baseA + (PEAK_A - baseA) * d.b
- sz = 0.8 + d.b * 0.6
- fillStyle rgba(\${dotRGB},\${alpha.toFixed(2)}); fillRect(x-sz/2, y-sz/2, sz, sz)

For each pair [a,b]: if a.b<0.05 || b.b<0.05 skip. lineAlpha = min(a.b,b.b)*0.10; strokeStyle rgba; lineWidth 0.5; beginPath moveTo(a) lineTo(b) stroke.

## Theme
Detect via closest('[data-card-theme]').classList.contains('dark'), fallback documentElement. Both useState isDark (for bg/labels) and isDarkRef (for RAF closure). MutationObserver on both elements.

## JSX
Root div relative h-full w-full overflow-hidden, inline background dark '#110F0C' / light '#F5F1EA', mouse/touch handlers. Canvas absolute inset-0 100%/100%. Overlay pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 with two spans:
- "Noise" — color dark rgba(255,255,255,0.45) / light rgba(28,25,22,0.45), fontSize 22, fontWeight 700, letterSpacing -0.02em
- "hover to illuminate" — color dark rgba(255,255,255,0.18) / light rgba(28,25,22,0.22), fontSize 11, fontWeight 600, textTransform uppercase, letterSpacing 0.12em

Cleanup: alive flag, cancelAnimationFrame, ResizeObserver.disconnect, observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,
}
