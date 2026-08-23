import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Root element: className="relative flex min-h-screen w-full select-none items-center justify-center overflow-hidden"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named \`NeonClock\`: a cyan 7-segment LCD-style clock rendered in SVG. Shows HH:MM:SS with a steady colon between HH/MM and a blinking colon between MM/SS (half-size). AM/PM indicator stacks above the seconds. Day-of-week row and long-form date beneath. Subtle LCD pixel grid overlay. Always dark, background #060a0a.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Imports: useState, useEffect from 'react'. No framer-motion.

Colors:
CYAN='#55E8E2', CYAN_OFF='rgba(85,232,226,0.055)', CYAN_IDLE='rgba(85,232,226,0.28)', CYAN_DIM='rgba(85,232,226,0.65)', BG='#060a0a'.
GLOW_SVG = \`drop-shadow(0 0 3px #55E8E2) drop-shadow(0 0 8px #55E8E299)\`
GLOW_TXT = \`0 0 5px #55E8E2, 0 0 11px #55E8E288\`

7-segment geometry (viewBox 42x80): VW=42, VH=80, T=6 (thickness), BV=3 (bevel), GP=2 (gap).
- hPts(y): returns "\${GP},\${y+T/2} \${GP+BV},\${y} \${VW-GP-BV},\${y} \${VW-GP},\${y+T/2} \${VW-GP-BV},\${y+T} \${GP+BV},\${y+T}"
- vPts(x,y1,y2): cx=x+T/2 → "\${cx},\${y1} \${x+T},\${y1+BV} \${x+T},\${y2-BV} \${cx},\${y2} \${x},\${y2-BV} \${x},\${y1+BV}"

Positions: aY=GP=2, gY=VH/2-T/2=37, dY=VH-GP-T=72. lX=GP=2, rX=VW-GP-T=34.
Verticals span full height: aEnd=aY, gTop=gY-GP, gEnd=gY+T+GP, dTop=dY+T.

SHAPES array in order a,b,c,d,e,f,g:
[hPts(aY), vPts(rX,aEnd,gTop), vPts(rX,gEnd,dTop), hPts(dY), vPts(lX,gEnd,dTop), vPts(lX,aEnd,gTop), hPts(gY)]

SEG map (Record<string,boolean[]>) for '0'..'9', a standard 7-seg lookup [a,b,c,d,e,f,g]:
'0':[1,1,1,1,1,1,0] '1':[0,1,1,0,0,0,0] '2':[1,1,0,1,1,0,1] '3':[1,1,1,1,0,0,1] '4':[0,1,1,0,0,1,1] '5':[1,0,1,1,0,1,1] '6':[1,0,1,1,1,1,1] '7':[1,1,1,0,0,0,0] '8':[1,1,1,1,1,1,1] '9':[1,1,1,1,0,1,1]

Digit({char,size}): svg viewBox 0 0 42 80, width=size, height=round(size*80/42), style display:block overflow:visible flexShrink:0. For each SHAPES poly: fill CYAN if seg on else CYAN_OFF; if on add style filter:GLOW_SVG.

ColonDots({dim,size}): svg viewBox 0 0 \${42*0.44} 80, width=round(size*0.44), height=round(size*80/42). Two circles at cx=42*0.22, cy=80*0.30 and 80*0.68, r=42*0.125, fill CYAN_OFF when dim else CYAN with glow filter.

Helpers: pad2(n)=String(n).padStart(2,'0'). DAYS=['SUN','MON','TUE','WED','THU','FRI','SAT'].
getNow(): new Date(); h=hours; return { h:pad2(h%12||12), m:pad2(minutes), s:pad2(seconds), isPM:h>=12, dow:getDay(), date: toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase() }.

Size constants: BIG=50, SML=24, GAP=3, COLON_BIG=round(50*0.44)=22, COLON_SML=round(24*0.44)=11. TIME_W = 4*BIG + COLON_BIG + COLON_SML + 2*SML + 7*GAP = 302.

State: now=useState(getNow), colonOn=useState(true). useEffect setInterval 1000ms: setNow(getNow()); setColonOn(c=>!c). Cleanup clearInterval.

Layout: root div relative flex h-full w-full select-none items-center justify-center overflow-hidden, background BG, fontFamily '"Courier New", Courier, monospace'. Inside: a left-anchored flex-column (alignItems flex-start) wrapper, centered as a whole.
- Time row: flex alignItems flex-end gap 3, holding Digit h[0], Digit h[1], ColonDots dim=false size=BIG, Digit m[0], Digit m[1], ColonDots dim={!colonOn} size=SML, then stacked column (alignItems flex-end) containing:
  - AM/PM row: flex gap 6 fontSize 13 letterSpacing 0.08em marginBottom 3. Two spans "AM" and "PM". Active one uses color CYAN + textShadow GLOW_TXT; inactive uses CYAN_IDLE, textShadow none.
  - Seconds row: flex gap 3, Digit s[0] size SML, Digit s[1] size SML.
- Days row: flex justifyContent space-between width TIME_W marginTop 13 fontSize 13 letterSpacing 0.05em. Map DAYS, color CYAN + GLOW_TXT when i===dow else CYAN_IDLE.
- Date row: div width TIME_W marginTop 5 textAlign center fontSize 13 letterSpacing 0.1em color CYAN_DIM. Render {now.date}.

LCD pixel-grid overlay: absolute inset-0 pointer-events-none. backgroundImage 'radial-gradient(circle, rgba(0,0,0,0.48) 1.3px, transparent 1.3px)', backgroundSize '3.8px 3.8px'.

## Typography
- Font: "Courier New", Courier, monospace
- Sizes: 13px`,

  'Lovable': `Create a React client component named \`NeonClock\`: a cyan 7-segment LCD-style clock rendered in SVG. Shows HH:MM:SS with a steady colon between HH/MM and a blinking colon between MM/SS (half-size). AM/PM indicator stacks above the seconds. Day-of-week row and long-form date beneath. Subtle LCD pixel grid overlay. Always dark — background #060a0a.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Imports: useState, useEffect from 'react'. No framer-motion.

Colors:
CYAN='#55E8E2', CYAN_OFF='rgba(85,232,226,0.055)', CYAN_IDLE='rgba(85,232,226,0.28)', CYAN_DIM='rgba(85,232,226,0.65)', BG='#060a0a'.
GLOW_SVG = \`drop-shadow(0 0 3px #55E8E2) drop-shadow(0 0 8px #55E8E299)\`
GLOW_TXT = \`0 0 5px #55E8E2, 0 0 11px #55E8E288\`

7-segment geometry (viewBox 42x80): VW=42, VH=80, T=6 (thickness), BV=3 (bevel), GP=2 (gap).
- hPts(y): returns "\${GP},\${y+T/2} \${GP+BV},\${y} \${VW-GP-BV},\${y} \${VW-GP},\${y+T/2} \${VW-GP-BV},\${y+T} \${GP+BV},\${y+T}"
- vPts(x,y1,y2): cx=x+T/2 → "\${cx},\${y1} \${x+T},\${y1+BV} \${x+T},\${y2-BV} \${cx},\${y2} \${x},\${y2-BV} \${x},\${y1+BV}"

Positions: aY=GP=2, gY=VH/2-T/2=37, dY=VH-GP-T=72. lX=GP=2, rX=VW-GP-T=34.
Verticals span full height: aEnd=aY, gTop=gY-GP, gEnd=gY+T+GP, dTop=dY+T.

SHAPES array in order a,b,c,d,e,f,g:
[hPts(aY), vPts(rX,aEnd,gTop), vPts(rX,gEnd,dTop), hPts(dY), vPts(lX,gEnd,dTop), vPts(lX,aEnd,gTop), hPts(gY)]

SEG map (Record<string,boolean[]>) for '0'..'9' — standard 7-seg lookup [a,b,c,d,e,f,g]:
'0':[1,1,1,1,1,1,0] '1':[0,1,1,0,0,0,0] '2':[1,1,0,1,1,0,1] '3':[1,1,1,1,0,0,1] '4':[0,1,1,0,0,1,1] '5':[1,0,1,1,0,1,1] '6':[1,0,1,1,1,1,1] '7':[1,1,1,0,0,0,0] '8':[1,1,1,1,1,1,1] '9':[1,1,1,1,0,1,1]

Digit({char,size}): svg viewBox 0 0 42 80, width=size, height=round(size*80/42), style display:block overflow:visible flexShrink:0. For each SHAPES poly: fill CYAN if seg on else CYAN_OFF; if on add style filter:GLOW_SVG.

ColonDots({dim,size}): svg viewBox 0 0 \${42*0.44} 80, width=round(size*0.44), height=round(size*80/42). Two circles at cx=42*0.22, cy=80*0.30 and 80*0.68, r=42*0.125, fill CYAN_OFF when dim else CYAN with glow filter.

Helpers: pad2(n)=String(n).padStart(2,'0'). DAYS=['SUN','MON','TUE','WED','THU','FRI','SAT'].
getNow(): new Date(); h=hours; return { h:pad2(h%12||12), m:pad2(minutes), s:pad2(seconds), isPM:h>=12, dow:getDay(), date: toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase() }.

Size constants: BIG=50, SML=24, GAP=3, COLON_BIG=round(50*0.44)=22, COLON_SML=round(24*0.44)=11. TIME_W = 4*BIG + COLON_BIG + COLON_SML + 2*SML + 7*GAP = 302.

State: now=useState(getNow), colonOn=useState(true). useEffect setInterval 1000ms: setNow(getNow()); setColonOn(c=>!c). Cleanup clearInterval.

Layout: root div relative flex h-full w-full select-none items-center justify-center overflow-hidden, background BG, fontFamily '"Courier New", Courier, monospace'. Inside: a left-anchored flex-column (alignItems flex-start) wrapper — centered as a whole.
- Time row: flex alignItems flex-end gap 3 — Digit h[0], Digit h[1], ColonDots dim=false size=BIG, Digit m[0], Digit m[1], ColonDots dim={!colonOn} size=SML, then stacked column (alignItems flex-end) containing:
  - AM/PM row: flex gap 6 fontSize 13 letterSpacing 0.08em marginBottom 3. Two spans "AM" and "PM". Active one uses color CYAN + textShadow GLOW_TXT; inactive uses CYAN_IDLE, textShadow none.
  - Seconds row: flex gap 3, Digit s[0] size SML, Digit s[1] size SML.
- Days row: flex justifyContent space-between width TIME_W marginTop 13 fontSize 13 letterSpacing 0.05em. Map DAYS, color CYAN + GLOW_TXT when i===dow else CYAN_IDLE.
- Date row: div width TIME_W marginTop 5 textAlign center fontSize 13 letterSpacing 0.1em color CYAN_DIM. Render {now.date}.

LCD pixel-grid overlay: absolute inset-0 pointer-events-none. backgroundImage 'radial-gradient(circle, rgba(0,0,0,0.48) 1.3px, transparent 1.3px)', backgroundSize '3.8px 3.8px'.

## Typography
- Font: "Courier New", Courier, monospace
- Sizes: 13px`,

  'V0': `Create a React client component named \`NeonClock\`: a cyan 7-segment LCD-style clock rendered in SVG. Shows HH:MM:SS with a steady colon between HH/MM and a blinking colon between MM/SS (half-size). AM/PM indicator stacks above the seconds. Day-of-week row and long-form date beneath. Subtle LCD pixel grid overlay. Always dark — background #060a0a.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Imports: useState, useEffect from 'react'. No framer-motion.

Colors:
CYAN='#55E8E2', CYAN_OFF='rgba(85,232,226,0.055)', CYAN_IDLE='rgba(85,232,226,0.28)', CYAN_DIM='rgba(85,232,226,0.65)', BG='#060a0a'.
GLOW_SVG = \`drop-shadow(0 0 3px #55E8E2) drop-shadow(0 0 8px #55E8E299)\`
GLOW_TXT = \`0 0 5px #55E8E2, 0 0 11px #55E8E288\`

7-segment geometry (viewBox 42x80): VW=42, VH=80, T=6 (thickness), BV=3 (bevel), GP=2 (gap).
- hPts(y): returns "\${GP},\${y+T/2} \${GP+BV},\${y} \${VW-GP-BV},\${y} \${VW-GP},\${y+T/2} \${VW-GP-BV},\${y+T} \${GP+BV},\${y+T}"
- vPts(x,y1,y2): cx=x+T/2 → "\${cx},\${y1} \${x+T},\${y1+BV} \${x+T},\${y2-BV} \${cx},\${y2} \${x},\${y2-BV} \${x},\${y1+BV}"

Positions: aY=GP=2, gY=VH/2-T/2=37, dY=VH-GP-T=72. lX=GP=2, rX=VW-GP-T=34.
Verticals span full height: aEnd=aY, gTop=gY-GP, gEnd=gY+T+GP, dTop=dY+T.

SHAPES array in order a,b,c,d,e,f,g:
[hPts(aY), vPts(rX,aEnd,gTop), vPts(rX,gEnd,dTop), hPts(dY), vPts(lX,gEnd,dTop), vPts(lX,aEnd,gTop), hPts(gY)]

SEG map (Record<string,boolean[]>) for '0'..'9' — standard 7-seg lookup [a,b,c,d,e,f,g]:
'0':[1,1,1,1,1,1,0] '1':[0,1,1,0,0,0,0] '2':[1,1,0,1,1,0,1] '3':[1,1,1,1,0,0,1] '4':[0,1,1,0,0,1,1] '5':[1,0,1,1,0,1,1] '6':[1,0,1,1,1,1,1] '7':[1,1,1,0,0,0,0] '8':[1,1,1,1,1,1,1] '9':[1,1,1,1,0,1,1]

Digit({char,size}): svg viewBox 0 0 42 80, width=size, height=round(size*80/42), style display:block overflow:visible flexShrink:0. For each SHAPES poly: fill CYAN if seg on else CYAN_OFF; if on add style filter:GLOW_SVG.

ColonDots({dim,size}): svg viewBox 0 0 \${42*0.44} 80, width=round(size*0.44), height=round(size*80/42). Two circles at cx=42*0.22, cy=80*0.30 and 80*0.68, r=42*0.125, fill CYAN_OFF when dim else CYAN with glow filter.

Helpers: pad2(n)=String(n).padStart(2,'0'). DAYS=['SUN','MON','TUE','WED','THU','FRI','SAT'].
getNow(): new Date(); h=hours; return { h:pad2(h%12||12), m:pad2(minutes), s:pad2(seconds), isPM:h>=12, dow:getDay(), date: toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}).toUpperCase() }.

Size constants: BIG=50, SML=24, GAP=3, COLON_BIG=round(50*0.44)=22, COLON_SML=round(24*0.44)=11. TIME_W = 4*BIG + COLON_BIG + COLON_SML + 2*SML + 7*GAP = 302.

State: now=useState(getNow), colonOn=useState(true). useEffect setInterval 1000ms: setNow(getNow()); setColonOn(c=>!c). Cleanup clearInterval.

Layout: root div relative flex h-full w-full select-none items-center justify-center overflow-hidden, background BG, fontFamily '"Courier New", Courier, monospace'. Inside: a left-anchored flex-column (alignItems flex-start) wrapper — centered as a whole.
- Time row: flex alignItems flex-end gap 3 — Digit h[0], Digit h[1], ColonDots dim=false size=BIG, Digit m[0], Digit m[1], ColonDots dim={!colonOn} size=SML, then stacked column (alignItems flex-end) containing:
  - AM/PM row: flex gap 6 fontSize 13 letterSpacing 0.08em marginBottom 3. Two spans "AM" and "PM". Active one uses color CYAN + textShadow GLOW_TXT; inactive uses CYAN_IDLE, textShadow none.
  - Seconds row: flex gap 3, Digit s[0] size SML, Digit s[1] size SML.
- Days row: flex justifyContent space-between width TIME_W marginTop 13 fontSize 13 letterSpacing 0.05em. Map DAYS, color CYAN + GLOW_TXT when i===dow else CYAN_IDLE.
- Date row: div width TIME_W marginTop 5 textAlign center fontSize 13 letterSpacing 0.1em color CYAN_DIM. Render {now.date}.

LCD pixel-grid overlay: absolute inset-0 pointer-events-none. backgroundImage 'radial-gradient(circle, rgba(0,0,0,0.48) 1.3px, transparent 1.3px)', backgroundSize '3.8px 3.8px'.

## Typography
- Font: "Courier New", Courier, monospace
- Sizes: 13px`,
}
