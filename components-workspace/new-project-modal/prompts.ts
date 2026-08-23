import type { Platform } from '../../app/components/ComponentCard'

const SPEC = `Build a self-contained "New Project Modal" React component. Export default function \`NewProjectModal\`. Single file, inline everything.

## Install
\`\`\`
npm install framer-motion @phosphor-icons/react
\`\`\`

## Colour palette (raw hex, no design tokens)
- Page bg: \`#E8E8DF\` light / \`#1A1A19\` dark
- Card bg: \`#f1f1f0\`
- Input bg: \`#f8f8f8\`
- Primary text: \`#1a1a18\`
- Muted / placeholder: \`#a0a09a\`
- Icon / secondary: \`#6c6c6c\`
- CTA button: bg \`#1a1a18\`, text \`#f1f1f0\`

## Animation spring
\`\`\`ts
const MORPH = { type: 'spring', stiffness: 320, damping: 30, mass: 1 }
\`\`\`

## Color swatches
\`\`\`ts
const COLORS = [
  { value: '#E05C50', label: 'Rose' },
  { value: '#E09A3A', label: 'Amber' },
  { value: '#48B068', label: 'Sage' },
  { value: '#30AACC', label: 'Teal' },
  { value: '#5878D8', label: 'Slate' },
  { value: '#8F54D8', label: 'Lavender' },
] as const
\`\`\`

## State
\`open\`, \`origin: { x, y, w, h } | null\`, \`title\`, \`description\`, \`isPrivate: false\`, \`titleError: false\`, \`color: string | null\`. Plus \`buttonRef\` for BoundingClientRect and \`titleRef\` for auto-focus.

## Trigger button
Pill-shaped \`motion.button\` (rounded-full), Phosphor \`Plus\` icon (size 18, weight="bold") + label "New Project", 16px semibold, font-sans. Dark bg \`#1a1a18\` / light text \`#f1f1f0\` (inverted in dark mode). Drop shadow only, no border.

- On click: capture \`buttonRef.current.getBoundingClientRect()\` → store as \`origin\`, then \`setOpen(true)\`.
- When open: \`animate={{ opacity: 0, scale: 0.85 }}\`, \`pointerEvents: none\`.
- Hover/tap spring (stiffness 400, damping 28).

## Backdrop
\`AnimatePresence\` → fixed inset-0 z-40, \`bg-black/25 backdrop-blur-[3px]\`, opacity 0↔1, duration 0.22. Click calls \`close()\`.

## Modal: ModalCard component
Split into its own function that receives all form state and handlers.

### Morph animation (pill → centred card)
Calculate once on mount:
\`\`\`ts
const targetW = Math.min(480, window.innerWidth - 32)
const initialOffsetX = origin.x + origin.w / 2 - window.innerWidth / 2
const initialOffsetY = origin.y + origin.h / 2 - window.innerHeight / 2
const initialScaleX = origin.w / targetW
\`\`\`

\`motion.div\` (max-w-[480px] rounded-[28px] bg-[#f1f1f0] p-6):
- \`initial\`: x:initialOffsetX, y:initialOffsetY, scaleX:initialScaleX, scaleY:0.18, borderRadius:9999, opacity:0.85
- \`animate\`: x:0, y:0, scaleX:1, scaleY:1, borderRadius:28, opacity:1
- \`exit\`: same as initial but opacity:0
- \`transition\`: \`{ default: MORPH, borderRadius: { duration: 0.32, ease: [0.32, 0.72, 0.34, 1] }, opacity: { duration: 0.18 } }\`
- \`style={{ borderRadius: 28, willChange: 'transform, border-radius' }}\`
- boxShadow (inline style): \`0px 16px 56px rgba(0,0,0,0.14)\`

### Content stagger
Wrap inner content in \`motion.div\` with variants \`hidden / show / exit\`:
- show: \`{ opacity: 1, transition: { delay: 0.18, staggerChildren: 0.055 } }\`
- exit: \`{ opacity: 0, transition: { duration: 0.08 } }\`

Each section uses \`variants={{ hidden: { opacity:0, y:8 }, show: { opacity:1, y:0, transition:{duration:0.2} } }}\`.

### Header
Relative container, \`mb-5 flex items-center justify-center\`. Title "New Project" (18px bold, \`#1a1a18\`). Absolute right: circular close button size-9 rounded-full bg \`#f8f8f8\` text \`#6c6c6c\`, X icon (size 16, weight bold). whileHover scale 1.1 + bg \`#ececec\`, whileTap scale 0.88.

### Inputs
Two pill inputs h-[52px] rounded-full bg-[#f8f8f8] px-5, font-sans 15px medium, text \`#1a1a18\`, placeholder \`#a0a09a\`, caretColor \`#1a1a18\`, outline-none.
- Both: border-2 border-transparent, transition-[border-color], focus:border-[#1a1a18].
- Title: border-red-400 if titleError. Auto-focus after 320ms via setTimeout + ref. If empty on submit, set titleError → animated "Title is required" label (12px, red-400, fade+y, AnimatePresence).
- Description: optional, no validation.

### Color picker (mt-4, flex gap-2)
7 swatches: one "None" + 6 from COLORS. Swatch component:
- size-[22px] rounded-full, spring scale animation.
- Selected: \`boxShadow: '0 0 0 2px #f1f1f0, 0 0 0 3.5px <color>'\` (white gap + colour ring). None ring uses \`#6c6c6c\`.
- animate={{ scale: selected ? 1.1 : 1 }}, whileHover scale 1.2, whileTap scale 0.88.
- Hover tooltip: dark pill (\`#1a1a18\` bg, \`#f1f1f0\` text, 11px semibold) appears above, AnimatePresence fade+scale 0.9→1, duration 0.12.
- None swatch background: \`linear-gradient(135deg, #e0dfd8 0%, #e0dfd8 45%, #c8c7c0 45%, #c8c7c0 55%, #e0dfd8 55%, #e0dfd8 100%)\`.
- Default selected: None (color === null).

### Footer (mt-4, flex justify-between items-center)
**Private toggle:** button that toggles \`isPrivate\`. Square checkbox size-7 rounded-lg border border-[#1a1a18]. animate backgroundColor \`#f8f8f8\` ↔ \`#6c6c6c\` (checked), duration 0.15. Check icon size 14 weight bold color \`#f1f1f0\` springs in/out (scale 0.4→1, rotate -10→0, spring 500/26, AnimatePresence mode="wait"). Label "Private" (15px semibold, \`#1a1a18\`).

**Create button:** CreateButton component, rounded-full px-7 py-3 bg \`#1a1a18\` text \`#f2f1ec\` 15px bold. On click: run \`onValidate()\` (sets titleError if empty, returns false). If valid: \`confirming=true\`, animate scale→0.96 bg→\`#3a3a38\`, swap label → Check icon (size 16, spring 400/22) via AnimatePresence mode="wait". After 600ms: \`confirming=false\`, call \`onConfirm()\`.

### close() resets
title='', description='', isPrivate=false, titleError=false, color=null.

## Mobile
\`targetW = Math.min(480, window.innerWidth - 32)\`: the card fills screen with 16px side margins on small screens.`

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Root element: className="flex min-h-screen w-full items-center justify-center bg-[#E8E8DF] dark:bg-[#1A1A19]"
The root ships full height with min-h-screen and the CLI install delivers it exactly as shown, so a standalone paste needs no change. Drop it into a container of your own and that container needs a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js with TypeScript
- Tailwind CSS v4
- If any are missing, set up via the shadcn CLI: \`npx shadcn@latest init\`

---

${SPEC}`,

  'Lovable': SPEC,

  'V0': SPEC,
}
