import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion @phosphor-icons/react

Root element: className="flex min-h-screen w-full items-center justify-center"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named MarkToggle, an iOS-style pill toggle in earth/sand tones whose white thumb carries a small icon that morphs from X (off) to Check (on) as it slides across. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Constants: MAX_TRACK_W = 80, MIN_TRACK_W = 48. State: isOn=false, animating=false, pageIsDark=true, trackW=80. Refs: containerRef, isOnRef=false. MotionValue thumbX = useMotionValue(offX).

Layout: root div ref=containerRef, className "flex h-full w-full items-center justify-center", background #110F0C dark / #EDEAE5 light.

Theme detection: closest [data-card-theme] .dark else documentElement .dark, MutationObserver on both. ResizeObserver on root: trackW = clamp(MIN, MAX, round(min(offsetW, offsetH)*0.18)). On trackW change: thumbX.set(isOnRef.current ? onX : offX).

Derived dimensions: trackH = round(trackW*0.55); thumb = round(trackW*0.45); pad = max(3, round(trackW*0.05)); offX = pad; onX = trackW - thumb - pad; iconSize = round(thumb*0.50).

Colors: offTrack '#8C7B6B' dark / '#B09478' light. onTrack '#4A5935' / '#6B8040'. trackColor = useTransform(thumbX, [offX, onX], [offTrack, onTrack]). iconColor matches the track the thumb is currently over (isOn ? onTrack : offTrack). trackInset dark 'inset 0 1px 4px rgba(0,0,0,0.50)' light 'inset 0 1px 3px rgba(0,0,0,0.14)'. thumbShadow dark '0 3px 8px rgba(0,0,0,0.50), 0 1px 3px rgba(0,0,0,0.30)' light '0 3px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.10)'.

handleToggle (useCallback, skip if animating): setAnimating(true); target = isOn ? offX : onX; isOnRef.current = !isOn; setIsOn(v=>!v); await animate(thumbX, target, {type:'spring', stiffness:500, damping:36}); setAnimating(false).

JSX: wrapper motion.div initial {opacity:0, scale:0.88} animate {opacity:1, scale:1} transition {duration:0.4, ease:[0.34,1.56,0.64,1]} className "select-none". Inside motion.button onClick={handleToggle} style {width:trackW, height:trackH, borderRadius:trackH/2, backgroundColor:trackColor, boxShadow:trackInset, position:'relative', cursor:'pointer', border:'none', outline:'none', display:'block'} whileTap {scale:0.96} transition {type:'spring', stiffness:400, damping:28}. Inside the button a motion.div thumb style {position:'absolute', top:pad, x:thumbX, width:thumb, height:thumb, borderRadius:'50%', background:'white', boxShadow:thumbShadow, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden'}.

Inside the thumb AnimatePresence mode="wait" initial={false}: when isOn render motion.span key="check" initial {scale:0, rotate:-45, opacity:0} animate {1,0,1} exit {scale:0, rotate:45, opacity:0} transition {duration:0.18, ease:[0.34,1.56,0.64,1]} containing <Check size={iconSize} weight="bold" color={iconColor}/>. Else motion.span key="x-icon" same animation but initial rotate 45 and exit rotate -45 containing <X size={iconSize} weight="bold" color={iconColor}/>. Icons from @phosphor-icons/react.

## Typography
- Font: project default sans-serif`,

  'Lovable': `Create a React client component named MarkToggle — an iOS-style pill toggle in earth/sand tones whose white thumb carries a small icon that morphs from X (off) to Check (on) as it slides across. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Constants: MAX_TRACK_W = 80, MIN_TRACK_W = 48. State: isOn=false, animating=false, pageIsDark=true, trackW=80. Refs: containerRef, isOnRef=false. MotionValue thumbX = useMotionValue(offX).

Layout: root div ref=containerRef, className "flex h-full w-full items-center justify-center", background #110F0C dark / #EDEAE5 light.

Theme detection: closest [data-card-theme] .dark else documentElement .dark, MutationObserver on both. ResizeObserver on root: trackW = clamp(MIN, MAX, round(min(offsetW, offsetH)*0.18)). On trackW change: thumbX.set(isOnRef.current ? onX : offX).

Derived dimensions: trackH = round(trackW*0.55); thumb = round(trackW*0.45); pad = max(3, round(trackW*0.05)); offX = pad; onX = trackW - thumb - pad; iconSize = round(thumb*0.50).

Colors: offTrack '#8C7B6B' dark / '#B09478' light. onTrack '#4A5935' / '#6B8040'. trackColor = useTransform(thumbX, [offX, onX], [offTrack, onTrack]). iconColor matches the track the thumb is currently over (isOn ? onTrack : offTrack). trackInset dark 'inset 0 1px 4px rgba(0,0,0,0.50)' light 'inset 0 1px 3px rgba(0,0,0,0.14)'. thumbShadow dark '0 3px 8px rgba(0,0,0,0.50), 0 1px 3px rgba(0,0,0,0.30)' light '0 3px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.10)'.

handleToggle (useCallback, skip if animating): setAnimating(true); target = isOn ? offX : onX; isOnRef.current = !isOn; setIsOn(v=>!v); await animate(thumbX, target, {type:'spring', stiffness:500, damping:36}); setAnimating(false).

JSX: wrapper motion.div initial {opacity:0, scale:0.88} animate {opacity:1, scale:1} transition {duration:0.4, ease:[0.34,1.56,0.64,1]} className "select-none". Inside motion.button onClick={handleToggle} style {width:trackW, height:trackH, borderRadius:trackH/2, backgroundColor:trackColor, boxShadow:trackInset, position:'relative', cursor:'pointer', border:'none', outline:'none', display:'block'} whileTap {scale:0.96} transition {type:'spring', stiffness:400, damping:28}. Inside the button a motion.div thumb style {position:'absolute', top:pad, x:thumbX, width:thumb, height:thumb, borderRadius:'50%', background:'white', boxShadow:thumbShadow, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden'}.

Inside the thumb AnimatePresence mode="wait" initial={false}: when isOn render motion.span key="check" initial {scale:0, rotate:-45, opacity:0} animate {1,0,1} exit {scale:0, rotate:45, opacity:0} transition {duration:0.18, ease:[0.34,1.56,0.64,1]} containing <Check size={iconSize} weight="bold" color={iconColor}/>. Else motion.span key="x-icon" same animation but initial rotate 45 and exit rotate -45 containing <X size={iconSize} weight="bold" color={iconColor}/>. Icons from @phosphor-icons/react.

## Typography
- Font: project default sans-serif`,

  'V0': `Create a React client component named MarkToggle — an iOS-style pill toggle in earth/sand tones whose white thumb carries a small icon that morphs from X (off) to Check (on) as it slides across. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Constants: MAX_TRACK_W = 80, MIN_TRACK_W = 48. State: isOn=false, animating=false, pageIsDark=true, trackW=80. Refs: containerRef, isOnRef=false. MotionValue thumbX = useMotionValue(offX).

Layout: root div ref=containerRef, className "flex h-full w-full items-center justify-center", background #110F0C dark / #EDEAE5 light.

Theme detection: closest [data-card-theme] .dark else documentElement .dark, MutationObserver on both. ResizeObserver on root: trackW = clamp(MIN, MAX, round(min(offsetW, offsetH)*0.18)). On trackW change: thumbX.set(isOnRef.current ? onX : offX).

Derived dimensions: trackH = round(trackW*0.55); thumb = round(trackW*0.45); pad = max(3, round(trackW*0.05)); offX = pad; onX = trackW - thumb - pad; iconSize = round(thumb*0.50).

Colors: offTrack '#8C7B6B' dark / '#B09478' light. onTrack '#4A5935' / '#6B8040'. trackColor = useTransform(thumbX, [offX, onX], [offTrack, onTrack]). iconColor matches the track the thumb is currently over (isOn ? onTrack : offTrack). trackInset dark 'inset 0 1px 4px rgba(0,0,0,0.50)' light 'inset 0 1px 3px rgba(0,0,0,0.14)'. thumbShadow dark '0 3px 8px rgba(0,0,0,0.50), 0 1px 3px rgba(0,0,0,0.30)' light '0 3px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.10)'.

handleToggle (useCallback, skip if animating): setAnimating(true); target = isOn ? offX : onX; isOnRef.current = !isOn; setIsOn(v=>!v); await animate(thumbX, target, {type:'spring', stiffness:500, damping:36}); setAnimating(false).

JSX: wrapper motion.div initial {opacity:0, scale:0.88} animate {opacity:1, scale:1} transition {duration:0.4, ease:[0.34,1.56,0.64,1]} className "select-none". Inside motion.button onClick={handleToggle} style {width:trackW, height:trackH, borderRadius:trackH/2, backgroundColor:trackColor, boxShadow:trackInset, position:'relative', cursor:'pointer', border:'none', outline:'none', display:'block'} whileTap {scale:0.96} transition {type:'spring', stiffness:400, damping:28}. Inside the button a motion.div thumb style {position:'absolute', top:pad, x:thumbX, width:thumb, height:thumb, borderRadius:'50%', background:'white', boxShadow:thumbShadow, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden'}.

Inside the thumb AnimatePresence mode="wait" initial={false}: when isOn render motion.span key="check" initial {scale:0, rotate:-45, opacity:0} animate {1,0,1} exit {scale:0, rotate:45, opacity:0} transition {duration:0.18, ease:[0.34,1.56,0.64,1]} containing <Check size={iconSize} weight="bold" color={iconColor}/>. Else motion.span key="x-icon" same animation but initial rotate 45 and exit rotate -45 containing <X size={iconSize} weight="bold" color={iconColor}/>. Icons from @phosphor-icons/react.

## Typography
- Font: project default sans-serif`,
}
