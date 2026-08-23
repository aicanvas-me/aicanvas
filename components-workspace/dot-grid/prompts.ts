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

Create a React client component named \`InteractiveDotGrid\` (accept optional \`{ showLabel = true }\` prop). Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed canvas of tiny square dots on a uniform grid. Dots illuminate near the cursor with a power-1.5 falloff and grow slightly when lit. Cursor is tracked at the WINDOW level so the grid stays reactive even when rendered behind pointer-events:none elements.

Constants:
\`\`\`
SPACING = 20    // px between dot centres
RADIUS  = 130   // hover influence radius
BASE_A  = 0.13  // resting dot opacity (dark mode)
PEAK_A  = 0.92  // fully-lit opacity
\`\`\`

Build: cols = floor(cw/SPACING)+2, rows = floor(ch/SPACING)+2, ox = (cw%SPACING)/2, oy = (ch%SPACING)/2. Each dot: \`{ x: ox + c*SPACING, y: oy + r*SPACING, b: 0 }\`.

Per-frame loop:
- dist2 = (x-mx)^2 + (y-my)^2
- tgt = dist2 < RADIUS*RADIUS ? Math.pow(1 - Math.sqrt(dist2)/RADIUS, 1.5) : 0
- d.b += (tgt > d.b ? 0.16 : 0.07) * (tgt - d.b); if d.b < 0.004 d.b = 0
- baseA = isDark ? BASE_A : 0.25  (note: LIGHT uses 0.25, not BASE_A)
- alpha = baseA + (PEAK_A - baseA) * d.b
- sz = 1 + d.b * 1.2   // 1px → 2.2px
- fillStyle = rgba(dotRGB, alpha.toFixed(2)); fillRect(d.x - sz/2, d.y - sz/2, sz, sz)

dotRGB = dark ? '255,255,255' : '28,25,22'.

Standard DPR canvas setup. ResizeObserver on canvas.parentElement rebuilds grid.

## Pointer tracking (WINDOW-LEVEL, not on the div)
Register passive listeners on window: \`mousemove\`, \`touchmove\`, \`touchend\`, \`touchcancel\`, plus \`document.addEventListener('mouseleave', clear)\`. On move, read \`canvasRef.current.getBoundingClientRect()\` and write \`{x: clientX - rect.left, y: clientY - rect.top}\` to mouseRef. touchend/touchcancel/mouseleave set to null. This is different from other canvas components. Do not attach handlers to the outer div.

Theme detection: walk containerRef.closest('[data-card-theme]'), fallback to documentElement. MutationObserver on both. Mirror into isDarkRef + isDark state.

JSX: outer div (NO pointer handlers, tracking is on window), relative h-full w-full overflow-hidden, bg '#110F0C' dark / '#F5F1EA' light. Canvas absolute inset-0 width/height 100%. If \`showLabel\` is true, render centered pointer-events-none overlay:
- "Dot Grid": fontSize 22, fontWeight 700, letterSpacing -0.02em, color rgba(255,255,255,0.45) dark / rgba(28,25,22,0.45) light
- "hover to illuminate": fontSize 11, fontWeight 600, textTransform uppercase, letterSpacing 0.12em, color rgba(255,255,255,0.18) dark / rgba(28,25,22,0.22) light

Cleanup: alive=false, cancelAnimationFrame, ro.disconnect, observer.disconnect, remove all window/document listeners.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,

  'Lovable': `Create a React client component named \`InteractiveDotGrid\` (accept optional \`{ showLabel = true }\` prop). Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed canvas of tiny square dots on a uniform grid. Dots illuminate near the cursor with a power-1.5 falloff and grow slightly when lit. Cursor is tracked at the WINDOW level so the grid stays reactive even when rendered behind pointer-events:none elements.

Constants:
\`\`\`
SPACING = 20    // px between dot centres
RADIUS  = 130   // hover influence radius
BASE_A  = 0.13  // resting dot opacity (dark mode)
PEAK_A  = 0.92  // fully-lit opacity
\`\`\`

Build: cols = floor(cw/SPACING)+2, rows = floor(ch/SPACING)+2, ox = (cw%SPACING)/2, oy = (ch%SPACING)/2. Each dot: \`{ x: ox + c*SPACING, y: oy + r*SPACING, b: 0 }\`.

Per-frame loop:
- dist2 = (x-mx)^2 + (y-my)^2
- tgt = dist2 < RADIUS*RADIUS ? Math.pow(1 - Math.sqrt(dist2)/RADIUS, 1.5) : 0
- d.b += (tgt > d.b ? 0.16 : 0.07) * (tgt - d.b); if d.b < 0.004 d.b = 0
- baseA = isDark ? BASE_A : 0.25  (note: LIGHT uses 0.25, not BASE_A)
- alpha = baseA + (PEAK_A - baseA) * d.b
- sz = 1 + d.b * 1.2   // 1px → 2.2px
- fillStyle = rgba(dotRGB, alpha.toFixed(2)); fillRect(d.x - sz/2, d.y - sz/2, sz, sz)

dotRGB = dark ? '255,255,255' : '28,25,22'.

Standard DPR canvas setup. ResizeObserver on canvas.parentElement rebuilds grid.

## Pointer tracking (WINDOW-LEVEL, not on the div)
Register passive listeners on window: \`mousemove\`, \`touchmove\`, \`touchend\`, \`touchcancel\`, plus \`document.addEventListener('mouseleave', clear)\`. On move, read \`canvasRef.current.getBoundingClientRect()\` and write \`{x: clientX - rect.left, y: clientY - rect.top}\` to mouseRef. touchend/touchcancel/mouseleave set to null. This is different from other canvas components — do not attach handlers to the outer div.

Theme detection: walk containerRef.closest('[data-card-theme]'), fallback to documentElement. MutationObserver on both. Mirror into isDarkRef + isDark state.

JSX: outer div (NO pointer handlers — tracking is on window), relative h-full w-full overflow-hidden, bg '#110F0C' dark / '#F5F1EA' light. Canvas absolute inset-0 width/height 100%. If \`showLabel\` is true, render centered pointer-events-none overlay:
- "Dot Grid" — fontSize 22, fontWeight 700, letterSpacing -0.02em, color rgba(255,255,255,0.45) dark / rgba(28,25,22,0.45) light
- "hover to illuminate" — fontSize 11, fontWeight 600, textTransform uppercase, letterSpacing 0.12em, color rgba(255,255,255,0.18) dark / rgba(28,25,22,0.22) light

Cleanup: alive=false, cancelAnimationFrame, ro.disconnect, observer.disconnect, remove all window/document listeners.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,

  'V0': `Create a React client component named \`InteractiveDotGrid\` (accept optional \`{ showLabel = true }\` prop). Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed canvas of tiny square dots on a uniform grid. Dots illuminate near the cursor with a power-1.5 falloff and grow slightly when lit. Cursor is tracked at the WINDOW level so the grid stays reactive even when rendered behind pointer-events:none elements.

Constants:
\`\`\`
SPACING = 20    // px between dot centres
RADIUS  = 130   // hover influence radius
BASE_A  = 0.13  // resting dot opacity (dark mode)
PEAK_A  = 0.92  // fully-lit opacity
\`\`\`

Build: cols = floor(cw/SPACING)+2, rows = floor(ch/SPACING)+2, ox = (cw%SPACING)/2, oy = (ch%SPACING)/2. Each dot: \`{ x: ox + c*SPACING, y: oy + r*SPACING, b: 0 }\`.

Per-frame loop:
- dist2 = (x-mx)^2 + (y-my)^2
- tgt = dist2 < RADIUS*RADIUS ? Math.pow(1 - Math.sqrt(dist2)/RADIUS, 1.5) : 0
- d.b += (tgt > d.b ? 0.16 : 0.07) * (tgt - d.b); if d.b < 0.004 d.b = 0
- baseA = isDark ? BASE_A : 0.25  (note: LIGHT uses 0.25, not BASE_A)
- alpha = baseA + (PEAK_A - baseA) * d.b
- sz = 1 + d.b * 1.2   // 1px → 2.2px
- fillStyle = rgba(dotRGB, alpha.toFixed(2)); fillRect(d.x - sz/2, d.y - sz/2, sz, sz)

dotRGB = dark ? '255,255,255' : '28,25,22'.

Standard DPR canvas setup. ResizeObserver on canvas.parentElement rebuilds grid.

## Pointer tracking (WINDOW-LEVEL, not on the div)
Register passive listeners on window: \`mousemove\`, \`touchmove\`, \`touchend\`, \`touchcancel\`, plus \`document.addEventListener('mouseleave', clear)\`. On move, read \`canvasRef.current.getBoundingClientRect()\` and write \`{x: clientX - rect.left, y: clientY - rect.top}\` to mouseRef. touchend/touchcancel/mouseleave set to null. This is different from other canvas components — do not attach handlers to the outer div.

Theme detection: walk containerRef.closest('[data-card-theme]'), fallback to documentElement. MutationObserver on both. Mirror into isDarkRef + isDark state.

JSX: outer div (NO pointer handlers — tracking is on window), relative h-full w-full overflow-hidden, bg '#110F0C' dark / '#F5F1EA' light. Canvas absolute inset-0 width/height 100%. If \`showLabel\` is true, render centered pointer-events-none overlay:
- "Dot Grid" — fontSize 22, fontWeight 700, letterSpacing -0.02em, color rgba(255,255,255,0.45) dark / rgba(28,25,22,0.45) light
- "hover to illuminate" — fontSize 11, fontWeight 600, textTransform uppercase, letterSpacing 0.12em, color rgba(255,255,255,0.18) dark / rgba(28,25,22,0.22) light

Cleanup: alive=false, cancelAnimationFrame, ro.disconnect, observer.disconnect, remove all window/document listeners.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,
}
