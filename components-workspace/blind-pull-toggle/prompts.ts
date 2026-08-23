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

Create a React client component named BlindPullToggle, a dark/light mode toggle styled as a window-blind with a pull cord. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Layout: fills parent (flex h-full w-full items-center justify-center). Background is theme-aware: #110F0C (dark) / #EDEAE5 (light).

Detect theme: closest [data-card-theme] ancestor else document.documentElement .dark class. MutationObserver on both for class changes.

Responsive sizing via ResizeObserver on root. size = clamp(48, min(w,h) * 0.2, 80). Keep a ref mirror for async handlers.

Constants: SLATS = 6. Derived: iconSize = round(size*0.45), radius = round(size*0.275), cordRestH = round(size*0.30), dotSize = max(8, round(size*0.138)).

Button: motion.button, width/height = size, borderRadius = radius, transparent background. whileHover scale 1.06, whileTap scale 0.97, spring {stiffness:400, damping:28}. Border: 1.5px solid rgba(255,255,255,0.10) dark / rgba(0,0,0,0.12) light. Shadow dark: '0 6px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)'; light: '0 4px 20px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)'.

Inside the button: absolute inset-0 container with borderRadius radius-1, overflow hidden. Render 6 slats. For slat i: topPx = round((i/6)*size), nextTop = i===5 ? size : round(((i+1)/6)*size), height = nextTop-topPx. Each slat is absolutely positioned, transformOrigin '50% 50%', contains a full-size div shifted top: -topPx showing buttonBg gradient + centered icon. Dark bg: 'linear-gradient(145deg, #3a3530, #252019)'; light: 'linear-gradient(145deg, #E8E4DC, #DFDBD4)'. Icon color: white (dark) / #2E2A24 (light). Use Phosphor Moon (toggleDark true) or Sun (toggleDark false), weight='regular', size=iconSize.

Cord below button (flex-col, centered, cursor pointer, calls same handler): a 2px-wide div .cord-line height cordRestH with linear-gradient top→bottom from cordTop to cordBottom. Dark cordTop rgba(255,255,255,0.28), cordBottom rgba(255,255,255,0.07); light 0.22 / 0.05. Below: a circular pull dot of dotSize with rgba(255,255,255,0.62)/rgba(0,0,0,0.32) bg and shadow '0 2px 8px rgba(0,0,0,0.5)' dark / '0 2px 6px rgba(0,0,0,0.12)' light.

Use useAnimate + stagger from framer-motion. handleToggle (guarded by animating flag):
1) animate('.cord-line', {height: round(size*0.65)}, {duration:0.1, ease:[0.4,0,1,1]})
2) animate('.cord-line', {height: round(size*0.30)}, {type:'spring', stiffness:300, damping:18}), fire and forget
3) await animate('.slat', {scaleY:0}, {delay: stagger(0.04), duration:0.1, ease:'easeIn'})
4) flip toggleDark
5) await animate('.slat', {scaleY:1}, {delay: stagger(0.04), duration:0.13, ease:'easeOut'})

Wrap the whole toggle + cord in a motion.div with initial {opacity:0, y:20} → {opacity:1, y:0}, duration 0.5, ease 'easeOut'.

## Typography
- Font: project default sans-serif`,

  'Lovable': `Create a React client component named BlindPullToggle — a dark/light mode toggle styled as a window-blind with a pull cord. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Layout: fills parent (flex h-full w-full items-center justify-center). Background is theme-aware: #110F0C (dark) / #EDEAE5 (light).

Detect theme: closest [data-card-theme] ancestor else document.documentElement .dark class. MutationObserver on both for class changes.

Responsive sizing via ResizeObserver on root. size = clamp(48, min(w,h) * 0.2, 80). Keep a ref mirror for async handlers.

Constants: SLATS = 6. Derived: iconSize = round(size*0.45), radius = round(size*0.275), cordRestH = round(size*0.30), dotSize = max(8, round(size*0.138)).

Button: motion.button, width/height = size, borderRadius = radius, transparent background. whileHover scale 1.06, whileTap scale 0.97, spring {stiffness:400, damping:28}. Border: 1.5px solid rgba(255,255,255,0.10) dark / rgba(0,0,0,0.12) light. Shadow dark: '0 6px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)'; light: '0 4px 20px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)'.

Inside the button: absolute inset-0 container with borderRadius radius-1, overflow hidden. Render 6 slats. For slat i: topPx = round((i/6)*size), nextTop = i===5 ? size : round(((i+1)/6)*size), height = nextTop-topPx. Each slat is absolutely positioned, transformOrigin '50% 50%', contains a full-size div shifted top: -topPx showing buttonBg gradient + centered icon. Dark bg: 'linear-gradient(145deg, #3a3530, #252019)'; light: 'linear-gradient(145deg, #E8E4DC, #DFDBD4)'. Icon color: white (dark) / #2E2A24 (light). Use Phosphor Moon (toggleDark true) or Sun (toggleDark false), weight='regular', size=iconSize.

Cord below button (flex-col, centered, cursor pointer, calls same handler): a 2px-wide div .cord-line height cordRestH with linear-gradient top→bottom from cordTop to cordBottom. Dark cordTop rgba(255,255,255,0.28), cordBottom rgba(255,255,255,0.07); light 0.22 / 0.05. Below: a circular pull dot of dotSize with rgba(255,255,255,0.62)/rgba(0,0,0,0.32) bg and shadow '0 2px 8px rgba(0,0,0,0.5)' dark / '0 2px 6px rgba(0,0,0,0.12)' light.

Use useAnimate + stagger from framer-motion. handleToggle (guarded by animating flag):
1) animate('.cord-line', {height: round(size*0.65)}, {duration:0.1, ease:[0.4,0,1,1]})
2) animate('.cord-line', {height: round(size*0.30)}, {type:'spring', stiffness:300, damping:18}) — fire and forget
3) await animate('.slat', {scaleY:0}, {delay: stagger(0.04), duration:0.1, ease:'easeIn'})
4) flip toggleDark
5) await animate('.slat', {scaleY:1}, {delay: stagger(0.04), duration:0.13, ease:'easeOut'})

Wrap the whole toggle + cord in a motion.div with initial {opacity:0, y:20} → {opacity:1, y:0}, duration 0.5, ease 'easeOut'.

## Typography
- Font: project default sans-serif`,

  'V0': `Create a React client component named BlindPullToggle — a dark/light mode toggle styled as a window-blind with a pull cord. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Layout: fills parent (flex h-full w-full items-center justify-center). Background is theme-aware: #110F0C (dark) / #EDEAE5 (light).

Detect theme: closest [data-card-theme] ancestor else document.documentElement .dark class. MutationObserver on both for class changes.

Responsive sizing via ResizeObserver on root. size = clamp(48, min(w,h) * 0.2, 80). Keep a ref mirror for async handlers.

Constants: SLATS = 6. Derived: iconSize = round(size*0.45), radius = round(size*0.275), cordRestH = round(size*0.30), dotSize = max(8, round(size*0.138)).

Button: motion.button, width/height = size, borderRadius = radius, transparent background. whileHover scale 1.06, whileTap scale 0.97, spring {stiffness:400, damping:28}. Border: 1.5px solid rgba(255,255,255,0.10) dark / rgba(0,0,0,0.12) light. Shadow dark: '0 6px 28px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)'; light: '0 4px 20px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.08)'.

Inside the button: absolute inset-0 container with borderRadius radius-1, overflow hidden. Render 6 slats. For slat i: topPx = round((i/6)*size), nextTop = i===5 ? size : round(((i+1)/6)*size), height = nextTop-topPx. Each slat is absolutely positioned, transformOrigin '50% 50%', contains a full-size div shifted top: -topPx showing buttonBg gradient + centered icon. Dark bg: 'linear-gradient(145deg, #3a3530, #252019)'; light: 'linear-gradient(145deg, #E8E4DC, #DFDBD4)'. Icon color: white (dark) / #2E2A24 (light). Use Phosphor Moon (toggleDark true) or Sun (toggleDark false), weight='regular', size=iconSize.

Cord below button (flex-col, centered, cursor pointer, calls same handler): a 2px-wide div .cord-line height cordRestH with linear-gradient top→bottom from cordTop to cordBottom. Dark cordTop rgba(255,255,255,0.28), cordBottom rgba(255,255,255,0.07); light 0.22 / 0.05. Below: a circular pull dot of dotSize with rgba(255,255,255,0.62)/rgba(0,0,0,0.32) bg and shadow '0 2px 8px rgba(0,0,0,0.5)' dark / '0 2px 6px rgba(0,0,0,0.12)' light.

Use useAnimate + stagger from framer-motion. handleToggle (guarded by animating flag):
1) animate('.cord-line', {height: round(size*0.65)}, {duration:0.1, ease:[0.4,0,1,1]})
2) animate('.cord-line', {height: round(size*0.30)}, {type:'spring', stiffness:300, damping:18}) — fire and forget
3) await animate('.slat', {scaleY:0}, {delay: stagger(0.04), duration:0.1, ease:'easeIn'})
4) flip toggleDark
5) await animate('.slat', {scaleY:1}, {delay: stagger(0.04), duration:0.13, ease:'easeOut'})

Wrap the whole toggle + cord in a motion.div with initial {opacity:0, y:20} → {opacity:1, y:0}, duration 0.5, ease 'easeOut'.

## Typography
- Font: project default sans-serif`,
}
