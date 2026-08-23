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

Create a React client component named \`GlassStepper\`, three frosted glass stepper pills (Quantity, Guests, Volume) with animated number transitions.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Three steppers side by side (wrap on mobile) with \`gap-5 px-4\`:
- "Quantity", min 0, max 10, step 1, initial 0, color #3A86FF, gradient "#3A86FF, #2962FF"
- "Guests",   min 1, max 8,  step 1, initial 1, color #FF5C8A, gradient "#FF5C8A, #FF1744"
- "Volume",   min 0, max 100, step 5, initial 50, color #06D6A0, gradient "#06D6A0, #00BFA5"

Each field: width 132px, flex-col.
- Label header row (\`mb-2 flex items-baseline justify-between px-1\`): label \`text-[10px] font-semibold uppercase tracking-widest text-white/40\`, value readout \`text-[10px] font-semibold tabular-nums\` color \`\${color}88\`, showing \`{value} / {max}\`.

Pill: \`relative isolate overflow-hidden rounded-2xl\` with glass:
- \`background: rgba(255,255,255,0.08)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)\`
- Separate \`z-[-1] rounded-2xl\` blur layer: \`backdrop-filter: blur(24px) saturate(1.8)\`
- Top edge highlight (\`absolute left-4 right-4 top-0 h-[1px]\` \`linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)\`)

Content row: \`relative z-10 flex items-stretch justify-between p-2\`.

Minus/Plus buttons: Phosphor \`Minus\`/\`Plus\` size 16 \`weight="regular"\`. 36px wide rounded-xl. Enabled: bg \`\${color}18\`, border \`\${color}22\`. Disabled (at min/max): bg \`\${color}0a\`, border \`\${color}0a\`, opacity 0.4, pointer-events none, icon color \`rgba(255,255,255,0.3)\`. \`whileHover { scale: 1.08 }\`, \`whileTap { scale: 0.88 }\`, spring \`{ stiffness: 300, damping: 20 }\` (skip when disabled or \`prefersReduced\`).

Number display: width 36, \`flex items-center justify-center overflow-hidden\`. Use \`AnimatePresence mode="popLayout" initial={false}\` with \`key={value}\` and a \`directionRef\` (1 for increment, -1 for decrement). Enter \`{ opacity: 0, y: direction * 24, scale: 0.5 }\`, animate \`{ opacity: 1, y: 0, scale: 1 }\`, exit \`{ opacity: 0, y: direction * -24, scale: 1.4 }\`, spring \`{ stiffness: 260, damping: 18 }\`. Text is \`text-base font-bold tabular-nums\` with a gradient clipped to text: \`linear-gradient(135deg, \${gradient})\`, \`WebkitBackgroundClip: 'text'\`, \`WebkitTextFillColor: 'transparent'\`.

Respect \`useReducedMotion\`: slideOffset becomes 0, and the enter/exit use \`duration: 0.15\`.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 16px
- Weights: 600, 700`,

  'Lovable': `Create a React client component named \`GlassStepper\` — three frosted glass stepper pills (Quantity, Guests, Volume) with animated number transitions.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Three steppers side by side (wrap on mobile) with \`gap-5 px-4\`:
- "Quantity", min 0, max 10, step 1, initial 0, color #3A86FF, gradient "#3A86FF, #2962FF"
- "Guests",   min 1, max 8,  step 1, initial 1, color #FF5C8A, gradient "#FF5C8A, #FF1744"
- "Volume",   min 0, max 100, step 5, initial 50, color #06D6A0, gradient "#06D6A0, #00BFA5"

Each field: width 132px, flex-col.
- Label header row (\`mb-2 flex items-baseline justify-between px-1\`): label \`text-[10px] font-semibold uppercase tracking-widest text-white/40\`, value readout \`text-[10px] font-semibold tabular-nums\` color \`\${color}88\`, showing \`{value} / {max}\`.

Pill: \`relative isolate overflow-hidden rounded-2xl\` with glass —
- \`background: rgba(255,255,255,0.08)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)\`
- Separate \`z-[-1] rounded-2xl\` blur layer: \`backdrop-filter: blur(24px) saturate(1.8)\`
- Top edge highlight (\`absolute left-4 right-4 top-0 h-[1px]\` \`linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)\`)

Content row: \`relative z-10 flex items-stretch justify-between p-2\`.

Minus/Plus buttons: Phosphor \`Minus\`/\`Plus\` size 16 \`weight="regular"\`. 36px wide rounded-xl. Enabled: bg \`\${color}18\`, border \`\${color}22\`. Disabled (at min/max): bg \`\${color}0a\`, border \`\${color}0a\`, opacity 0.4, pointer-events none, icon color \`rgba(255,255,255,0.3)\`. \`whileHover { scale: 1.08 }\`, \`whileTap { scale: 0.88 }\`, spring \`{ stiffness: 300, damping: 20 }\` (skip when disabled or \`prefersReduced\`).

Number display: width 36, \`flex items-center justify-center overflow-hidden\`. Use \`AnimatePresence mode="popLayout" initial={false}\` with \`key={value}\` and a \`directionRef\` (1 for increment, -1 for decrement). Enter \`{ opacity: 0, y: direction * 24, scale: 0.5 }\`, animate \`{ opacity: 1, y: 0, scale: 1 }\`, exit \`{ opacity: 0, y: direction * -24, scale: 1.4 }\`, spring \`{ stiffness: 260, damping: 18 }\`. Text is \`text-base font-bold tabular-nums\` with a gradient clipped to text: \`linear-gradient(135deg, \${gradient})\`, \`WebkitBackgroundClip: 'text'\`, \`WebkitTextFillColor: 'transparent'\`.

Respect \`useReducedMotion\`: slideOffset becomes 0, and the enter/exit use \`duration: 0.15\`.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 16px
- Weights: 600, 700`,

  'V0': `Create a React client component named \`GlassStepper\` — three frosted glass stepper pills (Quantity, Guests, Volume) with animated number transitions.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Three steppers side by side (wrap on mobile) with \`gap-5 px-4\`:
- "Quantity", min 0, max 10, step 1, initial 0, color #3A86FF, gradient "#3A86FF, #2962FF"
- "Guests",   min 1, max 8,  step 1, initial 1, color #FF5C8A, gradient "#FF5C8A, #FF1744"
- "Volume",   min 0, max 100, step 5, initial 50, color #06D6A0, gradient "#06D6A0, #00BFA5"

Each field: width 132px, flex-col.
- Label header row (\`mb-2 flex items-baseline justify-between px-1\`): label \`text-[10px] font-semibold uppercase tracking-widest text-white/40\`, value readout \`text-[10px] font-semibold tabular-nums\` color \`\${color}88\`, showing \`{value} / {max}\`.

Pill: \`relative isolate overflow-hidden rounded-2xl\` with glass —
- \`background: rgba(255,255,255,0.08)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)\`
- Separate \`z-[-1] rounded-2xl\` blur layer: \`backdrop-filter: blur(24px) saturate(1.8)\`
- Top edge highlight (\`absolute left-4 right-4 top-0 h-[1px]\` \`linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)\`)

Content row: \`relative z-10 flex items-stretch justify-between p-2\`.

Minus/Plus buttons: Phosphor \`Minus\`/\`Plus\` size 16 \`weight="regular"\`. 36px wide rounded-xl. Enabled: bg \`\${color}18\`, border \`\${color}22\`. Disabled (at min/max): bg \`\${color}0a\`, border \`\${color}0a\`, opacity 0.4, pointer-events none, icon color \`rgba(255,255,255,0.3)\`. \`whileHover { scale: 1.08 }\`, \`whileTap { scale: 0.88 }\`, spring \`{ stiffness: 300, damping: 20 }\` (skip when disabled or \`prefersReduced\`).

Number display: width 36, \`flex items-center justify-center overflow-hidden\`. Use \`AnimatePresence mode="popLayout" initial={false}\` with \`key={value}\` and a \`directionRef\` (1 for increment, -1 for decrement). Enter \`{ opacity: 0, y: direction * 24, scale: 0.5 }\`, animate \`{ opacity: 1, y: 0, scale: 1 }\`, exit \`{ opacity: 0, y: direction * -24, scale: 1.4 }\`, spring \`{ stiffness: 260, damping: 18 }\`. Text is \`text-base font-bold tabular-nums\` with a gradient clipped to text: \`linear-gradient(135deg, \${gradient})\`, \`WebkitBackgroundClip: 'text'\`, \`WebkitTextFillColor: 'transparent'\`.

Respect \`useReducedMotion\`: slideOffset becomes 0, and the enter/exit use \`duration: 0.15\`.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 16px
- Weights: 600, 700`,
}
