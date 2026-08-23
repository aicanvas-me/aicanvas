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

Create a React client component named \`BubbleField\`. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed HTML canvas filling its parent. A uniform grid of tiny stroked circles. On hover, circles near the cursor burst: expand and fade, briefly vanish, then reform. DPR-aware canvas, requestAnimationFrame, ResizeObserver.

Constants:
\`\`\`
SPACING = 20      // px between centres
RADIUS  = 200     // hover influence radius
BASE_R  = 1.5     // resting radius
BURST_R = 16      // extra radius during burst
BASE_A_DARK  = 0.55
BASE_A_LIGHT = 0.75
\`\`\`

Build grid once: cols = floor(cw/SPACING)+2, rows = floor(ch/SPACING)+2, ox = (cw%SPACING)/2, oy = (ch%SPACING)/2. Each bubble: \`{ x, y, b: 0, phase: Math.random() }\`.

Per-frame loop:
- dist2 = (x-mx)^2 + (y-my)^2
- tgt = dist2 < RADIUS*RADIUS ? Math.exp(-dist2 / (RADIUS*RADIUS*0.25)) : 0
- b += (tgt > b ? 0.16 : 0.07) * (tgt - b); if b < 0.004 b = 0
- if b > 0.08: phase = (phase + 0.025 * b) % 1
- With p = phase:
  - resting (b <= 0.08): stroke circle radius BASE_R at alpha baseA
  - p < 0.55: t = p/0.55; r = BASE_R + t*BURST_R; alpha = baseA*(1-t) (skip if < 0.004)
  - 0.55 <= p < 0.72: draw nothing
  - p >= 0.72: t = (p-0.72)/0.28; r = BASE_R*t; alpha = baseA*t (skip if r <= 0.2 or alpha <= 0.004)
- Every stroke: strokeStyle \`rgba(\${dotRGB},\${alpha.toFixed(3)})\`, lineWidth 0.5. dotRGB = dark ? '255,255,255' : '28,25,22'.

Standard DPR: dpr = devicePixelRatio || 1; canvas.width = round(rect.width*dpr); same for height; ctx.setTransform(dpr,0,0,dpr,0,0). ResizeObserver on canvas.parentElement re-runs build(). Mouse tracked via onMouseMove/onTouchMove on outer div, writing {x: clientX - canvasRect.left, y: clientY - canvasRect.top} to mouseRef. onMouseLeave/onTouchEnd sets mouseRef.current = null. Use sentinel -99999 when null.

Theme detection: walk \`containerRef.current.closest('[data-card-theme]')\`; if found read its \`dark\` class, otherwise read \`document.documentElement.classList.contains('dark')\`. MutationObserver on both for class changes. Mirror into isDarkRef (for the RAF loop) and isDark state (for JSX bg).

JSX: outer div relative h-full w-full overflow-hidden, inline background '#110F0C' dark / '#F5F1EA' light. Canvas absolute inset-0 width/height 100%. Centered pointer-events-none overlay with:
- "Bubble Field": fontSize 22, fontWeight 700, letterSpacing -0.02em, color rgba(255,255,255,0.45) dark / rgba(28,25,22,0.45) light
- "hover to burst": fontSize 11, fontWeight 600, textTransform uppercase, letterSpacing 0.12em, color rgba(255,255,255,0.18) dark / rgba(28,25,22,0.22) light

Cleanup: alive=false, cancelAnimationFrame, ro.disconnect, observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,

  'Lovable': `Create a React client component named \`BubbleField\`. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed HTML canvas filling its parent. A uniform grid of tiny stroked circles. On hover, circles near the cursor burst: expand and fade, briefly vanish, then reform. DPR-aware canvas, requestAnimationFrame, ResizeObserver.

Constants:
\`\`\`
SPACING = 20      // px between centres
RADIUS  = 200     // hover influence radius
BASE_R  = 1.5     // resting radius
BURST_R = 16      // extra radius during burst
BASE_A_DARK  = 0.55
BASE_A_LIGHT = 0.75
\`\`\`

Build grid once: cols = floor(cw/SPACING)+2, rows = floor(ch/SPACING)+2, ox = (cw%SPACING)/2, oy = (ch%SPACING)/2. Each bubble: \`{ x, y, b: 0, phase: Math.random() }\`.

Per-frame loop:
- dist2 = (x-mx)^2 + (y-my)^2
- tgt = dist2 < RADIUS*RADIUS ? Math.exp(-dist2 / (RADIUS*RADIUS*0.25)) : 0
- b += (tgt > b ? 0.16 : 0.07) * (tgt - b); if b < 0.004 b = 0
- if b > 0.08: phase = (phase + 0.025 * b) % 1
- With p = phase:
  - resting (b <= 0.08): stroke circle radius BASE_R at alpha baseA
  - p < 0.55: t = p/0.55; r = BASE_R + t*BURST_R; alpha = baseA*(1-t) (skip if < 0.004)
  - 0.55 <= p < 0.72: draw nothing
  - p >= 0.72: t = (p-0.72)/0.28; r = BASE_R*t; alpha = baseA*t (skip if r <= 0.2 or alpha <= 0.004)
- Every stroke: strokeStyle \`rgba(\${dotRGB},\${alpha.toFixed(3)})\`, lineWidth 0.5. dotRGB = dark ? '255,255,255' : '28,25,22'.

Standard DPR: dpr = devicePixelRatio || 1; canvas.width = round(rect.width*dpr); same for height; ctx.setTransform(dpr,0,0,dpr,0,0). ResizeObserver on canvas.parentElement re-runs build(). Mouse tracked via onMouseMove/onTouchMove on outer div, writing {x: clientX - canvasRect.left, y: clientY - canvasRect.top} to mouseRef. onMouseLeave/onTouchEnd sets mouseRef.current = null. Use sentinel -99999 when null.

Theme detection: walk \`containerRef.current.closest('[data-card-theme]')\`; if found read its \`dark\` class, otherwise read \`document.documentElement.classList.contains('dark')\`. MutationObserver on both for class changes. Mirror into isDarkRef (for the RAF loop) and isDark state (for JSX bg).

JSX: outer div relative h-full w-full overflow-hidden, inline background '#110F0C' dark / '#F5F1EA' light. Canvas absolute inset-0 width/height 100%. Centered pointer-events-none overlay with:
- "Bubble Field" — fontSize 22, fontWeight 700, letterSpacing -0.02em, color rgba(255,255,255,0.45) dark / rgba(28,25,22,0.45) light
- "hover to burst" — fontSize 11, fontWeight 600, textTransform uppercase, letterSpacing 0.12em, color rgba(255,255,255,0.18) dark / rgba(28,25,22,0.22) light

Cleanup: alive=false, cancelAnimationFrame, ro.disconnect, observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,

  'V0': `Create a React client component named \`BubbleField\`. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed HTML canvas filling its parent. A uniform grid of tiny stroked circles. On hover, circles near the cursor burst: expand and fade, briefly vanish, then reform. DPR-aware canvas, requestAnimationFrame, ResizeObserver.

Constants:
\`\`\`
SPACING = 20      // px between centres
RADIUS  = 200     // hover influence radius
BASE_R  = 1.5     // resting radius
BURST_R = 16      // extra radius during burst
BASE_A_DARK  = 0.55
BASE_A_LIGHT = 0.75
\`\`\`

Build grid once: cols = floor(cw/SPACING)+2, rows = floor(ch/SPACING)+2, ox = (cw%SPACING)/2, oy = (ch%SPACING)/2. Each bubble: \`{ x, y, b: 0, phase: Math.random() }\`.

Per-frame loop:
- dist2 = (x-mx)^2 + (y-my)^2
- tgt = dist2 < RADIUS*RADIUS ? Math.exp(-dist2 / (RADIUS*RADIUS*0.25)) : 0
- b += (tgt > b ? 0.16 : 0.07) * (tgt - b); if b < 0.004 b = 0
- if b > 0.08: phase = (phase + 0.025 * b) % 1
- With p = phase:
  - resting (b <= 0.08): stroke circle radius BASE_R at alpha baseA
  - p < 0.55: t = p/0.55; r = BASE_R + t*BURST_R; alpha = baseA*(1-t) (skip if < 0.004)
  - 0.55 <= p < 0.72: draw nothing
  - p >= 0.72: t = (p-0.72)/0.28; r = BASE_R*t; alpha = baseA*t (skip if r <= 0.2 or alpha <= 0.004)
- Every stroke: strokeStyle \`rgba(\${dotRGB},\${alpha.toFixed(3)})\`, lineWidth 0.5. dotRGB = dark ? '255,255,255' : '28,25,22'.

Standard DPR: dpr = devicePixelRatio || 1; canvas.width = round(rect.width*dpr); same for height; ctx.setTransform(dpr,0,0,dpr,0,0). ResizeObserver on canvas.parentElement re-runs build(). Mouse tracked via onMouseMove/onTouchMove on outer div, writing {x: clientX - canvasRect.left, y: clientY - canvasRect.top} to mouseRef. onMouseLeave/onTouchEnd sets mouseRef.current = null. Use sentinel -99999 when null.

Theme detection: walk \`containerRef.current.closest('[data-card-theme]')\`; if found read its \`dark\` class, otherwise read \`document.documentElement.classList.contains('dark')\`. MutationObserver on both for class changes. Mirror into isDarkRef (for the RAF loop) and isDark state (for JSX bg).

JSX: outer div relative h-full w-full overflow-hidden, inline background '#110F0C' dark / '#F5F1EA' light. Canvas absolute inset-0 width/height 100%. Centered pointer-events-none overlay with:
- "Bubble Field" — fontSize 22, fontWeight 700, letterSpacing -0.02em, color rgba(255,255,255,0.45) dark / rgba(28,25,22,0.45) light
- "hover to burst" — fontSize 11, fontWeight 600, textTransform uppercase, letterSpacing 0.12em, color rgba(255,255,255,0.18) dark / rgba(28,25,22,0.22) light

Cleanup: alive=false, cancelAnimationFrame, ro.disconnect, observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,
}
