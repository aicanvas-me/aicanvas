import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion

Root element: className="flex min-h-screen w-full items-center justify-center bg-[#E8E8DF] dark:bg-[#1A1A19]"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named \`EmojiBurst\`. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A centered button that, on click, explodes 18 random emojis outward in a circular burst pattern with a slight arc lift. Each click cycles through 5 themed sets. Uses Framer Motion.

Imports:
\`import { motion, AnimatePresence } from 'framer-motion'\` plus \`useState\`, \`useCallback\` from React.

## SETS (5 entries, as const)
\`\`\`
[
  { label: 'Party!', emojis: ['🎉','🎊','🥳','🎈','🎁','✨','🌟','🪅'], bg: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', shadow: 'rgba(139,92,246,0.5)' },
  { label: 'Boom!',  emojis: ['🔥','💥','⚡','🌪️','💫','⭐','🌈','☄️'], bg: 'linear-gradient(135deg, #F97316, #DC2626)', shadow: 'rgba(249,115,22,0.5)' },
  { label: 'Yum!',   emojis: ['🍕','🍔','🌮','🍣','🍩','🧁','🍦','🍇'], bg: 'linear-gradient(135deg, #22C55E, #16A34A)', shadow: 'rgba(34,197,94,0.5)' },
  { label: 'Cute!',  emojis: ['🐱','🐶','🐼','🦊','🦄','🐸','🐧','🐨'], bg: 'linear-gradient(135deg, #06B6D4, #0284C7)', shadow: 'rgba(6,182,212,0.5)' },
  { label: 'Love!',  emojis: ['❤️','💜','💙','💚','💛','🧡','💖','💝'], bg: 'linear-gradient(135deg, #EC4899, #BE185D)', shadow: 'rgba(236,72,153,0.5)' },
]
\`\`\`
\`const PARTICLE_COUNT = 18\`. Module-level \`let uid = 0\`.

## Particle interface
\`{ id, emoji, angle (radians), distance (px), rotation (deg), size (rem), duration (seconds) }\`. No delay field: all particles fire simultaneously.

## State
\`particles: Particle[]\` (setParticles), \`setIdx: number\` (setSetIdx, starts 0), \`isPopping: boolean\`. \`currentSet = SETS[setIdx % SETS.length]\`.

## explode() (useCallback)
- guard: if isPopping return
- setIsPopping(true)
- Build 18 particles:
\`\`\`
const baseAngle = (i / 18) * Math.PI * 2
const jitter    = (Math.random() - 0.5) * ((Math.PI * 2) / 18) * 0.8
{
  id: uid++,
  emoji: emojis[Math.floor(Math.random() * emojis.length)],
  angle: baseAngle + jitter,
  distance: 85 + Math.random() * 95,
  rotation: (Math.random() - 0.5) * 640,
  size: 1.4 + Math.random() * 0.9,
  duration: 0.55 + Math.random() * 0.25,  // 0.55–0.80s
}
\`\`\`
- setParticles(burst); setSetIdx(prev => prev + 1)
- setTimeout 850ms → setParticles([]); setIsPopping(false)

## EmojiParticle inline subcomponent
For each particle:
\`\`\`
const tx = Math.cos(p.angle) * p.distance
const ty = Math.sin(p.angle) * p.distance
const lift = 18 + Math.abs(Math.cos(p.angle)) * 22  // horizontal particles arc higher
\`\`\`
\`motion.span\` with className "pointer-events-none absolute select-none", style \`{ left: '50%', top: '50%', fontSize: \\\`\${p.size}rem\\\`, lineHeight: 1, transformOrigin: 'center center', translateX: '-50%', translateY: '-50%' }\`.
\`\`\`
initial: { x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }
animate: {
  x: [0, tx * 0.5, tx],
  y: [0, ty * 0.5 - lift, ty],
  scale: [0, 1.25, 0.55],
  opacity: [1, 1, 0],
  rotate: [0, p.rotation * 0.5, p.rotation],
}
transition: {
  duration: p.duration,
  ease: [[0.08, 0.82, 0.17, 1], 'linear'] as never,
  times: [0, 0.2, 1],
}
\`\`\`

## JSX
Root: \`<div className="flex h-full w-full items-center justify-center bg-[#E8E8DF] dark:bg-[#1A1A19]">\` containing a relative flex center div.

Inside:
- \`<AnimatePresence>{particles.map(p => <EmojiParticle key={p.id} p={p} />)}</AnimatePresence>\`
- \`motion.button\`: onClick explode, whileHover \`{ scale: 1.06 }\`, whileTap \`{ scale: 0.88 }\`, transition \`{ type: 'spring', stiffness: 420, damping: 18 }\`, className "relative z-10 cursor-pointer rounded-full px-14 py-4 text-xl font-bold text-white select-none", style \`{ background: currentSet.bg, boxShadow: \\\`0 8px 32px \${currentSet.shadow}, 0 2px 8px rgba(0,0,0,0.3)\\\`, letterSpacing: '-0.01em' }\`.
- Inside button: \`<AnimatePresence mode="wait">\` wrapping a single \`motion.span\` keyed by setIdx, className "block", \`initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}\`, \`animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}\`, \`exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }}\`, \`transition={{ type: 'spring', duration: 0.35, bounce: 0 }}\`, text \`{currentSet.label}\`.

## Typography
- Font: project default sans-serif
- Sizes: 20px
- Weights: 700`,

  'Lovable': `Create a React client component named \`EmojiBurst\`. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A centered button that, on click, explodes 18 random emojis outward in a circular burst pattern with a slight arc lift. Each click cycles through 5 themed sets. Uses Framer Motion.

Imports:
\`import { motion, AnimatePresence } from 'framer-motion'\` plus \`useState\`, \`useCallback\` from React.

## SETS (5 entries, as const)
\`\`\`
[
  { label: 'Party!', emojis: ['🎉','🎊','🥳','🎈','🎁','✨','🌟','🪅'], bg: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', shadow: 'rgba(139,92,246,0.5)' },
  { label: 'Boom!',  emojis: ['🔥','💥','⚡','🌪️','💫','⭐','🌈','☄️'], bg: 'linear-gradient(135deg, #F97316, #DC2626)', shadow: 'rgba(249,115,22,0.5)' },
  { label: 'Yum!',   emojis: ['🍕','🍔','🌮','🍣','🍩','🧁','🍦','🍇'], bg: 'linear-gradient(135deg, #22C55E, #16A34A)', shadow: 'rgba(34,197,94,0.5)' },
  { label: 'Cute!',  emojis: ['🐱','🐶','🐼','🦊','🦄','🐸','🐧','🐨'], bg: 'linear-gradient(135deg, #06B6D4, #0284C7)', shadow: 'rgba(6,182,212,0.5)' },
  { label: 'Love!',  emojis: ['❤️','💜','💙','💚','💛','🧡','💖','💝'], bg: 'linear-gradient(135deg, #EC4899, #BE185D)', shadow: 'rgba(236,72,153,0.5)' },
]
\`\`\`
\`const PARTICLE_COUNT = 18\`. Module-level \`let uid = 0\`.

## Particle interface
\`{ id, emoji, angle (radians), distance (px), rotation (deg), size (rem), duration (seconds) }\`. No delay field — all particles fire simultaneously.

## State
\`particles: Particle[]\` (setParticles), \`setIdx: number\` (setSetIdx, starts 0), \`isPopping: boolean\`. \`currentSet = SETS[setIdx % SETS.length]\`.

## explode() (useCallback)
- guard: if isPopping return
- setIsPopping(true)
- Build 18 particles:
\`\`\`
const baseAngle = (i / 18) * Math.PI * 2
const jitter    = (Math.random() - 0.5) * ((Math.PI * 2) / 18) * 0.8
{
  id: uid++,
  emoji: emojis[Math.floor(Math.random() * emojis.length)],
  angle: baseAngle + jitter,
  distance: 85 + Math.random() * 95,
  rotation: (Math.random() - 0.5) * 640,
  size: 1.4 + Math.random() * 0.9,
  duration: 0.55 + Math.random() * 0.25,  // 0.55–0.80s
}
\`\`\`
- setParticles(burst); setSetIdx(prev => prev + 1)
- setTimeout 850ms → setParticles([]); setIsPopping(false)

## EmojiParticle inline subcomponent
For each particle:
\`\`\`
const tx = Math.cos(p.angle) * p.distance
const ty = Math.sin(p.angle) * p.distance
const lift = 18 + Math.abs(Math.cos(p.angle)) * 22  // horizontal particles arc higher
\`\`\`
\`motion.span\` with className "pointer-events-none absolute select-none", style \`{ left: '50%', top: '50%', fontSize: \\\`\${p.size}rem\\\`, lineHeight: 1, transformOrigin: 'center center', translateX: '-50%', translateY: '-50%' }\`.
\`\`\`
initial: { x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }
animate: {
  x: [0, tx * 0.5, tx],
  y: [0, ty * 0.5 - lift, ty],
  scale: [0, 1.25, 0.55],
  opacity: [1, 1, 0],
  rotate: [0, p.rotation * 0.5, p.rotation],
}
transition: {
  duration: p.duration,
  ease: [[0.08, 0.82, 0.17, 1], 'linear'] as never,
  times: [0, 0.2, 1],
}
\`\`\`

## JSX
Root: \`<div className="flex h-full w-full items-center justify-center bg-[#E8E8DF] dark:bg-[#1A1A19]">\` containing a relative flex center div.

Inside:
- \`<AnimatePresence>{particles.map(p => <EmojiParticle key={p.id} p={p} />)}</AnimatePresence>\`
- \`motion.button\`: onClick explode, whileHover \`{ scale: 1.06 }\`, whileTap \`{ scale: 0.88 }\`, transition \`{ type: 'spring', stiffness: 420, damping: 18 }\`, className "relative z-10 cursor-pointer rounded-full px-14 py-4 text-xl font-bold text-white select-none", style \`{ background: currentSet.bg, boxShadow: \\\`0 8px 32px \${currentSet.shadow}, 0 2px 8px rgba(0,0,0,0.3)\\\`, letterSpacing: '-0.01em' }\`.
- Inside button: \`<AnimatePresence mode="wait">\` wrapping a single \`motion.span\` keyed by setIdx, className "block", \`initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}\`, \`animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}\`, \`exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }}\`, \`transition={{ type: 'spring', duration: 0.35, bounce: 0 }}\`, text \`{currentSet.label}\`.

## Typography
- Font: project default sans-serif
- Sizes: 20px
- Weights: 700`,

  'V0': `Create a React client component named \`EmojiBurst\`. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A centered button that, on click, explodes 18 random emojis outward in a circular burst pattern with a slight arc lift. Each click cycles through 5 themed sets. Uses Framer Motion.

Imports:
\`import { motion, AnimatePresence } from 'framer-motion'\` plus \`useState\`, \`useCallback\` from React.

## SETS (5 entries, as const)
\`\`\`
[
  { label: 'Party!', emojis: ['🎉','🎊','🥳','🎈','🎁','✨','🌟','🪅'], bg: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', shadow: 'rgba(139,92,246,0.5)' },
  { label: 'Boom!',  emojis: ['🔥','💥','⚡','🌪️','💫','⭐','🌈','☄️'], bg: 'linear-gradient(135deg, #F97316, #DC2626)', shadow: 'rgba(249,115,22,0.5)' },
  { label: 'Yum!',   emojis: ['🍕','🍔','🌮','🍣','🍩','🧁','🍦','🍇'], bg: 'linear-gradient(135deg, #22C55E, #16A34A)', shadow: 'rgba(34,197,94,0.5)' },
  { label: 'Cute!',  emojis: ['🐱','🐶','🐼','🦊','🦄','🐸','🐧','🐨'], bg: 'linear-gradient(135deg, #06B6D4, #0284C7)', shadow: 'rgba(6,182,212,0.5)' },
  { label: 'Love!',  emojis: ['❤️','💜','💙','💚','💛','🧡','💖','💝'], bg: 'linear-gradient(135deg, #EC4899, #BE185D)', shadow: 'rgba(236,72,153,0.5)' },
]
\`\`\`
\`const PARTICLE_COUNT = 18\`. Module-level \`let uid = 0\`.

## Particle interface
\`{ id, emoji, angle (radians), distance (px), rotation (deg), size (rem), duration (seconds) }\`. No delay field — all particles fire simultaneously.

## State
\`particles: Particle[]\` (setParticles), \`setIdx: number\` (setSetIdx, starts 0), \`isPopping: boolean\`. \`currentSet = SETS[setIdx % SETS.length]\`.

## explode() (useCallback)
- guard: if isPopping return
- setIsPopping(true)
- Build 18 particles:
\`\`\`
const baseAngle = (i / 18) * Math.PI * 2
const jitter    = (Math.random() - 0.5) * ((Math.PI * 2) / 18) * 0.8
{
  id: uid++,
  emoji: emojis[Math.floor(Math.random() * emojis.length)],
  angle: baseAngle + jitter,
  distance: 85 + Math.random() * 95,
  rotation: (Math.random() - 0.5) * 640,
  size: 1.4 + Math.random() * 0.9,
  duration: 0.55 + Math.random() * 0.25,  // 0.55–0.80s
}
\`\`\`
- setParticles(burst); setSetIdx(prev => prev + 1)
- setTimeout 850ms → setParticles([]); setIsPopping(false)

## EmojiParticle inline subcomponent
For each particle:
\`\`\`
const tx = Math.cos(p.angle) * p.distance
const ty = Math.sin(p.angle) * p.distance
const lift = 18 + Math.abs(Math.cos(p.angle)) * 22  // horizontal particles arc higher
\`\`\`
\`motion.span\` with className "pointer-events-none absolute select-none", style \`{ left: '50%', top: '50%', fontSize: \\\`\${p.size}rem\\\`, lineHeight: 1, transformOrigin: 'center center', translateX: '-50%', translateY: '-50%' }\`.
\`\`\`
initial: { x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }
animate: {
  x: [0, tx * 0.5, tx],
  y: [0, ty * 0.5 - lift, ty],
  scale: [0, 1.25, 0.55],
  opacity: [1, 1, 0],
  rotate: [0, p.rotation * 0.5, p.rotation],
}
transition: {
  duration: p.duration,
  ease: [[0.08, 0.82, 0.17, 1], 'linear'] as never,
  times: [0, 0.2, 1],
}
\`\`\`

## JSX
Root: \`<div className="flex h-full w-full items-center justify-center bg-[#E8E8DF] dark:bg-[#1A1A19]">\` containing a relative flex center div.

Inside:
- \`<AnimatePresence>{particles.map(p => <EmojiParticle key={p.id} p={p} />)}</AnimatePresence>\`
- \`motion.button\`: onClick explode, whileHover \`{ scale: 1.06 }\`, whileTap \`{ scale: 0.88 }\`, transition \`{ type: 'spring', stiffness: 420, damping: 18 }\`, className "relative z-10 cursor-pointer rounded-full px-14 py-4 text-xl font-bold text-white select-none", style \`{ background: currentSet.bg, boxShadow: \\\`0 8px 32px \${currentSet.shadow}, 0 2px 8px rgba(0,0,0,0.3)\\\`, letterSpacing: '-0.01em' }\`.
- Inside button: \`<AnimatePresence mode="wait">\` wrapping a single \`motion.span\` keyed by setIdx, className "block", \`initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}\`, \`animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}\`, \`exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }}\`, \`transition={{ type: 'spring', duration: 0.35, bounce: 0 }}\`, text \`{currentSet.label}\`.

## Typography
- Font: project default sans-serif
- Sizes: 20px
- Weights: 700`,
}
