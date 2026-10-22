import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion geist

Root element: className="relative flex min-h-screen w-full cursor-default items-center justify-center"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named \`ScrambleText\`. 'use client' at the top. TypeScript strict, no \`any\`. Extract a \`useScramble\` hook and a \`Crosshair\` component. Do not inline everything.

## Font
// npm install framer-motion geist
import { GeistPixelGrid } from 'geist/font/pixel'

## Constants
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!'
const WORDS = ['DECRYPT', 'ACCESS']

## Types and helpers
interface CharState { display: string; resolved: boolean }
function randomChar(): string. Picks a random char from CHARSET, fallback 'X'
const makeScrambled = (word: string): CharState[]. Maps each char to { display: randomChar(), resolved: false }

## useScramble(word: string, isHovered: boolean): CharState[]
- State: chars initialized with makeScrambled(word)
- Effect on [isHovered, word]:
  - Declare cancelled, timeouts array, scrambleInterval
  - startScrambleInterval(resolvedSet: Set<number>): clears old interval, starts new one at 60ms, and on each tick replaces unresolved chars with randomChar()
  - if isHovered: startScrambleInterval with empty resolvedSet; then forEach char of word, schedule a timeout at 80 + i*100ms that adds i to resolvedSet, sets that char to { display: letter, resolved: true }, and stops the interval once all chars are resolved
  - else: reset chars to makeScrambled(word), startScrambleInterval with empty Set
  - cleanup: cancelled=true, clear all timeouts, clear interval
- Returns chars

## Crosshair({ style: React.CSSProperties })
- pointer-events-none absolute div, dimensions: arm*2 + gap*2 square
- arm=14, gap=3, thick=1, color='rgba(190,207,93,0.35)'
- SVG with 4 arms (top, bottom, left, right) and a center circle r=1.5
- Arms start at gap distance from center: e.g. top arm goes from (arm+gap, 0) to (arm+gap, arm)
- Center at (arm+gap, arm+gap) = (17, 17)

## ScrambleText component
- State: isHovered
- chars0 = useScramble(WORDS[0]!, isHovered); chars1 = useScramble(WORDS[1]!, isHovered); rows = [chars0, chars1]
- const charStyle: React.CSSProperties = { color: '#BECF5D', fontSize: 'clamp(1.75rem, 9vw, 3.75rem)' }. The clamp shrinks the letters on a narrow screen; a fixed text-6xl overflows a 320px viewport.
- Root: relative flex h-full w-full cursor-default items-center justify-center, style={{ background: '#292929' }}
- Crosshair at top-right: style={{ top:'10%', right:'8%' }}
- Crosshair at bottom-left: style={{ bottom:'10%', left:'8%' }}
- Inner flex-col div: select-none, items-center, gap-4, padding 'clamp(1.5rem, 8vw, 60px) clamp(1rem, 10vw, 80px)', pointer handlers:
  - onPointerEnter sets isHovered true and onPointerLeave sets it false, both only when e.pointerType === 'mouse'. Plain mouse enter/leave is wrong here: on touch, the emulated mouseenter after a tap left the words stuck revealed.
  - onPointerDown sets isHovered true, onPointerUp and onPointerCancel set it false, all only when e.pointerType !== 'mouse'. Touch has no hover, so on touch the words reveal only while pressed.
- Rows: for each rowIdx, a flex flex-wrap items-center justify-center gap-1 div using GeistPixelGrid.className (flex-wrap lets a row that still does not fit break onto a second line, centred, instead of overflowing):
  - If rowIdx===0: prepend <span className="leading-none tracking-widest" style={charStyle}>/</span>
  - Each char: <span key={i} className="leading-none tracking-widest" style={charStyle}>{ch.display}</span>
  - If rowIdx===rows.length-1: append <span className="leading-none tracking-widest" style={charStyle}>_</span>
- Hint <motion.p>: mt-2 text-xs font-medium uppercase tracking-[0.2em] GeistPixelGrid.className, style={{ color:'rgba(190,207,93,0.45)' }}, initial {{opacity:0,y:8}} animate {{opacity:1,y:0}} transition {{duration:0.3,ease:'easeOut',delay:0.8}}, text "hover to decrypt"

## Visual spec
- Background: always #292929 (never theme-dependent)
- All text/symbols: #BECF5D (olive)
- Hint opacity: 45% (rgba(190,207,93,0.45))
- Crosshair opacity: 35% (rgba(190,207,93,0.35))
- Font size: charStyle's clamp(1.75rem, 9vw, 3.75rem), 28px up to 60px, for all word characters and prefix/suffix symbols
- No Phosphor icons, no light/dark variants

## Typography
- Font: GeistPixelGrid
- Sizes: 12px (hint), clamp(1.75rem, 9vw, 3.75rem) for the letters, 28px up to a 60px maximum
- Weights: 500`,

  'Lovable': `Create a React client component named \`ScrambleText\`. 'use client' at the top. TypeScript strict, no \`any\`. Extract a \`useScramble\` hook and a \`Crosshair\` component — do not inline everything.

## Font
// npm install framer-motion geist
import { GeistPixelGrid } from 'geist/font/pixel'

## Constants
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!'
const WORDS = ['DECRYPT', 'ACCESS']

## Types and helpers
interface CharState { display: string; resolved: boolean }
function randomChar(): string — picks a random char from CHARSET, fallback 'X'
const makeScrambled = (word: string): CharState[] — maps each char to { display: randomChar(), resolved: false }

## useScramble(word: string, isHovered: boolean): CharState[]
- State: chars initialized with makeScrambled(word)
- Effect on [isHovered, word]:
  - Declare cancelled, timeouts array, scrambleInterval
  - startScrambleInterval(resolvedSet: Set<number>): clears old interval, starts new one at 60ms — on each tick, replaces unresolved chars with randomChar()
  - if isHovered: startScrambleInterval with empty resolvedSet; then forEach char of word, schedule a timeout at 80 + i*100ms that adds i to resolvedSet, sets that char to { display: letter, resolved: true }, and stops the interval once all chars are resolved
  - else: reset chars to makeScrambled(word), startScrambleInterval with empty Set
  - cleanup: cancelled=true, clear all timeouts, clear interval
- Returns chars

## Crosshair({ style: React.CSSProperties })
- pointer-events-none absolute div, dimensions: arm*2 + gap*2 square
- arm=14, gap=3, thick=1, color='rgba(190,207,93,0.35)'
- SVG with 4 arms (top, bottom, left, right) and a center circle r=1.5
- Arms start at gap distance from center: e.g. top arm goes from (arm+gap, 0) to (arm+gap, arm)
- Center at (arm+gap, arm+gap) = (17, 17)

## ScrambleText component
- State: isHovered
- chars0 = useScramble(WORDS[0]!, isHovered); chars1 = useScramble(WORDS[1]!, isHovered); rows = [chars0, chars1]
- const charStyle: React.CSSProperties = { color: '#BECF5D', fontSize: 'clamp(1.75rem, 9vw, 3.75rem)' }. The clamp shrinks the letters on a narrow screen; a fixed text-6xl overflows a 320px viewport.
- Root: relative flex h-full w-full cursor-default items-center justify-center, style={{ background: '#292929' }}
- Crosshair at top-right: style={{ top:'10%', right:'8%' }}
- Crosshair at bottom-left: style={{ bottom:'10%', left:'8%' }}
- Inner flex-col div: select-none, items-center, gap-4, padding 'clamp(1.5rem, 8vw, 60px) clamp(1rem, 10vw, 80px)', pointer handlers:
  - onPointerEnter sets isHovered true and onPointerLeave sets it false, both only when e.pointerType === 'mouse'. Plain mouse enter/leave is wrong here: on touch, the emulated mouseenter after a tap left the words stuck revealed.
  - onPointerDown sets isHovered true, onPointerUp and onPointerCancel set it false, all only when e.pointerType !== 'mouse'. Touch has no hover, so on touch the words reveal only while pressed.
- Rows: for each rowIdx, a flex flex-wrap items-center justify-center gap-1 div using GeistPixelGrid.className (flex-wrap lets a row that still does not fit break onto a second line, centred, instead of overflowing):
  - If rowIdx===0: prepend <span className="leading-none tracking-widest" style={charStyle}>/</span>
  - Each char: <span key={i} className="leading-none tracking-widest" style={charStyle}>{ch.display}</span>
  - If rowIdx===rows.length-1: append <span className="leading-none tracking-widest" style={charStyle}>_</span>
- Hint <motion.p>: mt-2 text-xs font-medium uppercase tracking-[0.2em] GeistPixelGrid.className, style={{ color:'rgba(190,207,93,0.45)' }}, initial {{opacity:0,y:8}} animate {{opacity:1,y:0}} transition {{duration:0.3,ease:'easeOut',delay:0.8}}, text "hover to decrypt"

## Visual spec
- Background: always #292929 (never theme-dependent)
- All text/symbols: #BECF5D (olive)
- Hint opacity: 45% (rgba(190,207,93,0.45))
- Crosshair opacity: 35% (rgba(190,207,93,0.35))
- Font size: charStyle's clamp(1.75rem, 9vw, 3.75rem), 28px up to 60px, for all word characters and prefix/suffix symbols
- No Phosphor icons, no light/dark variants

## Typography
- Font: GeistPixelGrid
- Sizes: 12px (hint), clamp(1.75rem, 9vw, 3.75rem) for the letters, 28px up to a 60px maximum
- Weights: 500`,

  'V0': `Create a React client component named \`ScrambleText\`. 'use client' at the top. TypeScript strict, no \`any\`. Extract a \`useScramble\` hook and a \`Crosshair\` component — do not inline everything.

## Font
// npm install framer-motion geist
import { GeistPixelGrid } from 'geist/font/pixel'

## Constants
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!'
const WORDS = ['DECRYPT', 'ACCESS']

## Types and helpers
interface CharState { display: string; resolved: boolean }
function randomChar(): string — picks a random char from CHARSET, fallback 'X'
const makeScrambled = (word: string): CharState[] — maps each char to { display: randomChar(), resolved: false }

## useScramble(word: string, isHovered: boolean): CharState[]
- State: chars initialized with makeScrambled(word)
- Effect on [isHovered, word]:
  - Declare cancelled, timeouts array, scrambleInterval
  - startScrambleInterval(resolvedSet: Set<number>): clears old interval, starts new one at 60ms — on each tick, replaces unresolved chars with randomChar()
  - if isHovered: startScrambleInterval with empty resolvedSet; then forEach char of word, schedule a timeout at 80 + i*100ms that adds i to resolvedSet, sets that char to { display: letter, resolved: true }, and stops the interval once all chars are resolved
  - else: reset chars to makeScrambled(word), startScrambleInterval with empty Set
  - cleanup: cancelled=true, clear all timeouts, clear interval
- Returns chars

## Crosshair({ style: React.CSSProperties })
- pointer-events-none absolute div, dimensions: arm*2 + gap*2 square
- arm=14, gap=3, thick=1, color='rgba(190,207,93,0.35)'
- SVG with 4 arms (top, bottom, left, right) and a center circle r=1.5
- Arms start at gap distance from center: e.g. top arm goes from (arm+gap, 0) to (arm+gap, arm)
- Center at (arm+gap, arm+gap) = (17, 17)

## ScrambleText component
- State: isHovered
- chars0 = useScramble(WORDS[0]!, isHovered); chars1 = useScramble(WORDS[1]!, isHovered); rows = [chars0, chars1]
- const charStyle: React.CSSProperties = { color: '#BECF5D', fontSize: 'clamp(1.75rem, 9vw, 3.75rem)' }. The clamp shrinks the letters on a narrow screen; a fixed text-6xl overflows a 320px viewport.
- Root: relative flex h-full w-full cursor-default items-center justify-center, style={{ background: '#292929' }}
- Crosshair at top-right: style={{ top:'10%', right:'8%' }}
- Crosshair at bottom-left: style={{ bottom:'10%', left:'8%' }}
- Inner flex-col div: select-none, items-center, gap-4, padding 'clamp(1.5rem, 8vw, 60px) clamp(1rem, 10vw, 80px)', pointer handlers:
  - onPointerEnter sets isHovered true and onPointerLeave sets it false, both only when e.pointerType === 'mouse'. Plain mouse enter/leave is wrong here: on touch, the emulated mouseenter after a tap left the words stuck revealed.
  - onPointerDown sets isHovered true, onPointerUp and onPointerCancel set it false, all only when e.pointerType !== 'mouse'. Touch has no hover, so on touch the words reveal only while pressed.
- Rows: for each rowIdx, a flex flex-wrap items-center justify-center gap-1 div using GeistPixelGrid.className (flex-wrap lets a row that still does not fit break onto a second line, centred, instead of overflowing):
  - If rowIdx===0: prepend <span className="leading-none tracking-widest" style={charStyle}>/</span>
  - Each char: <span key={i} className="leading-none tracking-widest" style={charStyle}>{ch.display}</span>
  - If rowIdx===rows.length-1: append <span className="leading-none tracking-widest" style={charStyle}>_</span>
- Hint <motion.p>: mt-2 text-xs font-medium uppercase tracking-[0.2em] GeistPixelGrid.className, style={{ color:'rgba(190,207,93,0.45)' }}, initial {{opacity:0,y:8}} animate {{opacity:1,y:0}} transition {{duration:0.3,ease:'easeOut',delay:0.8}}, text "hover to decrypt"

## Visual spec
- Background: always #292929 (never theme-dependent)
- All text/symbols: #BECF5D (olive)
- Hint opacity: 45% (rgba(190,207,93,0.45))
- Crosshair opacity: 35% (rgba(190,207,93,0.35))
- Font size: charStyle's clamp(1.75rem, 9vw, 3.75rem), 28px up to 60px, for all word characters and prefix/suffix symbols
- No Phosphor icons, no light/dark variants

## Typography
- Font: GeistPixelGrid
- Sizes: 12px (hint), clamp(1.75rem, 9vw, 3.75rem) for the letters, 28px up to a 60px maximum
- Weights: 500`,
}
