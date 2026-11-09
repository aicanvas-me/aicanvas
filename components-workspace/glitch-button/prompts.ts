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

Create a React client component named \`GlitchButton\`: a terminal-inspired button that scrambles its label on hover through random glitch symbols, then resolves character by character left to right. Supports light + dark themes.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Imports: useState, useRef, useEffect, useLayoutEffect, useCallback from 'react'; motion from 'framer-motion'.

Constants:
- LABEL = 'INITIALIZE'
- GLITCH_CHARS = '@#$%&!*^~<>?+='
- SCRAMBLE_DURATION = 700 (ms total)
- SCRAMBLE_INTERVAL = 40 (ms between updates)

Palettes:
DARK { text:'#00ff41', textDim:'rgba(0, 255, 65, 0.6)', glow:'rgba(0, 255, 65, 0.15)', borderDefault:'#2E2A24' }
LIGHT { text:'#2a6b0a', textDim:'rgba(42, 107, 10, 0.7)', glow:'rgba(42, 107, 10, 0.12)', borderDefault:'#DDD8CE' }

Theme detection: useIsomorphicLayoutEffect (useLayoutEffect in the browser, useEffect on the server), so the dark start value is corrected before paint, find closest [data-card-theme], else use document.documentElement.classList.contains('dark'). MutationObserver on both with attributeFilter ['class']. Cleanup disconnect.

State: isDark, displayText (init LABEL), isHovered. Refs: rafRef (number, 0), isHoveredRef (false), startTimeRef (0), lastUpdateRef (0).

cleanup: cancelAnimationFrame(rafRef.current), set to 0. Cleanup effect on unmount.

scrambleTick(timestamp): if !isHoveredRef return. elapsed = timestamp - startTimeRef. resolvePerChar = 700/LABEL.length. If timestamp - lastUpdateRef < 40, schedule next RAF and return. Else lastUpdateRef = timestamp. resolvedCount = min(floor(elapsed/resolvePerChar), LABEL.length). If resolvedCount >= LABEL.length: setDisplayText(LABEL) and stop. Else: build chars[] where i<resolvedCount uses LABEL[i], else getRandomChar() (random from GLITCH_CHARS). setDisplayText(chars.join('')). Schedule next RAF.

handleMouseEnter: isHoveredRef=true, setIsHovered(true), startTimeRef=performance.now(), lastUpdateRef=0, cleanup(), rafRef=requestAnimationFrame(scrambleTick).
handleMouseLeave: isHoveredRef=false, setIsHovered(false), cleanup(), setDisplayText(LABEL).

Root: <div ref className="flex h-full w-full items-center justify-center" style={{background: isDark?'#110F0C':'#F5F1EA'}}>
motion.div entrance initial {opacity:0,y:16} animate {opacity:1,y:0} duration 0.5 easeOut.

motion.button: className "relative cursor-pointer px-8 py-4 font-mono text-lg font-semibold tracking-widest". style: background same, color=colors.text, boxShadow hover '0 0 20px \${glow}, inset 0 0 12px \${glow}' else 'none', transition 'box-shadow 0.3s'. whileTap scale 0.97, spring 400/30.

Corner brackets: map ['tl','tr','bl','br'] to span pointer-events-none absolute, width/height 10, positioned by corner. borderColor hover=textDim else borderDefault, borderTopWidth/BottomWidth/LeftWidth/RightWidth 1.5 depending on corner, borderStyle solid, transition 'border-color 0.3s'.

Inside: <span className="relative z-10">{displayText}</span>.

## Typography
- Font: monospace (system)
- Sizes: 18px
- Weights: 600`,

  'Lovable': `Create a React client component named \`GlitchButton\`: a terminal-inspired button that scrambles its label on hover through random glitch symbols, then resolves character by character left to right. Supports light + dark themes.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Imports: useState, useRef, useEffect, useLayoutEffect, useCallback from 'react'; motion from 'framer-motion'.

Constants:
- LABEL = 'INITIALIZE'
- GLITCH_CHARS = '@#$%&!*^~<>?+='
- SCRAMBLE_DURATION = 700 (ms total)
- SCRAMBLE_INTERVAL = 40 (ms between updates)

Palettes:
DARK { text:'#00ff41', textDim:'rgba(0, 255, 65, 0.6)', glow:'rgba(0, 255, 65, 0.15)', borderDefault:'#2E2A24' }
LIGHT { text:'#2a6b0a', textDim:'rgba(42, 107, 10, 0.7)', glow:'rgba(42, 107, 10, 0.12)', borderDefault:'#DDD8CE' }

Theme detection: useIsomorphicLayoutEffect (useLayoutEffect in the browser, useEffect on the server), so the dark start value is corrected before paint, find closest [data-card-theme], else use document.documentElement.classList.contains('dark'). MutationObserver on both with attributeFilter ['class']. Cleanup disconnect.

State: isDark, displayText (init LABEL), isHovered. Refs: rafRef (number, 0), isHoveredRef (false), startTimeRef (0), lastUpdateRef (0).

cleanup: cancelAnimationFrame(rafRef.current), set to 0. Cleanup effect on unmount.

scrambleTick(timestamp): if !isHoveredRef return. elapsed = timestamp - startTimeRef. resolvePerChar = 700/LABEL.length. If timestamp - lastUpdateRef < 40, schedule next RAF and return. Else lastUpdateRef = timestamp. resolvedCount = min(floor(elapsed/resolvePerChar), LABEL.length). If resolvedCount >= LABEL.length: setDisplayText(LABEL) and stop. Else: build chars[] where i<resolvedCount uses LABEL[i], else getRandomChar() (random from GLITCH_CHARS). setDisplayText(chars.join('')). Schedule next RAF.

handleMouseEnter: isHoveredRef=true, setIsHovered(true), startTimeRef=performance.now(), lastUpdateRef=0, cleanup(), rafRef=requestAnimationFrame(scrambleTick).
handleMouseLeave: isHoveredRef=false, setIsHovered(false), cleanup(), setDisplayText(LABEL).

Root: <div ref className="flex h-full w-full items-center justify-center" style={{background: isDark?'#110F0C':'#F5F1EA'}}>
motion.div entrance initial {opacity:0,y:16} animate {opacity:1,y:0} duration 0.5 easeOut.

motion.button: className "relative cursor-pointer px-8 py-4 font-mono text-lg font-semibold tracking-widest". style: background same, color=colors.text, boxShadow hover '0 0 20px \${glow}, inset 0 0 12px \${glow}' else 'none', transition 'box-shadow 0.3s'. whileTap scale 0.97, spring 400/30.

Corner brackets: map ['tl','tr','bl','br'] to span pointer-events-none absolute, width/height 10, positioned by corner. borderColor hover=textDim else borderDefault, borderTopWidth/BottomWidth/LeftWidth/RightWidth 1.5 depending on corner, borderStyle solid, transition 'border-color 0.3s'.

Inside: <span className="relative z-10">{displayText}</span>.

## Typography
- Font: monospace (system)
- Sizes: 18px
- Weights: 600`,

  'V0': `Create a React client component named \`GlitchButton\`: a terminal-inspired button that scrambles its label on hover through random glitch symbols, then resolves character by character left to right. Supports light + dark themes.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Imports: useState, useRef, useEffect, useLayoutEffect, useCallback from 'react'; motion from 'framer-motion'.

Constants:
- LABEL = 'INITIALIZE'
- GLITCH_CHARS = '@#$%&!*^~<>?+='
- SCRAMBLE_DURATION = 700 (ms total)
- SCRAMBLE_INTERVAL = 40 (ms between updates)

Palettes:
DARK { text:'#00ff41', textDim:'rgba(0, 255, 65, 0.6)', glow:'rgba(0, 255, 65, 0.15)', borderDefault:'#2E2A24' }
LIGHT { text:'#2a6b0a', textDim:'rgba(42, 107, 10, 0.7)', glow:'rgba(42, 107, 10, 0.12)', borderDefault:'#DDD8CE' }

Theme detection: useIsomorphicLayoutEffect (useLayoutEffect in the browser, useEffect on the server), so the dark start value is corrected before paint, find closest [data-card-theme], else use document.documentElement.classList.contains('dark'). MutationObserver on both with attributeFilter ['class']. Cleanup disconnect.

State: isDark, displayText (init LABEL), isHovered. Refs: rafRef (number, 0), isHoveredRef (false), startTimeRef (0), lastUpdateRef (0).

cleanup: cancelAnimationFrame(rafRef.current), set to 0. Cleanup effect on unmount.

scrambleTick(timestamp): if !isHoveredRef return. elapsed = timestamp - startTimeRef. resolvePerChar = 700/LABEL.length. If timestamp - lastUpdateRef < 40, schedule next RAF and return. Else lastUpdateRef = timestamp. resolvedCount = min(floor(elapsed/resolvePerChar), LABEL.length). If resolvedCount >= LABEL.length: setDisplayText(LABEL) and stop. Else: build chars[] where i<resolvedCount uses LABEL[i], else getRandomChar() (random from GLITCH_CHARS). setDisplayText(chars.join('')). Schedule next RAF.

handleMouseEnter: isHoveredRef=true, setIsHovered(true), startTimeRef=performance.now(), lastUpdateRef=0, cleanup(), rafRef=requestAnimationFrame(scrambleTick).
handleMouseLeave: isHoveredRef=false, setIsHovered(false), cleanup(), setDisplayText(LABEL).

Root: <div ref className="flex h-full w-full items-center justify-center" style={{background: isDark?'#110F0C':'#F5F1EA'}}>
motion.div entrance initial {opacity:0,y:16} animate {opacity:1,y:0} duration 0.5 easeOut.

motion.button: className "relative cursor-pointer px-8 py-4 font-mono text-lg font-semibold tracking-widest". style: background same, color=colors.text, boxShadow hover '0 0 20px \${glow}, inset 0 0 12px \${glow}' else 'none', transition 'box-shadow 0.3s'. whileTap scale 0.97, spring 400/30.

Corner brackets: map ['tl','tr','bl','br'] to span pointer-events-none absolute, width/height 10, positioned by corner. borderColor hover=textDim else borderDefault, borderTopWidth/BottomWidth/LeftWidth/RightWidth 1.5 depending on corner, borderStyle solid, transition 'border-color 0.3s'.

Inside: <span className="relative z-10">{displayText}</span>.

## Typography
- Font: monospace (system)
- Sizes: 18px
- Weights: 600`,
}
