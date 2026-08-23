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

Create a React client component named \`WaveLines\`.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A canvas of vertical cloth-like lines that breathe with a double sine wave and fold dramatically around the cursor on hover. Centred label "Wave Lines" with hint "hover to fold".

## Constants
- SPACING = 32 (px between lines at rest)
- ROW_STEP = 4 (sample step per line)
- AMP = 18 (resting wave amplitude)
- FREQ_Y = 0.015, FREQ_X = 0.006
- HOVER_BOOST = 5.0 (amplitude multiplier on hover)
- LOCAL_AMP = 58, LOCAL_RADIUS = 220
- LINE_A_DARK = 0.55, LINE_A_LIGHT = 0.75

## Canvas setup
DPR scaffolding. Computed once per build: cols = ceil(cw/SPACING)+2; rows = ceil(ch/ROW_STEP)+1; ox = (cw%SPACING)/2.

## Per frame (t += 0.003)
- hasHover = mouseRef != null
- hoverStr += ((hasHover?1:0) - hoverStr) * (hasHover?0.018:0.010)
- clearRect
- dotRGB = dark ? '255,255,255' : '28,25,22'
- lineA  = dark ? 0.55 : 0.75
- amp    = AMP * (1 + hoverStr * HOVER_BOOST)
- mx,my = mouseRef ?? -99999; r2 = LOCAL_RADIUS²
- strokeStyle rgba(dotRGB,lineA); lineWidth 0.8

For c=0..cols-1:
  rx = ox + c*SPACING
  beginPath; prevX=0; prevY=0
  For r=0..rows:
    ry = r*ROW_STEP
    wx = amp*sin(ry*FREQ_Y + rx*FREQ_X + t) + amp*0.38*sin(ry*FREQ_Y*1.6 + rx*FREQ_X*1.4 + t*1.5 + 1.1)
    wy = amp*0.12*cos(rx*FREQ_X*0.9 + ry*FREQ_Y*0.4 + t*0.8)
    dx = rx - mx; dy = ry - my; dist2 = dx²+dy²
    px = py = 0
    if (dist2 < r2*4):
      push = LOCAL_AMP * exp(-dist2 / (r2 * 0.5))
      dist = sqrt(dist2) || 1
      px = (dx/dist)*push; py = (dy/dist)*push
    x = rx+wx+px; y = ry+wy+py
    r===0 ? moveTo(x,y) : quadraticCurveTo(prevX,prevY,(prevX+x)/2,(prevY+y)/2)
    prevX=x; prevY=y
  lineTo(prevX,prevY); stroke

## Theme
useState isDark + isDarkRef + observer (closest data-card-theme → documentElement).

## JSX
div ref containerRef relative h-full w-full overflow-hidden, bg per theme, mouse/touch handlers on div. Canvas absolute inset-0 100%/100%. Overlay pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2:
- span "Wave Lines": color dark rgba(255,255,255,0.45) / light rgba(28,25,22,0.45), fontSize 22, fontWeight 700, letterSpacing -0.02em
- span "hover to fold": color dark rgba(255,255,255,0.18) / light rgba(28,25,22,0.22), fontSize 11, fontWeight 600, uppercase, letterSpacing 0.12em

Cleanup: alive=false; cancelAnimationFrame; ResizeObserver on canvas.parentElement; observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,

  'Lovable': `Create a React client component named \`WaveLines\`.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A canvas of vertical cloth-like lines that breathe with a double sine wave and fold dramatically around the cursor on hover. Centred label "Wave Lines" with hint "hover to fold".

## Constants
- SPACING = 32 (px between lines at rest)
- ROW_STEP = 4 (sample step per line)
- AMP = 18 (resting wave amplitude)
- FREQ_Y = 0.015, FREQ_X = 0.006
- HOVER_BOOST = 5.0 (amplitude multiplier on hover)
- LOCAL_AMP = 58, LOCAL_RADIUS = 220
- LINE_A_DARK = 0.55, LINE_A_LIGHT = 0.75

## Canvas setup
DPR scaffolding. Computed once per build: cols = ceil(cw/SPACING)+2; rows = ceil(ch/ROW_STEP)+1; ox = (cw%SPACING)/2.

## Per frame (t += 0.003)
- hasHover = mouseRef != null
- hoverStr += ((hasHover?1:0) - hoverStr) * (hasHover?0.018:0.010)
- clearRect
- dotRGB = dark ? '255,255,255' : '28,25,22'
- lineA  = dark ? 0.55 : 0.75
- amp    = AMP * (1 + hoverStr * HOVER_BOOST)
- mx,my = mouseRef ?? -99999; r2 = LOCAL_RADIUS²
- strokeStyle rgba(dotRGB,lineA); lineWidth 0.8

For c=0..cols-1:
  rx = ox + c*SPACING
  beginPath; prevX=0; prevY=0
  For r=0..rows:
    ry = r*ROW_STEP
    wx = amp*sin(ry*FREQ_Y + rx*FREQ_X + t) + amp*0.38*sin(ry*FREQ_Y*1.6 + rx*FREQ_X*1.4 + t*1.5 + 1.1)
    wy = amp*0.12*cos(rx*FREQ_X*0.9 + ry*FREQ_Y*0.4 + t*0.8)
    dx = rx - mx; dy = ry - my; dist2 = dx²+dy²
    px = py = 0
    if (dist2 < r2*4):
      push = LOCAL_AMP * exp(-dist2 / (r2 * 0.5))
      dist = sqrt(dist2) || 1
      px = (dx/dist)*push; py = (dy/dist)*push
    x = rx+wx+px; y = ry+wy+py
    r===0 ? moveTo(x,y) : quadraticCurveTo(prevX,prevY,(prevX+x)/2,(prevY+y)/2)
    prevX=x; prevY=y
  lineTo(prevX,prevY); stroke

## Theme
useState isDark + isDarkRef + observer (closest data-card-theme → documentElement).

## JSX
div ref containerRef relative h-full w-full overflow-hidden, bg per theme, mouse/touch handlers on div. Canvas absolute inset-0 100%/100%. Overlay pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2:
- span "Wave Lines" — color dark rgba(255,255,255,0.45) / light rgba(28,25,22,0.45), fontSize 22, fontWeight 700, letterSpacing -0.02em
- span "hover to fold" — color dark rgba(255,255,255,0.18) / light rgba(28,25,22,0.22), fontSize 11, fontWeight 600, uppercase, letterSpacing 0.12em

Cleanup: alive=false; cancelAnimationFrame; ResizeObserver on canvas.parentElement; observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,

  'V0': `Create a React client component named \`WaveLines\`.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A canvas of vertical cloth-like lines that breathe with a double sine wave and fold dramatically around the cursor on hover. Centred label "Wave Lines" with hint "hover to fold".

## Constants
- SPACING = 32 (px between lines at rest)
- ROW_STEP = 4 (sample step per line)
- AMP = 18 (resting wave amplitude)
- FREQ_Y = 0.015, FREQ_X = 0.006
- HOVER_BOOST = 5.0 (amplitude multiplier on hover)
- LOCAL_AMP = 58, LOCAL_RADIUS = 220
- LINE_A_DARK = 0.55, LINE_A_LIGHT = 0.75

## Canvas setup
DPR scaffolding. Computed once per build: cols = ceil(cw/SPACING)+2; rows = ceil(ch/ROW_STEP)+1; ox = (cw%SPACING)/2.

## Per frame (t += 0.003)
- hasHover = mouseRef != null
- hoverStr += ((hasHover?1:0) - hoverStr) * (hasHover?0.018:0.010)
- clearRect
- dotRGB = dark ? '255,255,255' : '28,25,22'
- lineA  = dark ? 0.55 : 0.75
- amp    = AMP * (1 + hoverStr * HOVER_BOOST)
- mx,my = mouseRef ?? -99999; r2 = LOCAL_RADIUS²
- strokeStyle rgba(dotRGB,lineA); lineWidth 0.8

For c=0..cols-1:
  rx = ox + c*SPACING
  beginPath; prevX=0; prevY=0
  For r=0..rows:
    ry = r*ROW_STEP
    wx = amp*sin(ry*FREQ_Y + rx*FREQ_X + t) + amp*0.38*sin(ry*FREQ_Y*1.6 + rx*FREQ_X*1.4 + t*1.5 + 1.1)
    wy = amp*0.12*cos(rx*FREQ_X*0.9 + ry*FREQ_Y*0.4 + t*0.8)
    dx = rx - mx; dy = ry - my; dist2 = dx²+dy²
    px = py = 0
    if (dist2 < r2*4):
      push = LOCAL_AMP * exp(-dist2 / (r2 * 0.5))
      dist = sqrt(dist2) || 1
      px = (dx/dist)*push; py = (dy/dist)*push
    x = rx+wx+px; y = ry+wy+py
    r===0 ? moveTo(x,y) : quadraticCurveTo(prevX,prevY,(prevX+x)/2,(prevY+y)/2)
    prevX=x; prevY=y
  lineTo(prevX,prevY); stroke

## Theme
useState isDark + isDarkRef + observer (closest data-card-theme → documentElement).

## JSX
div ref containerRef relative h-full w-full overflow-hidden, bg per theme, mouse/touch handlers on div. Canvas absolute inset-0 100%/100%. Overlay pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2:
- span "Wave Lines" — color dark rgba(255,255,255,0.45) / light rgba(28,25,22,0.45), fontSize 22, fontWeight 700, letterSpacing -0.02em
- span "hover to fold" — color dark rgba(255,255,255,0.18) / light rgba(28,25,22,0.22), fontSize 11, fontWeight 600, uppercase, letterSpacing 0.12em

Cleanup: alive=false; cancelAnimationFrame; ResizeObserver on canvas.parentElement; observer.disconnect.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 22px
- Weights: 600, 700`,
}
