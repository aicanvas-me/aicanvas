import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion @phosphor-icons/react

Root element: className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#1A1A19]"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named \`GlassMusicPlayer\`, a frosted-glass "Now Playing" card with an animated vinyl disc, RAF-driven progress bar, pagination dots, and full playback controls.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background image (absolute inset-0 object-cover opacity-60 pointer-events-none):
\`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png\`

TRACKS (title, artist, color, duration seconds):
- 'Midnight Drive' / 'Neon Collective' / '#FF6BF5' / 234
- 'Glass Horizons' / 'Aurora Synth' / '#06D6A0' / 198
- 'Warm Signal' / 'Dusk Protocol' / '#FF7B54' / 267

formatTime(s): \`\${Math.floor(s/60)}:\${Math.floor(s%60).toString().padStart(2,'0')}\`.

State: trackIdx, playing, liked, shuffled, elapsed (number). Refs: rafRef (number), startRef, progressRef. progressMV = useMotionValue(0); barWidth = useTransform(progressMV, v => \`\${v*100}%\`). track = TRACKS[trackIdx].

RAF LOOP (useEffect deps [playing, track.duration, progressMV]):
- If !playing → cancelAnimationFrame(rafRef.current); return.
- const SPEED = 15 (demo multiplier).
- startRef.current = performance.now() - progressRef.current * track.duration * (1000/SPEED).
- lastLabelUpdate = 0.
- tick(now): ms = now - startRef; pct = min(ms/(duration*1000/SPEED), 1); progressRef=pct; progressMV.set(pct); if now-lastLabelUpdate > 250 setElapsed(pct*duration) + lastLabelUpdate=now. If pct<1 rafRef = requestAnimationFrame(tick); else setPlaying(false), progressRef=0, progressMV.set(0), setElapsed(0).
- Return () => cancelAnimationFrame(rafRef.current).

skipTo(dir: -1|1): setPlaying(false); progressRef=0; progressMV.set(0); setElapsed(0); setTrackIdx(i => (i+dir+TRACKS.length) % TRACKS.length).

Root: relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]. Background img.

Card motion.div: initial {y:24, scale:0.95} animate {y:0, scale:1} transition {type:'spring', stiffness:200, damping:22}. className "relative isolate w-[320px] overflow-hidden rounded-[32px]". style background 'rgba(12,10,14,0.55)', border '1px solid rgba(255,255,255,0.09)', boxShadow '0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)'. Separate blur layer z-[-1], backdropFilter 'blur(48px) saturate(1.6)'. Top highlight: absolute left-12 right-12 top-0 h-[1px] linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent).

Inside (flex flex-col items-center px-7 pb-7 pt-6):

1) Top bar mb-6 flex justify-between:
   - ArrowLeft size=20 weight="regular" motion.button whileHover {scale:1.15, color:'rgba(255,255,255,0.8)'} whileTap {scale:0.85}, style color 'rgba(255,255,255,0.35)'.
   - "Now Playing" span text-[10px] font-semibold uppercase tracking-[0.18em] color 'rgba(255,255,255,0.4)'.
   - Heart motion.button size=20 weight={liked?'fill':'regular'}, animate color liked?track.color:'rgba(255,255,255,0.35)', transition {duration:0.2}, whileHover {scale:1.15} whileTap {scale:0.85}. onClick toggle liked.

2) Album disc: AnimatePresence mode="wait" key=trackIdx → motion.div initial {opacity:0, scale:0.85} animate {opacity:1, scale:1} exit {opacity:0, scale:0.85} transition {type:'spring', stiffness:260, damping:26} className "relative mb-7".
   Ambient glow div: absolute inset-0 rounded-full, background track.color, opacity 0.18, filter 'blur(28px)', transform 'scale(1.15)'.
   Disc: relative flex h-44 w-44 items-center justify-center rounded-full, style background \`radial-gradient(circle at 38% 35%, \${track.color}28, \${track.color}08 60%, transparent)\`, border \`1.5px solid \${track.color}25\`, boxShadow \`0 0 0 8px rgba(255,255,255,0.03), 0 12px 40px rgba(0,0,0,0.5)\`.
   Inner motion.div animate {rotate: playing ? 360 : 0}, transition {duration:4, repeat:Infinity, ease:'linear'}, className "relative h-28 w-28". Four ring divs at scales [1, 0.78, 0.58, 0.38]: absolute inset-0 rounded-full, transform scale, border \`1px solid \${track.color}\${i===0?'30':i===1?'1e':'14'}\`. Center hole: h-5 w-5 absolute centered, radial-gradient track.color cc→66, boxShadow \`0 0 10px \${track.color}55\`.

3) Track info: AnimatePresence mode="wait" key=trackIdx → motion.div initial {opacity:0, y:10, filter:'blur(4px)'} animate {opacity:1, y:0, filter:'blur(0px)'} exit {opacity:0, y:-10, filter:'blur(4px)'} transition {type:'spring', duration:0.4, bounce:0} className "mb-4 flex flex-col items-center gap-1". <h3 text-lg font-bold tracking-tight text-white/95>{title}</h3> + <p text-[13px] font-medium color rgba(255,255,255,0.38)>{artist}</p>.

4) Pagination dots: mb-5 flex items-center gap-[7px]. Each motion.button animate {width: i===trackIdx?20:5, opacity: i===trackIdx?0.5:0.22, backgroundColor: i===trackIdx?track.color:'#ffffff'} transition {type:'spring', stiffness:400, damping:28} className "h-[5px] cursor-pointer rounded-full" style {minWidth:5}. onClick: reset progress, setTrackIdx(i).

5) Progress bar mb-5 w-full: track div relative h-[3px] w-full overflow-hidden rounded-full, bg 'rgba(255,255,255,0.07)'. Fill motion.div absolute left-0 top-0 h-full rounded-full, style {width:barWidth, background:\`linear-gradient(90deg, \${track.color}70, \${track.color}dd)\`}. Below: flex justify-between, two spans text-[10px] font-medium tabular-nums color 'rgba(255,255,255,0.28)': formatTime(elapsed), formatTime(track.duration).

6) Controls row flex w-full items-center justify-between:
   - Shuffle motion.button size=19 weight="regular" onClick toggle shuffled, animate color shuffled?track.color:'rgba(255,255,255,0.35)' transition {duration:0.2}, whileHover {scale:1.15, color: shuffled?track.color:'rgba(255,255,255,0.75)'} whileTap {scale:0.85}.
   - SkipBack motion.button size=26 weight="fill" onClick skipTo(-1), style color 'rgba(255,255,255,0.65)', whileHover {scale:1.12, color:'rgba(255,255,255,0.95)'} whileTap {scale:0.9}.
   - Play/Pause motion.button h-[52px] w-[52px] rounded-full flex centered, animate {background:\`radial-gradient(circle at 38% 35%, \${track.color}ee, \${track.color}99)\`, boxShadow:\`0 4px 20px \${track.color}55, 0 0 0 1px \${track.color}33\`}, transition {duration:0.3}, whileHover {scale:1.07} whileTap {scale:0.92}. onClick toggle playing. Inside AnimatePresence mode="wait": Pause or Play motion.div key swap initial {scale:0.6, opacity:0} animate {scale:1, opacity:1} exit {scale:0.6, opacity:0} {duration:0.15}. Pause size=22 weight="fill" text-white. Play size=22 weight="fill" ml-0.5 text-white.
   - SkipForward size=26 weight="fill" onClick skipTo(1) (same style as SkipBack).
   - Queue motion.button size=19 weight="regular" style color 'rgba(255,255,255,0.35)', whileHover {scale:1.15, color:'rgba(255,255,255,0.75)'} whileTap {scale:0.85}.

Imports: useState, useEffect, useRef from react; motion, AnimatePresence, useMotionValue, useTransform from framer-motion; Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Queue, ArrowLeft from @phosphor-icons/react.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 13px, 18px
- Weights: 500, 600, 700`,

  'Lovable': `Create a React client component named \`GlassMusicPlayer\` — a frosted-glass "Now Playing" card with an animated vinyl disc, RAF-driven progress bar, pagination dots, and full playback controls.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background image (absolute inset-0 object-cover opacity-60 pointer-events-none):
\`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png\`

TRACKS (title, artist, color, duration seconds):
- 'Midnight Drive' / 'Neon Collective' / '#FF6BF5' / 234
- 'Glass Horizons' / 'Aurora Synth' / '#06D6A0' / 198
- 'Warm Signal' / 'Dusk Protocol' / '#FF7B54' / 267

formatTime(s): \`\${Math.floor(s/60)}:\${Math.floor(s%60).toString().padStart(2,'0')}\`.

State: trackIdx, playing, liked, shuffled, elapsed (number). Refs: rafRef (number), startRef, progressRef. progressMV = useMotionValue(0); barWidth = useTransform(progressMV, v => \`\${v*100}%\`). track = TRACKS[trackIdx].

RAF LOOP (useEffect deps [playing, track.duration, progressMV]):
- If !playing → cancelAnimationFrame(rafRef.current); return.
- const SPEED = 15 (demo multiplier).
- startRef.current = performance.now() - progressRef.current * track.duration * (1000/SPEED).
- lastLabelUpdate = 0.
- tick(now): ms = now - startRef; pct = min(ms/(duration*1000/SPEED), 1); progressRef=pct; progressMV.set(pct); if now-lastLabelUpdate > 250 setElapsed(pct*duration) + lastLabelUpdate=now. If pct<1 rafRef = requestAnimationFrame(tick); else setPlaying(false), progressRef=0, progressMV.set(0), setElapsed(0).
- Return () => cancelAnimationFrame(rafRef.current).

skipTo(dir: -1|1): setPlaying(false); progressRef=0; progressMV.set(0); setElapsed(0); setTrackIdx(i => (i+dir+TRACKS.length) % TRACKS.length).

Root: relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]. Background img.

Card motion.div: initial {y:24, scale:0.95} animate {y:0, scale:1} transition {type:'spring', stiffness:200, damping:22}. className "relative isolate w-[320px] overflow-hidden rounded-[32px]". style background 'rgba(12,10,14,0.55)', border '1px solid rgba(255,255,255,0.09)', boxShadow '0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)'. Separate blur layer z-[-1], backdropFilter 'blur(48px) saturate(1.6)'. Top highlight: absolute left-12 right-12 top-0 h-[1px] linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent).

Inside (flex flex-col items-center px-7 pb-7 pt-6):

1) Top bar mb-6 flex justify-between:
   - ArrowLeft size=20 weight="regular" motion.button whileHover {scale:1.15, color:'rgba(255,255,255,0.8)'} whileTap {scale:0.85}, style color 'rgba(255,255,255,0.35)'.
   - "Now Playing" span text-[10px] font-semibold uppercase tracking-[0.18em] color 'rgba(255,255,255,0.4)'.
   - Heart motion.button size=20 weight={liked?'fill':'regular'}, animate color liked?track.color:'rgba(255,255,255,0.35)', transition {duration:0.2}, whileHover {scale:1.15} whileTap {scale:0.85}. onClick toggle liked.

2) Album disc — AnimatePresence mode="wait" key=trackIdx → motion.div initial {opacity:0, scale:0.85} animate {opacity:1, scale:1} exit {opacity:0, scale:0.85} transition {type:'spring', stiffness:260, damping:26} className "relative mb-7".
   Ambient glow div: absolute inset-0 rounded-full, background track.color, opacity 0.18, filter 'blur(28px)', transform 'scale(1.15)'.
   Disc: relative flex h-44 w-44 items-center justify-center rounded-full, style background \`radial-gradient(circle at 38% 35%, \${track.color}28, \${track.color}08 60%, transparent)\`, border \`1.5px solid \${track.color}25\`, boxShadow \`0 0 0 8px rgba(255,255,255,0.03), 0 12px 40px rgba(0,0,0,0.5)\`.
   Inner motion.div animate {rotate: playing ? 360 : 0}, transition {duration:4, repeat:Infinity, ease:'linear'}, className "relative h-28 w-28". Four ring divs at scales [1, 0.78, 0.58, 0.38]: absolute inset-0 rounded-full, transform scale, border \`1px solid \${track.color}\${i===0?'30':i===1?'1e':'14'}\`. Center hole: h-5 w-5 absolute centered, radial-gradient track.color cc→66, boxShadow \`0 0 10px \${track.color}55\`.

3) Track info — AnimatePresence mode="wait" key=trackIdx → motion.div initial {opacity:0, y:10, filter:'blur(4px)'} animate {opacity:1, y:0, filter:'blur(0px)'} exit {opacity:0, y:-10, filter:'blur(4px)'} transition {type:'spring', duration:0.4, bounce:0} className "mb-4 flex flex-col items-center gap-1". <h3 text-lg font-bold tracking-tight text-white/95>{title}</h3> + <p text-[13px] font-medium color rgba(255,255,255,0.38)>{artist}</p>.

4) Pagination dots: mb-5 flex items-center gap-[7px]. Each motion.button animate {width: i===trackIdx?20:5, opacity: i===trackIdx?0.5:0.22, backgroundColor: i===trackIdx?track.color:'#ffffff'} transition {type:'spring', stiffness:400, damping:28} className "h-[5px] cursor-pointer rounded-full" style {minWidth:5}. onClick: reset progress, setTrackIdx(i).

5) Progress bar mb-5 w-full: track div relative h-[3px] w-full overflow-hidden rounded-full, bg 'rgba(255,255,255,0.07)'. Fill motion.div absolute left-0 top-0 h-full rounded-full, style {width:barWidth, background:\`linear-gradient(90deg, \${track.color}70, \${track.color}dd)\`}. Below: flex justify-between — two spans text-[10px] font-medium tabular-nums color 'rgba(255,255,255,0.28)': formatTime(elapsed), formatTime(track.duration).

6) Controls row flex w-full items-center justify-between:
   - Shuffle motion.button size=19 weight="regular" onClick toggle shuffled, animate color shuffled?track.color:'rgba(255,255,255,0.35)' transition {duration:0.2}, whileHover {scale:1.15, color: shuffled?track.color:'rgba(255,255,255,0.75)'} whileTap {scale:0.85}.
   - SkipBack motion.button size=26 weight="fill" onClick skipTo(-1), style color 'rgba(255,255,255,0.65)', whileHover {scale:1.12, color:'rgba(255,255,255,0.95)'} whileTap {scale:0.9}.
   - Play/Pause motion.button h-[52px] w-[52px] rounded-full flex centered, animate {background:\`radial-gradient(circle at 38% 35%, \${track.color}ee, \${track.color}99)\`, boxShadow:\`0 4px 20px \${track.color}55, 0 0 0 1px \${track.color}33\`}, transition {duration:0.3}, whileHover {scale:1.07} whileTap {scale:0.92}. onClick toggle playing. Inside AnimatePresence mode="wait": Pause or Play motion.div key swap initial {scale:0.6, opacity:0} animate {scale:1, opacity:1} exit {scale:0.6, opacity:0} {duration:0.15}. Pause size=22 weight="fill" text-white. Play size=22 weight="fill" ml-0.5 text-white.
   - SkipForward size=26 weight="fill" onClick skipTo(1) (same style as SkipBack).
   - Queue motion.button size=19 weight="regular" style color 'rgba(255,255,255,0.35)', whileHover {scale:1.15, color:'rgba(255,255,255,0.75)'} whileTap {scale:0.85}.

Imports: useState, useEffect, useRef from react; motion, AnimatePresence, useMotionValue, useTransform from framer-motion; Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Queue, ArrowLeft from @phosphor-icons/react.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 13px, 18px
- Weights: 500, 600, 700`,

  'V0': `Create a React client component named \`GlassMusicPlayer\` — a frosted-glass "Now Playing" card with an animated vinyl disc, RAF-driven progress bar, pagination dots, and full playback controls.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background image (absolute inset-0 object-cover opacity-60 pointer-events-none):
\`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png\`

TRACKS (title, artist, color, duration seconds):
- 'Midnight Drive' / 'Neon Collective' / '#FF6BF5' / 234
- 'Glass Horizons' / 'Aurora Synth' / '#06D6A0' / 198
- 'Warm Signal' / 'Dusk Protocol' / '#FF7B54' / 267

formatTime(s): \`\${Math.floor(s/60)}:\${Math.floor(s%60).toString().padStart(2,'0')}\`.

State: trackIdx, playing, liked, shuffled, elapsed (number). Refs: rafRef (number), startRef, progressRef. progressMV = useMotionValue(0); barWidth = useTransform(progressMV, v => \`\${v*100}%\`). track = TRACKS[trackIdx].

RAF LOOP (useEffect deps [playing, track.duration, progressMV]):
- If !playing → cancelAnimationFrame(rafRef.current); return.
- const SPEED = 15 (demo multiplier).
- startRef.current = performance.now() - progressRef.current * track.duration * (1000/SPEED).
- lastLabelUpdate = 0.
- tick(now): ms = now - startRef; pct = min(ms/(duration*1000/SPEED), 1); progressRef=pct; progressMV.set(pct); if now-lastLabelUpdate > 250 setElapsed(pct*duration) + lastLabelUpdate=now. If pct<1 rafRef = requestAnimationFrame(tick); else setPlaying(false), progressRef=0, progressMV.set(0), setElapsed(0).
- Return () => cancelAnimationFrame(rafRef.current).

skipTo(dir: -1|1): setPlaying(false); progressRef=0; progressMV.set(0); setElapsed(0); setTrackIdx(i => (i+dir+TRACKS.length) % TRACKS.length).

Root: relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]. Background img.

Card motion.div: initial {y:24, scale:0.95} animate {y:0, scale:1} transition {type:'spring', stiffness:200, damping:22}. className "relative isolate w-[320px] overflow-hidden rounded-[32px]". style background 'rgba(12,10,14,0.55)', border '1px solid rgba(255,255,255,0.09)', boxShadow '0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)'. Separate blur layer z-[-1], backdropFilter 'blur(48px) saturate(1.6)'. Top highlight: absolute left-12 right-12 top-0 h-[1px] linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent).

Inside (flex flex-col items-center px-7 pb-7 pt-6):

1) Top bar mb-6 flex justify-between:
   - ArrowLeft size=20 weight="regular" motion.button whileHover {scale:1.15, color:'rgba(255,255,255,0.8)'} whileTap {scale:0.85}, style color 'rgba(255,255,255,0.35)'.
   - "Now Playing" span text-[10px] font-semibold uppercase tracking-[0.18em] color 'rgba(255,255,255,0.4)'.
   - Heart motion.button size=20 weight={liked?'fill':'regular'}, animate color liked?track.color:'rgba(255,255,255,0.35)', transition {duration:0.2}, whileHover {scale:1.15} whileTap {scale:0.85}. onClick toggle liked.

2) Album disc — AnimatePresence mode="wait" key=trackIdx → motion.div initial {opacity:0, scale:0.85} animate {opacity:1, scale:1} exit {opacity:0, scale:0.85} transition {type:'spring', stiffness:260, damping:26} className "relative mb-7".
   Ambient glow div: absolute inset-0 rounded-full, background track.color, opacity 0.18, filter 'blur(28px)', transform 'scale(1.15)'.
   Disc: relative flex h-44 w-44 items-center justify-center rounded-full, style background \`radial-gradient(circle at 38% 35%, \${track.color}28, \${track.color}08 60%, transparent)\`, border \`1.5px solid \${track.color}25\`, boxShadow \`0 0 0 8px rgba(255,255,255,0.03), 0 12px 40px rgba(0,0,0,0.5)\`.
   Inner motion.div animate {rotate: playing ? 360 : 0}, transition {duration:4, repeat:Infinity, ease:'linear'}, className "relative h-28 w-28". Four ring divs at scales [1, 0.78, 0.58, 0.38]: absolute inset-0 rounded-full, transform scale, border \`1px solid \${track.color}\${i===0?'30':i===1?'1e':'14'}\`. Center hole: h-5 w-5 absolute centered, radial-gradient track.color cc→66, boxShadow \`0 0 10px \${track.color}55\`.

3) Track info — AnimatePresence mode="wait" key=trackIdx → motion.div initial {opacity:0, y:10, filter:'blur(4px)'} animate {opacity:1, y:0, filter:'blur(0px)'} exit {opacity:0, y:-10, filter:'blur(4px)'} transition {type:'spring', duration:0.4, bounce:0} className "mb-4 flex flex-col items-center gap-1". <h3 text-lg font-bold tracking-tight text-white/95>{title}</h3> + <p text-[13px] font-medium color rgba(255,255,255,0.38)>{artist}</p>.

4) Pagination dots: mb-5 flex items-center gap-[7px]. Each motion.button animate {width: i===trackIdx?20:5, opacity: i===trackIdx?0.5:0.22, backgroundColor: i===trackIdx?track.color:'#ffffff'} transition {type:'spring', stiffness:400, damping:28} className "h-[5px] cursor-pointer rounded-full" style {minWidth:5}. onClick: reset progress, setTrackIdx(i).

5) Progress bar mb-5 w-full: track div relative h-[3px] w-full overflow-hidden rounded-full, bg 'rgba(255,255,255,0.07)'. Fill motion.div absolute left-0 top-0 h-full rounded-full, style {width:barWidth, background:\`linear-gradient(90deg, \${track.color}70, \${track.color}dd)\`}. Below: flex justify-between — two spans text-[10px] font-medium tabular-nums color 'rgba(255,255,255,0.28)': formatTime(elapsed), formatTime(track.duration).

6) Controls row flex w-full items-center justify-between:
   - Shuffle motion.button size=19 weight="regular" onClick toggle shuffled, animate color shuffled?track.color:'rgba(255,255,255,0.35)' transition {duration:0.2}, whileHover {scale:1.15, color: shuffled?track.color:'rgba(255,255,255,0.75)'} whileTap {scale:0.85}.
   - SkipBack motion.button size=26 weight="fill" onClick skipTo(-1), style color 'rgba(255,255,255,0.65)', whileHover {scale:1.12, color:'rgba(255,255,255,0.95)'} whileTap {scale:0.9}.
   - Play/Pause motion.button h-[52px] w-[52px] rounded-full flex centered, animate {background:\`radial-gradient(circle at 38% 35%, \${track.color}ee, \${track.color}99)\`, boxShadow:\`0 4px 20px \${track.color}55, 0 0 0 1px \${track.color}33\`}, transition {duration:0.3}, whileHover {scale:1.07} whileTap {scale:0.92}. onClick toggle playing. Inside AnimatePresence mode="wait": Pause or Play motion.div key swap initial {scale:0.6, opacity:0} animate {scale:1, opacity:1} exit {scale:0.6, opacity:0} {duration:0.15}. Pause size=22 weight="fill" text-white. Play size=22 weight="fill" ml-0.5 text-white.
   - SkipForward size=26 weight="fill" onClick skipTo(1) (same style as SkipBack).
   - Queue motion.button size=19 weight="regular" style color 'rgba(255,255,255,0.35)', whileHover {scale:1.15, color:'rgba(255,255,255,0.75)'} whileTap {scale:0.85}.

Imports: useState, useEffect, useRef from react; motion, AnimatePresence, useMotionValue, useTransform from framer-motion; Play, Pause, SkipBack, SkipForward, Heart, Shuffle, Queue, ArrowLeft from @phosphor-icons/react.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 13px, 18px
- Weights: 500, 600, 700`,
}
