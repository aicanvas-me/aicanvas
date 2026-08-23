import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion @phosphor-icons/react

Root element: className="relative flex min-h-screen w-full items-center justify-center"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named \`RadialToolbar\`, a persistent circular EDIT button that opens a 6-wedge radial pie menu of text-formatting tools.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

## Imports
\`\`\`
'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import { X, TextB, TextItalic, TextUnderline, TextStrikethrough, LinkSimple, Palette } from '@phosphor-icons/react'
\`\`\`

## Geometry constants (exact)
\`\`\`
const CX = 120, CY = 120
const R_IN  = 30   // exactly half the 60px button, wedges touch the button, no gap
const R_OUT = 114
const R_ICON = 78
const GAP = 0
\`\`\`

\`toRad = (d) => (d - 90) * (Math.PI / 180)\` (so 0° points up).

\`wedgePath(startDeg, endDeg)\` returns SVG path:
- s = toRad(start + GAP), e = toRad(end - GAP)
- (x1,y1) = inner @ s; (x2,y2) = outer @ s; (x3,y3) = outer @ e; (x4,y4) = inner @ e
- \`M x1 y1 L x2 y2 A R_OUT R_OUT 0 0 1 x3 y3 L x4 y4 A R_IN R_IN 0 0 0 x1 y1 Z\`

\`iconXY(midDeg)\` returns \`{ x: CX + R_ICON*cos(toRad(mid)), y: CY + R_ICON*sin(toRad(mid)) }\`.

## Tools (clockwise from top, 60° each)
\`[ {id:'bold', label:'Bold', Icon: TextB}, {id:'italic', label:'Italic', Icon: TextItalic}, {id:'under', label:'Underline', Icon: TextUnderline}, {id:'strike', label:'Strikethrough', Icon: TextStrikethrough}, {id:'link', label:'Link', Icon: LinkSimple}, {id:'color', label:'Color', Icon: Palette} ]\`

## State
\`open\` (bool), \`hoveredId\` (string|null), \`activeId\` (string|null), \`isDark\` (bool, default true).

## Theme detection (inline useEffect)
Get \`containerRef.current\`. Function \`check\`: find \`closest('[data-card-theme]')\`; if found use its \`.classList.contains('dark')\`, else use \`document.documentElement.classList.contains('dark')\`. Run \`check()\` once. Create a \`MutationObserver(check)\` and observe \`document.documentElement\` (attributes, attributeFilter ['class']) and the card wrapper if present. Cleanup disconnects.

## Layout
Root \`div ref={containerRef} className="relative flex h-full w-full items-center justify-center"\` with \`style={{ background: isDark ? '#0a0a0a' : '#F5F1EA' }}\`.

## Wheel (AnimatePresence around \`open\` block)
When open: \`<div className="absolute inset-0 flex items-center justify-center">\` containing \`motion.div\` \`{ width:240, height:240, position:'relative', filter:'drop-shadow(0 20px 48px rgba(0,0,0,0.7))' }\`, \`initial { opacity:0 }\`, \`animate { opacity:1 }\`, \`exit { opacity:0 }\`, \`transition { duration:0.22, ease:'easeOut' }\`.

Inside the motion.div:
1. \`<svg width=240 height=240 className="absolute inset-0">\`:
   - One \`<circle cx=CX cy=CY r=R_OUT+1 fill="none" stroke=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.10)' strokeWidth=1 />\`.
   - 6 wedge \`<path>\` (NOT motion). \`d={wedgePath(i*60, i*60+60)}\`. style.fill: active → \`isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)'\`; hover → \`'rgba(255,255,255,0.14)' / 'rgba(0,0,0,0.10)'\`; idle → \`'rgba(255,255,255,0.07)' / 'rgba(0,0,0,0.06)'\`. style.stroke \`'rgba(255,255,255,0.04)' / 'rgba(0,0,0,0.06)'\` strokeWidth 1, transition \`'fill 0.18s ease'\`, cursor pointer. \`onPointerEnter\`/\`onPointerLeave\` set hoveredId. \`onClick\` toggles activeId (\`p === id ? null : id\`).

2. 6 \`motion.div\` icon containers (outside the svg, inside the motion.div). For each tool i:
   - \`{ x, y } = iconXY(i*60 + 30)\`
   - \`className="absolute flex items-center justify-center"\`
   - style \`{ left: x-12, top: y-12, width:24, height:24, pointerEvents:'none' }\`
   - \`initial { opacity:0, scale:0.4 }\`, \`animate { opacity:1, scale:1 }\`
   - \`transition { type:'spring', stiffness:320, damping:28, delay: i*0.035 + 0.05 }\`
   - Inside: \`<tool.Icon size={18} weight="regular" color={...} />\` where color = active → \`isDark?'#ffffff':'#110F0C'\`; hover → \`isDark?'#e4e4e7':'#2E2A24'\`; idle → \`isDark?'#71717a':'#9E9890'\`.

## Persistent EDIT button
\`motion.button\` (always rendered, not inside AnimatePresence) with style:
- \`position:'relative', zIndex:10, width:60, height:60, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'\`
- \`background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'\`
- \`border: '1px solid ' + (isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)')\`
- \`boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' : '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)'\`
- \`whileHover { scale:1.08 }\`, \`whileTap { scale:0.94 }\`
- \`onClick: open ? close : () => setOpen(true)\`. \`close\` sets open false, activeId null, hoveredId null.

Inside, an \`AnimatePresence mode="wait"\`:
- !open → \`motion.span key="edit"\`, \`initial { opacity:0, scale:0.7 }\`, \`animate { opacity:1, scale:1 }\`, \`exit { opacity:0, scale:0.7 }\`, \`transition { duration:0.14, ease:'easeOut' }\`. Style \`{ fontFamily:'var(--font-sans, sans-serif)', fontSize:11, fontWeight:700, letterSpacing:'0.1em', color: isDark?'#e4e4e7':'#2E2A24', userSelect:'none' }\`. Text "EDIT".
- open → \`motion.span key="x-icon"\`, \`initial { opacity:0, rotate:-90, scale:0.4 }\`, \`animate { opacity:1, rotate:0, scale:1 }\`, \`exit { opacity:0, rotate:-90, scale:0.4 }\`, \`transition { type:'spring', stiffness:260, damping:24 }\`, style \`{ display:'flex' }\`. Inside: \`<X size={16} weight="regular" color={isDark?'#a1a1aa':'#4A453F'} />\`.

## Label pill (AnimatePresence)
When open AND \`labelTool\` exists. \`labelTool = TOOLS.find(t=>t.id===hoveredId) ?? TOOLS.find(t=>t.id===activeId)\`. \`motion.div key={labelTool.id}\` className \`pointer-events-none absolute flex items-center gap-1.5 rounded-full px-3 py-1.5\`. style:
- \`top:'calc(50% + 140px)', left:'50%', x:'-50%'\`
- \`background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'\`
- \`border: '1px solid ' + (isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.10)')\`
- \`fontFamily:'var(--font-sans, sans-serif)', whiteSpace:'nowrap'\`

Enter \`{ opacity:0, y:8, scale:0.9 }\` → \`{ opacity:1, y:0, scale:1 }\`, exit \`{ opacity:0, y:4, scale:0.95 }\`, \`transition { type:'spring', stiffness:500, damping:30 }\`.

Inside: \`<labelTool.Icon size={11} weight="regular" color={activeId===labelTool.id ? (isDark?'#e4e4e7':'#2E2A24') : (isDark?'#71717a':'#9E9890')} />\`, \`<span className="text-xs font-medium" style={{ color: isDark?'#a1a1aa':'#736D65' }}>{labelTool.label}</span>\`, and if \`activeId===labelTool.id\` a \`motion.span className="h-1 w-1 rounded-full" style={{ background: isDark?'#ffffff':'#1C1916' }} initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:600, damping:20 }} />\`.

Use Manrope font. The button must remain visible at all times. Opening only adds the wheel around it, never replaces it.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 12px
- Weights: 500, 700`,

  'Lovable': `Create a React client component named \`RadialToolbar\` — a persistent circular EDIT button that opens a 6-wedge radial pie menu of text-formatting tools.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

## Imports
\`\`\`
'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import { X, TextB, TextItalic, TextUnderline, TextStrikethrough, LinkSimple, Palette } from '@phosphor-icons/react'
\`\`\`

## Geometry constants (exact)
\`\`\`
const CX = 120, CY = 120
const R_IN  = 30   // exactly half the 60px button — wedges touch the button, no gap
const R_OUT = 114
const R_ICON = 78
const GAP = 0
\`\`\`

\`toRad = (d) => (d - 90) * (Math.PI / 180)\` (so 0° points up).

\`wedgePath(startDeg, endDeg)\` returns SVG path:
- s = toRad(start + GAP), e = toRad(end - GAP)
- (x1,y1) = inner @ s; (x2,y2) = outer @ s; (x3,y3) = outer @ e; (x4,y4) = inner @ e
- \`M x1 y1 L x2 y2 A R_OUT R_OUT 0 0 1 x3 y3 L x4 y4 A R_IN R_IN 0 0 0 x1 y1 Z\`

\`iconXY(midDeg)\` returns \`{ x: CX + R_ICON*cos(toRad(mid)), y: CY + R_ICON*sin(toRad(mid)) }\`.

## Tools (clockwise from top, 60° each)
\`[ {id:'bold', label:'Bold', Icon: TextB}, {id:'italic', label:'Italic', Icon: TextItalic}, {id:'under', label:'Underline', Icon: TextUnderline}, {id:'strike', label:'Strikethrough', Icon: TextStrikethrough}, {id:'link', label:'Link', Icon: LinkSimple}, {id:'color', label:'Color', Icon: Palette} ]\`

## State
\`open\` (bool), \`hoveredId\` (string|null), \`activeId\` (string|null), \`isDark\` (bool, default true).

## Theme detection (inline useEffect)
Get \`containerRef.current\`. Function \`check\`: find \`closest('[data-card-theme]')\`; if found use its \`.classList.contains('dark')\`, else use \`document.documentElement.classList.contains('dark')\`. Run \`check()\` once. Create a \`MutationObserver(check)\` and observe \`document.documentElement\` (attributes, attributeFilter ['class']) and the card wrapper if present. Cleanup disconnects.

## Layout
Root \`div ref={containerRef} className="relative flex h-full w-full items-center justify-center"\` with \`style={{ background: isDark ? '#0a0a0a' : '#F5F1EA' }}\`.

## Wheel (AnimatePresence around \`open\` block)
When open: \`<div className="absolute inset-0 flex items-center justify-center">\` containing \`motion.div\` \`{ width:240, height:240, position:'relative', filter:'drop-shadow(0 20px 48px rgba(0,0,0,0.7))' }\`, \`initial { opacity:0 }\`, \`animate { opacity:1 }\`, \`exit { opacity:0 }\`, \`transition { duration:0.22, ease:'easeOut' }\`.

Inside the motion.div:
1. \`<svg width=240 height=240 className="absolute inset-0">\`:
   - One \`<circle cx=CX cy=CY r=R_OUT+1 fill="none" stroke=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.10)' strokeWidth=1 />\`.
   - 6 wedge \`<path>\` (NOT motion). \`d={wedgePath(i*60, i*60+60)}\`. style.fill: active → \`isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)'\`; hover → \`'rgba(255,255,255,0.14)' / 'rgba(0,0,0,0.10)'\`; idle → \`'rgba(255,255,255,0.07)' / 'rgba(0,0,0,0.06)'\`. style.stroke \`'rgba(255,255,255,0.04)' / 'rgba(0,0,0,0.06)'\` strokeWidth 1, transition \`'fill 0.18s ease'\`, cursor pointer. \`onPointerEnter\`/\`onPointerLeave\` set hoveredId. \`onClick\` toggles activeId (\`p === id ? null : id\`).

2. 6 \`motion.div\` icon containers (outside the svg, inside the motion.div). For each tool i:
   - \`{ x, y } = iconXY(i*60 + 30)\`
   - \`className="absolute flex items-center justify-center"\`
   - style \`{ left: x-12, top: y-12, width:24, height:24, pointerEvents:'none' }\`
   - \`initial { opacity:0, scale:0.4 }\`, \`animate { opacity:1, scale:1 }\`
   - \`transition { type:'spring', stiffness:320, damping:28, delay: i*0.035 + 0.05 }\`
   - Inside: \`<tool.Icon size={18} weight="regular" color={...} />\` where color = active → \`isDark?'#ffffff':'#110F0C'\`; hover → \`isDark?'#e4e4e7':'#2E2A24'\`; idle → \`isDark?'#71717a':'#9E9890'\`.

## Persistent EDIT button
\`motion.button\` (always rendered, not inside AnimatePresence) with style:
- \`position:'relative', zIndex:10, width:60, height:60, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'\`
- \`background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'\`
- \`border: '1px solid ' + (isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)')\`
- \`boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' : '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)'\`
- \`whileHover { scale:1.08 }\`, \`whileTap { scale:0.94 }\`
- \`onClick: open ? close : () => setOpen(true)\`. \`close\` sets open false, activeId null, hoveredId null.

Inside, an \`AnimatePresence mode="wait"\`:
- !open → \`motion.span key="edit"\`, \`initial { opacity:0, scale:0.7 }\`, \`animate { opacity:1, scale:1 }\`, \`exit { opacity:0, scale:0.7 }\`, \`transition { duration:0.14, ease:'easeOut' }\`. Style \`{ fontFamily:'var(--font-sans, sans-serif)', fontSize:11, fontWeight:700, letterSpacing:'0.1em', color: isDark?'#e4e4e7':'#2E2A24', userSelect:'none' }\`. Text "EDIT".
- open → \`motion.span key="x-icon"\`, \`initial { opacity:0, rotate:-90, scale:0.4 }\`, \`animate { opacity:1, rotate:0, scale:1 }\`, \`exit { opacity:0, rotate:-90, scale:0.4 }\`, \`transition { type:'spring', stiffness:260, damping:24 }\`, style \`{ display:'flex' }\`. Inside: \`<X size={16} weight="regular" color={isDark?'#a1a1aa':'#4A453F'} />\`.

## Label pill (AnimatePresence)
When open AND \`labelTool\` exists. \`labelTool = TOOLS.find(t=>t.id===hoveredId) ?? TOOLS.find(t=>t.id===activeId)\`. \`motion.div key={labelTool.id}\` className \`pointer-events-none absolute flex items-center gap-1.5 rounded-full px-3 py-1.5\`. style:
- \`top:'calc(50% + 140px)', left:'50%', x:'-50%'\`
- \`background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'\`
- \`border: '1px solid ' + (isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.10)')\`
- \`fontFamily:'var(--font-sans, sans-serif)', whiteSpace:'nowrap'\`

Enter \`{ opacity:0, y:8, scale:0.9 }\` → \`{ opacity:1, y:0, scale:1 }\`, exit \`{ opacity:0, y:4, scale:0.95 }\`, \`transition { type:'spring', stiffness:500, damping:30 }\`.

Inside: \`<labelTool.Icon size={11} weight="regular" color={activeId===labelTool.id ? (isDark?'#e4e4e7':'#2E2A24') : (isDark?'#71717a':'#9E9890')} />\`, \`<span className="text-xs font-medium" style={{ color: isDark?'#a1a1aa':'#736D65' }}>{labelTool.label}</span>\`, and if \`activeId===labelTool.id\` a \`motion.span className="h-1 w-1 rounded-full" style={{ background: isDark?'#ffffff':'#1C1916' }} initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:600, damping:20 }} />\`.

Use Manrope font. The button must remain visible at all times — opening only adds the wheel around it, never replaces it.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 12px
- Weights: 500, 700`,

  'V0': `Create a React client component named \`RadialToolbar\` — a persistent circular EDIT button that opens a 6-wedge radial pie menu of text-formatting tools.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

## Imports
\`\`\`
'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import { X, TextB, TextItalic, TextUnderline, TextStrikethrough, LinkSimple, Palette } from '@phosphor-icons/react'
\`\`\`

## Geometry constants (exact)
\`\`\`
const CX = 120, CY = 120
const R_IN  = 30   // exactly half the 60px button — wedges touch the button, no gap
const R_OUT = 114
const R_ICON = 78
const GAP = 0
\`\`\`

\`toRad = (d) => (d - 90) * (Math.PI / 180)\` (so 0° points up).

\`wedgePath(startDeg, endDeg)\` returns SVG path:
- s = toRad(start + GAP), e = toRad(end - GAP)
- (x1,y1) = inner @ s; (x2,y2) = outer @ s; (x3,y3) = outer @ e; (x4,y4) = inner @ e
- \`M x1 y1 L x2 y2 A R_OUT R_OUT 0 0 1 x3 y3 L x4 y4 A R_IN R_IN 0 0 0 x1 y1 Z\`

\`iconXY(midDeg)\` returns \`{ x: CX + R_ICON*cos(toRad(mid)), y: CY + R_ICON*sin(toRad(mid)) }\`.

## Tools (clockwise from top, 60° each)
\`[ {id:'bold', label:'Bold', Icon: TextB}, {id:'italic', label:'Italic', Icon: TextItalic}, {id:'under', label:'Underline', Icon: TextUnderline}, {id:'strike', label:'Strikethrough', Icon: TextStrikethrough}, {id:'link', label:'Link', Icon: LinkSimple}, {id:'color', label:'Color', Icon: Palette} ]\`

## State
\`open\` (bool), \`hoveredId\` (string|null), \`activeId\` (string|null), \`isDark\` (bool, default true).

## Theme detection (inline useEffect)
Get \`containerRef.current\`. Function \`check\`: find \`closest('[data-card-theme]')\`; if found use its \`.classList.contains('dark')\`, else use \`document.documentElement.classList.contains('dark')\`. Run \`check()\` once. Create a \`MutationObserver(check)\` and observe \`document.documentElement\` (attributes, attributeFilter ['class']) and the card wrapper if present. Cleanup disconnects.

## Layout
Root \`div ref={containerRef} className="relative flex h-full w-full items-center justify-center"\` with \`style={{ background: isDark ? '#0a0a0a' : '#F5F1EA' }}\`.

## Wheel (AnimatePresence around \`open\` block)
When open: \`<div className="absolute inset-0 flex items-center justify-center">\` containing \`motion.div\` \`{ width:240, height:240, position:'relative', filter:'drop-shadow(0 20px 48px rgba(0,0,0,0.7))' }\`, \`initial { opacity:0 }\`, \`animate { opacity:1 }\`, \`exit { opacity:0 }\`, \`transition { duration:0.22, ease:'easeOut' }\`.

Inside the motion.div:
1. \`<svg width=240 height=240 className="absolute inset-0">\`:
   - One \`<circle cx=CX cy=CY r=R_OUT+1 fill="none" stroke=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.10)' strokeWidth=1 />\`.
   - 6 wedge \`<path>\` (NOT motion). \`d={wedgePath(i*60, i*60+60)}\`. style.fill: active → \`isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.16)'\`; hover → \`'rgba(255,255,255,0.14)' / 'rgba(0,0,0,0.10)'\`; idle → \`'rgba(255,255,255,0.07)' / 'rgba(0,0,0,0.06)'\`. style.stroke \`'rgba(255,255,255,0.04)' / 'rgba(0,0,0,0.06)'\` strokeWidth 1, transition \`'fill 0.18s ease'\`, cursor pointer. \`onPointerEnter\`/\`onPointerLeave\` set hoveredId. \`onClick\` toggles activeId (\`p === id ? null : id\`).

2. 6 \`motion.div\` icon containers (outside the svg, inside the motion.div). For each tool i:
   - \`{ x, y } = iconXY(i*60 + 30)\`
   - \`className="absolute flex items-center justify-center"\`
   - style \`{ left: x-12, top: y-12, width:24, height:24, pointerEvents:'none' }\`
   - \`initial { opacity:0, scale:0.4 }\`, \`animate { opacity:1, scale:1 }\`
   - \`transition { type:'spring', stiffness:320, damping:28, delay: i*0.035 + 0.05 }\`
   - Inside: \`<tool.Icon size={18} weight="regular" color={...} />\` where color = active → \`isDark?'#ffffff':'#110F0C'\`; hover → \`isDark?'#e4e4e7':'#2E2A24'\`; idle → \`isDark?'#71717a':'#9E9890'\`.

## Persistent EDIT button
\`motion.button\` (always rendered, not inside AnimatePresence) with style:
- \`position:'relative', zIndex:10, width:60, height:60, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer'\`
- \`background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'\`
- \`border: '1px solid ' + (isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.14)')\`
- \`boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' : '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.6)'\`
- \`whileHover { scale:1.08 }\`, \`whileTap { scale:0.94 }\`
- \`onClick: open ? close : () => setOpen(true)\`. \`close\` sets open false, activeId null, hoveredId null.

Inside, an \`AnimatePresence mode="wait"\`:
- !open → \`motion.span key="edit"\`, \`initial { opacity:0, scale:0.7 }\`, \`animate { opacity:1, scale:1 }\`, \`exit { opacity:0, scale:0.7 }\`, \`transition { duration:0.14, ease:'easeOut' }\`. Style \`{ fontFamily:'var(--font-sans, sans-serif)', fontSize:11, fontWeight:700, letterSpacing:'0.1em', color: isDark?'#e4e4e7':'#2E2A24', userSelect:'none' }\`. Text "EDIT".
- open → \`motion.span key="x-icon"\`, \`initial { opacity:0, rotate:-90, scale:0.4 }\`, \`animate { opacity:1, rotate:0, scale:1 }\`, \`exit { opacity:0, rotate:-90, scale:0.4 }\`, \`transition { type:'spring', stiffness:260, damping:24 }\`, style \`{ display:'flex' }\`. Inside: \`<X size={16} weight="regular" color={isDark?'#a1a1aa':'#4A453F'} />\`.

## Label pill (AnimatePresence)
When open AND \`labelTool\` exists. \`labelTool = TOOLS.find(t=>t.id===hoveredId) ?? TOOLS.find(t=>t.id===activeId)\`. \`motion.div key={labelTool.id}\` className \`pointer-events-none absolute flex items-center gap-1.5 rounded-full px-3 py-1.5\`. style:
- \`top:'calc(50% + 140px)', left:'50%', x:'-50%'\`
- \`background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'\`
- \`border: '1px solid ' + (isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.10)')\`
- \`fontFamily:'var(--font-sans, sans-serif)', whiteSpace:'nowrap'\`

Enter \`{ opacity:0, y:8, scale:0.9 }\` → \`{ opacity:1, y:0, scale:1 }\`, exit \`{ opacity:0, y:4, scale:0.95 }\`, \`transition { type:'spring', stiffness:500, damping:30 }\`.

Inside: \`<labelTool.Icon size={11} weight="regular" color={activeId===labelTool.id ? (isDark?'#e4e4e7':'#2E2A24') : (isDark?'#71717a':'#9E9890')} />\`, \`<span className="text-xs font-medium" style={{ color: isDark?'#a1a1aa':'#736D65' }}>{labelTool.label}</span>\`, and if \`activeId===labelTool.id\` a \`motion.span className="h-1 w-1 rounded-full" style={{ background: isDark?'#ffffff':'#1C1916' }} initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:600, damping:20 }} />\`.

Use Manrope font. The button must remain visible at all times — opening only adds the wheel around it, never replaces it.

## Typography
- Font: project default sans-serif
- Sizes: 11px, 12px
- Weights: 500, 700`,
}
