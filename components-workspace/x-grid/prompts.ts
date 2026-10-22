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

Create a React client component named \`XGrid\`.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A canvas grid of axis-aligned × marks. Marks have a subtle resting wave in opacity and brighten/grow around the cursor with a wide falloff. Lit neighbours (right, below, diag down-right, diag down-left) are connected by thin lines. Centred label "X Grid" with hint "hover to illuminate".

## Constants
- SPACING = 20 (px between × centres)
- RADIUS = 340 (hover influence radius)
- BASE_A = 0.13 (dark resting alpha)
- PEAK_A = 0.92 (fully-lit alpha)
Light-mode base alpha override: 0.25 (branch on isDarkRef inside frame).

## Mark
type Mark = { x: number; y: number; b: number; col: number; row: number }

## Build
DPR scaffolding. cols = floor(cw/SPACING)+2; rows = floor(ch/SPACING)+2; ox = (cw%SPACING)/2; oy = (ch%SPACING)/2. marks array + grid[r][c] map. t0 = performance.now().

## Per frame
clearRect. lineWidth = 0.5 (reset so it doesn't bleed from connection pass).
mx,my from mouseRef ?? -99999; r2 = RADIUS²; dotRGB = dark?'255,255,255':'28,25,22'; t = (performance.now()-t0)/1000.

For each mark d:
- dist2 = (d.x-mx)² + (d.y-my)²
- tgt = dist2 < r2 ? Math.pow(1 - sqrt(dist2)/RADIUS, 1.5) : 0
- d.b += (tgt > d.b ? 0.16 : 0.05) * (tgt - d.b); if d.b < 0.004 set 0
- arm = 2 + d.b * 1.0
- sw  = 0.5 + d.b * 0.3
- baseA = dark ? 0.13 : 0.25
- wave = sin(d.col*0.3 + d.row*0.3 - t*0.5)
- restingAlpha = baseA*(1 + wave*0.3)
- alpha = restingAlpha + (0.92 - restingAlpha)*d.b
- strokeStyle rgba(dotRGB,alpha); lineWidth = sw
- beginPath; moveTo(x-arm,y-arm); lineTo(x+arm,y+arm); moveTo(x+arm,y-arm); lineTo(x-arm,y+arm); stroke

Connection pass (lineWidth=0.5):
For each mark d with b>=0.05, look up 4 neighbours [row][col+1], [row+1][col], [row+1][col+1], [row+1][col-1]. For each defined neighbour n with n.b>=0.05:
- lineAlpha = min(d.b,n.b) * 0.4
- strokeStyle rgba(dotRGB,lineAlpha); beginPath; moveTo(d.x,d.y); lineTo(n.x,n.y); stroke

## Theme
useState isDark + isDarkRef + MutationObserver.

## Mouse / touch
updateMouse reads canvas.getBoundingClientRect, sets mouseRef = { x:cx-rect.left, y:cy-rect.top }. Handlers on outer div: onMouseMove/onMouseLeave/onTouchStart/onTouchMove/onTouchEnd. onTouchStart runs the same update as onTouchMove, so a tap without moving lights the cells under the finger.

## JSX
\`\`\`
<div ref={containerRef} className="relative h-full w-full overflow-hidden" style={{ background: isDark ? '#110F0C' : '#F5F1EA' }} ...handlers>
  <canvas ref={canvasRef} className="absolute inset-0" style={{ width:'100%', height:'100%' }} />
  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
    <span style={{ color: isDark?'rgba(255,255,255,0.45)':'rgba(28,25,22,0.45)', fontSize:22, fontWeight:700, letterSpacing:'-0.02em' }}>X Grid</span>
    <span style={{ color: isDark?'rgba(255,255,255,0.18)':'rgba(28,25,22,0.22)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.12em' }}>hover to illuminate</span>
  </div>
</div>
\`\`\`

Cleanup: alive=false; cancelAnimationFrame; ResizeObserver on canvas.parentElement → disconnect; observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,

  'Lovable': `Create a React client component named \`XGrid\`.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A canvas grid of axis-aligned × marks. Marks have a subtle resting wave in opacity and brighten/grow around the cursor with a wide falloff. Lit neighbours (right, below, diag down-right, diag down-left) are connected by thin lines. Centred label "X Grid" with hint "hover to illuminate".

## Constants
- SPACING = 20 (px between × centres)
- RADIUS = 340 (hover influence radius)
- BASE_A = 0.13 (dark resting alpha)
- PEAK_A = 0.92 (fully-lit alpha)
Light-mode base alpha override: 0.25 (branch on isDarkRef inside frame).

## Mark
type Mark = { x: number; y: number; b: number; col: number; row: number }

## Build
DPR scaffolding. cols = floor(cw/SPACING)+2; rows = floor(ch/SPACING)+2; ox = (cw%SPACING)/2; oy = (ch%SPACING)/2. marks array + grid[r][c] map. t0 = performance.now().

## Per frame
clearRect. lineWidth = 0.5 (reset so it doesn't bleed from connection pass).
mx,my from mouseRef ?? -99999; r2 = RADIUS²; dotRGB = dark?'255,255,255':'28,25,22'; t = (performance.now()-t0)/1000.

For each mark d:
- dist2 = (d.x-mx)² + (d.y-my)²
- tgt = dist2 < r2 ? Math.pow(1 - sqrt(dist2)/RADIUS, 1.5) : 0
- d.b += (tgt > d.b ? 0.16 : 0.05) * (tgt - d.b); if d.b < 0.004 set 0
- arm = 2 + d.b * 1.0
- sw  = 0.5 + d.b * 0.3
- baseA = dark ? 0.13 : 0.25
- wave = sin(d.col*0.3 + d.row*0.3 - t*0.5)
- restingAlpha = baseA*(1 + wave*0.3)
- alpha = restingAlpha + (0.92 - restingAlpha)*d.b
- strokeStyle rgba(dotRGB,alpha); lineWidth = sw
- beginPath; moveTo(x-arm,y-arm); lineTo(x+arm,y+arm); moveTo(x+arm,y-arm); lineTo(x-arm,y+arm); stroke

Connection pass (lineWidth=0.5):
For each mark d with b>=0.05, look up 4 neighbours [row][col+1], [row+1][col], [row+1][col+1], [row+1][col-1]. For each defined neighbour n with n.b>=0.05:
- lineAlpha = min(d.b,n.b) * 0.4
- strokeStyle rgba(dotRGB,lineAlpha); beginPath; moveTo(d.x,d.y); lineTo(n.x,n.y); stroke

## Theme
useState isDark + isDarkRef + MutationObserver.

## Mouse / touch
updateMouse reads canvas.getBoundingClientRect, sets mouseRef = { x:cx-rect.left, y:cy-rect.top }. Handlers on outer div: onMouseMove/onMouseLeave/onTouchStart/onTouchMove/onTouchEnd. onTouchStart runs the same update as onTouchMove, so a tap without moving lights the cells under the finger.

## JSX
\`\`\`
<div ref={containerRef} className="relative h-full w-full overflow-hidden" style={{ background: isDark ? '#110F0C' : '#F5F1EA' }} ...handlers>
  <canvas ref={canvasRef} className="absolute inset-0" style={{ width:'100%', height:'100%' }} />
  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
    <span style={{ color: isDark?'rgba(255,255,255,0.45)':'rgba(28,25,22,0.45)', fontSize:22, fontWeight:700, letterSpacing:'-0.02em' }}>X Grid</span>
    <span style={{ color: isDark?'rgba(255,255,255,0.18)':'rgba(28,25,22,0.22)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.12em' }}>hover to illuminate</span>
  </div>
</div>
\`\`\`

Cleanup: alive=false; cancelAnimationFrame; ResizeObserver on canvas.parentElement → disconnect; observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,

  'V0': `Create a React client component named \`XGrid\`.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A canvas grid of axis-aligned × marks. Marks have a subtle resting wave in opacity and brighten/grow around the cursor with a wide falloff. Lit neighbours (right, below, diag down-right, diag down-left) are connected by thin lines. Centred label "X Grid" with hint "hover to illuminate".

## Constants
- SPACING = 20 (px between × centres)
- RADIUS = 340 (hover influence radius)
- BASE_A = 0.13 (dark resting alpha)
- PEAK_A = 0.92 (fully-lit alpha)
Light-mode base alpha override: 0.25 (branch on isDarkRef inside frame).

## Mark
type Mark = { x: number; y: number; b: number; col: number; row: number }

## Build
DPR scaffolding. cols = floor(cw/SPACING)+2; rows = floor(ch/SPACING)+2; ox = (cw%SPACING)/2; oy = (ch%SPACING)/2. marks array + grid[r][c] map. t0 = performance.now().

## Per frame
clearRect. lineWidth = 0.5 (reset so it doesn't bleed from connection pass).
mx,my from mouseRef ?? -99999; r2 = RADIUS²; dotRGB = dark?'255,255,255':'28,25,22'; t = (performance.now()-t0)/1000.

For each mark d:
- dist2 = (d.x-mx)² + (d.y-my)²
- tgt = dist2 < r2 ? Math.pow(1 - sqrt(dist2)/RADIUS, 1.5) : 0
- d.b += (tgt > d.b ? 0.16 : 0.05) * (tgt - d.b); if d.b < 0.004 set 0
- arm = 2 + d.b * 1.0
- sw  = 0.5 + d.b * 0.3
- baseA = dark ? 0.13 : 0.25
- wave = sin(d.col*0.3 + d.row*0.3 - t*0.5)
- restingAlpha = baseA*(1 + wave*0.3)
- alpha = restingAlpha + (0.92 - restingAlpha)*d.b
- strokeStyle rgba(dotRGB,alpha); lineWidth = sw
- beginPath; moveTo(x-arm,y-arm); lineTo(x+arm,y+arm); moveTo(x+arm,y-arm); lineTo(x-arm,y+arm); stroke

Connection pass (lineWidth=0.5):
For each mark d with b>=0.05, look up 4 neighbours [row][col+1], [row+1][col], [row+1][col+1], [row+1][col-1]. For each defined neighbour n with n.b>=0.05:
- lineAlpha = min(d.b,n.b) * 0.4
- strokeStyle rgba(dotRGB,lineAlpha); beginPath; moveTo(d.x,d.y); lineTo(n.x,n.y); stroke

## Theme
useState isDark + isDarkRef + MutationObserver.

## Mouse / touch
updateMouse reads canvas.getBoundingClientRect, sets mouseRef = { x:cx-rect.left, y:cy-rect.top }. Handlers on outer div: onMouseMove/onMouseLeave/onTouchStart/onTouchMove/onTouchEnd. onTouchStart runs the same update as onTouchMove, so a tap without moving lights the cells under the finger.

## JSX
\`\`\`
<div ref={containerRef} className="relative h-full w-full overflow-hidden" style={{ background: isDark ? '#110F0C' : '#F5F1EA' }} ...handlers>
  <canvas ref={canvasRef} className="absolute inset-0" style={{ width:'100%', height:'100%' }} />
  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2">
    <span style={{ color: isDark?'rgba(255,255,255,0.45)':'rgba(28,25,22,0.45)', fontSize:22, fontWeight:700, letterSpacing:'-0.02em' }}>X Grid</span>
    <span style={{ color: isDark?'rgba(255,255,255,0.18)':'rgba(28,25,22,0.22)', fontSize:11, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.12em' }}>hover to illuminate</span>
  </div>
</div>
\`\`\`

Cleanup: alive=false; cancelAnimationFrame; ResizeObserver on canvas.parentElement → disconnect; observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,
}
