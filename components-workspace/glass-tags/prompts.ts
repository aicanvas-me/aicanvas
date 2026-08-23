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

Create a React client component named \`GlassTags\`, a wrapped row of glass-morphism tag pills with individually colored selection states.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%203%20(1).png?updatedAt=1775226815629\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Tags (label, color):
- Design #FF9A3C, Development #FFBE0B, Motion #FF6BF5, AI #FF7B54, 3D #DC5A28, Typography #FFD166, Branding #FF6680, iOS #FF9A3C, WebGL #FFBE0B, React #FF7B54, Figma #FF6BF5, Prototyping #FFD166

Container: \`relative flex w-full max-w-sm flex-wrap justify-center gap-2 px-4 sm:max-w-md sm:gap-3 sm:px-6\`.

Each tag: \`motion.button\` with per-tag \`selected\` and \`hovered\` state. Entrance \`initial { scale: 0.8, y: 12 }\` → \`animate { scale: 1, y: 0 }\`, spring \`{ stiffness: 260, damping: 20, delay: i * 0.04 }\`. \`whileHover { scale: 1.05 }\`, \`whileTap { scale: 0.94 }\`. Click toggles selected.

Pill: \`relative isolate cursor-pointer rounded-full px-4 py-2 sm:px-5 sm:py-2.5\`. Style depends on selected/hovered:
- Selected: \`background: linear-gradient(135deg, \${color}33, \${color}18)\`; \`border: 1px solid \${color}55\`; \`boxShadow: 0 4px 24px \${color}30, inset 0 1px 0 rgba(255,255,255,0.12)\`
- Hover (not selected): bg \`rgba(255,255,255,0.13)\`, border \`rgba(255,255,255,0.24)\`, shadow \`0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.18)\`
- Idle: bg \`rgba(255,255,255,0.08)\`, border \`rgba(255,255,255,0.12)\`, shadow \`0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)\`
- CSS transition: \`background 0.2s ease, border 0.2s ease, box-shadow 0.2s ease\`

Separate non-animating blur layer (\`absolute inset-0 z-[-1] rounded-full\`): \`backdrop-filter: blur(24px) saturate(1.8)\`.

Selection glow (motion.div): absolute inset-0 rounded-full, \`background: radial-gradient(circle at center, \${color}, transparent 70%)\`, \`animate { opacity: selected ? 0.15 : 0 }\`, \`duration: 0.3\`.

Inner row: \`relative z-10 flex items-center gap-2\`. Fixed-width 14x14 slot containing two overlapping elements: a motion dot (2x2 centered, bg \`color\`) that scales to 0 and fades when selected, and when selected an \`<motion.svg>\` check icon that scales in with a spring \`{ stiffness: 500, damping: 25 }\` and draws the path (\`d="M3 7.5L5.5 10L11 4"\`) via \`pathLength\` 0 → 1, \`duration: 0.25, delay: 0.1\`, stroke = tag color, strokeWidth 2.

Label: \`text-xs font-semibold sm:text-sm\`, color \`rgba(255,255,255,0.5)\` → hover \`0.78\` → selected \`0.95\`, CSS transition color 0.2s.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 12px, 14px
- Weights: 600`,

  'Lovable': `Create a React client component named \`GlassTags\` — a wrapped row of glass-morphism tag pills with individually colored selection states.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%203%20(1).png?updatedAt=1775226815629\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Tags (label, color):
- Design #FF9A3C, Development #FFBE0B, Motion #FF6BF5, AI #FF7B54, 3D #DC5A28, Typography #FFD166, Branding #FF6680, iOS #FF9A3C, WebGL #FFBE0B, React #FF7B54, Figma #FF6BF5, Prototyping #FFD166

Container: \`relative flex w-full max-w-sm flex-wrap justify-center gap-2 px-4 sm:max-w-md sm:gap-3 sm:px-6\`.

Each tag: \`motion.button\` with per-tag \`selected\` and \`hovered\` state. Entrance \`initial { scale: 0.8, y: 12 }\` → \`animate { scale: 1, y: 0 }\`, spring \`{ stiffness: 260, damping: 20, delay: i * 0.04 }\`. \`whileHover { scale: 1.05 }\`, \`whileTap { scale: 0.94 }\`. Click toggles selected.

Pill: \`relative isolate cursor-pointer rounded-full px-4 py-2 sm:px-5 sm:py-2.5\`. Style depends on selected/hovered:
- Selected: \`background: linear-gradient(135deg, \${color}33, \${color}18)\`; \`border: 1px solid \${color}55\`; \`boxShadow: 0 4px 24px \${color}30, inset 0 1px 0 rgba(255,255,255,0.12)\`
- Hover (not selected): bg \`rgba(255,255,255,0.13)\`, border \`rgba(255,255,255,0.24)\`, shadow \`0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.18)\`
- Idle: bg \`rgba(255,255,255,0.08)\`, border \`rgba(255,255,255,0.12)\`, shadow \`0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)\`
- CSS transition: \`background 0.2s ease, border 0.2s ease, box-shadow 0.2s ease\`

Separate non-animating blur layer (\`absolute inset-0 z-[-1] rounded-full\`): \`backdrop-filter: blur(24px) saturate(1.8)\`.

Selection glow (motion.div): absolute inset-0 rounded-full, \`background: radial-gradient(circle at center, \${color}, transparent 70%)\`, \`animate { opacity: selected ? 0.15 : 0 }\`, \`duration: 0.3\`.

Inner row: \`relative z-10 flex items-center gap-2\`. Fixed-width 14x14 slot containing two overlapping elements: a motion dot (2x2 centered, bg \`color\`) that scales to 0 and fades when selected, and when selected an \`<motion.svg>\` check icon that scales in with a spring \`{ stiffness: 500, damping: 25 }\` and draws the path (\`d="M3 7.5L5.5 10L11 4"\`) via \`pathLength\` 0 → 1, \`duration: 0.25, delay: 0.1\`, stroke = tag color, strokeWidth 2.

Label: \`text-xs font-semibold sm:text-sm\`, color \`rgba(255,255,255,0.5)\` → hover \`0.78\` → selected \`0.95\`, CSS transition color 0.2s.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 12px, 14px
- Weights: 600`,

  'V0': `Create a React client component named \`GlassTags\` — a wrapped row of glass-morphism tag pills with individually colored selection states.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%203%20(1).png?updatedAt=1775226815629\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Tags (label, color):
- Design #FF9A3C, Development #FFBE0B, Motion #FF6BF5, AI #FF7B54, 3D #DC5A28, Typography #FFD166, Branding #FF6680, iOS #FF9A3C, WebGL #FFBE0B, React #FF7B54, Figma #FF6BF5, Prototyping #FFD166

Container: \`relative flex w-full max-w-sm flex-wrap justify-center gap-2 px-4 sm:max-w-md sm:gap-3 sm:px-6\`.

Each tag: \`motion.button\` with per-tag \`selected\` and \`hovered\` state. Entrance \`initial { scale: 0.8, y: 12 }\` → \`animate { scale: 1, y: 0 }\`, spring \`{ stiffness: 260, damping: 20, delay: i * 0.04 }\`. \`whileHover { scale: 1.05 }\`, \`whileTap { scale: 0.94 }\`. Click toggles selected.

Pill: \`relative isolate cursor-pointer rounded-full px-4 py-2 sm:px-5 sm:py-2.5\`. Style depends on selected/hovered:
- Selected: \`background: linear-gradient(135deg, \${color}33, \${color}18)\`; \`border: 1px solid \${color}55\`; \`boxShadow: 0 4px 24px \${color}30, inset 0 1px 0 rgba(255,255,255,0.12)\`
- Hover (not selected): bg \`rgba(255,255,255,0.13)\`, border \`rgba(255,255,255,0.24)\`, shadow \`0 6px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.18)\`
- Idle: bg \`rgba(255,255,255,0.08)\`, border \`rgba(255,255,255,0.12)\`, shadow \`0 4px 16px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)\`
- CSS transition: \`background 0.2s ease, border 0.2s ease, box-shadow 0.2s ease\`

Separate non-animating blur layer (\`absolute inset-0 z-[-1] rounded-full\`): \`backdrop-filter: blur(24px) saturate(1.8)\`.

Selection glow (motion.div): absolute inset-0 rounded-full, \`background: radial-gradient(circle at center, \${color}, transparent 70%)\`, \`animate { opacity: selected ? 0.15 : 0 }\`, \`duration: 0.3\`.

Inner row: \`relative z-10 flex items-center gap-2\`. Fixed-width 14x14 slot containing two overlapping elements: a motion dot (2x2 centered, bg \`color\`) that scales to 0 and fades when selected, and when selected an \`<motion.svg>\` check icon that scales in with a spring \`{ stiffness: 500, damping: 25 }\` and draws the path (\`d="M3 7.5L5.5 10L11 4"\`) via \`pathLength\` 0 → 1, \`duration: 0.25, delay: 0.1\`, stroke = tag color, strokeWidth 2.

Label: \`text-xs font-semibold sm:text-sm\`, color \`rgba(255,255,255,0.5)\` → hover \`0.78\` → selected \`0.95\`, CSS transition color 0.2s.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 12px, 14px
- Weights: 600`,
}
