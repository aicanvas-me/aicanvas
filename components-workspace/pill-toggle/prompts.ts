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

Create a React client component named PillToggle, a classic iOS-style pill switch with a plain white circular thumb and a track that transitions from gray to green as the thumb slides. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Constants: MAX_TRACK_W = 80, MIN_TRACK_W = 48.

State: isOn=false, animating=false, pageIsDark=true, trackW=80. Refs: containerRef, isOnRef=false. MotionValue thumbX = useMotionValue(offX).

Root: div ref=containerRef, className "flex h-full w-full items-center justify-center", style background '#110F0C' dark / '#EDEAE5' light.

Theme + resize (single useEffect): closest [data-card-theme] .dark else documentElement .dark. MutationObserver on both. ResizeObserver sets trackW = clamp(MIN, MAX, round(min(offsetW, offsetH)*0.18)). Separate useEffect on trackW: thumbX.set(isOnRef.current ? onX : offX).

Derived dimensions (computed each render): trackH = round(trackW*0.55); thumb = round(trackW*0.45); pad = max(3, round(trackW*0.05)); offX = pad; onX = trackW - thumb - pad.

Colors: offTrack '#3D3A3A' dark / '#D1D1D6' light. trackColor = useTransform(thumbX, [offX, onX], [offTrack, '#22c55e']). trackInset dark 'inset 0 1px 4px rgba(0,0,0,0.50)' light 'inset 0 1px 3px rgba(0,0,0,0.14)'. thumbShadow dark '0 3px 8px rgba(0,0,0,0.50), 0 1px 3px rgba(0,0,0,0.30)' light '0 3px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.10)'.

handleToggle (useCallback, guards on animating): setAnimating(true); target = isOn ? offX : onX; isOnRef.current = !isOn; setIsOn(v=>!v); await animate(thumbX, target, {type:'spring', stiffness:500, damping:36}); setAnimating(false).

JSX: wrapper motion.div initial {opacity:0, scale:0.88} animate {opacity:1, scale:1} transition {duration:0.4, ease:[0.34, 1.56, 0.64, 1]} className "select-none". Inside motion.button onClick={handleToggle} style {width:trackW, height:trackH, borderRadius:trackH/2, backgroundColor:trackColor, boxShadow:trackInset, position:'relative', cursor:'pointer', border:'none', outline:'none', display:'block'} whileTap {scale:0.96} transition {type:'spring', stiffness:400, damping:28}. Inside the button: motion.div thumb style {position:'absolute', top:pad, x:thumbX, width:thumb, height:thumb, borderRadius:'50%', background:'white', boxShadow:thumbShadow}. No icons, no children inside the thumb. Minimal and clean.

## Typography
- Font: project default sans-serif`,

  'Lovable': `Create a React client component named PillToggle — a classic iOS-style pill switch with a plain white circular thumb and a track that transitions from gray to green as the thumb slides. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Constants: MAX_TRACK_W = 80, MIN_TRACK_W = 48.

State: isOn=false, animating=false, pageIsDark=true, trackW=80. Refs: containerRef, isOnRef=false. MotionValue thumbX = useMotionValue(offX).

Root: div ref=containerRef, className "flex h-full w-full items-center justify-center", style background '#110F0C' dark / '#EDEAE5' light.

Theme + resize (single useEffect): closest [data-card-theme] .dark else documentElement .dark. MutationObserver on both. ResizeObserver sets trackW = clamp(MIN, MAX, round(min(offsetW, offsetH)*0.18)). Separate useEffect on trackW: thumbX.set(isOnRef.current ? onX : offX).

Derived dimensions (computed each render): trackH = round(trackW*0.55); thumb = round(trackW*0.45); pad = max(3, round(trackW*0.05)); offX = pad; onX = trackW - thumb - pad.

Colors: offTrack '#3D3A3A' dark / '#D1D1D6' light. trackColor = useTransform(thumbX, [offX, onX], [offTrack, '#22c55e']). trackInset dark 'inset 0 1px 4px rgba(0,0,0,0.50)' light 'inset 0 1px 3px rgba(0,0,0,0.14)'. thumbShadow dark '0 3px 8px rgba(0,0,0,0.50), 0 1px 3px rgba(0,0,0,0.30)' light '0 3px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.10)'.

handleToggle (useCallback, guards on animating): setAnimating(true); target = isOn ? offX : onX; isOnRef.current = !isOn; setIsOn(v=>!v); await animate(thumbX, target, {type:'spring', stiffness:500, damping:36}); setAnimating(false).

JSX: wrapper motion.div initial {opacity:0, scale:0.88} animate {opacity:1, scale:1} transition {duration:0.4, ease:[0.34, 1.56, 0.64, 1]} className "select-none". Inside motion.button onClick={handleToggle} style {width:trackW, height:trackH, borderRadius:trackH/2, backgroundColor:trackColor, boxShadow:trackInset, position:'relative', cursor:'pointer', border:'none', outline:'none', display:'block'} whileTap {scale:0.96} transition {type:'spring', stiffness:400, damping:28}. Inside the button: motion.div thumb style {position:'absolute', top:pad, x:thumbX, width:thumb, height:thumb, borderRadius:'50%', background:'white', boxShadow:thumbShadow}. No icons, no children inside the thumb — minimal and clean.

## Typography
- Font: project default sans-serif`,

  'V0': `Create a React client component named PillToggle — a classic iOS-style pill switch with a plain white circular thumb and a track that transitions from gray to green as the thumb slides. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Constants: MAX_TRACK_W = 80, MIN_TRACK_W = 48.

State: isOn=false, animating=false, pageIsDark=true, trackW=80. Refs: containerRef, isOnRef=false. MotionValue thumbX = useMotionValue(offX).

Root: div ref=containerRef, className "flex h-full w-full items-center justify-center", style background '#110F0C' dark / '#EDEAE5' light.

Theme + resize (single useEffect): closest [data-card-theme] .dark else documentElement .dark. MutationObserver on both. ResizeObserver sets trackW = clamp(MIN, MAX, round(min(offsetW, offsetH)*0.18)). Separate useEffect on trackW: thumbX.set(isOnRef.current ? onX : offX).

Derived dimensions (computed each render): trackH = round(trackW*0.55); thumb = round(trackW*0.45); pad = max(3, round(trackW*0.05)); offX = pad; onX = trackW - thumb - pad.

Colors: offTrack '#3D3A3A' dark / '#D1D1D6' light. trackColor = useTransform(thumbX, [offX, onX], [offTrack, '#22c55e']). trackInset dark 'inset 0 1px 4px rgba(0,0,0,0.50)' light 'inset 0 1px 3px rgba(0,0,0,0.14)'. thumbShadow dark '0 3px 8px rgba(0,0,0,0.50), 0 1px 3px rgba(0,0,0,0.30)' light '0 3px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.10)'.

handleToggle (useCallback, guards on animating): setAnimating(true); target = isOn ? offX : onX; isOnRef.current = !isOn; setIsOn(v=>!v); await animate(thumbX, target, {type:'spring', stiffness:500, damping:36}); setAnimating(false).

JSX: wrapper motion.div initial {opacity:0, scale:0.88} animate {opacity:1, scale:1} transition {duration:0.4, ease:[0.34, 1.56, 0.64, 1]} className "select-none". Inside motion.button onClick={handleToggle} style {width:trackW, height:trackH, borderRadius:trackH/2, backgroundColor:trackColor, boxShadow:trackInset, position:'relative', cursor:'pointer', border:'none', outline:'none', display:'block'} whileTap {scale:0.96} transition {type:'spring', stiffness:400, damping:28}. Inside the button: motion.div thumb style {position:'absolute', top:pad, x:thumbX, width:thumb, height:thumb, borderRadius:'50%', background:'white', boxShadow:thumbShadow}. No icons, no children inside the thumb — minimal and clean.

## Typography
- Font: project default sans-serif`,
}
