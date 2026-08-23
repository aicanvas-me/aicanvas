import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion @phosphor-icons/react

Root element: className="relative flex min-h-screen w-full items-center justify-end overflow-hidden bg-[#1A1A19] pb-8"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named \`GlassDock\`, a macOS-style frosted glass dock with distance-based magnification, notification-style tinted icon badges, and frosted tooltips.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background image (absolute inset-0 object-cover opacity-60 pointer-events-none):
\`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png?updatedAt=1775223702866\`

Constants:
- ICON_SIZE = 44
- MAG_RANGE = 120
- MAG_SCALE = 1.55

DOCK_ITEMS (icon, label, color):
Sun #FFBE0B "Energy" · Heart #FF5C8A "Love" · MusicNote #FF7B54 "Joy" · Coffee #C9A96E "Comfort" · Leaf #06D6A0 "Nature" · Star #FFBE0B "Dreams" · Moon #B388FF "Rest" · Flame #FF5C8A "Passion" · Cloud #3A86FF "Peace".

Root: div relative flex h-full w-full items-center justify-end overflow-hidden bg-[#1A1A19] pb-8. Background <img>.

GlassDock: const mouseX = useMotionValue(-200). Dock motion.div:
- initial {y:50}, animate {y:0}, transition {type:'spring', stiffness:180, damping:20}
- onMouseMove: mouseX.set(e.clientX); onMouseLeave: mouseX.set(-200)
- className "relative isolate mx-auto flex items-end gap-2 rounded-3xl px-4 pb-3 pt-3"
- style: background 'rgba(255,255,255,0.06)', border '1px solid rgba(255,255,255,0.1)', boxShadow '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
- Separate blur layer: pointer-events-none absolute inset-0 z-[-1] rounded-3xl, style { backdropFilter:'blur(24px) saturate(1.8)', WebkitBackdropFilter same }. Non-animating layer so magnification frames don't re-blur.
- Map DOCK_ITEMS to DockItem.

DockItem props: { icon: Icon, color, label, mouseX, index }.
- ref = useRef<HTMLDivElement>(null)
- distance = useTransform(mouseX, mx => { el=ref.current; if(!el||mx<0) return 200; const rect=el.getBoundingClientRect(); const center=rect.left+rect.width/2; return Math.abs(mx-center) })
- rawSize = useTransform(distance, [0, MAG_RANGE], [ICON_SIZE*MAG_SCALE, ICON_SIZE])
- size = useSpring(rawSize, { stiffness:300, damping:22, mass:0.5 })
- y = useTransform(size, [ICON_SIZE, ICON_SIZE*MAG_SCALE], [0, -12])

Outer motion.div: className "group relative flex cursor-pointer flex-col items-center", entrance initial {opacity:0, y:20} animate {opacity:1, y:0}, transition {type:'spring', stiffness:200, damping:18, delay: index*0.04}.

Tooltip motion.div: className "pointer-events-none absolute -top-10 rounded-lg px-3 py-1.5 text-xs font-medium text-white/90 opacity-0 group-hover:opacity-100", style background 'rgba(255,255,255,0.1)', backdropFilter 'blur(16px)', border '1px solid rgba(255,255,255,0.1)', transition 'opacity 0.15s'.

Icon badge motion.div (notification-style tinted, NOT gradient, NOT gloss, NOT squircle): style {width:size, height:size, y, background: \`\${color}18\`, border: \`1px solid \${color}22\`, borderRadius:12}, whileTap {scale:0.82}, className "flex items-center justify-center". Inside: <Icon size={22} weight="regular" style={{color}} />.

Imports: useRef from react; motion, useMotionValue, useSpring, useTransform from framer-motion; Sun, Heart, MusicNote, Coffee, Leaf, Star, Moon, Flame, Cloud from @phosphor-icons/react (all weight="regular").

## Typography
- Font: project default sans-serif
- Sizes: 12px
- Weights: 500`,

  'Lovable': `Create a React client component named \`GlassDock\` — a macOS-style frosted glass dock with distance-based magnification, notification-style tinted icon badges, and frosted tooltips.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background image (absolute inset-0 object-cover opacity-60 pointer-events-none):
\`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png?updatedAt=1775223702866\`

Constants:
- ICON_SIZE = 44
- MAG_RANGE = 120
- MAG_SCALE = 1.55

DOCK_ITEMS (icon, label, color):
Sun #FFBE0B "Energy" · Heart #FF5C8A "Love" · MusicNote #FF7B54 "Joy" · Coffee #C9A96E "Comfort" · Leaf #06D6A0 "Nature" · Star #FFBE0B "Dreams" · Moon #B388FF "Rest" · Flame #FF5C8A "Passion" · Cloud #3A86FF "Peace".

Root: div relative flex h-full w-full items-center justify-end overflow-hidden bg-[#1A1A19] pb-8. Background <img>.

GlassDock: const mouseX = useMotionValue(-200). Dock motion.div:
- initial {y:50}, animate {y:0}, transition {type:'spring', stiffness:180, damping:20}
- onMouseMove: mouseX.set(e.clientX); onMouseLeave: mouseX.set(-200)
- className "relative isolate mx-auto flex items-end gap-2 rounded-3xl px-4 pb-3 pt-3"
- style: background 'rgba(255,255,255,0.06)', border '1px solid rgba(255,255,255,0.1)', boxShadow '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
- Separate blur layer: pointer-events-none absolute inset-0 z-[-1] rounded-3xl, style { backdropFilter:'blur(24px) saturate(1.8)', WebkitBackdropFilter same } — non-animating layer so magnification frames don't re-blur.
- Map DOCK_ITEMS to DockItem.

DockItem props: { icon: Icon, color, label, mouseX, index }.
- ref = useRef<HTMLDivElement>(null)
- distance = useTransform(mouseX, mx => { el=ref.current; if(!el||mx<0) return 200; const rect=el.getBoundingClientRect(); const center=rect.left+rect.width/2; return Math.abs(mx-center) })
- rawSize = useTransform(distance, [0, MAG_RANGE], [ICON_SIZE*MAG_SCALE, ICON_SIZE])
- size = useSpring(rawSize, { stiffness:300, damping:22, mass:0.5 })
- y = useTransform(size, [ICON_SIZE, ICON_SIZE*MAG_SCALE], [0, -12])

Outer motion.div: className "group relative flex cursor-pointer flex-col items-center", entrance initial {opacity:0, y:20} animate {opacity:1, y:0}, transition {type:'spring', stiffness:200, damping:18, delay: index*0.04}.

Tooltip motion.div: className "pointer-events-none absolute -top-10 rounded-lg px-3 py-1.5 text-xs font-medium text-white/90 opacity-0 group-hover:opacity-100", style background 'rgba(255,255,255,0.1)', backdropFilter 'blur(16px)', border '1px solid rgba(255,255,255,0.1)', transition 'opacity 0.15s'.

Icon badge motion.div (notification-style tinted — NOT gradient, NOT gloss, NOT squircle): style {width:size, height:size, y, background: \`\${color}18\`, border: \`1px solid \${color}22\`, borderRadius:12}, whileTap {scale:0.82}, className "flex items-center justify-center". Inside: <Icon size={22} weight="regular" style={{color}} />.

Imports: useRef from react; motion, useMotionValue, useSpring, useTransform from framer-motion; Sun, Heart, MusicNote, Coffee, Leaf, Star, Moon, Flame, Cloud from @phosphor-icons/react (all weight="regular").

## Typography
- Font: project default sans-serif
- Sizes: 12px
- Weights: 500`,

  'V0': `Create a React client component named \`GlassDock\` — a macOS-style frosted glass dock with distance-based magnification, notification-style tinted icon badges, and frosted tooltips.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background image (absolute inset-0 object-cover opacity-60 pointer-events-none):
\`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%201%20(1).png?updatedAt=1775223702866\`

Constants:
- ICON_SIZE = 44
- MAG_RANGE = 120
- MAG_SCALE = 1.55

DOCK_ITEMS (icon, label, color):
Sun #FFBE0B "Energy" · Heart #FF5C8A "Love" · MusicNote #FF7B54 "Joy" · Coffee #C9A96E "Comfort" · Leaf #06D6A0 "Nature" · Star #FFBE0B "Dreams" · Moon #B388FF "Rest" · Flame #FF5C8A "Passion" · Cloud #3A86FF "Peace".

Root: div relative flex h-full w-full items-center justify-end overflow-hidden bg-[#1A1A19] pb-8. Background <img>.

GlassDock: const mouseX = useMotionValue(-200). Dock motion.div:
- initial {y:50}, animate {y:0}, transition {type:'spring', stiffness:180, damping:20}
- onMouseMove: mouseX.set(e.clientX); onMouseLeave: mouseX.set(-200)
- className "relative isolate mx-auto flex items-end gap-2 rounded-3xl px-4 pb-3 pt-3"
- style: background 'rgba(255,255,255,0.06)', border '1px solid rgba(255,255,255,0.1)', boxShadow '0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
- Separate blur layer: pointer-events-none absolute inset-0 z-[-1] rounded-3xl, style { backdropFilter:'blur(24px) saturate(1.8)', WebkitBackdropFilter same } — non-animating layer so magnification frames don't re-blur.
- Map DOCK_ITEMS to DockItem.

DockItem props: { icon: Icon, color, label, mouseX, index }.
- ref = useRef<HTMLDivElement>(null)
- distance = useTransform(mouseX, mx => { el=ref.current; if(!el||mx<0) return 200; const rect=el.getBoundingClientRect(); const center=rect.left+rect.width/2; return Math.abs(mx-center) })
- rawSize = useTransform(distance, [0, MAG_RANGE], [ICON_SIZE*MAG_SCALE, ICON_SIZE])
- size = useSpring(rawSize, { stiffness:300, damping:22, mass:0.5 })
- y = useTransform(size, [ICON_SIZE, ICON_SIZE*MAG_SCALE], [0, -12])

Outer motion.div: className "group relative flex cursor-pointer flex-col items-center", entrance initial {opacity:0, y:20} animate {opacity:1, y:0}, transition {type:'spring', stiffness:200, damping:18, delay: index*0.04}.

Tooltip motion.div: className "pointer-events-none absolute -top-10 rounded-lg px-3 py-1.5 text-xs font-medium text-white/90 opacity-0 group-hover:opacity-100", style background 'rgba(255,255,255,0.1)', backdropFilter 'blur(16px)', border '1px solid rgba(255,255,255,0.1)', transition 'opacity 0.15s'.

Icon badge motion.div (notification-style tinted — NOT gradient, NOT gloss, NOT squircle): style {width:size, height:size, y, background: \`\${color}18\`, border: \`1px solid \${color}22\`, borderRadius:12}, whileTap {scale:0.82}, className "flex items-center justify-center". Inside: <Icon size={22} weight="regular" style={{color}} />.

Imports: useRef from react; motion, useMotionValue, useSpring, useTransform from framer-motion; Sun, Heart, MusicNote, Coffee, Leaf, Star, Moon, Flame, Cloud from @phosphor-icons/react (all weight="regular").

## Typography
- Font: project default sans-serif
- Sizes: 12px
- Weights: 500`,
}
