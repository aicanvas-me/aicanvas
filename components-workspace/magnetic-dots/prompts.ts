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

Create a React client component named \`MagneticDots\`.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed canvas dot grid where dots are magnetically pulled toward the cursor and spring back when it leaves. No overlay text.

Constants (exact):
- SPACING = 22 (px between dot centres)
- DOT_RADIUS = 1.5
- INFLUENCE_R = 180
- SPRING_K = 0.055
- DAMPING = 0.11 (velocity *= 1 - DAMPING)
- MAG_STRENGTH = 16
- LERP_FACTOR = 0.06 (hoverStr ease)
- MOUSE_LERP = 0.14 (smoothed mouse)

Dot: { restX, restY, x, y, vx, vy }. Build grid: cols = ceil(w/SPACING)+1, rows = ceil(h/SPACING)+1, ox = (w%SPACING)/2, oy = (h%SPACING)/2. Preserve existing dots across resizes via a Map keyed on \`restX,restY\`.

Canvas DPR: rect = getBoundingClientRect; canvas.width = round(rect.width*dpr); canvas.height = round(rect.height*dpr); ctx.setTransform(dpr,0,0,dpr,0,0).

Per frame:
- hoverStr += (target - hoverStr) * LERP_FACTOR, target = 1 if pointer else 0
- If pointer: smoothMx += (rawX - smoothMx) * MOUSE_LERP (snap on first contact via a -99999 sentinel). Else reset sentinel.
- clearRect. fillStyle = dark ? 'rgba(255,255,255,0.5)' : 'rgba(28,25,22,0.4)'.
- For each dot:
  - If hoverStr > 0.001 and dist2 < INFLUENCE_R^2 and dist2 > 0.01: t = 1 - dist/INFLUENCE_R; force = t*t*MAG_STRENGTH*hoverStr; vx += (-dx/dist)*force; vy += (-dy/dist)*force (pulls toward cursor).
  - Spring: vx += (restX - x)*SPRING_K; vy += (restY - y)*SPRING_K.
  - vx *= 1 - DAMPING; vy *= 1 - DAMPING. Integrate. Draw arc radius DOT_RADIUS.

Theme: detect via closest('[data-card-theme]').classList.contains('dark'), fallback documentElement. MutationObserver on both. Background: dark '#110F0C', light '#F5F1EA', set via container inline style.

Root: div ref relative h-full w-full overflow-hidden with mouse/touch handlers updating mouseRef to { x: clientX-rect.left, y: clientY-rect.top }; leave/end sets null. Canvas absolute inset-0 100%/100%.

Cleanup: alive flag, cancelAnimationFrame, ResizeObserver on parentElement, observer.disconnect.

## Typography
- Font: project default sans-serif`,

  'Lovable': `Create a React client component named \`MagneticDots\`.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed canvas dot grid where dots are magnetically pulled toward the cursor and spring back when it leaves. No overlay text.

Constants (exact):
- SPACING = 22 (px between dot centres)
- DOT_RADIUS = 1.5
- INFLUENCE_R = 180
- SPRING_K = 0.055
- DAMPING = 0.11 (velocity *= 1 - DAMPING)
- MAG_STRENGTH = 16
- LERP_FACTOR = 0.06 (hoverStr ease)
- MOUSE_LERP = 0.14 (smoothed mouse)

Dot: { restX, restY, x, y, vx, vy }. Build grid: cols = ceil(w/SPACING)+1, rows = ceil(h/SPACING)+1, ox = (w%SPACING)/2, oy = (h%SPACING)/2. Preserve existing dots across resizes via a Map keyed on \`restX,restY\`.

Canvas DPR: rect = getBoundingClientRect; canvas.width = round(rect.width*dpr); canvas.height = round(rect.height*dpr); ctx.setTransform(dpr,0,0,dpr,0,0).

Per frame:
- hoverStr += (target - hoverStr) * LERP_FACTOR, target = 1 if pointer else 0
- If pointer: smoothMx += (rawX - smoothMx) * MOUSE_LERP (snap on first contact via a -99999 sentinel). Else reset sentinel.
- clearRect. fillStyle = dark ? 'rgba(255,255,255,0.5)' : 'rgba(28,25,22,0.4)'.
- For each dot:
  - If hoverStr > 0.001 and dist2 < INFLUENCE_R^2 and dist2 > 0.01: t = 1 - dist/INFLUENCE_R; force = t*t*MAG_STRENGTH*hoverStr; vx += (-dx/dist)*force; vy += (-dy/dist)*force (pulls toward cursor).
  - Spring: vx += (restX - x)*SPRING_K; vy += (restY - y)*SPRING_K.
  - vx *= 1 - DAMPING; vy *= 1 - DAMPING. Integrate. Draw arc radius DOT_RADIUS.

Theme: detect via closest('[data-card-theme]').classList.contains('dark'), fallback documentElement. MutationObserver on both. Background: dark '#110F0C', light '#F5F1EA' — set via container inline style.

Root: div ref relative h-full w-full overflow-hidden with mouse/touch handlers updating mouseRef to { x: clientX-rect.left, y: clientY-rect.top }; leave/end sets null. Canvas absolute inset-0 100%/100%.

Cleanup: alive flag, cancelAnimationFrame, ResizeObserver on parentElement, observer.disconnect.

## Typography
- Font: project default sans-serif`,

  'V0': `Create a React client component named \`MagneticDots\`.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A full-bleed canvas dot grid where dots are magnetically pulled toward the cursor and spring back when it leaves. No overlay text.

Constants (exact):
- SPACING = 22 (px between dot centres)
- DOT_RADIUS = 1.5
- INFLUENCE_R = 180
- SPRING_K = 0.055
- DAMPING = 0.11 (velocity *= 1 - DAMPING)
- MAG_STRENGTH = 16
- LERP_FACTOR = 0.06 (hoverStr ease)
- MOUSE_LERP = 0.14 (smoothed mouse)

Dot: { restX, restY, x, y, vx, vy }. Build grid: cols = ceil(w/SPACING)+1, rows = ceil(h/SPACING)+1, ox = (w%SPACING)/2, oy = (h%SPACING)/2. Preserve existing dots across resizes via a Map keyed on \`restX,restY\`.

Canvas DPR: rect = getBoundingClientRect; canvas.width = round(rect.width*dpr); canvas.height = round(rect.height*dpr); ctx.setTransform(dpr,0,0,dpr,0,0).

Per frame:
- hoverStr += (target - hoverStr) * LERP_FACTOR, target = 1 if pointer else 0
- If pointer: smoothMx += (rawX - smoothMx) * MOUSE_LERP (snap on first contact via a -99999 sentinel). Else reset sentinel.
- clearRect. fillStyle = dark ? 'rgba(255,255,255,0.5)' : 'rgba(28,25,22,0.4)'.
- For each dot:
  - If hoverStr > 0.001 and dist2 < INFLUENCE_R^2 and dist2 > 0.01: t = 1 - dist/INFLUENCE_R; force = t*t*MAG_STRENGTH*hoverStr; vx += (-dx/dist)*force; vy += (-dy/dist)*force (pulls toward cursor).
  - Spring: vx += (restX - x)*SPRING_K; vy += (restY - y)*SPRING_K.
  - vx *= 1 - DAMPING; vy *= 1 - DAMPING. Integrate. Draw arc radius DOT_RADIUS.

Theme: detect via closest('[data-card-theme]').classList.contains('dark'), fallback documentElement. MutationObserver on both. Background: dark '#110F0C', light '#F5F1EA' — set via container inline style.

Root: div ref relative h-full w-full overflow-hidden with mouse/touch handlers updating mouseRef to { x: clientX-rect.left, y: clientY-rect.top }; leave/end sets null. Canvas absolute inset-0 100%/100%.

Cleanup: alive flag, cancelAnimationFrame, ResizeObserver on parentElement, observer.disconnect.

## Typography
- Font: project default sans-serif`,
}
