import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion

Root element: className="flex min-h-screen w-full items-center justify-center"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named ChargingWidget, a circular battery-charging indicator with two animated liquid waves filling the inside and a percentage number counting from 0 to 78 on a loop. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Constants: TARGET_PERCENT = 78, COUNT_DURATION = 4 (seconds), PAUSE_DURATION = 1.

Layout: flex h-full w-full items-center justify-center. Background theme-aware: #110F0C dark / #F5F1EA light. Theme detection via closest [data-card-theme] dark class with documentElement fallback and MutationObserver on both.

Render a single SVG with viewBox='0 0 200 200', width/height = 'min(260px, 56vw)'. Inside <defs> add a clipPath id 'cw-circle-clip' = circle(100,100,r=88); and a filter id 'cw-bolt-glow' with a feGaussianBlur stdDeviation=3 then feComposite operator 'over' over SourceGraphic.

Draw: background circle cx=100 cy=100 r=88 fill = BG_CIRCLE_COLOR (rgba(120,60,220,0.10) dark / rgba(130,60,220,0.06) light). Wave group <g clipPath='url(#cw-circle-clip)'> containing two <path> refs (wave1/wave2), initial d = 'M 0 200 L 200 200 L 200 200 L 0 200 Z'. Stroke ring circle r=88 fill none stroke RING_COLOR (#a855f7 dark / #7c3aed light) strokeWidth 3. Lightning bolt group transform='translate(100, 52) scale(0.7)' filter='url(#cw-bolt-glow)', path d='M 8 -20 L -8 2 L 0 2 L -8 20 L 8 -2 L 0 -2 Z' fill BOLT_COLOR (#e0b0ff dark / #6d28d9 light). Percent number <text ref=displayRef> at x=100 y=118 textAnchor middle dominantBaseline middle fill TEXT_COLOR (#ffffff dark / #1C1916 light) fontSize=42 fontWeight=800 fontFamily 'Manrope, sans-serif' letterSpacing=-1. Then a '%' text x=100 y=140 fontSize=14 fontWeight=600 fill TEXT_MUTED (rgba(255,255,255,0.7) / rgba(28,25,22,0.60)).

Wave colors: WAVE1_COLOR rgba(120,60,220,0.45) dark / rgba(109,40,217,0.28) light. WAVE2_COLOR rgba(160,80,255,0.70) / rgba(124,58,237,0.52).

State: useMotionValue percent starts 0. Keep percentRef (number) in sync via percent.on('change', v => { percentRef=v; displayRef.textContent = round(v).toString() }). Unsubscribe on cleanup.

Count-up loop effect (alive flag): async while alive → percent.set(0); await animate(percent, TARGET_PERCENT, {duration: COUNT_DURATION, ease:'easeInOut'}); await sleep(PAUSE_DURATION*1000); repeat. Cleanup sets alive=false.

Wave RAF effect: no React state. offset1, offset2 = 0. buildWavePath(fillY, amp, phase): d = 'M 0 '+fillY; for x=0..200 step 2 add ' L '+x+' '+(fillY + sin((x/200)*2PI*2 + phase)*amp); close ' L 200 200 L 0 200 Z'. Tick: pct=percentRef; fillY = 200 - (pct/100)*200; amp = 14*(1-pct/100) + 4; offset1 += 0.025; offset2 -= 0.018; set wave1 d to build(fillY, amp, offset1); set wave2 d to build(fillY, amp, offset2 + PI). cancelAnimationFrame on cleanup.

## Typography
- Font: Manrope`,

  'Lovable': `Create a React client component named ChargingWidget — a circular battery-charging indicator with two animated liquid waves filling the inside and a percentage number counting from 0 to 78 on a loop. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Constants: TARGET_PERCENT = 78, COUNT_DURATION = 4 (seconds), PAUSE_DURATION = 1.

Layout: flex h-full w-full items-center justify-center. Background theme-aware: #110F0C dark / #F5F1EA light. Theme detection via closest [data-card-theme] dark class with documentElement fallback and MutationObserver on both.

Render a single SVG with viewBox='0 0 200 200', width/height = 'min(260px, 56vw)'. Inside <defs> add a clipPath id 'cw-circle-clip' = circle(100,100,r=88); and a filter id 'cw-bolt-glow' with a feGaussianBlur stdDeviation=3 then feComposite operator 'over' over SourceGraphic.

Draw: background circle cx=100 cy=100 r=88 fill = BG_CIRCLE_COLOR (rgba(120,60,220,0.10) dark / rgba(130,60,220,0.06) light). Wave group <g clipPath='url(#cw-circle-clip)'> containing two <path> refs (wave1/wave2) — initial d = 'M 0 200 L 200 200 L 200 200 L 0 200 Z'. Stroke ring circle r=88 fill none stroke RING_COLOR (#a855f7 dark / #7c3aed light) strokeWidth 3. Lightning bolt group transform='translate(100, 52) scale(0.7)' filter='url(#cw-bolt-glow)', path d='M 8 -20 L -8 2 L 0 2 L -8 20 L 8 -2 L 0 -2 Z' fill BOLT_COLOR (#e0b0ff dark / #6d28d9 light). Percent number <text ref=displayRef> at x=100 y=118 textAnchor middle dominantBaseline middle fill TEXT_COLOR (#ffffff dark / #1C1916 light) fontSize=42 fontWeight=800 fontFamily 'Manrope, sans-serif' letterSpacing=-1. Then a '%' text x=100 y=140 fontSize=14 fontWeight=600 fill TEXT_MUTED (rgba(255,255,255,0.7) / rgba(28,25,22,0.60)).

Wave colors: WAVE1_COLOR rgba(120,60,220,0.45) dark / rgba(109,40,217,0.28) light. WAVE2_COLOR rgba(160,80,255,0.70) / rgba(124,58,237,0.52).

State: useMotionValue percent starts 0. Keep percentRef (number) in sync via percent.on('change', v => { percentRef=v; displayRef.textContent = round(v).toString() }). Unsubscribe on cleanup.

Count-up loop effect (alive flag): async while alive → percent.set(0); await animate(percent, TARGET_PERCENT, {duration: COUNT_DURATION, ease:'easeInOut'}); await sleep(PAUSE_DURATION*1000); repeat. Cleanup sets alive=false.

Wave RAF effect — no React state. offset1, offset2 = 0. buildWavePath(fillY, amp, phase): d = 'M 0 '+fillY; for x=0..200 step 2 add ' L '+x+' '+(fillY + sin((x/200)*2PI*2 + phase)*amp); close ' L 200 200 L 0 200 Z'. Tick: pct=percentRef; fillY = 200 - (pct/100)*200; amp = 14*(1-pct/100) + 4; offset1 += 0.025; offset2 -= 0.018; set wave1 d to build(fillY, amp, offset1); set wave2 d to build(fillY, amp, offset2 + PI). cancelAnimationFrame on cleanup.

## Typography
- Font: Manrope`,

  'V0': `Create a React client component named ChargingWidget — a circular battery-charging indicator with two animated liquid waves filling the inside and a percentage number counting from 0 to 78 on a loop. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Constants: TARGET_PERCENT = 78, COUNT_DURATION = 4 (seconds), PAUSE_DURATION = 1.

Layout: flex h-full w-full items-center justify-center. Background theme-aware: #110F0C dark / #F5F1EA light. Theme detection via closest [data-card-theme] dark class with documentElement fallback and MutationObserver on both.

Render a single SVG with viewBox='0 0 200 200', width/height = 'min(260px, 56vw)'. Inside <defs> add a clipPath id 'cw-circle-clip' = circle(100,100,r=88); and a filter id 'cw-bolt-glow' with a feGaussianBlur stdDeviation=3 then feComposite operator 'over' over SourceGraphic.

Draw: background circle cx=100 cy=100 r=88 fill = BG_CIRCLE_COLOR (rgba(120,60,220,0.10) dark / rgba(130,60,220,0.06) light). Wave group <g clipPath='url(#cw-circle-clip)'> containing two <path> refs (wave1/wave2) — initial d = 'M 0 200 L 200 200 L 200 200 L 0 200 Z'. Stroke ring circle r=88 fill none stroke RING_COLOR (#a855f7 dark / #7c3aed light) strokeWidth 3. Lightning bolt group transform='translate(100, 52) scale(0.7)' filter='url(#cw-bolt-glow)', path d='M 8 -20 L -8 2 L 0 2 L -8 20 L 8 -2 L 0 -2 Z' fill BOLT_COLOR (#e0b0ff dark / #6d28d9 light). Percent number <text ref=displayRef> at x=100 y=118 textAnchor middle dominantBaseline middle fill TEXT_COLOR (#ffffff dark / #1C1916 light) fontSize=42 fontWeight=800 fontFamily 'Manrope, sans-serif' letterSpacing=-1. Then a '%' text x=100 y=140 fontSize=14 fontWeight=600 fill TEXT_MUTED (rgba(255,255,255,0.7) / rgba(28,25,22,0.60)).

Wave colors: WAVE1_COLOR rgba(120,60,220,0.45) dark / rgba(109,40,217,0.28) light. WAVE2_COLOR rgba(160,80,255,0.70) / rgba(124,58,237,0.52).

State: useMotionValue percent starts 0. Keep percentRef (number) in sync via percent.on('change', v => { percentRef=v; displayRef.textContent = round(v).toString() }). Unsubscribe on cleanup.

Count-up loop effect (alive flag): async while alive → percent.set(0); await animate(percent, TARGET_PERCENT, {duration: COUNT_DURATION, ease:'easeInOut'}); await sleep(PAUSE_DURATION*1000); repeat. Cleanup sets alive=false.

Wave RAF effect — no React state. offset1, offset2 = 0. buildWavePath(fillY, amp, phase): d = 'M 0 '+fillY; for x=0..200 step 2 add ' L '+x+' '+(fillY + sin((x/200)*2PI*2 + phase)*amp); close ' L 200 200 L 0 200 Z'. Tick: pct=percentRef; fillY = 200 - (pct/100)*200; amp = 14*(1-pct/100) + 4; offset1 += 0.025; offset2 -= 0.018; set wave1 d to build(fillY, amp, offset1); set wave2 d to build(fillY, amp, offset2 + PI). cancelAnimationFrame on cleanup.

## Typography
- Font: Manrope`,
}
