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

Create a React client component named \`GlassTabBar\`, a glass-morphism pill tab bar with five icon-and-label tabs and a sliding active glow.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png?updatedAt=1775223702866\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Tabs (Phosphor, \`weight="regular"\`):
- \`House\` / "Home" / #3A86FF
- \`Compass\` / "Explore" / #FF7B54
- \`PlusCircle\` / "Create" / #06D6A0
- \`ChatCircle\` / "Messages" / #FF5C8A
- \`User\` / "Profile" / #B388FF

Pill container: \`motion.div\` \`relative isolate flex w-[380px] items-center justify-around rounded-full px-5 py-2.5\`:
- \`background: rgba(255,255,255,0.07)\`
- \`border: 1px solid rgba(255,255,255,0.11)\`
- \`boxShadow: 0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)\`
- Separate non-animating blur layer (\`absolute inset-0 z-[-1] rounded-full\`): \`backdrop-filter: blur(24px) saturate(1.8)\`
- Entrance \`initial { y: 20 }\` → \`animate { y: 0 }\`, spring \`{ stiffness: 200, damping: 24 }\`.

Each tab: \`motion.button\` \`relative flex cursor-pointer flex-col items-center gap-px px-3 py-1\`, \`whileTap { scale: 0.85 }\`, state: \`hovered\` per index + global \`active\` index.

Active background: a \`motion.div layoutId="tab-glow"\` that slides between tabs via spring \`{ stiffness: 350, damping: 30 }\`:
- Middle tabs: \`-inset-x-3\`
- First tab (i===0): \`-left-5 -right-3\`
- Last tab (i===TABS.length-1): \`-left-3 -right-5\`
- \`-inset-y-1 rounded-full\`, \`background: rgba(255,255,255,0.1)\`, \`border: 1px solid rgba(255,255,255,0.08)\`

Edge tabs' inner content is shifted \`translateX(-4px)\` (first) or \`translateX(4px)\` (last) so it stays centered inside the asymmetric glow.

Icon: wrapped in a bare \`motion.div\` (no background or border) that animates \`{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }\` via spring \`{ stiffness: 400, damping: 20 }\`. Icon size 20, color: active → \`tab.color\`, hovered → \`rgba(255,255,255,0.7)\`, idle → \`rgba(255,255,255,0.32)\` (CSS transition).

Label under icon: \`text-[10px] font-medium\`, same color ramp as icon.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 10px
- Weights: 500`,

  'Lovable': `Create a React client component named \`GlassTabBar\` — a glass-morphism pill tab bar with five icon-and-label tabs and a sliding active glow.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png?updatedAt=1775223702866\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Tabs (Phosphor, \`weight="regular"\`):
- \`House\` / "Home" / #3A86FF
- \`Compass\` / "Explore" / #FF7B54
- \`PlusCircle\` / "Create" / #06D6A0
- \`ChatCircle\` / "Messages" / #FF5C8A
- \`User\` / "Profile" / #B388FF

Pill container: \`motion.div\` \`relative isolate flex w-[380px] items-center justify-around rounded-full px-5 py-2.5\` —
- \`background: rgba(255,255,255,0.07)\`
- \`border: 1px solid rgba(255,255,255,0.11)\`
- \`boxShadow: 0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)\`
- Separate non-animating blur layer (\`absolute inset-0 z-[-1] rounded-full\`): \`backdrop-filter: blur(24px) saturate(1.8)\`
- Entrance \`initial { y: 20 }\` → \`animate { y: 0 }\`, spring \`{ stiffness: 200, damping: 24 }\`.

Each tab: \`motion.button\` \`relative flex cursor-pointer flex-col items-center gap-px px-3 py-1\`, \`whileTap { scale: 0.85 }\`, state: \`hovered\` per index + global \`active\` index.

Active background: a \`motion.div layoutId="tab-glow"\` that slides between tabs via spring \`{ stiffness: 350, damping: 30 }\`:
- Middle tabs: \`-inset-x-3\`
- First tab (i===0): \`-left-5 -right-3\`
- Last tab (i===TABS.length-1): \`-left-3 -right-5\`
- \`-inset-y-1 rounded-full\`, \`background: rgba(255,255,255,0.1)\`, \`border: 1px solid rgba(255,255,255,0.08)\`

Edge tabs' inner content is shifted \`translateX(-4px)\` (first) or \`translateX(4px)\` (last) so it stays centered inside the asymmetric glow.

Icon: wrapped in a bare \`motion.div\` (no background or border) that animates \`{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }\` via spring \`{ stiffness: 400, damping: 20 }\`. Icon size 20, color: active → \`tab.color\`, hovered → \`rgba(255,255,255,0.7)\`, idle → \`rgba(255,255,255,0.32)\` (CSS transition).

Label under icon: \`text-[10px] font-medium\`, same color ramp as icon.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 10px
- Weights: 500`,

  'V0': `Create a React client component named \`GlassTabBar\` — a glass-morphism pill tab bar with five icon-and-label tabs and a sliding active glow.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png?updatedAt=1775223702866\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Tabs (Phosphor, \`weight="regular"\`):
- \`House\` / "Home" / #3A86FF
- \`Compass\` / "Explore" / #FF7B54
- \`PlusCircle\` / "Create" / #06D6A0
- \`ChatCircle\` / "Messages" / #FF5C8A
- \`User\` / "Profile" / #B388FF

Pill container: \`motion.div\` \`relative isolate flex w-[380px] items-center justify-around rounded-full px-5 py-2.5\` —
- \`background: rgba(255,255,255,0.07)\`
- \`border: 1px solid rgba(255,255,255,0.11)\`
- \`boxShadow: 0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.07)\`
- Separate non-animating blur layer (\`absolute inset-0 z-[-1] rounded-full\`): \`backdrop-filter: blur(24px) saturate(1.8)\`
- Entrance \`initial { y: 20 }\` → \`animate { y: 0 }\`, spring \`{ stiffness: 200, damping: 24 }\`.

Each tab: \`motion.button\` \`relative flex cursor-pointer flex-col items-center gap-px px-3 py-1\`, \`whileTap { scale: 0.85 }\`, state: \`hovered\` per index + global \`active\` index.

Active background: a \`motion.div layoutId="tab-glow"\` that slides between tabs via spring \`{ stiffness: 350, damping: 30 }\`:
- Middle tabs: \`-inset-x-3\`
- First tab (i===0): \`-left-5 -right-3\`
- Last tab (i===TABS.length-1): \`-left-3 -right-5\`
- \`-inset-y-1 rounded-full\`, \`background: rgba(255,255,255,0.1)\`, \`border: 1px solid rgba(255,255,255,0.08)\`

Edge tabs' inner content is shifted \`translateX(-4px)\` (first) or \`translateX(4px)\` (last) so it stays centered inside the asymmetric glow.

Icon: wrapped in a bare \`motion.div\` (no background or border) that animates \`{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }\` via spring \`{ stiffness: 400, damping: 20 }\`. Icon size 20, color: active → \`tab.color\`, hovered → \`rgba(255,255,255,0.7)\`, idle → \`rgba(255,255,255,0.32)\` (CSS transition).

Label under icon: \`text-[10px] font-medium\`, same color ramp as icon.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 10px
- Weights: 500`,
}
