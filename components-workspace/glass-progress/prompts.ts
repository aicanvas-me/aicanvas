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

Create a React client component named \`GlassProgress\`, a floating glass panel containing four animated progress bars over an ethereal orange flower background, with a circular refresh button below that replays the animation.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks or utility functions (one inner \`GlassProgressBar\` subcomponent is OK). 'use client' at the top. No 'any' types.

## Background
Full-bleed \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133\`, \`opacity-60 object-cover absolute inset-0\`, over \`bg-[#1A1A19]\`.

## Bars (label, value %, color, gradient, delay ms)
1. Storage  72  #3A86FF  "#3A86FF, #2962FF"  200
2. Upload   45  #FF5C8A  "#FF5C8A, #FF1744"  400
3. Battery  88  #06D6A0  "#06D6A0, #00BFA5"  600
4. Memory   30  #FFBE0B  "#FFBE0B, #FF9800"  800

On mount (and on replay) set all values to 0, then for each bar schedule \`setTimeout(() => setValues(i) = bar.value, bar.delay)\`. Clear all timeouts on cleanup.

## Glass panel
\`rounded-3xl\`, background \`rgba(255,255,255,0.06)\`, border \`1px solid rgba(255,255,255,0.1)\`, shadow \`0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)\`. Separate non-animating blur layer (absolute inset-0 z-[-1] rounded-3xl) with \`backdrop-filter: blur(24px) saturate(1.8)\` (+Webkit). Top-edge highlight: absolute left-8 right-8 top-0 h-[1px] \`linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)\`. Panel entrance: \`initial { scale: 0.92, y: 16 }\`, \`animate { scale: 1, y: 0 }\`, spring \`{ stiffness: 300, damping: 26 }\`. Inner padding \`px-6 py-6\`, bars stacked \`flex flex-col gap-5\`.

## Progress bar
Label row (\`mb-2 flex items-center justify-between px-1\`): left label \`text-[10px] font-semibold uppercase tracking-widest text-white/40\`; right percent \`text-[10px] font-semibold tabular-nums\` in color \`\${color}88\`. Track: \`relative h-2 w-full rounded-full overflow-hidden\` with the same glass panel style + inner blur layer. Fill: \`motion.div\` absolute bottom-0 left-0 top-0 rounded-full, \`background: linear-gradient(90deg, \${gradient})\`, \`filter: drop-shadow(0 0 \${glowSize}px \${color}\${glowAlpha})\` where \`glowSize = 4 + value * 0.08\` and \`glowAlpha = (40 + value * 0.4)\` as a 2-char hex. Initial \`{ width: '0%' }\`, animate \`{ width: \`\${value}%\`, opacity: [0.85, 1, 0.85] }\`, transition \`{ width: { type: 'spring', stiffness: 200, damping: 24 }, opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }\`. Percentage counter uses \`useSpring(0, { stiffness: 80, damping: 20 })\` driven to \`value\` via \`useEffect\`; read with \`useMotionValueEvent\` and \`Math.round\` into local state for display. Respect \`useReducedMotion()\`: fallback to 0.3s width transition with no pulse.

## Refresh button
Below panel, \`h-10 w-10 rounded-full\` glass (\`rgba(255,255,255,0.06)\` bg, \`1px solid rgba(255,255,255,0.1)\` border). \`whileHover { scale: 1.12, background: 'rgba(255,255,255,0.12)' }\`, \`whileTap { scale: 0.9, rotate: -90 }\`, spring \`{ stiffness: 400, damping: 20 }\`. Icon: Phosphor \`ArrowClockwise\` size 18 weight="regular" \`text-white/50\`. \`aria-label="Replay animation"\`. Click resets values to [0,0,0,0] and bumps a \`resetKey\` that re-runs the staggered \`setTimeout\` effect.

Root: \`relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]\`. Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 10px
- Weights: 600`,

  'Lovable': `Create a React client component named \`GlassProgress\` — a floating glass panel containing four animated progress bars over an ethereal orange flower background, with a circular refresh button below that replays the animation.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks or utility functions (one inner \`GlassProgressBar\` subcomponent is OK). 'use client' at the top. No 'any' types.

## Background
Full-bleed \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133\`, \`opacity-60 object-cover absolute inset-0\`, over \`bg-[#1A1A19]\`.

## Bars (label, value %, color, gradient, delay ms)
1. Storage  72  #3A86FF  "#3A86FF, #2962FF"  200
2. Upload   45  #FF5C8A  "#FF5C8A, #FF1744"  400
3. Battery  88  #06D6A0  "#06D6A0, #00BFA5"  600
4. Memory   30  #FFBE0B  "#FFBE0B, #FF9800"  800

On mount (and on replay) set all values to 0, then for each bar schedule \`setTimeout(() => setValues(i) = bar.value, bar.delay)\`. Clear all timeouts on cleanup.

## Glass panel
\`rounded-3xl\`, background \`rgba(255,255,255,0.06)\`, border \`1px solid rgba(255,255,255,0.1)\`, shadow \`0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)\`. Separate non-animating blur layer (absolute inset-0 z-[-1] rounded-3xl) with \`backdrop-filter: blur(24px) saturate(1.8)\` (+Webkit). Top-edge highlight: absolute left-8 right-8 top-0 h-[1px] \`linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)\`. Panel entrance: \`initial { scale: 0.92, y: 16 }\`, \`animate { scale: 1, y: 0 }\`, spring \`{ stiffness: 300, damping: 26 }\`. Inner padding \`px-6 py-6\`, bars stacked \`flex flex-col gap-5\`.

## Progress bar
Label row (\`mb-2 flex items-center justify-between px-1\`): left label \`text-[10px] font-semibold uppercase tracking-widest text-white/40\`; right percent \`text-[10px] font-semibold tabular-nums\` in color \`\${color}88\`. Track: \`relative h-2 w-full rounded-full overflow-hidden\` with the same glass panel style + inner blur layer. Fill: \`motion.div\` absolute bottom-0 left-0 top-0 rounded-full, \`background: linear-gradient(90deg, \${gradient})\`, \`filter: drop-shadow(0 0 \${glowSize}px \${color}\${glowAlpha})\` where \`glowSize = 4 + value * 0.08\` and \`glowAlpha = (40 + value * 0.4)\` as a 2-char hex. Initial \`{ width: '0%' }\`, animate \`{ width: \`\${value}%\`, opacity: [0.85, 1, 0.85] }\`, transition \`{ width: { type: 'spring', stiffness: 200, damping: 24 }, opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }\`. Percentage counter uses \`useSpring(0, { stiffness: 80, damping: 20 })\` driven to \`value\` via \`useEffect\`; read with \`useMotionValueEvent\` and \`Math.round\` into local state for display. Respect \`useReducedMotion()\` — fallback to 0.3s width transition with no pulse.

## Refresh button
Below panel, \`h-10 w-10 rounded-full\` glass (\`rgba(255,255,255,0.06)\` bg, \`1px solid rgba(255,255,255,0.1)\` border). \`whileHover { scale: 1.12, background: 'rgba(255,255,255,0.12)' }\`, \`whileTap { scale: 0.9, rotate: -90 }\`, spring \`{ stiffness: 400, damping: 20 }\`. Icon: Phosphor \`ArrowClockwise\` size 18 weight="regular" \`text-white/50\`. \`aria-label="Replay animation"\`. Click resets values to [0,0,0,0] and bumps a \`resetKey\` that re-runs the staggered \`setTimeout\` effect.

Root: \`relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]\`. Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 10px
- Weights: 600`,

  'V0': `Create a React client component named \`GlassProgress\` — a floating glass panel containing four animated progress bars over an ethereal orange flower background, with a circular refresh button below that replays the animation.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks or utility functions (one inner \`GlassProgressBar\` subcomponent is OK). 'use client' at the top. No 'any' types.

## Background
Full-bleed \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133\`, \`opacity-60 object-cover absolute inset-0\`, over \`bg-[#1A1A19]\`.

## Bars (label, value %, color, gradient, delay ms)
1. Storage  72  #3A86FF  "#3A86FF, #2962FF"  200
2. Upload   45  #FF5C8A  "#FF5C8A, #FF1744"  400
3. Battery  88  #06D6A0  "#06D6A0, #00BFA5"  600
4. Memory   30  #FFBE0B  "#FFBE0B, #FF9800"  800

On mount (and on replay) set all values to 0, then for each bar schedule \`setTimeout(() => setValues(i) = bar.value, bar.delay)\`. Clear all timeouts on cleanup.

## Glass panel
\`rounded-3xl\`, background \`rgba(255,255,255,0.06)\`, border \`1px solid rgba(255,255,255,0.1)\`, shadow \`0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)\`. Separate non-animating blur layer (absolute inset-0 z-[-1] rounded-3xl) with \`backdrop-filter: blur(24px) saturate(1.8)\` (+Webkit). Top-edge highlight: absolute left-8 right-8 top-0 h-[1px] \`linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)\`. Panel entrance: \`initial { scale: 0.92, y: 16 }\`, \`animate { scale: 1, y: 0 }\`, spring \`{ stiffness: 300, damping: 26 }\`. Inner padding \`px-6 py-6\`, bars stacked \`flex flex-col gap-5\`.

## Progress bar
Label row (\`mb-2 flex items-center justify-between px-1\`): left label \`text-[10px] font-semibold uppercase tracking-widest text-white/40\`; right percent \`text-[10px] font-semibold tabular-nums\` in color \`\${color}88\`. Track: \`relative h-2 w-full rounded-full overflow-hidden\` with the same glass panel style + inner blur layer. Fill: \`motion.div\` absolute bottom-0 left-0 top-0 rounded-full, \`background: linear-gradient(90deg, \${gradient})\`, \`filter: drop-shadow(0 0 \${glowSize}px \${color}\${glowAlpha})\` where \`glowSize = 4 + value * 0.08\` and \`glowAlpha = (40 + value * 0.4)\` as a 2-char hex. Initial \`{ width: '0%' }\`, animate \`{ width: \`\${value}%\`, opacity: [0.85, 1, 0.85] }\`, transition \`{ width: { type: 'spring', stiffness: 200, damping: 24 }, opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }\`. Percentage counter uses \`useSpring(0, { stiffness: 80, damping: 20 })\` driven to \`value\` via \`useEffect\`; read with \`useMotionValueEvent\` and \`Math.round\` into local state for display. Respect \`useReducedMotion()\` — fallback to 0.3s width transition with no pulse.

## Refresh button
Below panel, \`h-10 w-10 rounded-full\` glass (\`rgba(255,255,255,0.06)\` bg, \`1px solid rgba(255,255,255,0.1)\` border). \`whileHover { scale: 1.12, background: 'rgba(255,255,255,0.12)' }\`, \`whileTap { scale: 0.9, rotate: -90 }\`, spring \`{ stiffness: 400, damping: 20 }\`. Icon: Phosphor \`ArrowClockwise\` size 18 weight="regular" \`text-white/50\`. \`aria-label="Replay animation"\`. Click resets values to [0,0,0,0] and bumps a \`resetKey\` that re-runs the staggered \`setTimeout\` effect.

Root: \`relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]\`. Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 10px
- Weights: 600`,
}
