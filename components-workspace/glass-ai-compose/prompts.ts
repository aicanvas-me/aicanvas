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

Create a React client component named \`GlassAiCompose\`, a glassmorphism AI prompt composer with per-model theming, textarea, image uploads, web-search toggle, and a layoutId model switcher.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background image (absolute inset-0, object-cover, opacity-60, pointer-events-none):
\`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133\`

MODELS (label, color):
- Claude #FF7B54
- ChatGPT #10A37F
- Perplexity #3A86FF
- Gemini #FFBE0B

Constants: MAX_TEXTAREA_HEIGHT = 160.

Glass shared styles:
- glassBlur: { backdropFilter: 'blur(24px) saturate(1.8)', WebkitBackdropFilter: 'blur(24px) saturate(1.8)' }
- glassPanel: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)' }
- ACTIVE_GLOW: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1.5px rgba(255,255,255,0.25), 0 0 20px rgba(255,255,255,0.06)'

State: isActive, message, activeModel (default Claude), images: string[], webSearch, showWebLabel. Refs: containerRef, textareaRef, fileInputRef. useReducedMotion().

Behavior:
- onFocus textarea → setIsActive(true). Click outside containerRef (mousedown + touchstart listeners, cleanup on unmount) → setIsActive(false).
- Auto-resize textarea: on change set height='auto' then scrollHeight capped at 160.
- webSearch useEffect: when true, showWebLabel=true then setTimeout 1000ms → false (cleanup clearTimeout).
- handleImageUpload: FileReader readAsDataURL → push base64 into images. Reset e.target.value.
- Enter (no shift) → handleSend; clears message + images and resets height.
- canSend = message.trim().length > 0 || images.length > 0.

Root: relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19].

Panel (motion.div, ref=containerRef wraps inner), className \`relative isolate overflow-hidden rounded-2xl\`, w-[calc(100%-2rem)] max-w-[420px].
- animate boxShadow: isActive ? ACTIVE_GLOW : glassPanel.boxShadow, transition = reducedMotion ? {duration:0.15} : {type:'spring', stiffness:350, damping:28}.
- style: glassPanel background + border (not boxShadow, it's animated).
- Separate blur layer: pointer-events-none absolute inset-0 z-[-1] rounded-2xl style=glassBlur.
- Top highlight: absolute left-6 right-6 top-0 h-[1px] \`linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)\`.

Compose area (relative z-10 flex flex-col gap-6 p-4 pb-2):
- textarea placeholder "Ask anything..." rows=1, bg-transparent text-white/90 placeholder-white/40, caretColor: activeModel.color, maxHeight 160.
- AnimatePresence thumbnails: motion.div wrapper (opacity/height 0↔auto). Each thumbnail 64px rounded-xl border rgba(255,255,255,0.12), spring {stiffness:350, damping:25} scale 0.8↔1; X button (5x5 absolute top-1 right-1, bg rgba(0,0,0,0.6), X size 10 text-white/80).
- Toolbar flex justify-between:
  Left (gap-2): Upload button 32x32 rounded-xl bg rgba(255,255,255,0.08) border rgba(255,255,255,0.12), ImageSquare size 16 color rgba(255,255,255,0.5). Hidden file input accept image/* multiple.
  Globe toggle 32x32 same base; when webSearch: bg \`\${activeModel.color}18\`, border \`1px solid \${activeModel.color}22\`, icon activeModel.color. whileHover scale 1.08 bg white/14 (or \`\${color}28\` when active); whileTap 0.88; spring {320,20}.
  AnimatePresence "Web search on" label: motion.span text-[10px] font-semibold, color \`\${activeModel.color}88\`, opacity+x -4 fade.
  Right: Send button 36x36 rounded-xl. animate: canSend ? { background: \`\${activeModel.color}40\`, border: \`1px solid \${activeModel.color}66\` } : { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }. opacity canSend?1:0.4 pointerEvents none when disabled. PaperPlaneRight size 16 colored accent or white/30.

Divider: mx-4 h-[1px] rgba(255,255,255,0.07).

Model switcher row (px-3 py-2.5): 4 buttons flex-1 rounded-lg px-3 py-1.5. Active button renders motion.div layoutId="model-pill" absolute inset-0 rounded-lg with bg \`\${color}18\` border \`1px solid \${color}22\` spring {stiffness:400, damping:28}. Label text-[11px] font-semibold color=isActive?color:'rgba(255,255,255,0.50)'.

Icons from @phosphor-icons/react (weight="regular"): PaperPlaneRight, ImageSquare, GlobeSimple, X. Framer Motion: motion, AnimatePresence, useReducedMotion.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 11px, 14px
- Weights: 500, 600`,

  'Lovable': `Create a React client component named \`GlassAiCompose\` — a glassmorphism AI prompt composer with per-model theming, textarea, image uploads, web-search toggle, and a layoutId model switcher.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background image (absolute inset-0, object-cover, opacity-60, pointer-events-none):
\`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133\`

MODELS (label, color):
- Claude #FF7B54
- ChatGPT #10A37F
- Perplexity #3A86FF
- Gemini #FFBE0B

Constants: MAX_TEXTAREA_HEIGHT = 160.

Glass shared styles:
- glassBlur: { backdropFilter: 'blur(24px) saturate(1.8)', WebkitBackdropFilter: 'blur(24px) saturate(1.8)' }
- glassPanel: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)' }
- ACTIVE_GLOW: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1.5px rgba(255,255,255,0.25), 0 0 20px rgba(255,255,255,0.06)'

State: isActive, message, activeModel (default Claude), images: string[], webSearch, showWebLabel. Refs: containerRef, textareaRef, fileInputRef. useReducedMotion().

Behavior:
- onFocus textarea → setIsActive(true). Click outside containerRef (mousedown + touchstart listeners, cleanup on unmount) → setIsActive(false).
- Auto-resize textarea: on change set height='auto' then scrollHeight capped at 160.
- webSearch useEffect: when true, showWebLabel=true then setTimeout 1000ms → false (cleanup clearTimeout).
- handleImageUpload: FileReader readAsDataURL → push base64 into images. Reset e.target.value.
- Enter (no shift) → handleSend; clears message + images and resets height.
- canSend = message.trim().length > 0 || images.length > 0.

Root: relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19].

Panel (motion.div, ref=containerRef wraps inner), className \`relative isolate overflow-hidden rounded-2xl\`, w-[calc(100%-2rem)] max-w-[420px].
- animate boxShadow: isActive ? ACTIVE_GLOW : glassPanel.boxShadow, transition = reducedMotion ? {duration:0.15} : {type:'spring', stiffness:350, damping:28}.
- style: glassPanel background + border (not boxShadow — it's animated).
- Separate blur layer: pointer-events-none absolute inset-0 z-[-1] rounded-2xl style=glassBlur.
- Top highlight: absolute left-6 right-6 top-0 h-[1px] \`linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)\`.

Compose area (relative z-10 flex flex-col gap-6 p-4 pb-2):
- textarea placeholder "Ask anything..." rows=1, bg-transparent text-white/90 placeholder-white/40, caretColor: activeModel.color, maxHeight 160.
- AnimatePresence thumbnails: motion.div wrapper (opacity/height 0↔auto). Each thumbnail 64px rounded-xl border rgba(255,255,255,0.12), spring {stiffness:350, damping:25} scale 0.8↔1; X button (5x5 absolute top-1 right-1, bg rgba(0,0,0,0.6), X size 10 text-white/80).
- Toolbar flex justify-between:
  Left (gap-2): Upload button 32x32 rounded-xl bg rgba(255,255,255,0.08) border rgba(255,255,255,0.12), ImageSquare size 16 color rgba(255,255,255,0.5). Hidden file input accept image/* multiple.
  Globe toggle 32x32 same base; when webSearch: bg \`\${activeModel.color}18\`, border \`1px solid \${activeModel.color}22\`, icon activeModel.color. whileHover scale 1.08 bg white/14 (or \`\${color}28\` when active); whileTap 0.88; spring {320,20}.
  AnimatePresence "Web search on" label: motion.span text-[10px] font-semibold, color \`\${activeModel.color}88\`, opacity+x -4 fade.
  Right: Send button 36x36 rounded-xl. animate: canSend ? { background: \`\${activeModel.color}40\`, border: \`1px solid \${activeModel.color}66\` } : { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }. opacity canSend?1:0.4 pointerEvents none when disabled. PaperPlaneRight size 16 colored accent or white/30.

Divider: mx-4 h-[1px] rgba(255,255,255,0.07).

Model switcher row (px-3 py-2.5): 4 buttons flex-1 rounded-lg px-3 py-1.5. Active button renders motion.div layoutId="model-pill" absolute inset-0 rounded-lg with bg \`\${color}18\` border \`1px solid \${color}22\` spring {stiffness:400, damping:28}. Label text-[11px] font-semibold color=isActive?color:'rgba(255,255,255,0.50)'.

Icons from @phosphor-icons/react (weight="regular"): PaperPlaneRight, ImageSquare, GlobeSimple, X. Framer Motion: motion, AnimatePresence, useReducedMotion.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 11px, 14px
- Weights: 500, 600`,

  'V0': `Create a React client component named \`GlassAiCompose\` — a glassmorphism AI prompt composer with per-model theming, textarea, image uploads, web-search toggle, and a layoutId model switcher.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background image (absolute inset-0, object-cover, opacity-60, pointer-events-none):
\`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133\`

MODELS (label, color):
- Claude #FF7B54
- ChatGPT #10A37F
- Perplexity #3A86FF
- Gemini #FFBE0B

Constants: MAX_TEXTAREA_HEIGHT = 160.

Glass shared styles:
- glassBlur: { backdropFilter: 'blur(24px) saturate(1.8)', WebkitBackdropFilter: 'blur(24px) saturate(1.8)' }
- glassPanel: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)' }
- ACTIVE_GLOW: '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1.5px rgba(255,255,255,0.25), 0 0 20px rgba(255,255,255,0.06)'

State: isActive, message, activeModel (default Claude), images: string[], webSearch, showWebLabel. Refs: containerRef, textareaRef, fileInputRef. useReducedMotion().

Behavior:
- onFocus textarea → setIsActive(true). Click outside containerRef (mousedown + touchstart listeners, cleanup on unmount) → setIsActive(false).
- Auto-resize textarea: on change set height='auto' then scrollHeight capped at 160.
- webSearch useEffect: when true, showWebLabel=true then setTimeout 1000ms → false (cleanup clearTimeout).
- handleImageUpload: FileReader readAsDataURL → push base64 into images. Reset e.target.value.
- Enter (no shift) → handleSend; clears message + images and resets height.
- canSend = message.trim().length > 0 || images.length > 0.

Root: relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19].

Panel (motion.div, ref=containerRef wraps inner), className \`relative isolate overflow-hidden rounded-2xl\`, w-[calc(100%-2rem)] max-w-[420px].
- animate boxShadow: isActive ? ACTIVE_GLOW : glassPanel.boxShadow, transition = reducedMotion ? {duration:0.15} : {type:'spring', stiffness:350, damping:28}.
- style: glassPanel background + border (not boxShadow — it's animated).
- Separate blur layer: pointer-events-none absolute inset-0 z-[-1] rounded-2xl style=glassBlur.
- Top highlight: absolute left-6 right-6 top-0 h-[1px] \`linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)\`.

Compose area (relative z-10 flex flex-col gap-6 p-4 pb-2):
- textarea placeholder "Ask anything..." rows=1, bg-transparent text-white/90 placeholder-white/40, caretColor: activeModel.color, maxHeight 160.
- AnimatePresence thumbnails: motion.div wrapper (opacity/height 0↔auto). Each thumbnail 64px rounded-xl border rgba(255,255,255,0.12), spring {stiffness:350, damping:25} scale 0.8↔1; X button (5x5 absolute top-1 right-1, bg rgba(0,0,0,0.6), X size 10 text-white/80).
- Toolbar flex justify-between:
  Left (gap-2): Upload button 32x32 rounded-xl bg rgba(255,255,255,0.08) border rgba(255,255,255,0.12), ImageSquare size 16 color rgba(255,255,255,0.5). Hidden file input accept image/* multiple.
  Globe toggle 32x32 same base; when webSearch: bg \`\${activeModel.color}18\`, border \`1px solid \${activeModel.color}22\`, icon activeModel.color. whileHover scale 1.08 bg white/14 (or \`\${color}28\` when active); whileTap 0.88; spring {320,20}.
  AnimatePresence "Web search on" label: motion.span text-[10px] font-semibold, color \`\${activeModel.color}88\`, opacity+x -4 fade.
  Right: Send button 36x36 rounded-xl. animate: canSend ? { background: \`\${activeModel.color}40\`, border: \`1px solid \${activeModel.color}66\` } : { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.08)' }. opacity canSend?1:0.4 pointerEvents none when disabled. PaperPlaneRight size 16 colored accent or white/30.

Divider: mx-4 h-[1px] rgba(255,255,255,0.07).

Model switcher row (px-3 py-2.5): 4 buttons flex-1 rounded-lg px-3 py-1.5. Active button renders motion.div layoutId="model-pill" absolute inset-0 rounded-lg with bg \`\${color}18\` border \`1px solid \${color}22\` spring {stiffness:400, damping:28}. Label text-[11px] font-semibold color=isActive?color:'rgba(255,255,255,0.50)'.

Icons from @phosphor-icons/react (weight="regular"): PaperPlaneRight, ImageSquare, GlobeSimple, X. Framer Motion: motion, AnimatePresence, useReducedMotion.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 11px, 14px
- Weights: 500, 600`,
}
