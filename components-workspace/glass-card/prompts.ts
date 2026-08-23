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

Create a React client component named \`GlassCard\`, three frosted-glass feature cards with 3D mouse-tilt, rotating gradient border, and notification-style tinted icon badges over an orange-flower background.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background (absolute inset-0 object-cover opacity-60 pointer-events-none):
\`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133\`

CARDS (title, subtitle, color, gradient pair, cta, Icon):
1. Analytics | "Real-time metrics and insights for your application." | #5B8FF9 / '#5B8FF9, #A78BFA' | "View Dashboard" | ChartLineUp
2. Automation | "Streamline your workflows with intelligent triggers." | #FF6BF5 / '#FF6BF5, #FF6680' | "Create Workflow" | Lightning
3. Security | "Enterprise-grade protection for your data." | #FF7B54 / '#FF7B54, #FFBE0B' | "View Report" | ShieldCheck

Root: relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]. Inside: background <img>, then a flex-wrap gap-6 px-6 row mapping cards.

Inner GlassCardItem (defined inline in same file):
- cardRef = useRef<HTMLDivElement>(null).
- mouseX, mouseY = useMotionValue(0.5) each.
- rotateX = useSpring(useTransform(mouseY, [0,1], [8,-8]), {stiffness:200, damping:20}).
- rotateY = useSpring(useTransform(mouseX, [0,1], [-8,8]), {stiffness:200, damping:20}).
- handleMouse: rect = cardRef.current!.getBoundingClientRect(); mouseX.set((e.clientX-rect.left)/rect.width); mouseY similar.
- handleLeave: reset both to 0.5.

Outer card motion.div: ref, onMouseMove, onMouseLeave, style {rotateX, rotateY, transformPerspective: 800}, className "relative w-64 cursor-pointer overflow-hidden rounded-3xl p-[1px]".

Inside:
(a) Rotating border motion.div: className "absolute inset-0 rounded-3xl opacity-30", style background \`linear-gradient(135deg, \${gradient}, transparent 60%)\`, animate {rotate:[0,360]}, transition {duration:20, repeat:Infinity, ease:'linear'}.
(b) Card body div className "relative rounded-3xl p-6", style: background 'rgba(255,255,255,0.08)', backdropFilter 'blur(24px) saturate(1.8)', WebkitBackdropFilter same, boxShadow '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)'.
  - Icon badge motion.div: mb-5 flex h-12 w-12 items-center justify-center rounded-xl, style {background: \`\${color}18\`, border: \`1px solid \${color}22\`}, whileHover {scale:1.1, rotate:5}, transition {type:'spring', stiffness:400, damping:15}. Child: <Icon size={22} weight="regular" style={{color}} />.
  - <h3 className="mb-2 text-base font-semibold text-white/90">{title}</h3>
  - <p className="mb-5 text-sm leading-relaxed text-white/40">{subtitle}</p>
  - CTA motion.button: whileHover {scale:1.03}, whileTap {scale:0.97}, className "flex w-full items-center justify-between rounded-2xl px-4 py-3". Style: background \`linear-gradient(135deg, \${color1}40, \${color2}28)\`, border \`1px solid \${color1}55\`, boxShadow \`0 2px 12px \${color1}25\`. onMouseEnter updates boxShadow to \`0 4px 20px \${color1}45\`; onMouseLeave back. Split gradient by ','. Inside: <span style={{color:'rgba(255,255,255,0.75)'}} text-sm font-semibold>{cta}</span> + <ArrowRight size={16} weight="regular" style={{color:'rgba(255,255,255,0.55)'}} />.
  - Top edge highlight div: absolute left-6 right-6 top-0 h-[1px] background "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)".

No entrance animation. Always dark. Icons from @phosphor-icons/react (weight="regular"): ChartLineUp, Lightning, ShieldCheck, ArrowRight. Imports: useRef from react; motion, useMotionValue, useTransform, useSpring from framer-motion.

## Typography
- Font: project default sans-serif
- Sizes: 14px, 16px
- Weights: 600`,

  'Lovable': `Create a React client component named \`GlassCard\` — three frosted-glass feature cards with 3D mouse-tilt, rotating gradient border, and notification-style tinted icon badges over an orange-flower background.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background (absolute inset-0 object-cover opacity-60 pointer-events-none):
\`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133\`

CARDS (title, subtitle, color, gradient pair, cta, Icon):
1. Analytics — "Real-time metrics and insights for your application." — #5B8FF9 / '#5B8FF9, #A78BFA' — "View Dashboard" — ChartLineUp
2. Automation — "Streamline your workflows with intelligent triggers." — #FF6BF5 / '#FF6BF5, #FF6680' — "Create Workflow" — Lightning
3. Security — "Enterprise-grade protection for your data." — #FF7B54 / '#FF7B54, #FFBE0B' — "View Report" — ShieldCheck

Root: relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]. Inside: background <img>, then a flex-wrap gap-6 px-6 row mapping cards.

Inner GlassCardItem (defined inline in same file):
- cardRef = useRef<HTMLDivElement>(null).
- mouseX, mouseY = useMotionValue(0.5) each.
- rotateX = useSpring(useTransform(mouseY, [0,1], [8,-8]), {stiffness:200, damping:20}).
- rotateY = useSpring(useTransform(mouseX, [0,1], [-8,8]), {stiffness:200, damping:20}).
- handleMouse: rect = cardRef.current!.getBoundingClientRect(); mouseX.set((e.clientX-rect.left)/rect.width); mouseY similar.
- handleLeave: reset both to 0.5.

Outer card motion.div: ref, onMouseMove, onMouseLeave, style {rotateX, rotateY, transformPerspective: 800}, className "relative w-64 cursor-pointer overflow-hidden rounded-3xl p-[1px]".

Inside:
(a) Rotating border motion.div: className "absolute inset-0 rounded-3xl opacity-30", style background \`linear-gradient(135deg, \${gradient}, transparent 60%)\`, animate {rotate:[0,360]}, transition {duration:20, repeat:Infinity, ease:'linear'}.
(b) Card body div className "relative rounded-3xl p-6", style: background 'rgba(255,255,255,0.08)', backdropFilter 'blur(24px) saturate(1.8)', WebkitBackdropFilter same, boxShadow '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)'.
  - Icon badge motion.div: mb-5 flex h-12 w-12 items-center justify-center rounded-xl, style {background: \`\${color}18\`, border: \`1px solid \${color}22\`}, whileHover {scale:1.1, rotate:5}, transition {type:'spring', stiffness:400, damping:15}. Child: <Icon size={22} weight="regular" style={{color}} />.
  - <h3 className="mb-2 text-base font-semibold text-white/90">{title}</h3>
  - <p className="mb-5 text-sm leading-relaxed text-white/40">{subtitle}</p>
  - CTA motion.button: whileHover {scale:1.03}, whileTap {scale:0.97}, className "flex w-full items-center justify-between rounded-2xl px-4 py-3". Style: background \`linear-gradient(135deg, \${color1}40, \${color2}28)\`, border \`1px solid \${color1}55\`, boxShadow \`0 2px 12px \${color1}25\`. onMouseEnter updates boxShadow to \`0 4px 20px \${color1}45\`; onMouseLeave back. Split gradient by ','. Inside: <span style={{color:'rgba(255,255,255,0.75)'}} text-sm font-semibold>{cta}</span> + <ArrowRight size={16} weight="regular" style={{color:'rgba(255,255,255,0.55)'}} />.
  - Top edge highlight div: absolute left-6 right-6 top-0 h-[1px] background "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)".

No entrance animation. Always dark. Icons from @phosphor-icons/react (weight="regular"): ChartLineUp, Lightning, ShieldCheck, ArrowRight. Imports: useRef from react; motion, useMotionValue, useTransform, useSpring from framer-motion.

## Typography
- Font: project default sans-serif
- Sizes: 14px, 16px
- Weights: 600`,

  'V0': `Create a React client component named \`GlassCard\` — three frosted-glass feature cards with 3D mouse-tilt, rotating gradient border, and notification-style tinted icon badges over an orange-flower background.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Background (absolute inset-0 object-cover opacity-60 pointer-events-none):
\`https://ik.imagekit.io/aitoolkit/bg%20images/Ethereal%20Orange%20Flower%204%20(1).png?updatedAt=1775226802133\`

CARDS (title, subtitle, color, gradient pair, cta, Icon):
1. Analytics — "Real-time metrics and insights for your application." — #5B8FF9 / '#5B8FF9, #A78BFA' — "View Dashboard" — ChartLineUp
2. Automation — "Streamline your workflows with intelligent triggers." — #FF6BF5 / '#FF6BF5, #FF6680' — "Create Workflow" — Lightning
3. Security — "Enterprise-grade protection for your data." — #FF7B54 / '#FF7B54, #FFBE0B' — "View Report" — ShieldCheck

Root: relative flex h-full w-full items-center justify-center overflow-hidden bg-[#1A1A19]. Inside: background <img>, then a flex-wrap gap-6 px-6 row mapping cards.

Inner GlassCardItem (defined inline in same file):
- cardRef = useRef<HTMLDivElement>(null).
- mouseX, mouseY = useMotionValue(0.5) each.
- rotateX = useSpring(useTransform(mouseY, [0,1], [8,-8]), {stiffness:200, damping:20}).
- rotateY = useSpring(useTransform(mouseX, [0,1], [-8,8]), {stiffness:200, damping:20}).
- handleMouse: rect = cardRef.current!.getBoundingClientRect(); mouseX.set((e.clientX-rect.left)/rect.width); mouseY similar.
- handleLeave: reset both to 0.5.

Outer card motion.div: ref, onMouseMove, onMouseLeave, style {rotateX, rotateY, transformPerspective: 800}, className "relative w-64 cursor-pointer overflow-hidden rounded-3xl p-[1px]".

Inside:
(a) Rotating border motion.div: className "absolute inset-0 rounded-3xl opacity-30", style background \`linear-gradient(135deg, \${gradient}, transparent 60%)\`, animate {rotate:[0,360]}, transition {duration:20, repeat:Infinity, ease:'linear'}.
(b) Card body div className "relative rounded-3xl p-6", style: background 'rgba(255,255,255,0.08)', backdropFilter 'blur(24px) saturate(1.8)', WebkitBackdropFilter same, boxShadow '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.12)'.
  - Icon badge motion.div: mb-5 flex h-12 w-12 items-center justify-center rounded-xl, style {background: \`\${color}18\`, border: \`1px solid \${color}22\`}, whileHover {scale:1.1, rotate:5}, transition {type:'spring', stiffness:400, damping:15}. Child: <Icon size={22} weight="regular" style={{color}} />.
  - <h3 className="mb-2 text-base font-semibold text-white/90">{title}</h3>
  - <p className="mb-5 text-sm leading-relaxed text-white/40">{subtitle}</p>
  - CTA motion.button: whileHover {scale:1.03}, whileTap {scale:0.97}, className "flex w-full items-center justify-between rounded-2xl px-4 py-3". Style: background \`linear-gradient(135deg, \${color1}40, \${color2}28)\`, border \`1px solid \${color1}55\`, boxShadow \`0 2px 12px \${color1}25\`. onMouseEnter updates boxShadow to \`0 4px 20px \${color1}45\`; onMouseLeave back. Split gradient by ','. Inside: <span style={{color:'rgba(255,255,255,0.75)'}} text-sm font-semibold>{cta}</span> + <ArrowRight size={16} weight="regular" style={{color:'rgba(255,255,255,0.55)'}} />.
  - Top edge highlight div: absolute left-6 right-6 top-0 h-[1px] background "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)".

No entrance animation. Always dark. Icons from @phosphor-icons/react (weight="regular"): ChartLineUp, Lightning, ShieldCheck, ArrowRight. Imports: useRef from react; motion, useMotionValue, useTransform, useSpring from framer-motion.

## Typography
- Font: project default sans-serif
- Sizes: 14px, 16px
- Weights: 600`,
}
