import type { Platform } from '../../app/components/ComponentCard'

const body = `Create a single self-contained React client component named ExpandingTabs. It is a premium monochrome expanding tab bar built with TypeScript, Tailwind CSS v4, Framer Motion, and AI Canvas icons. Put 'use client' at the top. Do not use the TypeScript any type. Do not create extra files.

Install dependencies with: npm install framer-motion

Create four tabs in this exact order:
1. Inbox with mail
2. Calendar with calendar-blank
3. Alerts with Bell
4. Search with search

Use size="1.18em" on every icon. The icons are AI Canvas icons (\`@/components/icons/<name>\`, e.g. \`import { Mail } from '@/components/icons/mail'\`), Line style, Regular weight. Install each icon with npx shadcn@latest add https://aicanvas.me/r/icon-<name>.json. Store the active label in React state and initialize it to "Inbox". Exactly one tab is active at a time. Clicking any tab makes it active.

Define one shared motion transition exactly as { type: 'spring', stiffness: 420, damping: 30, mass: 0.7 } and use it throughout. The active tab is an expanded rounded pill containing its icon and title-case label. Inactive tabs are 40px circles containing only their icons. Each motion.button uses layout and the shared spring so its width morphs smoothly. Inactive buttons use whileHover={{ scale: 1.045 }} and all buttons use whileTap={{ scale: 0.94 }}.

The icon positioning architecture is critical. Every button must use justify-start and the fixed left inset pl-2.5. The active variant adds gap-2 and pr-4, while the inactive variant uses w-10. The icon wrapper must be a motion.span with no layout prop and no layoutId. Give it shrink-0 so it cannot compress. Animate only { scale: isActive ? 1.03 : 1, opacity: isActive ? 1 : 0.78 } with the shared spring. This fixed inset keeps the icon centered in the 40px circle and anchored in the same left slot while the button width morphs around it. Do not center the icon using justify-center on the button and do not independently layout-track its position.

Render the active label beside the icon inside AnimatePresence with initial={false}. The label is a motion.span with layout, initial={{ opacity: 0, x: -7 }}, animate={{ opacity: 1, x: 0 }}, exit={{ opacity: 0, x: -7 }}, and the shared spring. Its classes must include whitespace-nowrap text-sm font-semibold tracking-[0.01em]. Use the project default sans-serif font and title-case labels.

Use this exact page root class: "flex min-h-screen w-full items-center justify-center bg-[#E3E3E8] dark:bg-[#0E0E0F]".

The outer motion.div uses layout and the shared spring. Give it role="tablist", aria-label="Mail navigation", and these exact classes:
"flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-full border border-black/[0.035] bg-white/35 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.98)] dark:border-white/[0.055] dark:bg-white/[0.025] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]"

The outer container highlight is a single inset top-light with a 1px vertical offset, zero blur, and zero spread. Keep its light alpha at 0.98 and dark alpha at 0.16.

Every motion.button uses this exact shared base class:
"relative flex h-10 shrink-0 cursor-pointer items-center justify-start overflow-hidden rounded-full pl-2.5 outline-none focus-visible:ring-2 focus-visible:ring-black/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#E3E3E8] dark:focus-visible:ring-white/80 dark:focus-visible:ring-offset-[#0E0E0F]"

For the active pill, append these exact light and dark classes and shadow layers:
"gap-2 bg-[#FCFCFD] pr-4 shadow-[0_7px_18px_rgba(32,32,36,0.14),0_1px_2px_rgba(32,32,36,0.08),inset_0_2px_0_rgba(255,255,255,0.98)] dark:bg-[#29292C] dark:shadow-[0_7px_18px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.06),inset_0_2px_0_rgba(255,255,255,0.18)]"

For each inactive circle, append these exact light and dark classes and shadow layers:
"w-10 bg-[#F8F8FA] shadow-[0_3px_9px_rgba(32,32,36,0.09),0_1px_1px_rgba(32,32,36,0.06),inset_0_2px_0_rgba(255,255,255,0.92)] dark:bg-[#202023] dark:shadow-[0_3px_9px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.035),inset_0_2px_0_rgba(255,255,255,0.15)]"

Preserve every shadow layer exactly. The individual buttons use a clearly visible inset top-light with a 2px vertical offset, zero blur, and zero spread. The exact 2px highlight alphas are active light 0.98, active dark 0.18, inactive light 0.92, and inactive dark 0.15. The approved dark button shadows also retain their existing subtler 1px inset layers at 0.06 for active and 0.035 for inactive.

Use icon and label color #161618 in light mode and #F3F3F4 in dark mode. Keep the palette entirely monochrome with no accent hues.

Accessibility is required. Every button has type="button", role="tab", aria-selected={isActive}, and aria-label={tab.label}. Icons use aria-hidden="true". Buttons remain keyboard focusable and show the visible focus rings specified in the base classes. The tab bar must remain on one row and fit narrow screens through max-w-[calc(100vw-1.5rem)], compact inactive circles, and short labels.`

const claudePreamble = `Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

`

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': claudePreamble + body,
  Lovable: body,
  V0: body,
}
