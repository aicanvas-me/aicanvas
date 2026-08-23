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

Create a React client component named \`DistortionGrid\`. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed canvas renders a grid of horizontal and vertical lines that undulate with low-frequency sine waves. When the mouse is over the canvas, (a) amplitude grows globally via a smoothed hoverStr, and (b) a radial gaussian repulsion pushes lines away from the cursor, leaving a bulged "void" around it.

Constants:
\`\`\`
SPACING      = 32      // px between grid points at rest
BASE_AMP     = 30      // px, resting wave amplitude
WAVE_FREQ    = 0.007   // ~900px wavelength
HOVER_BOOST  = 1.5     // global amp multiplier on full hover
LOCAL_AMP    = 60      // px repulsion strength
LOCAL_RADIUS = 260     // px repulsion radius
LINE_A_DARK  = 0.55
LINE_A_LIGHT = 0.75
\`\`\`

Build: cols = floor(cw/SPACING)+2, rows = floor(ch/SPACING)+2, ox = (cw%SPACING)/2, oy = (ch%SPACING)/2. Store cols/rows/ox/oy; no per-point state.

Per-frame loop:
- t += 0.002
- hoverStr += ((mouseRef.current ? 1 : 0) - hoverStr) * (hasHover ? 0.018 : 0.010)
- amp = BASE_AMP * (1 + hoverStr * HOVER_BOOST)

displaced(c, r) → [x, y]:
\`\`\`
rx = ox + c * SPACING
ry = oy + r * SPACING
wx = amp * (sin(rx * WAVE_FREQ + t) + sin(ry * WAVE_FREQ * 0.6 + t * 1.3) * 0.55)
wy = amp * (cos(ry * WAVE_FREQ * 0.8 + t * 1.15) + cos(rx * WAVE_FREQ * 0.5 + t * 0.75) * 0.55)
dx = rx - mx; dy = ry - my; dist2 = dx*dx + dy*dy
if dist2 < (LOCAL_RADIUS*LOCAL_RADIUS)*4:
  push = LOCAL_AMP * exp(-dist2 / ((LOCAL_RADIUS*LOCAL_RADIUS) * 0.5))
  dist = sqrt(dist2) || 1
  px = (dx/dist) * push; py = (dy/dist) * push
else: px = py = 0
return [rx + wx + px, ry + wy + py]
\`\`\`

Draw horizontal lines: for each row, beginPath, moveTo displaced(0,r), lineTo displaced(c,r) for c=1..cols-1, stroke. Vertical similarly. strokeStyle = rgba(dotRGB, lineA.toFixed(3)), lineWidth 0.5. dotRGB = dark ? '255,255,255' : '28,25,22'; lineA = dark ? 0.55 : 0.75.

Standard DPR setup. ResizeObserver rebuilds. Mouse handlers on outer div update mouseRef to canvas-local coords; onMouseLeave/onTouchEnd set to null. Theme detection: walk closest('[data-card-theme]'), fallback to documentElement.dark; MutationObserver on both; mirror into isDarkRef + isDark state.

JSX: outer div relative h-full w-full overflow-hidden, bg '#110F0C' dark / '#F5F1EA' light. Canvas absolute inset-0 width/height 100%. Centered overlay:
- "Distortion Grid": 22px 700 -0.02em, color rgba(255,255,255,0.45) dark / rgba(28,25,22,0.45) light
- "hover to warp": 11px 600 uppercase 0.12em, color rgba(255,255,255,0.18) dark / rgba(28,25,22,0.22) light

Cleanup: alive=false, cancelAnimationFrame, ro.disconnect, observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,

  'Lovable': `Create a React client component named \`DistortionGrid\`. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed canvas renders a grid of horizontal and vertical lines that undulate with low-frequency sine waves. When the mouse is over the canvas, (a) amplitude grows globally via a smoothed hoverStr, and (b) a radial gaussian repulsion pushes lines away from the cursor, leaving a bulged "void" around it.

Constants:
\`\`\`
SPACING      = 32      // px between grid points at rest
BASE_AMP     = 30      // px — resting wave amplitude
WAVE_FREQ    = 0.007   // ~900px wavelength
HOVER_BOOST  = 1.5     // global amp multiplier on full hover
LOCAL_AMP    = 60      // px repulsion strength
LOCAL_RADIUS = 260     // px repulsion radius
LINE_A_DARK  = 0.55
LINE_A_LIGHT = 0.75
\`\`\`

Build: cols = floor(cw/SPACING)+2, rows = floor(ch/SPACING)+2, ox = (cw%SPACING)/2, oy = (ch%SPACING)/2. Store cols/rows/ox/oy; no per-point state.

Per-frame loop:
- t += 0.002
- hoverStr += ((mouseRef.current ? 1 : 0) - hoverStr) * (hasHover ? 0.018 : 0.010)
- amp = BASE_AMP * (1 + hoverStr * HOVER_BOOST)

displaced(c, r) → [x, y]:
\`\`\`
rx = ox + c * SPACING
ry = oy + r * SPACING
wx = amp * (sin(rx * WAVE_FREQ + t) + sin(ry * WAVE_FREQ * 0.6 + t * 1.3) * 0.55)
wy = amp * (cos(ry * WAVE_FREQ * 0.8 + t * 1.15) + cos(rx * WAVE_FREQ * 0.5 + t * 0.75) * 0.55)
dx = rx - mx; dy = ry - my; dist2 = dx*dx + dy*dy
if dist2 < (LOCAL_RADIUS*LOCAL_RADIUS)*4:
  push = LOCAL_AMP * exp(-dist2 / ((LOCAL_RADIUS*LOCAL_RADIUS) * 0.5))
  dist = sqrt(dist2) || 1
  px = (dx/dist) * push; py = (dy/dist) * push
else: px = py = 0
return [rx + wx + px, ry + wy + py]
\`\`\`

Draw horizontal lines: for each row, beginPath, moveTo displaced(0,r), lineTo displaced(c,r) for c=1..cols-1, stroke. Vertical similarly. strokeStyle = rgba(dotRGB, lineA.toFixed(3)), lineWidth 0.5. dotRGB = dark ? '255,255,255' : '28,25,22'; lineA = dark ? 0.55 : 0.75.

Standard DPR setup. ResizeObserver rebuilds. Mouse handlers on outer div update mouseRef to canvas-local coords; onMouseLeave/onTouchEnd set to null. Theme detection: walk closest('[data-card-theme]'), fallback to documentElement.dark; MutationObserver on both; mirror into isDarkRef + isDark state.

JSX: outer div relative h-full w-full overflow-hidden, bg '#110F0C' dark / '#F5F1EA' light. Canvas absolute inset-0 width/height 100%. Centered overlay:
- "Distortion Grid" — 22px 700 -0.02em, color rgba(255,255,255,0.45) dark / rgba(28,25,22,0.45) light
- "hover to warp" — 11px 600 uppercase 0.12em, color rgba(255,255,255,0.18) dark / rgba(28,25,22,0.22) light

Cleanup: alive=false, cancelAnimationFrame, ro.disconnect, observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,

  'V0': `Create a React client component named \`DistortionGrid\`. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed canvas renders a grid of horizontal and vertical lines that undulate with low-frequency sine waves. When the mouse is over the canvas, (a) amplitude grows globally via a smoothed hoverStr, and (b) a radial gaussian repulsion pushes lines away from the cursor, leaving a bulged "void" around it.

Constants:
\`\`\`
SPACING      = 32      // px between grid points at rest
BASE_AMP     = 30      // px — resting wave amplitude
WAVE_FREQ    = 0.007   // ~900px wavelength
HOVER_BOOST  = 1.5     // global amp multiplier on full hover
LOCAL_AMP    = 60      // px repulsion strength
LOCAL_RADIUS = 260     // px repulsion radius
LINE_A_DARK  = 0.55
LINE_A_LIGHT = 0.75
\`\`\`

Build: cols = floor(cw/SPACING)+2, rows = floor(ch/SPACING)+2, ox = (cw%SPACING)/2, oy = (ch%SPACING)/2. Store cols/rows/ox/oy; no per-point state.

Per-frame loop:
- t += 0.002
- hoverStr += ((mouseRef.current ? 1 : 0) - hoverStr) * (hasHover ? 0.018 : 0.010)
- amp = BASE_AMP * (1 + hoverStr * HOVER_BOOST)

displaced(c, r) → [x, y]:
\`\`\`
rx = ox + c * SPACING
ry = oy + r * SPACING
wx = amp * (sin(rx * WAVE_FREQ + t) + sin(ry * WAVE_FREQ * 0.6 + t * 1.3) * 0.55)
wy = amp * (cos(ry * WAVE_FREQ * 0.8 + t * 1.15) + cos(rx * WAVE_FREQ * 0.5 + t * 0.75) * 0.55)
dx = rx - mx; dy = ry - my; dist2 = dx*dx + dy*dy
if dist2 < (LOCAL_RADIUS*LOCAL_RADIUS)*4:
  push = LOCAL_AMP * exp(-dist2 / ((LOCAL_RADIUS*LOCAL_RADIUS) * 0.5))
  dist = sqrt(dist2) || 1
  px = (dx/dist) * push; py = (dy/dist) * push
else: px = py = 0
return [rx + wx + px, ry + wy + py]
\`\`\`

Draw horizontal lines: for each row, beginPath, moveTo displaced(0,r), lineTo displaced(c,r) for c=1..cols-1, stroke. Vertical similarly. strokeStyle = rgba(dotRGB, lineA.toFixed(3)), lineWidth 0.5. dotRGB = dark ? '255,255,255' : '28,25,22'; lineA = dark ? 0.55 : 0.75.

Standard DPR setup. ResizeObserver rebuilds. Mouse handlers on outer div update mouseRef to canvas-local coords; onMouseLeave/onTouchEnd set to null. Theme detection: walk closest('[data-card-theme]'), fallback to documentElement.dark; MutationObserver on both; mirror into isDarkRef + isDark state.

JSX: outer div relative h-full w-full overflow-hidden, bg '#110F0C' dark / '#F5F1EA' light. Canvas absolute inset-0 width/height 100%. Centered overlay:
- "Distortion Grid" — 22px 700 -0.02em, color rgba(255,255,255,0.45) dark / rgba(28,25,22,0.45) light
- "hover to warp" — 11px 600 uppercase 0.12em, color rgba(255,255,255,0.18) dark / rgba(28,25,22,0.22) light

Cleanup: alive=false, cancelAnimationFrame, ro.disconnect, observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,
}
