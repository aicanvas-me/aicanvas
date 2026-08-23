import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion

Root element: className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#1A1A19]"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named \`GlassToggle\`, a glass Preferences panel with five iOS-style toggle rows, each animating its track color and thumb position with Framer Motion springs.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Panel: 320px wide, \`rounded-3xl px-7 py-7 flex-col gap-5\`, glass:
- \`background: rgba(255,255,255,0.06)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)\`
- Separate \`z-[-1] rounded-3xl\` blur layer: \`backdrop-filter: blur(24px) saturate(1.6)\`
- Top edge highlight (\`absolute left-7 right-7 top-0 h-[1px]\` \`linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)\`)
- Entrance \`initial { y:20, scale:0.96 }\` → \`{ y:0, scale:1 }\`, spring \`{ stiffness: 200, damping: 22 }\`.

Header: \`<h3 className="text-base font-semibold text-white/80">Preferences</h3>\`.

Toggles (label, defaultOn, color, delay):
- "Dark Mode", true, #FF6BF5, 0.1
- "Notifications", true, #06D6A0, 0.15
- "Auto-Update", false, #FFBE0B, 0.2
- "Analytics", false, #FF7B54, 0.25
- "Haptic Feedback", true, #3A86FF, 0.3

Between each toggle row place a thin divider: \`h-[1px] w-full bg rgba(255,255,255,0.06)\`.

Each Toggle row: \`motion.div flex items-center justify-between\`, entrance \`{ opacity:0, x:-16 }\` → \`{ opacity:1, x:0 }\`, spring \`{ stiffness: 200, damping: 22, delay }\`.

Left column: label \`text-sm font-medium text-white/60\`; below it a small state text \`text-[11px]\`: "On" when on (color = toggle color), "Off" when off (color \`rgba(255,255,255,0.25)\`, opacity 0.5).

Right: button 56x32 \`rounded-full\`, whileTap scale 0.95.
- Use a \`useSpring(defaultOn ? 1 : 0, { stiffness: 300, damping: 22 })\` progress motion value, updated in a \`useEffect\` when \`on\` changes.
- \`useTransform(progress, [0,1], ['rgba(255,255,255,0.08)', '\${color}44'])\` → track background (motion value, cast string).
- \`useTransform(progress, [0,1], ['rgba(255,255,255,0.1)', '\${color}55'])\` → track border color.
- \`useTransform(progress, [0,1], [2, 26])\` → thumb x.
- \`useTransform(progress, [0,1], ['0 2px 8px rgba(0,0,0,0.3)', '0 2px 16px \${color}44'])\` → thumb shadow.
- When on, extra box-shadow \`0 0 20px \${color}15, inset 0 1px 2px rgba(0,0,0,0.1)\`; when off, \`inset 0 1px 2px rgba(0,0,0,0.2)\`.

Thumb: \`absolute top-1/2 h-6 w-6 rounded-full\`, \`y: '-50%'\`, x from motion value. Background when on: \`linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))\`; off: \`linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.5))\`. Inside thumb, a 2px inset div with \`linear-gradient(180deg, rgba(255,255,255,0.5), transparent 60%)\` as a highlight.

Glow behind thumb (motion.div inset-0 rounded-full): \`animate { opacity: on ? 0.3 : 0 }\`, \`background: radial-gradient(circle at 75% 50%, \${color}, transparent 70%)\`.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 14px, 16px
- Weights: 500, 600`,

  'Lovable': `Create a React client component named \`GlassToggle\` — a glass Preferences panel with five iOS-style toggle rows, each animating its track color and thumb position with Framer Motion springs.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Panel: 320px wide, \`rounded-3xl px-7 py-7 flex-col gap-5\`, glass —
- \`background: rgba(255,255,255,0.06)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)\`
- Separate \`z-[-1] rounded-3xl\` blur layer: \`backdrop-filter: blur(24px) saturate(1.6)\`
- Top edge highlight (\`absolute left-7 right-7 top-0 h-[1px]\` \`linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)\`)
- Entrance \`initial { y:20, scale:0.96 }\` → \`{ y:0, scale:1 }\`, spring \`{ stiffness: 200, damping: 22 }\`.

Header: \`<h3 className="text-base font-semibold text-white/80">Preferences</h3>\`.

Toggles (label, defaultOn, color, delay):
- "Dark Mode", true, #FF6BF5, 0.1
- "Notifications", true, #06D6A0, 0.15
- "Auto-Update", false, #FFBE0B, 0.2
- "Analytics", false, #FF7B54, 0.25
- "Haptic Feedback", true, #3A86FF, 0.3

Between each toggle row place a thin divider: \`h-[1px] w-full bg rgba(255,255,255,0.06)\`.

Each Toggle row: \`motion.div flex items-center justify-between\`, entrance \`{ opacity:0, x:-16 }\` → \`{ opacity:1, x:0 }\`, spring \`{ stiffness: 200, damping: 22, delay }\`.

Left column: label \`text-sm font-medium text-white/60\`; below it a small state text \`text-[11px]\` — "On" when on (color = toggle color), "Off" when off (color \`rgba(255,255,255,0.25)\`, opacity 0.5).

Right: button 56x32 \`rounded-full\`, whileTap scale 0.95.
- Use a \`useSpring(defaultOn ? 1 : 0, { stiffness: 300, damping: 22 })\` progress motion value, updated in a \`useEffect\` when \`on\` changes.
- \`useTransform(progress, [0,1], ['rgba(255,255,255,0.08)', '\${color}44'])\` → track background (motion value, cast string).
- \`useTransform(progress, [0,1], ['rgba(255,255,255,0.1)', '\${color}55'])\` → track border color.
- \`useTransform(progress, [0,1], [2, 26])\` → thumb x.
- \`useTransform(progress, [0,1], ['0 2px 8px rgba(0,0,0,0.3)', '0 2px 16px \${color}44'])\` → thumb shadow.
- When on, extra box-shadow \`0 0 20px \${color}15, inset 0 1px 2px rgba(0,0,0,0.1)\`; when off, \`inset 0 1px 2px rgba(0,0,0,0.2)\`.

Thumb: \`absolute top-1/2 h-6 w-6 rounded-full\`, \`y: '-50%'\`, x from motion value. Background when on: \`linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))\`; off: \`linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.5))\`. Inside thumb, a 2px inset div with \`linear-gradient(180deg, rgba(255,255,255,0.5), transparent 60%)\` as a highlight.

Glow behind thumb (motion.div inset-0 rounded-full): \`animate { opacity: on ? 0.3 : 0 }\`, \`background: radial-gradient(circle at 75% 50%, \${color}, transparent 70%)\`.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 14px, 16px
- Weights: 500, 600`,

  'V0': `Create a React client component named \`GlassToggle\` — a glass Preferences panel with five iOS-style toggle rows, each animating its track color and thumb position with Framer Motion springs.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Panel: 320px wide, \`rounded-3xl px-7 py-7 flex-col gap-5\`, glass —
- \`background: rgba(255,255,255,0.06)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)\`
- Separate \`z-[-1] rounded-3xl\` blur layer: \`backdrop-filter: blur(24px) saturate(1.6)\`
- Top edge highlight (\`absolute left-7 right-7 top-0 h-[1px]\` \`linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)\`)
- Entrance \`initial { y:20, scale:0.96 }\` → \`{ y:0, scale:1 }\`, spring \`{ stiffness: 200, damping: 22 }\`.

Header: \`<h3 className="text-base font-semibold text-white/80">Preferences</h3>\`.

Toggles (label, defaultOn, color, delay):
- "Dark Mode", true, #FF6BF5, 0.1
- "Notifications", true, #06D6A0, 0.15
- "Auto-Update", false, #FFBE0B, 0.2
- "Analytics", false, #FF7B54, 0.25
- "Haptic Feedback", true, #3A86FF, 0.3

Between each toggle row place a thin divider: \`h-[1px] w-full bg rgba(255,255,255,0.06)\`.

Each Toggle row: \`motion.div flex items-center justify-between\`, entrance \`{ opacity:0, x:-16 }\` → \`{ opacity:1, x:0 }\`, spring \`{ stiffness: 200, damping: 22, delay }\`.

Left column: label \`text-sm font-medium text-white/60\`; below it a small state text \`text-[11px]\` — "On" when on (color = toggle color), "Off" when off (color \`rgba(255,255,255,0.25)\`, opacity 0.5).

Right: button 56x32 \`rounded-full\`, whileTap scale 0.95.
- Use a \`useSpring(defaultOn ? 1 : 0, { stiffness: 300, damping: 22 })\` progress motion value, updated in a \`useEffect\` when \`on\` changes.
- \`useTransform(progress, [0,1], ['rgba(255,255,255,0.08)', '\${color}44'])\` → track background (motion value, cast string).
- \`useTransform(progress, [0,1], ['rgba(255,255,255,0.1)', '\${color}55'])\` → track border color.
- \`useTransform(progress, [0,1], [2, 26])\` → thumb x.
- \`useTransform(progress, [0,1], ['0 2px 8px rgba(0,0,0,0.3)', '0 2px 16px \${color}44'])\` → thumb shadow.
- When on, extra box-shadow \`0 0 20px \${color}15, inset 0 1px 2px rgba(0,0,0,0.1)\`; when off, \`inset 0 1px 2px rgba(0,0,0,0.2)\`.

Thumb: \`absolute top-1/2 h-6 w-6 rounded-full\`, \`y: '-50%'\`, x from motion value. Background when on: \`linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))\`; off: \`linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.5))\`. Inside thumb, a 2px inset div with \`linear-gradient(180deg, rgba(255,255,255,0.5), transparent 60%)\` as a highlight.

Glow behind thumb (motion.div inset-0 rounded-full): \`animate { opacity: on ? 0.3 : 0 }\`, \`background: radial-gradient(circle at 75% 50%, \${color}, transparent 70%)\`.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 14px, 16px
- Weights: 500, 600`,
}
