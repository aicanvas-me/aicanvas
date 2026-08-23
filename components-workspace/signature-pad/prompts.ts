import type { Platform } from '../../app/components/ComponentCard'

const SPEC = `Create \`components-workspace/signature-pad/index.tsx\`. Export a default function \`SignaturePad\`. Single file, \`'use client'\` at top.

**Container:** Root \`<div>\` with \`flex min-h-screen w-full items-center justify-center p-6\`. Inline style \`backgroundColor\` swaps on theme: \`#E8E8DF\` (light) / \`#1A1A19\` (dark). Track theme via \`isDark\` state (default \`false\`) updated in a \`useEffect\` MutationObserver on \`document.documentElement\` (and on \`closest('[data-card-theme]')\`) reading the \`dark\` class. SSR starts \`false\` to avoid hydration mismatch.

---

## Pattern

This is a **button-morphs-into-modal** pattern (same family as new-project-modal / voice-chat-pill). User clicks the trigger pill → pill scales to 0 + opacity 0 while a fixed-position card morphs from the pill's bounding rect into a centered 480px-wide modal. On Save: button morphs to a check, then the whole modal collapses back to the pill.

State at the top level: \`open\` (bool), \`origin\` (\`{x, y, w, h} | null\`, the captured \`getBoundingClientRect()\` of the pill on click), \`isDark\` (bool). Modal is a child component so its drawing state resets on close/reopen.

---

## Trigger pill (collapsed)

\`motion.button\` ref'd as \`buttonRef\`, pill-shaped (\`borderRadius: 9999\`).

**Colors, inverted per theme** (dark pill on light page, light pill on dark page):
- Light theme: bg \`#1a1a18\`, hover \`#2d2d2b\`, text \`#f1f1f0\`. Inner icon tile: bg \`#f1f1f0\`, icon \`#1a1a18\`.
- Dark theme: bg \`#e0dfd8\`, hover \`#d4d3cc\`, text \`#1a1a18\`. Inner icon tile: bg \`#1a1a18\`, icon \`#f1f1f0\`.

**Box shadow:** \`0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)\`.

**Animation:** \`animate={{ opacity: open ? 0 : 1, scale: open ? 0.85 : 1, backgroundColor }}\`. When open: \`transition={{ duration: 0.18 }}\` and \`pointerEvents: 'none'\`. When closed: spring stiffness 400 damping 28. \`whileHover={{ scale: 1.03, backgroundColor: hover }}\`, \`whileTap={{ scale: 0.97 }}\`.

**Layout:** \`flex items-center gap-3 py-2 pl-2 pr-5 font-sans text-[15px] font-semibold\`. Children:
1. Icon tile: \`flex size-9 shrink-0 items-center justify-center rounded-full\`. Phosphor \`<Signature size={18} weight="regular" />\` inside.
2. Text "Create your digital signature".

**On click:** capture \`buttonRef.getBoundingClientRect()\` into \`origin\`, then \`setOpen(true)\`.

---

## Backdrop

Fixed inset-0 div, z-40, fade in/out 0.22s. Style: \`backgroundColor: 'rgba(0,0,0,0.28)'\`, \`backdropFilter: 'blur(3px)'\`. Click → \`close()\`.

---

## Modal: pill-to-card morph

The modal palette is **always cream-light** regardless of \`isDark\` (mirrors voice-chat-pill behavior). Constants:
\`\`\`ts
const MODAL_PALETTE = {
  surfaceBg: '#f1f1f0',
  fieldBg: '#f8f8f8',
  fieldHover: '#ececec',
  labelColor: '#6c6c6c',
  titleColor: '#1a1a18',
  primaryBg: '#1a1a18',
  primaryFg: '#f2f1ec',
  inkColor: '#1a1a18',
  baselineColor: 'rgba(26,26,24,0.14)',
} as const
\`\`\`

Centered fixed div z-50, \`onClick={onClose}\`. Inner \`motion.div\` morphs from pill origin (use \`onClick={(e) => e.stopPropagation()}\` to prevent close):
- Compute: \`targetW = Math.min(480, window.innerWidth - 32)\`, \`initialOffsetX = origin.x + origin.w/2 - vw/2\`, \`initialOffsetY = origin.y + origin.h/2 - vh/2\`, \`initialScaleX = origin.w / targetW\`.
- \`initial\`: \`{ x: initialOffsetX, y: initialOffsetY, scaleX: initialScaleX, scaleY: 0.18, borderRadius: 9999, opacity: 0.85 }\`
- \`animate\`: \`{ x: 0, y: 0, scaleX: 1, scaleY: 1, borderRadius: 28, opacity: 1 }\`
- \`exit\`: reverses initial but \`opacity: 0\`
- \`transition\`: \`default: MORPH\` (\`{ type:'spring', stiffness:320, damping:30, mass:1 }\`); \`borderRadius: { duration: 0.32, ease: [0.32, 0.72, 0.34, 1] }\`; \`opacity: { duration: 0.18 }\`.
- Style: \`borderRadius: 28\`, \`willChange: 'transform, border-radius'\`, \`backgroundColor: surfaceBg\`, \`boxShadow: '0px 16px 56px rgba(0,0,0,0.18)'\`.
- Class: \`w-full max-w-[480px] px-6 pb-6 pt-6\`.

**Inner stagger**: wrap header + canvas + footer in a \`motion.div\` with variants \`{ hidden: { opacity:0 }, show: { opacity:1, transition: { delay:0.18, staggerChildren:0.055 } }, exit: { opacity:0, transition: { duration:0.08 } } }\`, \`initial="hidden" animate="show" exit="exit"\`.

---

## Header

\`flex items-start justify-between gap-3\`, \`mb-5\`.

**Left** (\`flex items-start gap-3\`):
- Icon tile: \`flex size-10 shrink-0 items-center justify-center rounded-full\`, \`backgroundColor: fieldBg\`, \`color: titleColor\`. Phosphor \`<Signature size={20} weight="regular" />\`.
- Title block (\`flex flex-col gap-0.5\`):
  - "Create your digital signature": \`font-sans text-[17px] font-bold leading-tight\`, color \`titleColor\`.
  - "Draw using your mouse or finger": \`font-sans text-[13px] font-medium\`, color \`labelColor\`.

**Right**: close button (\`flex size-9 shrink-0 items-center justify-center rounded-full\`), \`backgroundColor: fieldBg\`, \`color: labelColor\`. \`whileHover={{ scale:1.1, backgroundColor: fieldHover }}\`, \`whileTap={{ scale:0.88 }}\`, spring 400/26. Phosphor \`<X size={16} weight="bold" />\`. \`onClick={onClose}\`.

---

## Canvas (the signing surface)

Wrapper \`relative mb-3\`.

**Canvas container** (\`canvasContainerRef\`):
\`relative aspect-[16/9] w-full overflow-hidden rounded-[20px]\`, \`backgroundColor: fieldBg\`.

**Canvas** (absolute inset-0, \`touch-none\`, cursor crosshair):
- Pointer event handlers for \`onPointerDown / Move / Up / Cancel / Leave\`.
- DPR-aware sizing: read \`container.clientWidth / clientHeight\` (NOT \`getBoundingClientRect\`, since the morph animation transforms the parent, and bounding rect is post-transform). \`canvas.width = floor(clientWidth * dpr)\`, \`canvas.height = floor(clientHeight * dpr)\`, \`canvas.style.width = clientWidth + 'px'\`, \`canvas.style.height = clientHeight + 'px'\`. Then \`ctx.setTransform(dpr, 0, 0, dpr, 0, 0)\`.
- Re-run setup via a \`ResizeObserver\` on the container.

**Drawing model**: \`Stroke = { x: number; y: number; t: number }[]\`. Maintain \`strokesRef: Stroke[]\` (all completed + current strokes), \`currentRef: Stroke\` (in-progress), \`drawingRef: boolean\`, \`sizeRef: { w, h }\`.
- \`onPointerDown\`: \`preventDefault\`, \`setPointerCapture\`, push a new stroke with one point, set \`hasInk\` true.
- \`onPointerMove\`: append point to current stroke, draw the latest segment incrementally.
- \`onPointerUp/Cancel/Leave\`: \`releasePointerCapture\`, \`drawingRef = false\`.

**Smooth strokes**: quadratic curves to the midpoint between successive points:
\`\`\`
const mid = { x: (prev.x + curr.x)/2, y: (prev.y + curr.y)/2 }
ctx.beginPath()
if (i === 1) ctx.moveTo(prev.x, prev.y)
else {
  const prev2 = stroke[i-2]
  const prevMid = { x: (prev2.x + prev.x)/2, y: (prev2.y + prev.y)/2 }
  ctx.moveTo(prevMid.x, prevMid.y)
}
ctx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y)
ctx.stroke()
\`\`\`

**Velocity-tapered width**: line width depends on pointer speed (slow = thicker):
\`\`\`
const MIN_W = 1.1, MAX_W = 2.6
function widthForVelocity(prev, curr) {
  const d = Math.hypot(curr.x - prev.x, curr.y - prev.y)
  const dt = Math.max(1, curr.t - prev.t)
  const v = d / dt
  return Math.max(MIN_W, MAX_W - v * 0.55)
}
\`\`\`
\`ctx.lineCap = 'round'\`, \`ctx.lineJoin = 'round'\`, \`ctx.strokeStyle = inkColor\`. Use \`performance.now()\` for the timestamp.

A full \`redrawAll\` (replays all strokes from the array) runs after \`setupCanvas\` so a resize never loses ink. Single-point taps draw a small filled arc.

**Baseline + hint inside the canvas:**
- Decorative baseline div: \`pointer-events-none absolute inset-x-8 bottom-[28%] h-px\`, \`backgroundColor: baselineColor\`.
- "Sign here" hint: \`AnimatePresence\` shows a centered span at \`bottom-[31%]\` (\`text-[13px] font-medium\`, color \`labelColor\` opacity 0.7) only when \`!hasInk\`. Fades 0.18s.

---

## Below the canvas: date + clear row

\`mt-2 flex h-7 items-center justify-between\`.

**Left**: date stamp. Lazy-set in a \`useEffect\` (\`new Date().toLocaleDateString(undefined, { month:'long', day:'numeric', year:'numeric' })\`) so SSR renders empty, no hydration mismatch. \`font-sans text-[12px] font-medium tabular-nums\`, color \`labelColor\` opacity 0.7.

**Right**: \`Clear\` button, \`AnimatePresence\` fades it in (\`initial:{opacity:0,x:6}\`, \`animate:{opacity:1,x:0}\`, \`exit:{opacity:0,x:6}\`, 0.18s) only when \`hasInk && !confirming\`. Style \`flex items-center gap-1.5 rounded-full px-2 py-1 font-sans text-[13px] font-semibold\`, color \`labelColor\`. Phosphor \`<Eraser size={14} weight="regular" />\` + label "Clear". \`onClick\` clears \`strokesRef\`/\`currentRef\`, sets \`hasInk=false\`, calls \`redrawAll\`.

---

## Footer

\`flex items-center justify-end gap-2\`.

**Cancel**: pill button \`rounded-full px-5 py-3 font-sans text-[15px] font-bold\`, \`backgroundColor: fieldBg\`, \`color: titleColor\`. Hover \`backgroundColor: fieldHover\`, scale 1.04. Tap scale 0.96. Spring 400/26. Disabled during \`confirming\` (opacity 0.5). \`onClick={onClose}\`.

**Save signature** (primary): pill button, \`min-w-[148px] flex items-center justify-center rounded-full px-7 py-3 font-sans text-[15px] font-bold\`, \`backgroundColor: primaryBg\`, \`color: primaryFg\`. Disabled when \`!hasInk\` (opacity 0.4) or while \`confirming\`. Hover scale 1.05, tap 0.96. Spring 500/40.

**Save flow:**
1. \`onClick\` → \`setConfirming(true)\`.
2. Button label is replaced via \`<AnimatePresence mode="wait">\` with a centered \`<Check size={16} weight="bold" />\` (initial \`{opacity:0,scale:0.5}\`, animate \`{opacity:1,scale:1}\`, exit \`{opacity:0,scale:0.5}\`, spring 400/22). The button itself animates \`scale: 0.96\`.
3. After ~1100ms, call \`onClose()\`. The modal exit-animates back to the pill, the pill fades back in. Drawing state resets because \`ModalCard\` unmounts.

---

## Dependencies

\`\`\`
npm install framer-motion @phosphor-icons/react
\`\`\`

Imports:
\`\`\`ts
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Eraser, Signature } from '@phosphor-icons/react'
\`\`\`

## Typography
- Font: project default sans (Manrope)
- Sizes: 12, 13, 15, 17 px
- Weights: 500 (medium), 600 (semibold), 700 (bold)

## Constants
\`\`\`ts
const MORPH = { type: 'spring' as const, stiffness: 320, damping: 30, mass: 1 }
const MIN_W = 1.1
const MAX_W = 2.6
\`\`\`

## Notes
- Single root element (no Fragment) so the registry root-detector can read its attributes.
- Hardcoded hex colors throughout. Do NOT import design tokens or a theme provider; the component must be self-contained for copy-paste install.
- Mobile-friendly: pointer events cover mouse + touch + pen; no fixed widths/heights.`

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

${SPEC}`,

  Lovable: SPEC,

  V0: SPEC,
}
