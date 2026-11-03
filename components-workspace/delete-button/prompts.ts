import type { Platform } from '../../app/components/ComponentCard'

// The shared spec body (used verbatim by all three platforms). The Claude Code
// lane prepends an env-check preamble; Lovable and V0 use it as-is.
const SPEC = `Build a single, self-contained, copy-paste React + TypeScript component: a "Delete Account" pill button that turns account deletion into a three-state undo flow instead of a confirm dialog.

STACK
- React + TypeScript, Tailwind CSS v4, Framer Motion, AI Canvas icons (\`@/components/icons/<name>\`, e.g. \`import { Undo } from '@/components/icons/undo'\`), Line style, 1.5px stroke. Install each icon with npx shadcn@latest add https://aicanvas.me/r/icon-<name>.json. No other dependencies.
- One default-exported component named DeleteButton, in a single file. 'use client' at the top. Add a comment: // npm install framer-motion
- Root element: className="flex min-h-screen w-full items-center justify-center bg-[#E3E3E8] dark:bg-[#0E0E0F]". Use Tailwind's dark: variant (class-based dark mode), not a manual theme hook: this component only needs the two hardcoded page colors plus theme-branched Tailwind classes on the pill itself, no inline hex switching.

STATE MACHINE
Three states, driven by useState<'default' | 'counting' | 'deleted'>('default') plus a countdown number starting at 5:
1. "default": the resting red pill. Clicking it starts deletion: set countdown to 5 and move to "counting".
2. "counting": a soft-red pill with a live 5-second countdown. On mount of this state, start a window.setInterval(..., 1000) that decrements countdown each tick; when it would go to 0 or below, immediately set state to "deleted" and clamp countdown at 0. Clear the interval on cleanup / state change (useEffect keyed on the state, return the clearInterval). Clicking the undo button at any point resets countdown to 5 and returns to "default" (clearing the interval via the effect cleanup).
3. "deleted": a muted terminal pill reading "Account Deleted". On entering this state, start a window.setTimeout for 2800ms that resets countdown to 5 and returns to "default" (self-resetting demo loop). Clear the timeout on cleanup.

STRUCTURE (single morphing pill, Framer Motion layout animation)
- An outer motion.div with the layout prop and className "mx-4 flex max-w-[calc(100vw-2rem)] items-center justify-center overflow-hidden rounded-full". This is the shared layout container all three pill shapes animate within/between.
- A shared pill transition object used everywhere: { type: 'spring', stiffness: 420, damping: 30, mass: 0.7 }.
- Wrap the three state pills in <AnimatePresence initial={false} mode="popLayout">, each pill keyed by its state name, with layout, initial={{ opacity: 0, scale: 0.9-ish }}, animate={{ opacity: 1, scale: 1 }}, exit={{ opacity: 0, scale: 0.94-ish }}, and the shared pill transition. Only one pill is mounted at a time; popLayout lets the outgoing pill exit while the incoming one's layout resize animates smoothly (this is what produces the shape-morph between pill 1 → pill 2 → pill 3).

PILL 1, DEFAULT ("Delete Account")
- A single motion.button, type="button", aria-label "Delete account", onClick starts deletion.
- className: rounded-full bg-red-600 px-6 py-3 text-sm font-semibold tracking-[0.01em] text-white shadow-[0_0.7rem_1.8rem_rgb(220_38_38_/_0.25),inset_0_2px_0_rgba(255,255,255,0.3)] (a soft red drop shadow with a second, inset_0_2px_0 layer that draws a glossy white highlight across the top edge), outline-none, hover:bg-red-700, focus-visible:ring-4 focus-visible:ring-red-400/45; dark: bg-red-500, hover:bg-red-400, dark:shadow-[0_0.7rem_1.8rem_rgb(248_113_113_/_0.18),inset_0_2px_0_rgba(255,255,255,0.18)] (dimmer red drop shadow, dimmer inset highlight).
- whileHover={{ scale: 1.025 }}, whileTap={{ scale: 0.96 }}.
- Label text: "Delete Account".

PILL 2, COUNTING ("Cancel Deletion")
- A motion.div, role="status", aria-live="polite", aria-label naming the remaining seconds (e.g. "Account deletion will be final in {countdown} seconds").
- className: flex items-center gap-3 rounded-full border border-red-200 bg-red-100 p-1.5 pr-2 text-red-700 shadow-[0_0.8rem_2rem_rgb(239_68_68_/_0.12),inset_0_2px_0_rgba(255,255,255,0.65)] (soft red drop shadow plus an inset_0_2px_0 white glossy highlight across the top edge); dark: border-red-400/20, bg-red-500/15, text-red-300, dark:shadow-[0_0.8rem_2rem_rgb(248_113_113_/_0.1),inset_0_2px_0_rgba(255,255,255,0.15)] (dimmer drop shadow, dimmer inset highlight).
- Left: an undo motion.button, size-10 (40px) circle, bg-red-600 (dark: bg-red-500), text-white, grid place-items-center, shadow-[0_1px_2px_0_rgb(0_0_0_/_0.05),inset_0_2px_0_rgba(255,255,255,0.3)] dark:shadow-[0_1px_2px_0_rgb(0_0_0_/_0.05),inset_0_2px_0_rgba(255,255,255,0.18)] (a small drop shadow plus an inset_0_2px_0 glossy top highlight, not the shadow-sm utility), focus-visible:ring-4 ring-red-400/45, aria-label "Undo account deletion", onClick resets to the default state. whileHover={{ scale: 1.08, rotate: -5 }}, whileTap={{ scale: 0.9 }}, using the shared pill transition. Icon: \`undo\` at size="1.1em", aria-hidden.
- Center: a plain <span> "Cancel Deletion", text-sm font-semibold, whitespace-nowrap, small horizontal padding.
- Right: the countdown badge, a motion.span with the layout prop, size-10 circle, overflow-hidden, bg-red-600 (dark: bg-red-500), text-white, text-sm font-bold, tabular-nums, grid place-items-center, shadow-[0_1px_2px_0_rgb(0_0_0_/_0.05),inset_0_2px_0_rgba(255,255,255,0.3)] dark:shadow-[0_1px_2px_0_rgb(0_0_0_/_0.05),inset_0_2px_0_rgba(255,255,255,0.18)] (same small drop shadow plus glossy inset highlight as the undo button), aria-hidden. Inside it, an AnimatePresence initial={false} mode="popLayout" wraps a single motion.span keyed by the current countdown NUMBER, so every digit change triggers an odometer roll: initial={{ y: '100%', opacity: 0 }}, animate={{ y: '0%', opacity: 1 }}, exit={{ y: '-100%', opacity: 0 }}, transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}. This makes each new digit slide up from below while the old one slides out the top, clipped by the circle's overflow-hidden.

PILL 3, DELETED ("Account Deleted")
- A motion.div, role="status", aria-live="polite".
- className: flex items-center gap-2 rounded-full border border-stone-300 bg-stone-200 px-5 py-3 text-sm font-semibold text-stone-600 shadow-[0_1px_2px_0_rgb(0_0_0_/_0.05),inset_0_2px_0_rgba(255,255,255,0.65)] (small drop shadow plus a bright inset_0_2px_0 glossy highlight, not the shadow-sm utility); dark: border-stone-700, bg-stone-800, text-stone-300, dark:shadow-[0_1px_2px_0_rgb(0_0_0_/_0.05),inset_0_2px_0_rgba(255,255,255,0.15)] (dimmer inset highlight). This is a deliberately muted/desaturated palette compared to the reds; it reads as "resolved", not alarming.
- A small check badge before the label: size-5 circle, bg-stone-500 (dark: bg-stone-600), text-white, grid place-items-center, shadow-[inset_0_2px_0_rgba(255,255,255,0.3)] dark:shadow-[inset_0_2px_0_rgba(255,255,255,0.15)] (a pure inset highlight, no drop shadow, giving the badge a glossy convex ring). Icon: \`check\` at size="0.9em", aria-hidden.
- Label text: "Account Deleted".
- This state is transient, after ~2.8s it auto-resets to Pill 1 with countdown back at 5, so the whole cycle is repeatable without a page reload.

QUALITY BAR
- Exactly one default export, DeleteButton, copy-paste ready, no other components in the file.
- Both intervals/timeouts must be cleared on unmount and on every state transition (no leaked timers, no state updates after unmount).
- The undo button must fully cancel the pending deletion: clicking it at second 4, 2, or 1 all behave identically (back to default, countdown reset to 5, no stray "deleted" flash).
- Keep the three pills visually and structurally distinct (red action → soft-red countdown → muted stone resolution) so the color alone communicates escalation then resolution.
- Fully responsive: the pill never overflows small viewports (max-w-[calc(100vw-2rem)] with mx-4 handles this).
- Dual theme via Tailwind's dark: classes throughout, matching the exact color pairs listed above.`

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Before building, verify the project is set up for this stack and scaffold anything missing:
- Tailwind CSS v4 (CSS-first \`@theme\`, no tailwind.config.js), TypeScript, and React must all be configured.
- If the project isn't initialized for this, use the shadcn CLI to scaffold the base (e.g. \`npx shadcn@latest init\`) so Tailwind v4 + TS + React are wired up before you write the component.
- Install deps: \`npm install framer-motion\`.

Then build the component. Inline everything into a single file, one default-exported component plus the small countdown/timeout logic in the same module. Trust idiomatic React + Framer Motion; you don't need scaffolding files or comments explaining basics.

${SPEC}`,
  Lovable: SPEC,
  V0: SPEC,
}
