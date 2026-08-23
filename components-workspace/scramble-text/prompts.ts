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
import localFont from 'next/font/local'
const GeistPixelGrid = localFont({ src: '../../node_modules/geist/dist/fonts/geist-pixel/GeistPixel-Grid.woff2' })

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
- Root: relative flex h-full w-full cursor-default items-center justify-center, style={{ background: '#292929' }}
- Crosshair at top-right: style={{ top:'10%', right:'8%' }}
- Crosshair at bottom-left: style={{ bottom:'10%', left:'8%' }}
- Inner flex-col div: select-none, items-center, gap-4, padding '60px 80px', mouse enter/leave handlers
- Rows: for each rowIdx, a flex items-center gap-1 div using GeistPixelGrid.className:
  - If rowIdx===0: prepend <span className="text-6xl leading-none tracking-widest" style={{ color: '#BECF5D' }}>/</span>
  - Each char: <span key={i} className="text-6xl leading-none tracking-widest" style={{ color: '#BECF5D' }}>{ch.display}</span>
  - If rowIdx===rows.length-1: append <span className="text-6xl leading-none tracking-widest" style={{ color: '#BECF5D' }}>_</span>
- Hint <motion.p>: mt-2 text-xs font-medium uppercase tracking-[0.2em] GeistPixelGrid.className, style={{ color:'rgba(190,207,93,0.45)' }}, initial {{opacity:0,y:8}} animate {{opacity:1,y:0}} transition {{duration:0.3,ease:'easeOut',delay:0.8}}, text "hover to decrypt"

## Visual spec
- Background: always #292929 (never theme-dependent)
- All text/symbols: #BECF5D (olive)
- Hint opacity: 45% (rgba(190,207,93,0.45))
- Crosshair opacity: 35% (rgba(190,207,93,0.35))
- Font size: text-6xl for all word characters and prefix/suffix symbols
- No Phosphor icons, no light/dark variants

## Typography
- Font: GeistPixelGrid
- Sizes: 12px, 60px
- Weights: 500`,

  'Lovable': `Create a React client component named \`ScrambleText\`. 'use client' at the top. TypeScript strict, no \`any\`. Extract a \`useScramble\` hook and a \`Crosshair\` component — do not inline everything.

## Font
import localFont from 'next/font/local'
const GeistPixelGrid = localFont({ src: '../../node_modules/geist/dist/fonts/geist-pixel/GeistPixel-Grid.woff2' })

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
- Root: relative flex h-full w-full cursor-default items-center justify-center, style={{ background: '#292929' }}
- Crosshair at top-right: style={{ top:'10%', right:'8%' }}
- Crosshair at bottom-left: style={{ bottom:'10%', left:'8%' }}
- Inner flex-col div: select-none, items-center, gap-4, padding '60px 80px', mouse enter/leave handlers
- Rows: for each rowIdx, a flex items-center gap-1 div using GeistPixelGrid.className:
  - If rowIdx===0: prepend <span className="text-6xl leading-none tracking-widest" style={{ color: '#BECF5D' }}>/</span>
  - Each char: <span key={i} className="text-6xl leading-none tracking-widest" style={{ color: '#BECF5D' }}>{ch.display}</span>
  - If rowIdx===rows.length-1: append <span className="text-6xl leading-none tracking-widest" style={{ color: '#BECF5D' }}>_</span>
- Hint <motion.p>: mt-2 text-xs font-medium uppercase tracking-[0.2em] GeistPixelGrid.className, style={{ color:'rgba(190,207,93,0.45)' }}, initial {{opacity:0,y:8}} animate {{opacity:1,y:0}} transition {{duration:0.3,ease:'easeOut',delay:0.8}}, text "hover to decrypt"

## Visual spec
- Background: always #292929 (never theme-dependent)
- All text/symbols: #BECF5D (olive)
- Hint opacity: 45% (rgba(190,207,93,0.45))
- Crosshair opacity: 35% (rgba(190,207,93,0.35))
- Font size: text-6xl for all word characters and prefix/suffix symbols
- No Phosphor icons, no light/dark variants

## Typography
- Font: GeistPixelGrid
- Sizes: 12px, 60px
- Weights: 500`,

  'V0': `Create a React client component named \`ScrambleText\`. 'use client' at the top. TypeScript strict, no \`any\`. Extract a \`useScramble\` hook and a \`Crosshair\` component — do not inline everything.

## Font
import localFont from 'next/font/local'
const GeistPixelGrid = localFont({ src: '../../node_modules/geist/dist/fonts/geist-pixel/GeistPixel-Grid.woff2' })

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
- Root: relative flex h-full w-full cursor-default items-center justify-center, style={{ background: '#292929' }}
- Crosshair at top-right: style={{ top:'10%', right:'8%' }}
- Crosshair at bottom-left: style={{ bottom:'10%', left:'8%' }}
- Inner flex-col div: select-none, items-center, gap-4, padding '60px 80px', mouse enter/leave handlers
- Rows: for each rowIdx, a flex items-center gap-1 div using GeistPixelGrid.className:
  - If rowIdx===0: prepend <span className="text-6xl leading-none tracking-widest" style={{ color: '#BECF5D' }}>/</span>
  - Each char: <span key={i} className="text-6xl leading-none tracking-widest" style={{ color: '#BECF5D' }}>{ch.display}</span>
  - If rowIdx===rows.length-1: append <span className="text-6xl leading-none tracking-widest" style={{ color: '#BECF5D' }}>_</span>
- Hint <motion.p>: mt-2 text-xs font-medium uppercase tracking-[0.2em] GeistPixelGrid.className, style={{ color:'rgba(190,207,93,0.45)' }}, initial {{opacity:0,y:8}} animate {{opacity:1,y:0}} transition {{duration:0.3,ease:'easeOut',delay:0.8}}, text "hover to decrypt"

## Visual spec
- Background: always #292929 (never theme-dependent)
- All text/symbols: #BECF5D (olive)
- Hint opacity: 45% (rgba(190,207,93,0.45))
- Crosshair opacity: 35% (rgba(190,207,93,0.35))
- Font size: text-6xl for all word characters and prefix/suffix symbols
- No Phosphor icons, no light/dark variants

## Typography
- Font: GeistPixelGrid
- Sizes: 12px, 60px
- Weights: 500`,
}
