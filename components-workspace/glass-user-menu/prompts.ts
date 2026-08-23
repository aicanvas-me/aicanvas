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

Create a React client component named \`GlassUserMenu\`, a glass user-menu trigger over an ethereal orange flower background that opens a frosted glass dropdown grouped into Account, Workspace, and a Log Out row.

Write this as a single self-contained React client component. Inline everything. One inner \`MenuItem\` and one inner \`LogOutItem\` subcomponent are OK. 'use client' at the top. No 'any' types.

## Background
\`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png?updatedAt=1775223702866\`, \`object-cover opacity-60\` over \`bg-[#1A1A19]\`. Root: \`relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]\`. Wrapper: \`relative flex flex-col items-center\` with \`marginTop: -150\`.

## Data
- USER: \`{ name: 'Jennifer Rivera', email: 'jennifer@studio.io', avatar: 'https://ik.imagekit.io/aitoolkit/Miscellaneous/Avatars/Silhouette%20Profile%20Against%20Gradient%20Background%201.webp' }\`
- MENU_GROUPS:
  - Account: Profile (User icon, #3A86FF), Settings (Gear icon, #B388FF)
  - Workspace: Team (Users icon, #06D6A0), Billing (CreditCard icon, #FFBE0B)
- Log Out row at the bottom: SignOut icon, color #FF5A5A, label "Log Out"

## Glass tokens (inline as constants)
\`glassPanel = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)' }\`
\`glassPanelBlur = { backdropFilter: 'blur(24px) saturate(1.8)', WebkitBackdropFilter: 'blur(24px) saturate(1.8)' }\`
\`ACTIVE_GLOW = '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1.5px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.08)'\`

## Trigger
\`motion.button\` \`relative isolate flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2.5\` with \`glassPanel\` style and a separate non-animating blur layer (absolute inset-0 z-[-1] rounded-2xl). \`whileHover { scale: 1.02 }\`, \`whileTap { scale: 0.97 }\`. Animate \`boxShadow\` between \`glassPanel.boxShadow\` and \`ACTIVE_GLOW\` based on \`open\`, spring \`{ stiffness: 300, damping: 26 }\`. Inside: 32×32 \`<img src={USER.avatar} alt={USER.name} className="h-8 w-8 shrink-0 rounded-full object-cover" />\`; name span \`text-sm font-semibold text-white/80\`; \`<CaretUpDown size={16} weight="regular" className="text-white/40" />\`. No animation wrapper. Click toggles \`open\`.

## Dropdown
\`AnimatePresence\` around a \`motion.div\` rendered when \`open\`. \`absolute left-full top-0 ml-2 w-[min(256px,calc(100vw-32px))] rounded-2xl p-2\` with style \`{ ...glassPanel, ...glassPanelBlur, transformOrigin: 'top left' }\`, opens to the right of the trigger, blur applied directly, no child blur div. Initial \`{ opacity: 0, scale: 0.95, x: -8, filter: 'blur(4px)' }\`, animate to \`{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }\`, exit reverse, transition spring \`{ stiffness: 350, damping: 28 }\`. Left-edge highlight: \`absolute bottom-6 left-0 top-6 w-[1px]\` background \`linear-gradient(180deg, transparent, rgba(255,255,255,0.18), transparent)\`.

For each group: \`<p className="mb-0.5 px-3 pt-1 text-[10px] font-semibold uppercase tracking-widest text-white/25">{group.label}</p>\`, then map items to \`<MenuItem />\`. After Account+Workspace, render a divider \`mx-2 my-1.5 h-[1px]\` background \`rgba(255,255,255,0.07)\`, then \`<LogOutItem />\`.

## MenuItem
Outer \`motion.div\` \`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5\` with \`minHeight: 44\`. Initial \`{ opacity: 0 }\`, animate \`{ opacity: 1 }\`, transition \`{ duration: 0.15, delay: 0.06 + index * 0.04 }\`. Track \`hovered\` per item with \`onMouseEnter/Leave\`. Inside: \`motion.button\` \`flex min-w-0 flex-1 cursor-pointer items-center gap-2.5\` with \`transformOrigin: 'left center'\`, animate \`{ x: hovered ? 3 : 0, scale: hovered ? 1.08 : 1 }\`, \`whileTap { scale: 0.90 }\`, transition spring \`{ stiffness: 320, damping: 20 }\`. Children: 32×32 \`rounded-xl\` icon badge \`background: \${color}18\`, \`border: 1px solid \${color}22\`, containing the icon at size 16 weight="regular" with \`color\` style; label span \`text-sm font-medium\` with color \`rgba(255,255,255,0.95)\` when hovered else \`rgba(255,255,255,0.70)\`, transition \`color 0.15s\`.

## LogOutItem
Same shape as MenuItem but red: badge background \`#FF5A5A18\` border \`#FF5A5A22\`, SignOut icon color \`#FF5A5A\`, label color \`rgba(255,90,90,0.95)\` hovered or \`rgba(255,90,90,0.70)\` idle.

## Outside-click close
Wrap dropdown in a \`ref\` div. \`useEffect\` while open: add \`mousedown\` and \`touchstart\` document listeners; if \`!ref.current.contains(target)\` set \`open = false\`. Cleanup removes both. No 'any' types: type the listener event as \`MouseEvent | TouchEvent\`.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 14px
- Weights: 500, 600`,

  'Lovable': `Create a React client component named \`GlassUserMenu\` — a glass user-menu trigger over an ethereal orange flower background that opens a frosted glass dropdown grouped into Account, Workspace, and a Log Out row.

Write this as a single self-contained React client component. Inline everything. One inner \`MenuItem\` and one inner \`LogOutItem\` subcomponent are OK. 'use client' at the top. No 'any' types.

## Background
\`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png?updatedAt=1775223702866\`, \`object-cover opacity-60\` over \`bg-[#1A1A19]\`. Root: \`relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]\`. Wrapper: \`relative flex flex-col items-center\` with \`marginTop: -150\`.

## Data
- USER: \`{ name: 'Jennifer Rivera', email: 'jennifer@studio.io', avatar: 'https://ik.imagekit.io/aitoolkit/Miscellaneous/Avatars/Silhouette%20Profile%20Against%20Gradient%20Background%201.webp' }\`
- MENU_GROUPS:
  - Account: Profile (User icon, #3A86FF), Settings (Gear icon, #B388FF)
  - Workspace: Team (Users icon, #06D6A0), Billing (CreditCard icon, #FFBE0B)
- Log Out row at the bottom: SignOut icon, color #FF5A5A, label "Log Out"

## Glass tokens (inline as constants)
\`glassPanel = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)' }\`
\`glassPanelBlur = { backdropFilter: 'blur(24px) saturate(1.8)', WebkitBackdropFilter: 'blur(24px) saturate(1.8)' }\`
\`ACTIVE_GLOW = '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1.5px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.08)'\`

## Trigger
\`motion.button\` \`relative isolate flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2.5\` with \`glassPanel\` style and a separate non-animating blur layer (absolute inset-0 z-[-1] rounded-2xl). \`whileHover { scale: 1.02 }\`, \`whileTap { scale: 0.97 }\`. Animate \`boxShadow\` between \`glassPanel.boxShadow\` and \`ACTIVE_GLOW\` based on \`open\`, spring \`{ stiffness: 300, damping: 26 }\`. Inside: 32×32 \`<img src={USER.avatar} alt={USER.name} className="h-8 w-8 shrink-0 rounded-full object-cover" />\`; name span \`text-sm font-semibold text-white/80\`; \`<CaretUpDown size={16} weight="regular" className="text-white/40" />\` — no animation wrapper. Click toggles \`open\`.

## Dropdown
\`AnimatePresence\` around a \`motion.div\` rendered when \`open\`. \`absolute left-full top-0 ml-2 w-[min(256px,calc(100vw-32px))] rounded-2xl p-2\` with style \`{ ...glassPanel, ...glassPanelBlur, transformOrigin: 'top left' }\` — opens to the right of the trigger, blur applied directly, no child blur div. Initial \`{ opacity: 0, scale: 0.95, x: -8, filter: 'blur(4px)' }\`, animate to \`{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }\`, exit reverse, transition spring \`{ stiffness: 350, damping: 28 }\`. Left-edge highlight: \`absolute bottom-6 left-0 top-6 w-[1px]\` background \`linear-gradient(180deg, transparent, rgba(255,255,255,0.18), transparent)\`.

For each group: \`<p className="mb-0.5 px-3 pt-1 text-[10px] font-semibold uppercase tracking-widest text-white/25">{group.label}</p>\`, then map items to \`<MenuItem />\`. After Account+Workspace, render a divider \`mx-2 my-1.5 h-[1px]\` background \`rgba(255,255,255,0.07)\`, then \`<LogOutItem />\`.

## MenuItem
Outer \`motion.div\` \`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5\` with \`minHeight: 44\`. Initial \`{ opacity: 0 }\`, animate \`{ opacity: 1 }\`, transition \`{ duration: 0.15, delay: 0.06 + index * 0.04 }\`. Track \`hovered\` per item with \`onMouseEnter/Leave\`. Inside: \`motion.button\` \`flex min-w-0 flex-1 cursor-pointer items-center gap-2.5\` with \`transformOrigin: 'left center'\`, animate \`{ x: hovered ? 3 : 0, scale: hovered ? 1.08 : 1 }\`, \`whileTap { scale: 0.90 }\`, transition spring \`{ stiffness: 320, damping: 20 }\`. Children: 32×32 \`rounded-xl\` icon badge \`background: \${color}18\`, \`border: 1px solid \${color}22\`, containing the icon at size 16 weight="regular" with \`color\` style; label span \`text-sm font-medium\` with color \`rgba(255,255,255,0.95)\` when hovered else \`rgba(255,255,255,0.70)\`, transition \`color 0.15s\`.

## LogOutItem
Same shape as MenuItem but red: badge background \`#FF5A5A18\` border \`#FF5A5A22\`, SignOut icon color \`#FF5A5A\`, label color \`rgba(255,90,90,0.95)\` hovered or \`rgba(255,90,90,0.70)\` idle.

## Outside-click close
Wrap dropdown in a \`ref\` div. \`useEffect\` while open: add \`mousedown\` and \`touchstart\` document listeners; if \`!ref.current.contains(target)\` set \`open = false\`. Cleanup removes both. No 'any' types — type the listener event as \`MouseEvent | TouchEvent\`.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 14px
- Weights: 500, 600`,

  'V0': `Create a React client component named \`GlassUserMenu\` — a glass user-menu trigger over an ethereal orange flower background that opens a frosted glass dropdown grouped into Account, Workspace, and a Log Out row.

Write this as a single self-contained React client component. Inline everything. One inner \`MenuItem\` and one inner \`LogOutItem\` subcomponent are OK. 'use client' at the top. No 'any' types.

## Background
\`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png?updatedAt=1775223702866\`, \`object-cover opacity-60\` over \`bg-[#1A1A19]\`. Root: \`relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]\`. Wrapper: \`relative flex flex-col items-center\` with \`marginTop: -150\`.

## Data
- USER: \`{ name: 'Jennifer Rivera', email: 'jennifer@studio.io', avatar: 'https://ik.imagekit.io/aitoolkit/Miscellaneous/Avatars/Silhouette%20Profile%20Against%20Gradient%20Background%201.webp' }\`
- MENU_GROUPS:
  - Account: Profile (User icon, #3A86FF), Settings (Gear icon, #B388FF)
  - Workspace: Team (Users icon, #06D6A0), Billing (CreditCard icon, #FFBE0B)
- Log Out row at the bottom: SignOut icon, color #FF5A5A, label "Log Out"

## Glass tokens (inline as constants)
\`glassPanel = { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1)' }\`
\`glassPanelBlur = { backdropFilter: 'blur(24px) saturate(1.8)', WebkitBackdropFilter: 'blur(24px) saturate(1.8)' }\`
\`ACTIVE_GLOW = '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1.5px rgba(255,255,255,0.4), 0 0 20px rgba(255,255,255,0.08)'\`

## Trigger
\`motion.button\` \`relative isolate flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2.5\` with \`glassPanel\` style and a separate non-animating blur layer (absolute inset-0 z-[-1] rounded-2xl). \`whileHover { scale: 1.02 }\`, \`whileTap { scale: 0.97 }\`. Animate \`boxShadow\` between \`glassPanel.boxShadow\` and \`ACTIVE_GLOW\` based on \`open\`, spring \`{ stiffness: 300, damping: 26 }\`. Inside: 32×32 \`<img src={USER.avatar} alt={USER.name} className="h-8 w-8 shrink-0 rounded-full object-cover" />\`; name span \`text-sm font-semibold text-white/80\`; \`<CaretUpDown size={16} weight="regular" className="text-white/40" />\` — no animation wrapper. Click toggles \`open\`.

## Dropdown
\`AnimatePresence\` around a \`motion.div\` rendered when \`open\`. \`absolute left-full top-0 ml-2 w-[min(256px,calc(100vw-32px))] rounded-2xl p-2\` with style \`{ ...glassPanel, ...glassPanelBlur, transformOrigin: 'top left' }\` — opens to the right of the trigger, blur applied directly, no child blur div. Initial \`{ opacity: 0, scale: 0.95, x: -8, filter: 'blur(4px)' }\`, animate to \`{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }\`, exit reverse, transition spring \`{ stiffness: 350, damping: 28 }\`. Left-edge highlight: \`absolute bottom-6 left-0 top-6 w-[1px]\` background \`linear-gradient(180deg, transparent, rgba(255,255,255,0.18), transparent)\`.

For each group: \`<p className="mb-0.5 px-3 pt-1 text-[10px] font-semibold uppercase tracking-widest text-white/25">{group.label}</p>\`, then map items to \`<MenuItem />\`. After Account+Workspace, render a divider \`mx-2 my-1.5 h-[1px]\` background \`rgba(255,255,255,0.07)\`, then \`<LogOutItem />\`.

## MenuItem
Outer \`motion.div\` \`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5\` with \`minHeight: 44\`. Initial \`{ opacity: 0 }\`, animate \`{ opacity: 1 }\`, transition \`{ duration: 0.15, delay: 0.06 + index * 0.04 }\`. Track \`hovered\` per item with \`onMouseEnter/Leave\`. Inside: \`motion.button\` \`flex min-w-0 flex-1 cursor-pointer items-center gap-2.5\` with \`transformOrigin: 'left center'\`, animate \`{ x: hovered ? 3 : 0, scale: hovered ? 1.08 : 1 }\`, \`whileTap { scale: 0.90 }\`, transition spring \`{ stiffness: 320, damping: 20 }\`. Children: 32×32 \`rounded-xl\` icon badge \`background: \${color}18\`, \`border: 1px solid \${color}22\`, containing the icon at size 16 weight="regular" with \`color\` style; label span \`text-sm font-medium\` with color \`rgba(255,255,255,0.95)\` when hovered else \`rgba(255,255,255,0.70)\`, transition \`color 0.15s\`.

## LogOutItem
Same shape as MenuItem but red: badge background \`#FF5A5A18\` border \`#FF5A5A22\`, SignOut icon color \`#FF5A5A\`, label color \`rgba(255,90,90,0.95)\` hovered or \`rgba(255,90,90,0.70)\` idle.

## Outside-click close
Wrap dropdown in a \`ref\` div. \`useEffect\` while open: add \`mousedown\` and \`touchstart\` document listeners; if \`!ref.current.contains(target)\` set \`open = false\`. Cleanup removes both. No 'any' types — type the listener event as \`MouseEvent | TouchEvent\`.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 14px
- Weights: 500, 600`,
}
