import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named \`DangerStripes\`: three caution-tape stripes crossing over each other on a bright orange background. One stripe is black, one is white, one is dark grey, each with contrasting repeating text. Orange X accents punctuate the text. On hover, the stripes shake with random jitter. On click, the shaking intensifies. On mouse leave, the shaking decays smoothly.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types. Do not use any design tokens or theme variables. Use raw hex values only.

Imports: useCallback, useEffect, useRef from 'react'; motion from 'framer-motion'.

Constants:
- STRIPE_TEXT = 'WORK IN PROGRESS  ✕  DO NOT CLICK OR HOVER  ✕  DANGER' (use \\u00A0 for non-breaking spaces around each X, \\u2715 for the X glyph)
- ACCENT_COLOR = '#FF6B1A' (orange, matches the page background, used to color the X separators)
- STRIPES array: 3 objects each with rotate (number), top (string percentage), bg (hex), fg (hex)
  - { rotate: -20, top: '40%', bg: '#0a0a0a', fg: '#ffffff' }
  - { rotate: 12, top: '47%', bg: '#ffffff', fg: '#0a0a0a' }
  - { rotate: -8, top: '54%', bg: '#2a2a2a', fg: '#ffffff' }

Sub-component RepeatingText (takes color prop):
- Render 10 copies of STRIPE_TEXT joined by an extra X separator between repetitions
- Each X (\\u2715), both the ones inside STRIPE_TEXT and the ones between repetitions, must be wrapped in its own span styled with color ACCENT_COLOR and fontSize '1.4em' so it reads bigger and orange
- Non-X text uses the color prop passed in (white or black depending on stripe)
- Outer div className: "flex items-center whitespace-nowrap text-sm font-black tracking-widest uppercase sm:text-base"
- Use String.split('\\u2715') to separate the X glyphs from the text chunks, then render each chunk + X span alternately
- Between each STRIPE_TEXT repetition add one more X span (with non-breaking spaces around it)

Helper: random(min, max) returns Math.random() * (max - min) + min

Main component DangerStripes:
- Refs: rafRef (number, 0), hoveringRef (boolean, false), clickedRef (boolean, false), intensityRef (number, 0), stripesRef (array of HTMLDivElement | null)
- No useState for animation: all animation state in refs for performance

animateStripes (useCallback, no deps):
- If hovering or clicked: lerp intensityRef toward target (clicked ? 3 : 1) with factor 0.15
- Else: decay intensityRef by multiplying 0.92 each frame
- When intensity < 0.005 and not hovering/clicked: reset all stripe transforms to just rotate(baseDeg), clear rafRef, return
- Otherwise: for each stripe, compute random jitter:
  - tx = random(-18, 18) * intensity
  - ty = random(-10, 10) * intensity
  - skewX = random(-6, 6) * intensity
  - scale = 1 + random(-0.04, 0.04) * intensity
  - Apply: el.style.transform = \`rotate(\${base}deg) translate(\${tx}px, \${ty}px) skewX(\${skewX}deg) scale(\${sc})\`
- Schedule next frame via requestAnimationFrame

Cleanup effect: cancel RAF on unmount.

startLoop: if rafRef is 0, start the RAF loop.
triggerHover: set hoveringRef true, call startLoop.
triggerClick: set clickedRef true, call startLoop, setTimeout 500ms to set clickedRef false.
triggerLeave: set hoveringRef false (loop continues with decay).

Root element: div, className "flex min-h-screen w-full items-center justify-center bg-[#FF6B1A]". The orange background matches ACCENT_COLOR.
Inner container: div, className "relative h-full w-full overflow-hidden select-none", style minHeight 100vh.

Each stripe: motion.div with ref stored in stripesRef array.
- className: "absolute left-[-40%] flex h-[60px] w-[180%] items-center overflow-hidden sm:h-[72px]"
- style:
  - top: stripe.top
  - background: stripe.bg (solid hex, no gradient)
  - boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 8px rgba(0,0,0,0.3)'
  - willChange: 'transform'
  - cursor: 'pointer'
- Framer Motion entrance: initial { x: alternating -300/300 per index, opacity: 0, rotate: stripe.rotate }, animate { x: 0, opacity: 1, rotate: stripe.rotate }, transition { duration: 0.6, delay: i * 0.12, ease: 'easeOut' }
- Event handlers: onMouseEnter=triggerHover, onMouseLeave=triggerLeave, onClick=triggerClick, onTouchStart=triggerHover, onTouchEnd triggers click then leave after 600ms
- Children: <RepeatingText color={stripe.fg} />`,

  'Lovable': `Create a React client component named \`DangerStripes\`: three caution-tape stripes crossing over each other on a bright orange background. One stripe is black, one is white, one is dark grey — each with contrasting repeating text. Orange X accents punctuate the text. On hover, the stripes shake with random jitter. On click, the shaking intensifies. On mouse leave, the shaking decays smoothly.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types. Do not use any design tokens or theme variables — use raw hex values only.

Imports: useCallback, useEffect, useRef from 'react'; motion from 'framer-motion'.

Constants:
- STRIPE_TEXT = 'WORK IN PROGRESS  ✕  DO NOT CLICK OR HOVER  ✕  DANGER' (use \\u00A0 for non-breaking spaces around each X, \\u2715 for the X glyph)
- ACCENT_COLOR = '#FF6B1A' (orange, matches the page background — used to color the X separators)
- STRIPES array: 3 objects each with rotate (number), top (string percentage), bg (hex), fg (hex)
  - { rotate: -20, top: '40%', bg: '#0a0a0a', fg: '#ffffff' }
  - { rotate: 12, top: '47%', bg: '#ffffff', fg: '#0a0a0a' }
  - { rotate: -8, top: '54%', bg: '#2a2a2a', fg: '#ffffff' }

Sub-component RepeatingText (takes color prop):
- Render 10 copies of STRIPE_TEXT joined by an extra X separator between repetitions
- Each X (\\u2715) — both the ones inside STRIPE_TEXT and the ones between repetitions — must be wrapped in its own span styled with color ACCENT_COLOR and fontSize '1.4em' so it reads bigger and orange
- Non-X text uses the color prop passed in (white or black depending on stripe)
- Outer div className: "flex items-center whitespace-nowrap text-sm font-black tracking-widest uppercase sm:text-base"
- Use String.split('\\u2715') to separate the X glyphs from the text chunks, then render each chunk + X span alternately
- Between each STRIPE_TEXT repetition add one more X span (with non-breaking spaces around it)

Helper: random(min, max) returns Math.random() * (max - min) + min

Main component DangerStripes:
- Refs: rafRef (number, 0), hoveringRef (boolean, false), clickedRef (boolean, false), intensityRef (number, 0), stripesRef (array of HTMLDivElement | null)
- No useState for animation — all animation state in refs for performance

animateStripes (useCallback, no deps):
- If hovering or clicked: lerp intensityRef toward target (clicked ? 3 : 1) with factor 0.15
- Else: decay intensityRef by multiplying 0.92 each frame
- When intensity < 0.005 and not hovering/clicked: reset all stripe transforms to just rotate(baseDeg), clear rafRef, return
- Otherwise: for each stripe, compute random jitter:
  - tx = random(-18, 18) * intensity
  - ty = random(-10, 10) * intensity
  - skewX = random(-6, 6) * intensity
  - scale = 1 + random(-0.04, 0.04) * intensity
  - Apply: el.style.transform = \`rotate(\${base}deg) translate(\${tx}px, \${ty}px) skewX(\${skewX}deg) scale(\${sc})\`
- Schedule next frame via requestAnimationFrame

Cleanup effect: cancel RAF on unmount.

startLoop: if rafRef is 0, start the RAF loop.
triggerHover: set hoveringRef true, call startLoop.
triggerClick: set clickedRef true, call startLoop, setTimeout 500ms to set clickedRef false.
triggerLeave: set hoveringRef false (loop continues with decay).

Root element: div, className "flex min-h-screen w-full items-center justify-center bg-[#FF6B1A]" — the orange background matches ACCENT_COLOR.
Inner container: div, className "relative h-full w-full overflow-hidden select-none", style minHeight 100vh.

Each stripe: motion.div with ref stored in stripesRef array.
- className: "absolute left-[-40%] flex h-[60px] w-[180%] items-center overflow-hidden sm:h-[72px]"
- style:
  - top: stripe.top
  - background: stripe.bg (solid hex, no gradient)
  - boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 8px rgba(0,0,0,0.3)'
  - willChange: 'transform'
  - cursor: 'pointer'
- Framer Motion entrance: initial { x: alternating -300/300 per index, opacity: 0, rotate: stripe.rotate }, animate { x: 0, opacity: 1, rotate: stripe.rotate }, transition { duration: 0.6, delay: i * 0.12, ease: 'easeOut' }
- Event handlers: onMouseEnter=triggerHover, onMouseLeave=triggerLeave, onClick=triggerClick, onTouchStart=triggerHover, onTouchEnd triggers click then leave after 600ms
- Children: <RepeatingText color={stripe.fg} />`,

  'V0': `Create a React client component named \`DangerStripes\`: three caution-tape stripes crossing over each other on a bright orange background. One stripe is black, one is white, one is dark grey — each with contrasting repeating text. Orange X accents punctuate the text. On hover, the stripes shake with random jitter. On click, the shaking intensifies. On mouse leave, the shaking decays smoothly.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types. Do not use any design tokens or theme variables — use raw hex values only.

Imports: useCallback, useEffect, useRef from 'react'; motion from 'framer-motion'.

Constants:
- STRIPE_TEXT = 'WORK IN PROGRESS  ✕  DO NOT CLICK OR HOVER  ✕  DANGER' (use \\u00A0 for non-breaking spaces around each X, \\u2715 for the X glyph)
- ACCENT_COLOR = '#FF6B1A' (orange, matches the page background — used to color the X separators)
- STRIPES array: 3 objects each with rotate (number), top (string percentage), bg (hex), fg (hex)
  - { rotate: -20, top: '40%', bg: '#0a0a0a', fg: '#ffffff' }
  - { rotate: 12, top: '47%', bg: '#ffffff', fg: '#0a0a0a' }
  - { rotate: -8, top: '54%', bg: '#2a2a2a', fg: '#ffffff' }

Sub-component RepeatingText (takes color prop):
- Render 10 copies of STRIPE_TEXT joined by an extra X separator between repetitions
- Each X (\\u2715) — both the ones inside STRIPE_TEXT and the ones between repetitions — must be wrapped in its own span styled with color ACCENT_COLOR and fontSize '1.4em' so it reads bigger and orange
- Non-X text uses the color prop passed in (white or black depending on stripe)
- Outer div className: "flex items-center whitespace-nowrap text-sm font-black tracking-widest uppercase sm:text-base"
- Use String.split('\\u2715') to separate the X glyphs from the text chunks, then render each chunk + X span alternately
- Between each STRIPE_TEXT repetition add one more X span (with non-breaking spaces around it)

Helper: random(min, max) returns Math.random() * (max - min) + min

Main component DangerStripes:
- Refs: rafRef (number, 0), hoveringRef (boolean, false), clickedRef (boolean, false), intensityRef (number, 0), stripesRef (array of HTMLDivElement | null)
- No useState for animation — all animation state in refs for performance

animateStripes (useCallback, no deps):
- If hovering or clicked: lerp intensityRef toward target (clicked ? 3 : 1) with factor 0.15
- Else: decay intensityRef by multiplying 0.92 each frame
- When intensity < 0.005 and not hovering/clicked: reset all stripe transforms to just rotate(baseDeg), clear rafRef, return
- Otherwise: for each stripe, compute random jitter:
  - tx = random(-18, 18) * intensity
  - ty = random(-10, 10) * intensity
  - skewX = random(-6, 6) * intensity
  - scale = 1 + random(-0.04, 0.04) * intensity
  - Apply: el.style.transform = \`rotate(\${base}deg) translate(\${tx}px, \${ty}px) skewX(\${skewX}deg) scale(\${sc})\`
- Schedule next frame via requestAnimationFrame

Cleanup effect: cancel RAF on unmount.

startLoop: if rafRef is 0, start the RAF loop.
triggerHover: set hoveringRef true, call startLoop.
triggerClick: set clickedRef true, call startLoop, setTimeout 500ms to set clickedRef false.
triggerLeave: set hoveringRef false (loop continues with decay).

Root element: div, className "flex min-h-screen w-full items-center justify-center bg-[#FF6B1A]" — the orange background matches ACCENT_COLOR.
Inner container: div, className "relative h-full w-full overflow-hidden select-none", style minHeight 100vh.

Each stripe: motion.div with ref stored in stripesRef array.
- className: "absolute left-[-40%] flex h-[60px] w-[180%] items-center overflow-hidden sm:h-[72px]"
- style:
  - top: stripe.top
  - background: stripe.bg (solid hex, no gradient)
  - boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 1px 8px rgba(0,0,0,0.3)'
  - willChange: 'transform'
  - cursor: 'pointer'
- Framer Motion entrance: initial { x: alternating -300/300 per index, opacity: 0, rotate: stripe.rotate }, animate { x: 0, opacity: 1, rotate: stripe.rotate }, transition { duration: 0.6, delay: i * 0.12, ease: 'easeOut' }
- Event handlers: onMouseEnter=triggerHover, onMouseLeave=triggerLeave, onClick=triggerClick, onTouchStart=triggerHover, onTouchEnd triggers click then leave after 600ms
- Children: <RepeatingText color={stripe.fg} />`,
}
