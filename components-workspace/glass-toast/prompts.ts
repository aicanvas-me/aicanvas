import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion @phosphor-icons/react

Root element: className="flex min-h-screen w-full items-center justify-center bg-[#1A1A19]"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named \`GlassToast\`, four trigger buttons (Success / Error / Warning / Info) that spawn glass-morphism toast cards in the bottom-right with a draining progress bar.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20pink%20Flower%20%20(1).png\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Constants: \`TOAST_DURATION = 4000\`, \`MAX_TOASTS = 3\`.

Variants (Phosphor \`weight="regular"\`):
- success: color #06D6A0, gradient "#06D6A0, #00BFA5", icon \`CheckCircle\`, label "Success"
- error:   color #FF5C8A, gradient "#FF5C8A, #FF1744", icon \`XCircle\`,     label "Error"
- warning: color #FFBE0B, gradient "#FFBE0B, #FF9800", icon \`Warning\`,     label "Warning"
- info:    color #3A86FF, gradient "#3A86FF, #2962FF", icon \`Info\`,        label "Info"

Demo content per variant:
- success: "Changes saved" / "Your settings have been updated successfully"
- error:   "Upload failed" / "The file exceeds the maximum size limit"
- warning: "Low storage"   / "You have less than 100MB remaining"
- info:    "New update"    / "Version 2.4 is now available"

Glass panel (shared for both trigger buttons and toast cards):
- \`background: rgba(255,255,255,0.06)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)\`
- Separate non-animating absolute blur layer: \`backdrop-filter: blur(24px) saturate(1.8)\`

Trigger buttons (one per variant): \`motion.button relative isolate flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-2xl px-3 py-2\`, \`minHeight: 44\`, same glass panel + absolute blur layer. Hover scale 1.08, tap 0.90, spring \`{ stiffness: 300, damping: 20 }\`. Contains a 32x32 \`rounded-xl\` tinted icon badge (bg \`\${color}18\`, border \`\${color}22\`), icon size 16, plus a \`text-sm font-semibold text-white/70\` label.

Toast container: \`fixed bottom-4 left-4 right-4 z-50 flex flex-col-reverse gap-3 sm:bottom-6 sm:left-auto sm:right-6 sm:w-[380px]\`. Wrap children in \`AnimatePresence mode="popLayout" initial={false}\`.

Toast card: \`motion.div layout relative w-full overflow-hidden rounded-2xl\` + glass panel. Enter \`{ opacity:0, x:80, scale:0.95 }\` → \`{ opacity:1, x:0, scale:1 }\` → exit same as enter, spring \`{ stiffness: 300, damping: 26 }\`. Slight hover scale 1.01. Inside: a separate absolute \`z-0\` blur layer, a content row \`relative z-10 flex items-center gap-3 py-3.5 pl-4 pr-10\` with a 36x36 tinted icon tile (bg \`\${variant.color}18\`, border \`\${variant.color}22\`, icon size 18), and a text column with a \`text-sm font-semibold text-white/90\` truncated title and an optional \`text-xs text-white/50\` description.

Close button: a 44x44 touch target on the right, containing a 20x20 circular button (bg \`rgba(255,255,255,0.08)\`, border \`rgba(255,255,255,0.12)\`) with Phosphor \`X\` size 10 \`text-white/60\`; whileHover bg \`rgba(255,255,255,0.14)\`, whileTap scale 0.88.

Progress bar: \`absolute bottom-0 left-0 right-0 h-[2px]\`, inner div \`origin-left\` bg \`\${variant.color}99\`. Drive with a requestAnimationFrame loop: track \`elapsed\` across frames, computed \`fraction = max(0, 1 - elapsed / TOAST_DURATION)\`, write directly to \`style.transform = scaleX(fraction)\`. When hovered, freeze elapsed (don't advance). When fraction hits 0, dismiss. Always cancel RAF on unmount.

Enforce \`MAX_TOASTS\` by slicing oldest. Triggers call \`addToast(variant)\`.

Respect \`useReducedMotion\`: fall back to opacity fades.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 12px, 14px
- Weights: 600`,

  'Lovable': `Create a React client component named \`GlassToast\` — four trigger buttons (Success / Error / Warning / Info) that spawn glass-morphism toast cards in the bottom-right with a draining progress bar.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20pink%20Flower%20%20(1).png\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Constants: \`TOAST_DURATION = 4000\`, \`MAX_TOASTS = 3\`.

Variants (Phosphor \`weight="regular"\`):
- success: color #06D6A0, gradient "#06D6A0, #00BFA5", icon \`CheckCircle\`, label "Success"
- error:   color #FF5C8A, gradient "#FF5C8A, #FF1744", icon \`XCircle\`,     label "Error"
- warning: color #FFBE0B, gradient "#FFBE0B, #FF9800", icon \`Warning\`,     label "Warning"
- info:    color #3A86FF, gradient "#3A86FF, #2962FF", icon \`Info\`,        label "Info"

Demo content per variant:
- success: "Changes saved" / "Your settings have been updated successfully"
- error:   "Upload failed" / "The file exceeds the maximum size limit"
- warning: "Low storage"   / "You have less than 100MB remaining"
- info:    "New update"    / "Version 2.4 is now available"

Glass panel (shared for both trigger buttons and toast cards):
- \`background: rgba(255,255,255,0.06)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)\`
- Separate non-animating absolute blur layer: \`backdrop-filter: blur(24px) saturate(1.8)\`

Trigger buttons (one per variant): \`motion.button relative isolate flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-2xl px-3 py-2\`, \`minHeight: 44\`, same glass panel + absolute blur layer. Hover scale 1.08, tap 0.90, spring \`{ stiffness: 300, damping: 20 }\`. Contains a 32x32 \`rounded-xl\` tinted icon badge (bg \`\${color}18\`, border \`\${color}22\`), icon size 16, plus a \`text-sm font-semibold text-white/70\` label.

Toast container: \`fixed bottom-4 left-4 right-4 z-50 flex flex-col-reverse gap-3 sm:bottom-6 sm:left-auto sm:right-6 sm:w-[380px]\`. Wrap children in \`AnimatePresence mode="popLayout" initial={false}\`.

Toast card: \`motion.div layout relative w-full overflow-hidden rounded-2xl\` + glass panel. Enter \`{ opacity:0, x:80, scale:0.95 }\` → \`{ opacity:1, x:0, scale:1 }\` → exit same as enter, spring \`{ stiffness: 300, damping: 26 }\`. Slight hover scale 1.01. Inside: a separate absolute \`z-0\` blur layer, a content row \`relative z-10 flex items-center gap-3 py-3.5 pl-4 pr-10\` with a 36x36 tinted icon tile (bg \`\${variant.color}18\`, border \`\${variant.color}22\`, icon size 18), and a text column with a \`text-sm font-semibold text-white/90\` truncated title and an optional \`text-xs text-white/50\` description.

Close button: a 44x44 touch target on the right, containing a 20x20 circular button (bg \`rgba(255,255,255,0.08)\`, border \`rgba(255,255,255,0.12)\`) with Phosphor \`X\` size 10 \`text-white/60\`; whileHover bg \`rgba(255,255,255,0.14)\`, whileTap scale 0.88.

Progress bar: \`absolute bottom-0 left-0 right-0 h-[2px]\`, inner div \`origin-left\` bg \`\${variant.color}99\`. Drive with a requestAnimationFrame loop: track \`elapsed\` across frames, computed \`fraction = max(0, 1 - elapsed / TOAST_DURATION)\`, write directly to \`style.transform = scaleX(fraction)\`. When hovered, freeze elapsed (don't advance). When fraction hits 0, dismiss. Always cancel RAF on unmount.

Enforce \`MAX_TOASTS\` by slicing oldest. Triggers call \`addToast(variant)\`.

Respect \`useReducedMotion\` — fall back to opacity fades.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 12px, 14px
- Weights: 600`,

  'V0': `Create a React client component named \`GlassToast\` — four trigger buttons (Success / Error / Warning / Info) that spawn glass-morphism toast cards in the bottom-right with a draining progress bar.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background: \`<img>\` at \`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20pink%20Flower%20%20(1).png\`, \`object-cover opacity-60\`, over \`bg-[#1A1A19]\`.

Constants: \`TOAST_DURATION = 4000\`, \`MAX_TOASTS = 3\`.

Variants (Phosphor \`weight="regular"\`):
- success: color #06D6A0, gradient "#06D6A0, #00BFA5", icon \`CheckCircle\`, label "Success"
- error:   color #FF5C8A, gradient "#FF5C8A, #FF1744", icon \`XCircle\`,     label "Error"
- warning: color #FFBE0B, gradient "#FFBE0B, #FF9800", icon \`Warning\`,     label "Warning"
- info:    color #3A86FF, gradient "#3A86FF, #2962FF", icon \`Info\`,        label "Info"

Demo content per variant:
- success: "Changes saved" / "Your settings have been updated successfully"
- error:   "Upload failed" / "The file exceeds the maximum size limit"
- warning: "Low storage"   / "You have less than 100MB remaining"
- info:    "New update"    / "Version 2.4 is now available"

Glass panel (shared for both trigger buttons and toast cards):
- \`background: rgba(255,255,255,0.06)\`
- \`border: 1px solid rgba(255,255,255,0.1)\`
- \`boxShadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)\`
- Separate non-animating absolute blur layer: \`backdrop-filter: blur(24px) saturate(1.8)\`

Trigger buttons (one per variant): \`motion.button relative isolate flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-2xl px-3 py-2\`, \`minHeight: 44\`, same glass panel + absolute blur layer. Hover scale 1.08, tap 0.90, spring \`{ stiffness: 300, damping: 20 }\`. Contains a 32x32 \`rounded-xl\` tinted icon badge (bg \`\${color}18\`, border \`\${color}22\`), icon size 16, plus a \`text-sm font-semibold text-white/70\` label.

Toast container: \`fixed bottom-4 left-4 right-4 z-50 flex flex-col-reverse gap-3 sm:bottom-6 sm:left-auto sm:right-6 sm:w-[380px]\`. Wrap children in \`AnimatePresence mode="popLayout" initial={false}\`.

Toast card: \`motion.div layout relative w-full overflow-hidden rounded-2xl\` + glass panel. Enter \`{ opacity:0, x:80, scale:0.95 }\` → \`{ opacity:1, x:0, scale:1 }\` → exit same as enter, spring \`{ stiffness: 300, damping: 26 }\`. Slight hover scale 1.01. Inside: a separate absolute \`z-0\` blur layer, a content row \`relative z-10 flex items-center gap-3 py-3.5 pl-4 pr-10\` with a 36x36 tinted icon tile (bg \`\${variant.color}18\`, border \`\${variant.color}22\`, icon size 18), and a text column with a \`text-sm font-semibold text-white/90\` truncated title and an optional \`text-xs text-white/50\` description.

Close button: a 44x44 touch target on the right, containing a 20x20 circular button (bg \`rgba(255,255,255,0.08)\`, border \`rgba(255,255,255,0.12)\`) with Phosphor \`X\` size 10 \`text-white/60\`; whileHover bg \`rgba(255,255,255,0.14)\`, whileTap scale 0.88.

Progress bar: \`absolute bottom-0 left-0 right-0 h-[2px]\`, inner div \`origin-left\` bg \`\${variant.color}99\`. Drive with a requestAnimationFrame loop: track \`elapsed\` across frames, computed \`fraction = max(0, 1 - elapsed / TOAST_DURATION)\`, write directly to \`style.transform = scaleX(fraction)\`. When hovered, freeze elapsed (don't advance). When fraction hits 0, dismiss. Always cancel RAF on unmount.

Enforce \`MAX_TOASTS\` by slicing oldest. Triggers call \`addToast(variant)\`.

Respect \`useReducedMotion\` — fall back to opacity fades.

Use Manrope font.

## Typography
- Font: project default sans-serif
- Sizes: 12px, 14px
- Weights: 600`,
}
