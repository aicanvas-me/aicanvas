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

Create a React client component named \`GlassSidebar\`, a glass-morphism vertical sidebar that springs between a collapsed icon rail and an expanded label state.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: full-bleed \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20pink%20Flower%20%20(1).png\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Constants:
- \`COLLAPSED_WIDTH = 64\`, \`EXPANDED_WIDTH = 220\`
- \`ICON_TILE_SIZE = 44\`, \`TOGGLE_BUTTON_HEIGHT = 36\`

Nav items (Phosphor, \`weight="regular"\`):
- \`House\` / "Home" / #3A86FF
- \`MagnifyingGlass\` / "Search" / #B388FF
- \`Folders\` / "Projects" / #FFBE0B
- \`Bell\` / "Notifications" / #FF5C8A
- \`ChartLine\` / "Analytics" / #06D6A0
- \`Gear\` / "Settings" / #C9A96E
- \`User\` / "Profile" / #FF7B54

Panel: \`rounded-3xl px-2.5 py-3\`, glass:
- \`background: rgba(255,255,255,0.06)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)\`
- separate absolute \`z-[-1]\` blur layer: \`backdrop-filter: blur(24px) saturate(1.8)\`

Width is driven by a \`useSpring(COLLAPSED_WIDTH, { stiffness: 280, damping: 26 })\`. Entrance: \`initial { x: -20 }\` → \`animate { x: 0 }\`, spring \`{ stiffness: 200, damping: 22, delay: 0.1 }\`. Wrap the panel in a fixed-width \`EXPANDED_WIDTH\` container so it expands rightward from a stable left edge.

Each nav row:
- \`motion.button\` \`onClick\` sets active index; hover state local. \`animate { scale: hovered ? (isOpen ? 1.08 : 1.15) : 1, x: hovered ? (isOpen ? 0 : 3) : 0 }\`, \`whileTap { scale: 0.90 }\`, spring \`{ stiffness: 320, damping: 20 }\`.
- 44x44 tinted icon tile, \`rounded-xl\`. Active: bg \`\${color}28\`, border \`\${color}44\`. Inactive: bg \`\${color}18\`, border \`\${color}22\`. Icon size 20.
- Label (only when \`isOpen\`, \`AnimatePresence\`): \`text-sm font-semibold\`, color \`rgba(255,255,255,0.75)\` (or \`item.color\` when active). Enter \`{ opacity:0, x:-8 }\` → \`{ opacity:1, x:0 }\` with \`duration: 0.18, delay: 0.18 + index * 0.03\`, exit fast \`duration: 0.08\`.
- When collapsed + hovered, show a tooltip on the right (\`left-[calc(100%+10px)]\`): same glass + blur \`rounded-lg px-3 py-1.5 text-xs font-semibold text-white/90\`, fades \`{ opacity:0, x:-6 }\`.
- Reset \`hovered\` to false whenever \`isOpen\` changes to avoid stuck tooltips.

Divider: \`h-[1px]\` full-width \`rgba(255,255,255,0.1)\`.

Toggle button: 44x36 \`rounded-2xl\`, bg \`rgba(255,255,255,0.08)\`, border \`rgba(255,255,255,0.12)\`. Hover \`scale: 1.08\`, tap \`0.90\`, spring \`{ stiffness: 300, damping: 20 }\`. Contains \`AnimatePresence mode="wait"\`: \`ArrowRight\` (collapsed) or \`ArrowLeft\` (open), each spinning 90° on enter/exit with \`duration: 0.18\`. Container justifies center when collapsed, start (\`px-1\`) when open.

Clicking toggle flips \`isOpen\` and calls \`widthSpring.set(next ? EXPANDED_WIDTH : COLLAPSED_WIDTH)\`.

Use Manrope ('font-sans').

## Typography
- Font: project default sans-serif
- Sizes: 12px, 14px
- Weights: 600`,

  'Lovable': `Create a React client component named \`GlassSidebar\` — a glass-morphism vertical sidebar that springs between a collapsed icon rail and an expanded label state.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: full-bleed \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20pink%20Flower%20%20(1).png\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Constants:
- \`COLLAPSED_WIDTH = 64\`, \`EXPANDED_WIDTH = 220\`
- \`ICON_TILE_SIZE = 44\`, \`TOGGLE_BUTTON_HEIGHT = 36\`

Nav items (Phosphor, \`weight="regular"\`):
- \`House\` / "Home" / #3A86FF
- \`MagnifyingGlass\` / "Search" / #B388FF
- \`Folders\` / "Projects" / #FFBE0B
- \`Bell\` / "Notifications" / #FF5C8A
- \`ChartLine\` / "Analytics" / #06D6A0
- \`Gear\` / "Settings" / #C9A96E
- \`User\` / "Profile" / #FF7B54

Panel: \`rounded-3xl px-2.5 py-3\`, glass —
- \`background: rgba(255,255,255,0.06)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)\`
- separate absolute \`z-[-1]\` blur layer: \`backdrop-filter: blur(24px) saturate(1.8)\`

Width is driven by a \`useSpring(COLLAPSED_WIDTH, { stiffness: 280, damping: 26 })\`. Entrance: \`initial { x: -20 }\` → \`animate { x: 0 }\`, spring \`{ stiffness: 200, damping: 22, delay: 0.1 }\`. Wrap the panel in a fixed-width \`EXPANDED_WIDTH\` container so it expands rightward from a stable left edge.

Each nav row:
- \`motion.button\` \`onClick\` sets active index; hover state local. \`animate { scale: hovered ? (isOpen ? 1.08 : 1.15) : 1, x: hovered ? (isOpen ? 0 : 3) : 0 }\`, \`whileTap { scale: 0.90 }\`, spring \`{ stiffness: 320, damping: 20 }\`.
- 44x44 tinted icon tile, \`rounded-xl\`. Active: bg \`\${color}28\`, border \`\${color}44\`. Inactive: bg \`\${color}18\`, border \`\${color}22\`. Icon size 20.
- Label (only when \`isOpen\`, \`AnimatePresence\`): \`text-sm font-semibold\`, color \`rgba(255,255,255,0.75)\` (or \`item.color\` when active). Enter \`{ opacity:0, x:-8 }\` → \`{ opacity:1, x:0 }\` with \`duration: 0.18, delay: 0.18 + index * 0.03\`, exit fast \`duration: 0.08\`.
- When collapsed + hovered, show a tooltip on the right (\`left-[calc(100%+10px)]\`): same glass + blur \`rounded-lg px-3 py-1.5 text-xs font-semibold text-white/90\`, fades \`{ opacity:0, x:-6 }\`.
- Reset \`hovered\` to false whenever \`isOpen\` changes to avoid stuck tooltips.

Divider: \`h-[1px]\` full-width \`rgba(255,255,255,0.1)\`.

Toggle button: 44x36 \`rounded-2xl\`, bg \`rgba(255,255,255,0.08)\`, border \`rgba(255,255,255,0.12)\`. Hover \`scale: 1.08\`, tap \`0.90\`, spring \`{ stiffness: 300, damping: 20 }\`. Contains \`AnimatePresence mode="wait"\`: \`ArrowRight\` (collapsed) or \`ArrowLeft\` (open), each spinning 90° on enter/exit with \`duration: 0.18\`. Container justifies center when collapsed, start (\`px-1\`) when open.

Clicking toggle flips \`isOpen\` and calls \`widthSpring.set(next ? EXPANDED_WIDTH : COLLAPSED_WIDTH)\`.

Use Manrope ('font-sans').

## Typography
- Font: project default sans-serif
- Sizes: 12px, 14px
- Weights: 600`,

  'V0': `Create a React client component named \`GlassSidebar\` — a glass-morphism vertical sidebar that springs between a collapsed icon rail and an expanded label state.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: full-bleed \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20pink%20Flower%20%20(1).png\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Constants:
- \`COLLAPSED_WIDTH = 64\`, \`EXPANDED_WIDTH = 220\`
- \`ICON_TILE_SIZE = 44\`, \`TOGGLE_BUTTON_HEIGHT = 36\`

Nav items (Phosphor, \`weight="regular"\`):
- \`House\` / "Home" / #3A86FF
- \`MagnifyingGlass\` / "Search" / #B388FF
- \`Folders\` / "Projects" / #FFBE0B
- \`Bell\` / "Notifications" / #FF5C8A
- \`ChartLine\` / "Analytics" / #06D6A0
- \`Gear\` / "Settings" / #C9A96E
- \`User\` / "Profile" / #FF7B54

Panel: \`rounded-3xl px-2.5 py-3\`, glass —
- \`background: rgba(255,255,255,0.06)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)\`
- separate absolute \`z-[-1]\` blur layer: \`backdrop-filter: blur(24px) saturate(1.8)\`

Width is driven by a \`useSpring(COLLAPSED_WIDTH, { stiffness: 280, damping: 26 })\`. Entrance: \`initial { x: -20 }\` → \`animate { x: 0 }\`, spring \`{ stiffness: 200, damping: 22, delay: 0.1 }\`. Wrap the panel in a fixed-width \`EXPANDED_WIDTH\` container so it expands rightward from a stable left edge.

Each nav row:
- \`motion.button\` \`onClick\` sets active index; hover state local. \`animate { scale: hovered ? (isOpen ? 1.08 : 1.15) : 1, x: hovered ? (isOpen ? 0 : 3) : 0 }\`, \`whileTap { scale: 0.90 }\`, spring \`{ stiffness: 320, damping: 20 }\`.
- 44x44 tinted icon tile, \`rounded-xl\`. Active: bg \`\${color}28\`, border \`\${color}44\`. Inactive: bg \`\${color}18\`, border \`\${color}22\`. Icon size 20.
- Label (only when \`isOpen\`, \`AnimatePresence\`): \`text-sm font-semibold\`, color \`rgba(255,255,255,0.75)\` (or \`item.color\` when active). Enter \`{ opacity:0, x:-8 }\` → \`{ opacity:1, x:0 }\` with \`duration: 0.18, delay: 0.18 + index * 0.03\`, exit fast \`duration: 0.08\`.
- When collapsed + hovered, show a tooltip on the right (\`left-[calc(100%+10px)]\`): same glass + blur \`rounded-lg px-3 py-1.5 text-xs font-semibold text-white/90\`, fades \`{ opacity:0, x:-6 }\`.
- Reset \`hovered\` to false whenever \`isOpen\` changes to avoid stuck tooltips.

Divider: \`h-[1px]\` full-width \`rgba(255,255,255,0.1)\`.

Toggle button: 44x36 \`rounded-2xl\`, bg \`rgba(255,255,255,0.08)\`, border \`rgba(255,255,255,0.12)\`. Hover \`scale: 1.08\`, tap \`0.90\`, spring \`{ stiffness: 300, damping: 20 }\`. Contains \`AnimatePresence mode="wait"\`: \`ArrowRight\` (collapsed) or \`ArrowLeft\` (open), each spinning 90° on enter/exit with \`duration: 0.18\`. Container justifies center when collapsed, start (\`px-1\`) when open.

Clicking toggle flips \`isOpen\` and calls \`widthSpring.set(next ? EXPANDED_WIDTH : COLLAPSED_WIDTH)\`.

Use Manrope ('font-sans').

## Typography
- Font: project default sans-serif
- Sizes: 12px, 14px
- Weights: 600`,
}
