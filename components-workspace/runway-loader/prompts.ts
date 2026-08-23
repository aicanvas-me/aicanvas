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

Create a React client component named \`RunwayLoader\`: a playful progress indicator shaped like a runway. A top-down SVG airplane taxis left→right along a rounded horizontal track while a red fill grows behind it. When the plane nose touches the right wall it "takes off" (scales + slides off-screen + fades), the bar completes, then the whole thing resets and loops. Numeric % and label read out below. Supports light + dark themes.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types. Define the Airplane SVG as a plain inner function component in the same file (not an exported helper).

Imports: useEffect, useRef, useState from 'react'; motion, AnimatePresence from 'framer-motion'.

Airplane({isDark}): <svg className="w-[52px] sm:w-[72px] h-auto" viewBox="0 0 72 46" fill="none" style={{filter: isDark ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.75)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.35)) drop-shadow(0 1px 3px rgba(0,0,0,0.2))'}}>
Colors (dark vs light): bodyTop '#ececec'/'#c8c8c8', bodyMid '#ffffff'/'#dedede', bodyBot '#d0d0d0'/'#b4b4b4', wingLight '#f8f8f8'/'#d8d8d8', wingDark '#bababa'/'#909090', tail '#c8c8c8'/'#a8a8a8', nose '#f4f4f4'/'#d8d8d8'.
defs: linearGradient id="rl-body" x1=0 y1=0 x2=0 y2=1 stops 0% bodyTop, 40% bodyMid, 100% bodyBot. "rl-wing-t" x1=0 y1=1 x2=1 y2=0 stops wingLight→wingDark. "rl-wing-b" x1=0 y1=0 x2=1 y2=1 stops wingLight→wingDark.
Paths:
- Top wing: <path d="M44,21 L28,21 L8,2 L18,0 Z" fill="url(#rl-wing-t)"/>
- Bottom wing: <path d="M44,25 L28,25 L8,44 L18,46 Z" fill="url(#rl-wing-b)"/>
- Tail stabilisers: <path d="M8,21 L2,14 L6,14 L12,21 Z" fill={tail}/> and <path d="M8,25 L2,32 L6,32 L12,25 Z" fill={tail}/>
- Fuselage: <ellipse cx=34 cy=23 rx=29 ry=7 fill="url(#rl-body)"/>
- Nose: <path d="M61,19.5 C66,21.5 67.5,23 67,23 C67.5,23 66,24.5 61,26.5 L58,23 Z" fill={nose}/>
- Cockpit window: <ellipse cx=57 cy=23 rx=4 ry=3 fill="#7ec8e8" opacity="0.9"/>

Type Phase = 'taxiing' | 'takeoff' | 'resetting'.

State/refs in RunwayLoader:
- containerRef<HTMLDivElement>
- [isDark, setIsDark] default true
- [progress, setProgress] number starting 0
- [phase, setPhase]<Phase> default 'taxiing'
- [cycle, setCycle] number 0
- rafRef number 0, startRef undefined, aliveRef true, disappearedRef false
- const WALL_PCT = 91

Theme effect: same closest [data-card-theme] / html fallback pattern. MutationObserver on both, cleanup disconnect.

Animation effect (runs once):
- aliveRef.current=true; disappearedRef.current=false; TAXI_MS=5500.
- tick(ts): if !aliveRef return. if !startRef set startRef=ts. t=min((ts-startRef)/TAXI_MS, 1). eased = t<=0.75 ? (t/0.75)*82 : 82 + (1 - (1-(t-0.75)/0.25)^2)*18. p=min(eased,100). setProgress(p). If p>=WALL_PCT && !disappearedRef: disappearedRef=true; setPhase('takeoff'). If p<100 raf=requestAnimationFrame(tick); else setTimeout 600ms: setPhase('resetting'), setTimeout 400ms: disappearedRef=false, startRef=undefined, setProgress(0), setPhase('taxiing'), setCycle(c=>c+1), raf=requestAnimationFrame(tick).
- Initial: rafRef=requestAnimationFrame(tick). Cleanup: aliveRef=false; cancelAnimationFrame(rafRef).

planePct = min(progress, WALL_PCT).

Theme-responsive track styles:
- trackBg dark: 'linear-gradient(to bottom, #404040, #252525)'; light: 'linear-gradient(to bottom, #bab7b2, #a09d98)'
- trackShadow dark: 'inset 0 4px 12px rgba(0,0,0,0.85), inset 0 -1px 3px rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.5)'; light: 'inset 0 3px 8px rgba(0,0,0,0.22), inset 0 -1px 3px rgba(255,255,255,0.28), 0 2px 5px rgba(0,0,0,0.12)'
- dashColor dark 'rgba(255,255,255,0.22)' light 'rgba(255,255,255,0.42)'

JSX:
<div ref={containerRef} className="flex h-full w-full items-center justify-center" style={{background: isDark?'#110F0C':'#F5F1EA'}}>
  <div className="flex w-full max-w-[440px] flex-col items-center gap-4 px-4 sm:gap-6 sm:px-6">
    <div className="relative h-11 w-full overflow-visible rounded-full sm:h-14" style={{background:trackBg, boxShadow:trackShadow}}>

      {/* Centreline dashes */}
      <div className="pointer-events-none absolute top-1/2 -translate-y-px" style={{ left:18, right:18, height:2, backgroundImage: \`repeating-linear-gradient(to right, \${dashColor} 0, \${dashColor} 10px, transparent 10px, transparent 24px)\` }}/>

      {/* Red fill on top */}
      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: \`\${progress}%\`, background:'linear-gradient(to right, #6b0000, #be1c1c 50%, #e03030)', boxShadow:'inset 0 1px 3px rgba(255,255,255,0.1)' }}/>

      {/* Heat shimmer exhaust, only when taxiing & progress>30 */}
      {phase === 'taxiing' && progress > 30 && (
        <motion.div className="pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full" style={{ right: \`calc(\${100 - planePct}% + 26px)\`, width: Math.min(((progress-30)/70)*56, 56), height: 22, background:'radial-gradient(ellipse at right, rgba(255,140,20,0.3), transparent)', filter:'blur(8px)' }} animate={{opacity:[0.3,0.75,0.2,0.65,0.3]}} transition={{duration:0.2, repeat:Infinity}}/>
      )}

      <AnimatePresence>
        {phase !== 'resetting' && (
          <div key={\`plane-\${cycle}\`} className="pointer-events-none absolute top-1/2 z-20" style={{ left: \`\${planePct}%\`, transform:'translateX(-50%) translateY(-50%)' }}>
            {phase === 'taxiing'
              ? <Airplane isDark={isDark}/>
              : <motion.div initial={{opacity:1,x:0,scale:1}} animate={{opacity:0,x:120,scale:1.8}} transition={{duration:0.7,ease:'easeIn'}}><Airplane isDark={isDark}/></motion.div>
            }
          </div>
        )}
      </AnimatePresence>
    </div>

    <div className="flex flex-col items-center gap-1">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums sm:text-[28px]" style={{color: isDark?'#FAF7F2':'#1C1916'}}>{Math.round(progress)}</span>
        <span className="text-sm font-semibold sm:text-base" style={{color:'#9E9890'}}>%</span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-widest sm:text-[11px]" style={{color: isDark?'#736D65':'#9E9890'}}>
        {phase === 'takeoff' ? 'Taking off!' : phase === 'resetting' ? '...' : 'Preparing for takeoff'}
      </span>
    </div>
  </div>
</div>

## Typography
- Font: project default sans-serif
- Sizes: 10px, 11px, 14px, 16px, 24px, 28px
- Weights: 600, 700`,

  'Lovable': `Create a React client component named \`RunwayLoader\`: a playful progress indicator shaped like a runway. A top-down SVG airplane taxis left→right along a rounded horizontal track while a red fill grows behind it. When the plane nose touches the right wall it "takes off" (scales + slides off-screen + fades), the bar completes, then the whole thing resets and loops. Numeric % and label read out below. Supports light + dark themes.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types. Define the Airplane SVG as a plain inner function component in the same file (not an exported helper).

Imports: useEffect, useRef, useState from 'react'; motion, AnimatePresence from 'framer-motion'.

Airplane({isDark}): <svg className="w-[52px] sm:w-[72px] h-auto" viewBox="0 0 72 46" fill="none" style={{filter: isDark ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.75)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.35)) drop-shadow(0 1px 3px rgba(0,0,0,0.2))'}}>
Colors (dark vs light): bodyTop '#ececec'/'#c8c8c8', bodyMid '#ffffff'/'#dedede', bodyBot '#d0d0d0'/'#b4b4b4', wingLight '#f8f8f8'/'#d8d8d8', wingDark '#bababa'/'#909090', tail '#c8c8c8'/'#a8a8a8', nose '#f4f4f4'/'#d8d8d8'.
defs: linearGradient id="rl-body" x1=0 y1=0 x2=0 y2=1 stops 0% bodyTop, 40% bodyMid, 100% bodyBot. "rl-wing-t" x1=0 y1=1 x2=1 y2=0 stops wingLight→wingDark. "rl-wing-b" x1=0 y1=0 x2=1 y2=1 stops wingLight→wingDark.
Paths:
- Top wing: <path d="M44,21 L28,21 L8,2 L18,0 Z" fill="url(#rl-wing-t)"/>
- Bottom wing: <path d="M44,25 L28,25 L8,44 L18,46 Z" fill="url(#rl-wing-b)"/>
- Tail stabilisers: <path d="M8,21 L2,14 L6,14 L12,21 Z" fill={tail}/> and <path d="M8,25 L2,32 L6,32 L12,25 Z" fill={tail}/>
- Fuselage: <ellipse cx=34 cy=23 rx=29 ry=7 fill="url(#rl-body)"/>
- Nose: <path d="M61,19.5 C66,21.5 67.5,23 67,23 C67.5,23 66,24.5 61,26.5 L58,23 Z" fill={nose}/>
- Cockpit window: <ellipse cx=57 cy=23 rx=4 ry=3 fill="#7ec8e8" opacity="0.9"/>

Type Phase = 'taxiing' | 'takeoff' | 'resetting'.

State/refs in RunwayLoader:
- containerRef<HTMLDivElement>
- [isDark, setIsDark] default true
- [progress, setProgress] number starting 0
- [phase, setPhase]<Phase> default 'taxiing'
- [cycle, setCycle] number 0
- rafRef number 0, startRef undefined, aliveRef true, disappearedRef false
- const WALL_PCT = 91

Theme effect: same closest [data-card-theme] / html fallback pattern. MutationObserver on both, cleanup disconnect.

Animation effect (runs once):
- aliveRef.current=true; disappearedRef.current=false; TAXI_MS=5500.
- tick(ts): if !aliveRef return. if !startRef set startRef=ts. t=min((ts-startRef)/TAXI_MS, 1). eased = t<=0.75 ? (t/0.75)*82 : 82 + (1 - (1-(t-0.75)/0.25)^2)*18. p=min(eased,100). setProgress(p). If p>=WALL_PCT && !disappearedRef: disappearedRef=true; setPhase('takeoff'). If p<100 raf=requestAnimationFrame(tick); else setTimeout 600ms: setPhase('resetting'), setTimeout 400ms: disappearedRef=false, startRef=undefined, setProgress(0), setPhase('taxiing'), setCycle(c=>c+1), raf=requestAnimationFrame(tick).
- Initial: rafRef=requestAnimationFrame(tick). Cleanup: aliveRef=false; cancelAnimationFrame(rafRef).

planePct = min(progress, WALL_PCT).

Theme-responsive track styles:
- trackBg dark: 'linear-gradient(to bottom, #404040, #252525)'; light: 'linear-gradient(to bottom, #bab7b2, #a09d98)'
- trackShadow dark: 'inset 0 4px 12px rgba(0,0,0,0.85), inset 0 -1px 3px rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.5)'; light: 'inset 0 3px 8px rgba(0,0,0,0.22), inset 0 -1px 3px rgba(255,255,255,0.28), 0 2px 5px rgba(0,0,0,0.12)'
- dashColor dark 'rgba(255,255,255,0.22)' light 'rgba(255,255,255,0.42)'

JSX:
<div ref={containerRef} className="flex h-full w-full items-center justify-center" style={{background: isDark?'#110F0C':'#F5F1EA'}}>
  <div className="flex w-full max-w-[440px] flex-col items-center gap-4 px-4 sm:gap-6 sm:px-6">
    <div className="relative h-11 w-full overflow-visible rounded-full sm:h-14" style={{background:trackBg, boxShadow:trackShadow}}>

      {/* Centreline dashes */}
      <div className="pointer-events-none absolute top-1/2 -translate-y-px" style={{ left:18, right:18, height:2, backgroundImage: \`repeating-linear-gradient(to right, \${dashColor} 0, \${dashColor} 10px, transparent 10px, transparent 24px)\` }}/>

      {/* Red fill on top */}
      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: \`\${progress}%\`, background:'linear-gradient(to right, #6b0000, #be1c1c 50%, #e03030)', boxShadow:'inset 0 1px 3px rgba(255,255,255,0.1)' }}/>

      {/* Heat shimmer exhaust — only when taxiing & progress>30 */}
      {phase === 'taxiing' && progress > 30 && (
        <motion.div className="pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full" style={{ right: \`calc(\${100 - planePct}% + 26px)\`, width: Math.min(((progress-30)/70)*56, 56), height: 22, background:'radial-gradient(ellipse at right, rgba(255,140,20,0.3), transparent)', filter:'blur(8px)' }} animate={{opacity:[0.3,0.75,0.2,0.65,0.3]}} transition={{duration:0.2, repeat:Infinity}}/>
      )}

      <AnimatePresence>
        {phase !== 'resetting' && (
          <div key={\`plane-\${cycle}\`} className="pointer-events-none absolute top-1/2 z-20" style={{ left: \`\${planePct}%\`, transform:'translateX(-50%) translateY(-50%)' }}>
            {phase === 'taxiing'
              ? <Airplane isDark={isDark}/>
              : <motion.div initial={{opacity:1,x:0,scale:1}} animate={{opacity:0,x:120,scale:1.8}} transition={{duration:0.7,ease:'easeIn'}}><Airplane isDark={isDark}/></motion.div>
            }
          </div>
        )}
      </AnimatePresence>
    </div>

    <div className="flex flex-col items-center gap-1">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums sm:text-[28px]" style={{color: isDark?'#FAF7F2':'#1C1916'}}>{Math.round(progress)}</span>
        <span className="text-sm font-semibold sm:text-base" style={{color:'#9E9890'}}>%</span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-widest sm:text-[11px]" style={{color: isDark?'#736D65':'#9E9890'}}>
        {phase === 'takeoff' ? 'Taking off!' : phase === 'resetting' ? '—' : 'Preparing for takeoff'}
      </span>
    </div>
  </div>
</div>

## Typography
- Font: project default sans-serif
- Sizes: 10px, 11px, 14px, 16px, 24px, 28px
- Weights: 600, 700`,

  'V0': `Create a React client component named \`RunwayLoader\`: a playful progress indicator shaped like a runway. A top-down SVG airplane taxis left→right along a rounded horizontal track while a red fill grows behind it. When the plane nose touches the right wall it "takes off" (scales + slides off-screen + fades), the bar completes, then the whole thing resets and loops. Numeric % and label read out below. Supports light + dark themes.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types. Define the Airplane SVG as a plain inner function component in the same file (not an exported helper).

Imports: useEffect, useRef, useState from 'react'; motion, AnimatePresence from 'framer-motion'.

Airplane({isDark}): <svg className="w-[52px] sm:w-[72px] h-auto" viewBox="0 0 72 46" fill="none" style={{filter: isDark ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.75)) drop-shadow(0 2px 4px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.35)) drop-shadow(0 1px 3px rgba(0,0,0,0.2))'}}>
Colors (dark vs light): bodyTop '#ececec'/'#c8c8c8', bodyMid '#ffffff'/'#dedede', bodyBot '#d0d0d0'/'#b4b4b4', wingLight '#f8f8f8'/'#d8d8d8', wingDark '#bababa'/'#909090', tail '#c8c8c8'/'#a8a8a8', nose '#f4f4f4'/'#d8d8d8'.
defs: linearGradient id="rl-body" x1=0 y1=0 x2=0 y2=1 stops 0% bodyTop, 40% bodyMid, 100% bodyBot. "rl-wing-t" x1=0 y1=1 x2=1 y2=0 stops wingLight→wingDark. "rl-wing-b" x1=0 y1=0 x2=1 y2=1 stops wingLight→wingDark.
Paths:
- Top wing: <path d="M44,21 L28,21 L8,2 L18,0 Z" fill="url(#rl-wing-t)"/>
- Bottom wing: <path d="M44,25 L28,25 L8,44 L18,46 Z" fill="url(#rl-wing-b)"/>
- Tail stabilisers: <path d="M8,21 L2,14 L6,14 L12,21 Z" fill={tail}/> and <path d="M8,25 L2,32 L6,32 L12,25 Z" fill={tail}/>
- Fuselage: <ellipse cx=34 cy=23 rx=29 ry=7 fill="url(#rl-body)"/>
- Nose: <path d="M61,19.5 C66,21.5 67.5,23 67,23 C67.5,23 66,24.5 61,26.5 L58,23 Z" fill={nose}/>
- Cockpit window: <ellipse cx=57 cy=23 rx=4 ry=3 fill="#7ec8e8" opacity="0.9"/>

Type Phase = 'taxiing' | 'takeoff' | 'resetting'.

State/refs in RunwayLoader:
- containerRef<HTMLDivElement>
- [isDark, setIsDark] default true
- [progress, setProgress] number starting 0
- [phase, setPhase]<Phase> default 'taxiing'
- [cycle, setCycle] number 0
- rafRef number 0, startRef undefined, aliveRef true, disappearedRef false
- const WALL_PCT = 91

Theme effect: same closest [data-card-theme] / html fallback pattern. MutationObserver on both, cleanup disconnect.

Animation effect (runs once):
- aliveRef.current=true; disappearedRef.current=false; TAXI_MS=5500.
- tick(ts): if !aliveRef return. if !startRef set startRef=ts. t=min((ts-startRef)/TAXI_MS, 1). eased = t<=0.75 ? (t/0.75)*82 : 82 + (1 - (1-(t-0.75)/0.25)^2)*18. p=min(eased,100). setProgress(p). If p>=WALL_PCT && !disappearedRef: disappearedRef=true; setPhase('takeoff'). If p<100 raf=requestAnimationFrame(tick); else setTimeout 600ms: setPhase('resetting'), setTimeout 400ms: disappearedRef=false, startRef=undefined, setProgress(0), setPhase('taxiing'), setCycle(c=>c+1), raf=requestAnimationFrame(tick).
- Initial: rafRef=requestAnimationFrame(tick). Cleanup: aliveRef=false; cancelAnimationFrame(rafRef).

planePct = min(progress, WALL_PCT).

Theme-responsive track styles:
- trackBg dark: 'linear-gradient(to bottom, #404040, #252525)'; light: 'linear-gradient(to bottom, #bab7b2, #a09d98)'
- trackShadow dark: 'inset 0 4px 12px rgba(0,0,0,0.85), inset 0 -1px 3px rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.5)'; light: 'inset 0 3px 8px rgba(0,0,0,0.22), inset 0 -1px 3px rgba(255,255,255,0.28), 0 2px 5px rgba(0,0,0,0.12)'
- dashColor dark 'rgba(255,255,255,0.22)' light 'rgba(255,255,255,0.42)'

JSX:
<div ref={containerRef} className="flex h-full w-full items-center justify-center" style={{background: isDark?'#110F0C':'#F5F1EA'}}>
  <div className="flex w-full max-w-[440px] flex-col items-center gap-4 px-4 sm:gap-6 sm:px-6">
    <div className="relative h-11 w-full overflow-visible rounded-full sm:h-14" style={{background:trackBg, boxShadow:trackShadow}}>

      {/* Centreline dashes */}
      <div className="pointer-events-none absolute top-1/2 -translate-y-px" style={{ left:18, right:18, height:2, backgroundImage: \`repeating-linear-gradient(to right, \${dashColor} 0, \${dashColor} 10px, transparent 10px, transparent 24px)\` }}/>

      {/* Red fill on top */}
      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: \`\${progress}%\`, background:'linear-gradient(to right, #6b0000, #be1c1c 50%, #e03030)', boxShadow:'inset 0 1px 3px rgba(255,255,255,0.1)' }}/>

      {/* Heat shimmer exhaust — only when taxiing & progress>30 */}
      {phase === 'taxiing' && progress > 30 && (
        <motion.div className="pointer-events-none absolute top-1/2 -translate-y-1/2 rounded-full" style={{ right: \`calc(\${100 - planePct}% + 26px)\`, width: Math.min(((progress-30)/70)*56, 56), height: 22, background:'radial-gradient(ellipse at right, rgba(255,140,20,0.3), transparent)', filter:'blur(8px)' }} animate={{opacity:[0.3,0.75,0.2,0.65,0.3]}} transition={{duration:0.2, repeat:Infinity}}/>
      )}

      <AnimatePresence>
        {phase !== 'resetting' && (
          <div key={\`plane-\${cycle}\`} className="pointer-events-none absolute top-1/2 z-20" style={{ left: \`\${planePct}%\`, transform:'translateX(-50%) translateY(-50%)' }}>
            {phase === 'taxiing'
              ? <Airplane isDark={isDark}/>
              : <motion.div initial={{opacity:1,x:0,scale:1}} animate={{opacity:0,x:120,scale:1.8}} transition={{duration:0.7,ease:'easeIn'}}><Airplane isDark={isDark}/></motion.div>
            }
          </div>
        )}
      </AnimatePresence>
    </div>

    <div className="flex flex-col items-center gap-1">
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums sm:text-[28px]" style={{color: isDark?'#FAF7F2':'#1C1916'}}>{Math.round(progress)}</span>
        <span className="text-sm font-semibold sm:text-base" style={{color:'#9E9890'}}>%</span>
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-widest sm:text-[11px]" style={{color: isDark?'#736D65':'#9E9890'}}>
        {phase === 'takeoff' ? 'Taking off!' : phase === 'resetting' ? '—' : 'Preparing for takeoff'}
      </span>
    </div>
  </div>
</div>

## Typography
- Font: project default sans-serif
- Sizes: 10px, 11px, 14px, 16px, 24px, 28px
- Weights: 600, 700`,
}
