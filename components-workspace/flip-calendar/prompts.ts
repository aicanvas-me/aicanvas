import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion

Root element: className="flex min-h-screen w-full flex-col items-center justify-center gap-6"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named FlipCalendar, a draggable flip-clock-style day calendar in rich blue gradients with parallax mouse tilt, a glowing scan line during flips, and a small hint "↑ swipe ↓" below it. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files (you may keep one small inline Half sub-component in the same file). 'use client' at the top. No 'any' types.

Constants: FLIP_MS = 220. fmt(n) returns String(n).padStart(2,'0').

State/refs: topDisplay=1, bottomDisplay=1, flapContent=1, flapVisible=false, flapping=false. currentRef=1, rootRef, isDark=true. MotionValues: rotateX=0, scanY=18, scanYPct=useTransform(scanY, v=>v+'%'). tiltX=0, tiltY=0. aliveRef=true, timeouts array.

Layout root: div ref=rootRef, flex h-full w-full flex-col items-center justify-center gap-6, background '#110F0C' dark / '#F5F1EA' light.

Theme detection via closest [data-card-theme] .dark else documentElement .dark, MutationObserver on both.

Parallax wrapper: div style perspective '900px', onMouseMove + onMouseLeave. motion.div initial {opacity:0, y:32, scale:0.9} animate {1,0,1} transition {duration:0.65, ease:[0.22,1,0.36,1]}. drag='y' dragConstraints top:0 bottom:0 dragElastic:0.08 onDragEnd → if |offset.y|<40 and |velocity.y|<300 return; else flip(offset.y>0||velocity.y>300 ? 'next' : 'prev'). style width 'min(260px, 56vw)' aspectRatio '1 / 1' rotate '3deg' rotateX={tiltX} rotateY={tiltY}, className relative cursor-grab active:cursor-grabbing select-none.

Mouse parallax: getBoundingClientRect, cx=(clientX-left)/width-0.5, cy=(clientY-top)/height-0.5. animate(tiltX, cy*-11, {duration:0.12, ease:'linear'}); animate(tiltY, cx*11, ...). On leave spring both to 0 with {stiffness:160, damping:18}.

Page stack: three dummy sheets behind the card using [13,8,4].map((y,i)) → absolute inset-0 background '#2E2A24' dark / '#C8C2B8' light, transform translateY(y px), opacity 0.28 + i*0.2, zIndex 0, borderRadius 18, boxShadow '0 '+(y*2)+'px '+(y*4)+'px rgba(0,0,0,0.35)'.

Main card: absolute inset-0 overflow-hidden zIndex 1 borderRadius 18 boxShadow cardShadow. cardShadow dark '0 40px 100px rgba(20,55,155,0.65), 0 12px 32px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07)' light '0 40px 100px rgba(40,100,220,0.32), 0 12px 32px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.9)'.

Gradients:
topGrad dark 'linear-gradient(155deg, #3572cc 0%, #2d62bc 55%, #2455a0 100%)' light '#4e9aec / #3d88da / #3078c8'.
flapGrad dark '#2d64bc / #2556ac / #1e4894' light '#4290de / #3480cc / #2870bc'.
bottomGrad dark '#4a8edc / #5a9eec / #68aef4' light '#5aaaee / #6abaf8 / #76c4fc'.
headerGrad dark 'linear-gradient(180deg, #2a2724 0%, #1e1c19 100%)' light '#d8d4ce / #c6c2bc'.
ringGrad dark 'radial-gradient(circle at 35% 30%, #f4f0ea 0%, #c0bcb6 45%, #888480 100%)' light '#ffffff / #dedad4 / #aeaaa4'.
seam 'rgba(0,0,0,0.42)' / 'rgba(0,0,0,0.22)'. numShadow dark '0 4px 24px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)' light '0 4px 24px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.22)'.

Layers inside card:
- Header: absolute inset-x-0 top-0 flex items-end justify-center gap-8, height 18%, background headerGrad, zIndex 12, borderRadius '18px 18px 0 0', borderLeft+borderRight '1.5px solid rgba(0,0,0,0.14)', paddingBottom 7. Two 15×15 circles with background ringGrad and boxShadow '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.6)'.
- Bottom half: absolute inset-x-0 bottom-0, top '59%', background bottomGrad, overflow hidden; <Half n={bottomDisplay} half='bottom' numShadow=..../>
- Top half: absolute inset-x-0, top '18%' bottom '41%', background topGrad, borderRadius '12px 12px 0 0'; <Half n={topDisplay} half='top' .../>
- Flap (if flapVisible): absolute inset-x-0 top 18% height 41% zIndex 8. motion.div absolute inset-0 overflow hidden background flapGrad rotateX={rotateX} perspective:140 transformOrigin 'center bottom' willChange 'transform' borderRadius '12px 12px 0 0' boxShadow 'inset 0 0 0 1px rgba(255,255,255,0.2)'. Inside <Half n={flapContent} half='top' .../>. Below the flap a 3px crease div bottom 0, background 'rgba(255,255,255,0.25)', zIndex 9, boxShadow '0 0 8px rgba(255,255,255,0.18)'.
- Scan line (if flapVisible): motion.div absolute inset-x-0 top={scanYPct} height 2 borderRadius 9999 background '#ffffff' opacity 0.3 zIndex 20 pointer-events-none.
- Center seam: absolute inset-x-0 top 'calc(59% - 3px)' height 6 background seam zIndex 10.
- Header/body divider: top 'calc(18% - 1px)' height 1 background 'rgba(0,0,0,0.22)' zIndex 11.
- Surface light: top '18%' height '30%' background 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, transparent 100%)' borderRadius '12px 12px 0 0' zIndex 6.

Half(n, half, numShadow): absolute inset-x-0 flex items-center justify-center, height 200%, top:0 if top else bottom:0. Inside span font-sans font-bold select-none tabular-nums fontSize 'clamp(3.8rem, 13vw, 6.5rem)' color '#ffffff' lineHeight 1 letterSpacing '-0.03em' textShadow numShadow → fmt(n).

Flip logic: flip(dir) computes target (wrap 1..31). runFlip(target, durationMs, dir, onDone): prev=currentRef.current, currentRef=target, setFlapContent(prev), setFlapVisible(true). If dir==='next' scanY.set(18) then animate(scanY, 104, {duration:(durationMs*2)/1000, ease:'linear'}); else 104→18. rotateX.set(0), animate(rotateX, -90, {duration: durationMs/1000, ease:'easeIn'}). sched (setTimeout, cleared in aliveRef cleanup) at durationMs: setTopDisplay(target); setBottomDisplay(target); setFlapContent(target); rotateX.set(90); animate(rotateX, 0, {duration: durationMs/1000, ease:'easeOut'}). sched at durationMs*2+20: setFlapVisible(false); onDone?.().

Hint: motion.p initial {opacity:0} animate {opacity:1} transition {delay:1.1, duration:0.8} className 'font-mono text-xs tracking-widest' color '#3a3530' dark / '#C8C2B8' light → '↑ swipe ↓'.

## Typography
- Font: monospace (system)
- Sizes: 12px
- Weights: 700`,

  'Lovable': `Create a React client component named FlipCalendar — a draggable flip-clock-style day calendar in rich blue gradients with parallax mouse tilt, a glowing scan line during flips, and a small hint "↑ swipe ↓" below it. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files (you may keep one small inline Half sub-component in the same file). 'use client' at the top. No 'any' types.

Constants: FLIP_MS = 220. fmt(n) returns String(n).padStart(2,'0').

State/refs: topDisplay=1, bottomDisplay=1, flapContent=1, flapVisible=false, flapping=false. currentRef=1, rootRef, isDark=true. MotionValues: rotateX=0, scanY=18, scanYPct=useTransform(scanY, v=>v+'%'). tiltX=0, tiltY=0. aliveRef=true, timeouts array.

Layout root: div ref=rootRef, flex h-full w-full flex-col items-center justify-center gap-6, background '#110F0C' dark / '#F5F1EA' light.

Theme detection via closest [data-card-theme] .dark else documentElement .dark, MutationObserver on both.

Parallax wrapper: div style perspective '900px', onMouseMove + onMouseLeave. motion.div initial {opacity:0, y:32, scale:0.9} animate {1,0,1} transition {duration:0.65, ease:[0.22,1,0.36,1]}. drag='y' dragConstraints top:0 bottom:0 dragElastic:0.08 onDragEnd → if |offset.y|<40 and |velocity.y|<300 return; else flip(offset.y>0||velocity.y>300 ? 'next' : 'prev'). style width 'min(260px, 56vw)' aspectRatio '1 / 1' rotate '3deg' rotateX={tiltX} rotateY={tiltY}, className relative cursor-grab active:cursor-grabbing select-none.

Mouse parallax: getBoundingClientRect, cx=(clientX-left)/width-0.5, cy=(clientY-top)/height-0.5. animate(tiltX, cy*-11, {duration:0.12, ease:'linear'}); animate(tiltY, cx*11, ...). On leave spring both to 0 with {stiffness:160, damping:18}.

Page stack: three dummy sheets behind the card using [13,8,4].map((y,i)) → absolute inset-0 background '#2E2A24' dark / '#C8C2B8' light, transform translateY(y px), opacity 0.28 + i*0.2, zIndex 0, borderRadius 18, boxShadow '0 '+(y*2)+'px '+(y*4)+'px rgba(0,0,0,0.35)'.

Main card: absolute inset-0 overflow-hidden zIndex 1 borderRadius 18 boxShadow cardShadow. cardShadow dark '0 40px 100px rgba(20,55,155,0.65), 0 12px 32px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07)' light '0 40px 100px rgba(40,100,220,0.32), 0 12px 32px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.9)'.

Gradients:
topGrad dark 'linear-gradient(155deg, #3572cc 0%, #2d62bc 55%, #2455a0 100%)' light '#4e9aec / #3d88da / #3078c8'.
flapGrad dark '#2d64bc / #2556ac / #1e4894' light '#4290de / #3480cc / #2870bc'.
bottomGrad dark '#4a8edc / #5a9eec / #68aef4' light '#5aaaee / #6abaf8 / #76c4fc'.
headerGrad dark 'linear-gradient(180deg, #2a2724 0%, #1e1c19 100%)' light '#d8d4ce / #c6c2bc'.
ringGrad dark 'radial-gradient(circle at 35% 30%, #f4f0ea 0%, #c0bcb6 45%, #888480 100%)' light '#ffffff / #dedad4 / #aeaaa4'.
seam 'rgba(0,0,0,0.42)' / 'rgba(0,0,0,0.22)'. numShadow dark '0 4px 24px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)' light '0 4px 24px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.22)'.

Layers inside card:
- Header: absolute inset-x-0 top-0 flex items-end justify-center gap-8, height 18%, background headerGrad, zIndex 12, borderRadius '18px 18px 0 0', borderLeft+borderRight '1.5px solid rgba(0,0,0,0.14)', paddingBottom 7. Two 15×15 circles with background ringGrad and boxShadow '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.6)'.
- Bottom half: absolute inset-x-0 bottom-0, top '59%', background bottomGrad, overflow hidden; <Half n={bottomDisplay} half='bottom' numShadow=..../>
- Top half: absolute inset-x-0, top '18%' bottom '41%', background topGrad, borderRadius '12px 12px 0 0'; <Half n={topDisplay} half='top' .../>
- Flap (if flapVisible): absolute inset-x-0 top 18% height 41% zIndex 8. motion.div absolute inset-0 overflow hidden background flapGrad rotateX={rotateX} perspective:140 transformOrigin 'center bottom' willChange 'transform' borderRadius '12px 12px 0 0' boxShadow 'inset 0 0 0 1px rgba(255,255,255,0.2)'. Inside <Half n={flapContent} half='top' .../>. Below the flap a 3px crease div bottom 0, background 'rgba(255,255,255,0.25)', zIndex 9, boxShadow '0 0 8px rgba(255,255,255,0.18)'.
- Scan line (if flapVisible): motion.div absolute inset-x-0 top={scanYPct} height 2 borderRadius 9999 background '#ffffff' opacity 0.3 zIndex 20 pointer-events-none.
- Center seam: absolute inset-x-0 top 'calc(59% - 3px)' height 6 background seam zIndex 10.
- Header/body divider: top 'calc(18% - 1px)' height 1 background 'rgba(0,0,0,0.22)' zIndex 11.
- Surface light: top '18%' height '30%' background 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, transparent 100%)' borderRadius '12px 12px 0 0' zIndex 6.

Half(n, half, numShadow): absolute inset-x-0 flex items-center justify-center, height 200%, top:0 if top else bottom:0. Inside span font-sans font-bold select-none tabular-nums fontSize 'clamp(3.8rem, 13vw, 6.5rem)' color '#ffffff' lineHeight 1 letterSpacing '-0.03em' textShadow numShadow → fmt(n).

Flip logic: flip(dir) computes target (wrap 1..31). runFlip(target, durationMs, dir, onDone): prev=currentRef.current, currentRef=target, setFlapContent(prev), setFlapVisible(true). If dir==='next' scanY.set(18) then animate(scanY, 104, {duration:(durationMs*2)/1000, ease:'linear'}); else 104→18. rotateX.set(0), animate(rotateX, -90, {duration: durationMs/1000, ease:'easeIn'}). sched (setTimeout, cleared in aliveRef cleanup) at durationMs: setTopDisplay(target); setBottomDisplay(target); setFlapContent(target); rotateX.set(90); animate(rotateX, 0, {duration: durationMs/1000, ease:'easeOut'}). sched at durationMs*2+20: setFlapVisible(false); onDone?.().

Hint: motion.p initial {opacity:0} animate {opacity:1} transition {delay:1.1, duration:0.8} className 'font-mono text-xs tracking-widest' color '#3a3530' dark / '#C8C2B8' light → '↑ swipe ↓'.

## Typography
- Font: monospace (system)
- Sizes: 12px
- Weights: 700`,

  'V0': `Create a React client component named FlipCalendar — a draggable flip-clock-style day calendar in rich blue gradients with parallax mouse tilt, a glowing scan line during flips, and a small hint "↑ swipe ↓" below it. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files (you may keep one small inline Half sub-component in the same file). 'use client' at the top. No 'any' types.

Constants: FLIP_MS = 220. fmt(n) returns String(n).padStart(2,'0').

State/refs: topDisplay=1, bottomDisplay=1, flapContent=1, flapVisible=false, flapping=false. currentRef=1, rootRef, isDark=true. MotionValues: rotateX=0, scanY=18, scanYPct=useTransform(scanY, v=>v+'%'). tiltX=0, tiltY=0. aliveRef=true, timeouts array.

Layout root: div ref=rootRef, flex h-full w-full flex-col items-center justify-center gap-6, background '#110F0C' dark / '#F5F1EA' light.

Theme detection via closest [data-card-theme] .dark else documentElement .dark, MutationObserver on both.

Parallax wrapper: div style perspective '900px', onMouseMove + onMouseLeave. motion.div initial {opacity:0, y:32, scale:0.9} animate {1,0,1} transition {duration:0.65, ease:[0.22,1,0.36,1]}. drag='y' dragConstraints top:0 bottom:0 dragElastic:0.08 onDragEnd → if |offset.y|<40 and |velocity.y|<300 return; else flip(offset.y>0||velocity.y>300 ? 'next' : 'prev'). style width 'min(260px, 56vw)' aspectRatio '1 / 1' rotate '3deg' rotateX={tiltX} rotateY={tiltY}, className relative cursor-grab active:cursor-grabbing select-none.

Mouse parallax: getBoundingClientRect, cx=(clientX-left)/width-0.5, cy=(clientY-top)/height-0.5. animate(tiltX, cy*-11, {duration:0.12, ease:'linear'}); animate(tiltY, cx*11, ...). On leave spring both to 0 with {stiffness:160, damping:18}.

Page stack: three dummy sheets behind the card using [13,8,4].map((y,i)) → absolute inset-0 background '#2E2A24' dark / '#C8C2B8' light, transform translateY(y px), opacity 0.28 + i*0.2, zIndex 0, borderRadius 18, boxShadow '0 '+(y*2)+'px '+(y*4)+'px rgba(0,0,0,0.35)'.

Main card: absolute inset-0 overflow-hidden zIndex 1 borderRadius 18 boxShadow cardShadow. cardShadow dark '0 40px 100px rgba(20,55,155,0.65), 0 12px 32px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.07)' light '0 40px 100px rgba(40,100,220,0.32), 0 12px 32px rgba(0,0,0,0.16), 0 0 0 1px rgba(255,255,255,0.9)'.

Gradients:
topGrad dark 'linear-gradient(155deg, #3572cc 0%, #2d62bc 55%, #2455a0 100%)' light '#4e9aec / #3d88da / #3078c8'.
flapGrad dark '#2d64bc / #2556ac / #1e4894' light '#4290de / #3480cc / #2870bc'.
bottomGrad dark '#4a8edc / #5a9eec / #68aef4' light '#5aaaee / #6abaf8 / #76c4fc'.
headerGrad dark 'linear-gradient(180deg, #2a2724 0%, #1e1c19 100%)' light '#d8d4ce / #c6c2bc'.
ringGrad dark 'radial-gradient(circle at 35% 30%, #f4f0ea 0%, #c0bcb6 45%, #888480 100%)' light '#ffffff / #dedad4 / #aeaaa4'.
seam 'rgba(0,0,0,0.42)' / 'rgba(0,0,0,0.22)'. numShadow dark '0 4px 24px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4)' light '0 4px 24px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.22)'.

Layers inside card:
- Header: absolute inset-x-0 top-0 flex items-end justify-center gap-8, height 18%, background headerGrad, zIndex 12, borderRadius '18px 18px 0 0', borderLeft+borderRight '1.5px solid rgba(0,0,0,0.14)', paddingBottom 7. Two 15×15 circles with background ringGrad and boxShadow '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.6)'.
- Bottom half: absolute inset-x-0 bottom-0, top '59%', background bottomGrad, overflow hidden; <Half n={bottomDisplay} half='bottom' numShadow=..../>
- Top half: absolute inset-x-0, top '18%' bottom '41%', background topGrad, borderRadius '12px 12px 0 0'; <Half n={topDisplay} half='top' .../>
- Flap (if flapVisible): absolute inset-x-0 top 18% height 41% zIndex 8. motion.div absolute inset-0 overflow hidden background flapGrad rotateX={rotateX} perspective:140 transformOrigin 'center bottom' willChange 'transform' borderRadius '12px 12px 0 0' boxShadow 'inset 0 0 0 1px rgba(255,255,255,0.2)'. Inside <Half n={flapContent} half='top' .../>. Below the flap a 3px crease div bottom 0, background 'rgba(255,255,255,0.25)', zIndex 9, boxShadow '0 0 8px rgba(255,255,255,0.18)'.
- Scan line (if flapVisible): motion.div absolute inset-x-0 top={scanYPct} height 2 borderRadius 9999 background '#ffffff' opacity 0.3 zIndex 20 pointer-events-none.
- Center seam: absolute inset-x-0 top 'calc(59% - 3px)' height 6 background seam zIndex 10.
- Header/body divider: top 'calc(18% - 1px)' height 1 background 'rgba(0,0,0,0.22)' zIndex 11.
- Surface light: top '18%' height '30%' background 'linear-gradient(180deg, rgba(255,255,255,0.09) 0%, transparent 100%)' borderRadius '12px 12px 0 0' zIndex 6.

Half(n, half, numShadow): absolute inset-x-0 flex items-center justify-center, height 200%, top:0 if top else bottom:0. Inside span font-sans font-bold select-none tabular-nums fontSize 'clamp(3.8rem, 13vw, 6.5rem)' color '#ffffff' lineHeight 1 letterSpacing '-0.03em' textShadow numShadow → fmt(n).

Flip logic: flip(dir) computes target (wrap 1..31). runFlip(target, durationMs, dir, onDone): prev=currentRef.current, currentRef=target, setFlapContent(prev), setFlapVisible(true). If dir==='next' scanY.set(18) then animate(scanY, 104, {duration:(durationMs*2)/1000, ease:'linear'}); else 104→18. rotateX.set(0), animate(rotateX, -90, {duration: durationMs/1000, ease:'easeIn'}). sched (setTimeout, cleared in aliveRef cleanup) at durationMs: setTopDisplay(target); setBottomDisplay(target); setFlapContent(target); rotateX.set(90); animate(rotateX, 0, {duration: durationMs/1000, ease:'easeOut'}). sched at durationMs*2+20: setFlapVisible(false); onDone?.().

Hint: motion.p initial {opacity:0} animate {opacity:1} transition {delay:1.1, duration:0.8} className 'font-mono text-xs tracking-widest' color '#3a3530' dark / '#C8C2B8' light → '↑ swipe ↓'.

## Typography
- Font: monospace (system)
- Sizes: 12px
- Weights: 700`,
}
