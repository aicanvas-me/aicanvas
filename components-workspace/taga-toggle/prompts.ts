import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion

Root element: className="flex min-h-screen w-full items-center justify-center"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named \`TagaToggle\`, a playful pill toggle with an expressive face drawn on the thumb. Off = dead face (×× eyes, flat mouth). On = happy face (squinted arc eyes, big smile).

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

## Imports
\`\`\`
'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
\`\`\`

## Constants
\`MAX_TRACK_W = 80\`, \`MIN_TRACK_W = 48\`, \`FACE_COLOR = '#4A3F35'\` (warm dark, legible on white in both themes).

## Derived dimensions (from \`trackW\` state)
\`trackH = round(trackW * 0.58)\`
\`thumb = round(trackW * 0.50)\`
\`pad = max(3, round(trackW * 0.04))\`
\`offX = pad\`, \`onX = trackW - thumb - pad\`
\`faceSize = thumb * 0.78\`

## Motion values
\`thumbX = useMotionValue(offX)\`.
\`trackColor = useTransform(thumbX, [offX, onX], [offTrack, onTrack])\` where:
- \`offTrack = pageIsDark ? '#4A4540' : '#9E9890'\`
- \`onTrack = pageIsDark ? '#D4960A' : '#F5C518'\`

## State
\`isOn\` (bool, default false), \`animating\` (bool), \`pageIsDark\` (bool, default true), \`trackW\` (number, default MAX_TRACK_W).
Keep a \`isOnRef = useRef(false)\` synchronized with \`isOn\` to read in the resize snap effect.

## Theme + resize detection (single useEffect)
Get \`containerRef.current\`. Theme: find \`closest('[data-card-theme]')\` → if found use \`.classList.contains('dark')\`, else \`document.documentElement.classList.contains('dark')\`. MutationObserver on both. Resize: \`ResizeObserver\` on the container, compute \`s = max(MIN_TRACK_W, min(MAX_TRACK_W, round(min(el.offsetWidth, el.offsetHeight) * 0.18)))\` → \`setTrackW(s)\`. Cleanup disconnects both.

## Resize snap (separate useEffect on trackW)
\`thumbX.set(isOnRef.current ? onX : offX)\` snaps the thumb instantly when the track resizes.

## Toggle handler
\`handleToggle\` (async, guarded by \`animating\`): set animating true, compute target (\`isOn ? offX : onX\`), update \`isOnRef\`, toggle \`isOn\`, \`await animate(thumbX, target, { type:'spring', stiffness:500, damping:36 })\`, set animating false.

## Theme tokens
\`previewBg = pageIsDark ? '#110F0C' : '#EDEAE5'\`
\`trackInset = pageIsDark ? 'inset 0 1px 4px rgba(0,0,0,0.50)' : 'inset 0 1px 3px rgba(0,0,0,0.14)'\`
\`thumbShadow = pageIsDark ? '0 3px 8px rgba(0,0,0,0.50), 0 1px 3px rgba(0,0,0,0.30)' : '0 3px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.10)'\`

## Face SVG paths
Mouth (IMPORTANT: both share M+Q structure for smooth Framer Motion path interpolation):
- Off (flat): \`'M -0.40,0.43 Q 0,0.43 0.40,0.43'\`
- On (smile): \`'M -0.40,0.15 Q 0,0.50 0.40,0.15'\`

Eye spring: \`{ duration: 0.16, ease: [0.34, 1.56, 0.64, 1] }\`.

Left eye happy: \`<motion.path d="M -0.50,-0.28 Q -0.32,-0.06 -0.14,-0.28" stroke={FACE_COLOR} strokeWidth={0.13} strokeLinecap="round" fill="none" />\`
Left eye dead: \`<motion.g>\` containing two \`<line>\` elements forming an ×:
- \`x1="-0.50" y1="-0.33" x2="-0.14" y2="-0.01"\`
- \`x1="-0.14" y1="-0.33" x2="-0.50" y2="-0.01"\`

Right eye happy: \`d="M 0.14,-0.28 Q 0.32,-0.06 0.50,-0.28"\`
Right eye dead: same × pattern at (0.14,0.50) positions:
- \`x1="0.14" y1="-0.33" x2="0.50" y2="-0.01"\`
- \`x1="0.50" y1="-0.33" x2="0.14" y2="-0.01"\`

All strokes: \`stroke={FACE_COLOR} strokeWidth={0.13} strokeLinecap="round"\`.

## JSX structure
Root: \`<div ref={containerRef} className="flex h-full w-full items-center justify-center" style={{ background: previewBg }}>\`.
Entrance: \`motion.div initial { opacity:0, scale:0.88 } animate { opacity:1, scale:1 } transition { duration:0.4, ease:[0.34,1.56,0.64,1] }\` wrapping the track.

Track: \`motion.button\` with \`style={{ width:trackW, height:trackH, borderRadius:trackH/2, backgroundColor:trackColor, boxShadow:trackInset, position:'relative', cursor:'pointer', border:'none', outline:'none', display:'block' }}\`, \`whileTap {{ scale: 0.96 }}\`, \`transition {{ type: 'spring', stiffness: 400, damping: 28 }}\`, \`onClick={handleToggle}\`.

Thumb: \`motion.div\` inside the track. \`style={{ position:'absolute', top:pad, x:thumbX, width:thumb, height:thumb, borderRadius:'50%', background:'white', boxShadow:thumbShadow, display:'flex', alignItems:'center', justifyContent:'center' }}\`.

Inside thumb: \`<svg viewBox="-1 -1 2 2" width={faceSize} height={faceSize}>\`:
- Two \`AnimatePresence mode="wait"\` blocks (left eye, right eye), each choosing happy arc path or dead × group based on \`isOn\`. Enter/exit: \`initial/exit { opacity:0, scale:0.3 }\`, \`animate { opacity:1, scale:1 }\`, transition = eyeSpring.
- \`<motion.path d={mouthPath} stroke={FACE_COLOR} strokeWidth={0.13} strokeLinecap="round" fill="none" transition={{ duration:0.28, ease:'easeInOut' }} />\`. The path \`d\` attribute is set to either the flat or smile path. Because both share the same M+Q structure, Framer Motion interpolates between them smoothly.

Use Manrope font.

## Typography
- Font: project default sans-serif`,

  'Lovable': `Create a React client component named \`TagaToggle\` — a playful pill toggle with an expressive face drawn on the thumb. Off = dead face (×× eyes, flat mouth). On = happy face (squinted arc eyes, big smile).

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

## Imports
\`\`\`
'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
\`\`\`

## Constants
\`MAX_TRACK_W = 80\`, \`MIN_TRACK_W = 48\`, \`FACE_COLOR = '#4A3F35'\` (warm dark — legible on white in both themes).

## Derived dimensions (from \`trackW\` state)
\`trackH = round(trackW * 0.58)\`
\`thumb = round(trackW * 0.50)\`
\`pad = max(3, round(trackW * 0.04))\`
\`offX = pad\`, \`onX = trackW - thumb - pad\`
\`faceSize = thumb * 0.78\`

## Motion values
\`thumbX = useMotionValue(offX)\`.
\`trackColor = useTransform(thumbX, [offX, onX], [offTrack, onTrack])\` where:
- \`offTrack = pageIsDark ? '#4A4540' : '#9E9890'\`
- \`onTrack = pageIsDark ? '#D4960A' : '#F5C518'\`

## State
\`isOn\` (bool, default false), \`animating\` (bool), \`pageIsDark\` (bool, default true), \`trackW\` (number, default MAX_TRACK_W).
Keep a \`isOnRef = useRef(false)\` synchronized with \`isOn\` to read in the resize snap effect.

## Theme + resize detection (single useEffect)
Get \`containerRef.current\`. Theme: find \`closest('[data-card-theme]')\` → if found use \`.classList.contains('dark')\`, else \`document.documentElement.classList.contains('dark')\`. MutationObserver on both. Resize: \`ResizeObserver\` on the container — compute \`s = max(MIN_TRACK_W, min(MAX_TRACK_W, round(min(el.offsetWidth, el.offsetHeight) * 0.18)))\` → \`setTrackW(s)\`. Cleanup disconnects both.

## Resize snap (separate useEffect on trackW)
\`thumbX.set(isOnRef.current ? onX : offX)\` — snaps the thumb instantly when the track resizes.

## Toggle handler
\`handleToggle\` (async, guarded by \`animating\`): set animating true, compute target (\`isOn ? offX : onX\`), update \`isOnRef\`, toggle \`isOn\`, \`await animate(thumbX, target, { type:'spring', stiffness:500, damping:36 })\`, set animating false.

## Theme tokens
\`previewBg = pageIsDark ? '#110F0C' : '#EDEAE5'\`
\`trackInset = pageIsDark ? 'inset 0 1px 4px rgba(0,0,0,0.50)' : 'inset 0 1px 3px rgba(0,0,0,0.14)'\`
\`thumbShadow = pageIsDark ? '0 3px 8px rgba(0,0,0,0.50), 0 1px 3px rgba(0,0,0,0.30)' : '0 3px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.10)'\`

## Face SVG paths
Mouth (IMPORTANT — both share M+Q structure for smooth Framer Motion path interpolation):
- Off (flat): \`'M -0.40,0.43 Q 0,0.43 0.40,0.43'\`
- On (smile): \`'M -0.40,0.15 Q 0,0.50 0.40,0.15'\`

Eye spring: \`{ duration: 0.16, ease: [0.34, 1.56, 0.64, 1] }\`.

Left eye happy: \`<motion.path d="M -0.50,-0.28 Q -0.32,-0.06 -0.14,-0.28" stroke={FACE_COLOR} strokeWidth={0.13} strokeLinecap="round" fill="none" />\`
Left eye dead: \`<motion.g>\` containing two \`<line>\` elements forming an ×:
- \`x1="-0.50" y1="-0.33" x2="-0.14" y2="-0.01"\`
- \`x1="-0.14" y1="-0.33" x2="-0.50" y2="-0.01"\`

Right eye happy: \`d="M 0.14,-0.28 Q 0.32,-0.06 0.50,-0.28"\`
Right eye dead: same × pattern at (0.14,0.50) positions:
- \`x1="0.14" y1="-0.33" x2="0.50" y2="-0.01"\`
- \`x1="0.50" y1="-0.33" x2="0.14" y2="-0.01"\`

All strokes: \`stroke={FACE_COLOR} strokeWidth={0.13} strokeLinecap="round"\`.

## JSX structure
Root: \`<div ref={containerRef} className="flex h-full w-full items-center justify-center" style={{ background: previewBg }}>\`.
Entrance: \`motion.div initial { opacity:0, scale:0.88 } animate { opacity:1, scale:1 } transition { duration:0.4, ease:[0.34,1.56,0.64,1] }\` wrapping the track.

Track: \`motion.button\` with \`style={{ width:trackW, height:trackH, borderRadius:trackH/2, backgroundColor:trackColor, boxShadow:trackInset, position:'relative', cursor:'pointer', border:'none', outline:'none', display:'block' }}\`, \`whileTap {{ scale: 0.96 }}\`, \`transition {{ type: 'spring', stiffness: 400, damping: 28 }}\`, \`onClick={handleToggle}\`.

Thumb: \`motion.div\` inside the track. \`style={{ position:'absolute', top:pad, x:thumbX, width:thumb, height:thumb, borderRadius:'50%', background:'white', boxShadow:thumbShadow, display:'flex', alignItems:'center', justifyContent:'center' }}\`.

Inside thumb: \`<svg viewBox="-1 -1 2 2" width={faceSize} height={faceSize}>\`:
- Two \`AnimatePresence mode="wait"\` blocks (left eye, right eye), each choosing happy arc path or dead × group based on \`isOn\`. Enter/exit: \`initial/exit { opacity:0, scale:0.3 }\`, \`animate { opacity:1, scale:1 }\`, transition = eyeSpring.
- \`<motion.path d={mouthPath} stroke={FACE_COLOR} strokeWidth={0.13} strokeLinecap="round" fill="none" transition={{ duration:0.28, ease:'easeInOut' }} />\` — the path \`d\` attribute is set to either the flat or smile path. Because both share the same M+Q structure, Framer Motion interpolates between them smoothly.

Use Manrope font.

## Typography
- Font: project default sans-serif`,

  'V0': `Create a React client component named \`TagaToggle\` — a playful pill toggle with an expressive face drawn on the thumb. Off = dead face (×× eyes, flat mouth). On = happy face (squinted arc eyes, big smile).

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

## Imports
\`\`\`
'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion'
\`\`\`

## Constants
\`MAX_TRACK_W = 80\`, \`MIN_TRACK_W = 48\`, \`FACE_COLOR = '#4A3F35'\` (warm dark — legible on white in both themes).

## Derived dimensions (from \`trackW\` state)
\`trackH = round(trackW * 0.58)\`
\`thumb = round(trackW * 0.50)\`
\`pad = max(3, round(trackW * 0.04))\`
\`offX = pad\`, \`onX = trackW - thumb - pad\`
\`faceSize = thumb * 0.78\`

## Motion values
\`thumbX = useMotionValue(offX)\`.
\`trackColor = useTransform(thumbX, [offX, onX], [offTrack, onTrack])\` where:
- \`offTrack = pageIsDark ? '#4A4540' : '#9E9890'\`
- \`onTrack = pageIsDark ? '#D4960A' : '#F5C518'\`

## State
\`isOn\` (bool, default false), \`animating\` (bool), \`pageIsDark\` (bool, default true), \`trackW\` (number, default MAX_TRACK_W).
Keep a \`isOnRef = useRef(false)\` synchronized with \`isOn\` to read in the resize snap effect.

## Theme + resize detection (single useEffect)
Get \`containerRef.current\`. Theme: find \`closest('[data-card-theme]')\` → if found use \`.classList.contains('dark')\`, else \`document.documentElement.classList.contains('dark')\`. MutationObserver on both. Resize: \`ResizeObserver\` on the container — compute \`s = max(MIN_TRACK_W, min(MAX_TRACK_W, round(min(el.offsetWidth, el.offsetHeight) * 0.18)))\` → \`setTrackW(s)\`. Cleanup disconnects both.

## Resize snap (separate useEffect on trackW)
\`thumbX.set(isOnRef.current ? onX : offX)\` — snaps the thumb instantly when the track resizes.

## Toggle handler
\`handleToggle\` (async, guarded by \`animating\`): set animating true, compute target (\`isOn ? offX : onX\`), update \`isOnRef\`, toggle \`isOn\`, \`await animate(thumbX, target, { type:'spring', stiffness:500, damping:36 })\`, set animating false.

## Theme tokens
\`previewBg = pageIsDark ? '#110F0C' : '#EDEAE5'\`
\`trackInset = pageIsDark ? 'inset 0 1px 4px rgba(0,0,0,0.50)' : 'inset 0 1px 3px rgba(0,0,0,0.14)'\`
\`thumbShadow = pageIsDark ? '0 3px 8px rgba(0,0,0,0.50), 0 1px 3px rgba(0,0,0,0.30)' : '0 3px 8px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.10)'\`

## Face SVG paths
Mouth (IMPORTANT — both share M+Q structure for smooth Framer Motion path interpolation):
- Off (flat): \`'M -0.40,0.43 Q 0,0.43 0.40,0.43'\`
- On (smile): \`'M -0.40,0.15 Q 0,0.50 0.40,0.15'\`

Eye spring: \`{ duration: 0.16, ease: [0.34, 1.56, 0.64, 1] }\`.

Left eye happy: \`<motion.path d="M -0.50,-0.28 Q -0.32,-0.06 -0.14,-0.28" stroke={FACE_COLOR} strokeWidth={0.13} strokeLinecap="round" fill="none" />\`
Left eye dead: \`<motion.g>\` containing two \`<line>\` elements forming an ×:
- \`x1="-0.50" y1="-0.33" x2="-0.14" y2="-0.01"\`
- \`x1="-0.14" y1="-0.33" x2="-0.50" y2="-0.01"\`

Right eye happy: \`d="M 0.14,-0.28 Q 0.32,-0.06 0.50,-0.28"\`
Right eye dead: same × pattern at (0.14,0.50) positions:
- \`x1="0.14" y1="-0.33" x2="0.50" y2="-0.01"\`
- \`x1="0.50" y1="-0.33" x2="0.14" y2="-0.01"\`

All strokes: \`stroke={FACE_COLOR} strokeWidth={0.13} strokeLinecap="round"\`.

## JSX structure
Root: \`<div ref={containerRef} className="flex h-full w-full items-center justify-center" style={{ background: previewBg }}>\`.
Entrance: \`motion.div initial { opacity:0, scale:0.88 } animate { opacity:1, scale:1 } transition { duration:0.4, ease:[0.34,1.56,0.64,1] }\` wrapping the track.

Track: \`motion.button\` with \`style={{ width:trackW, height:trackH, borderRadius:trackH/2, backgroundColor:trackColor, boxShadow:trackInset, position:'relative', cursor:'pointer', border:'none', outline:'none', display:'block' }}\`, \`whileTap {{ scale: 0.96 }}\`, \`transition {{ type: 'spring', stiffness: 400, damping: 28 }}\`, \`onClick={handleToggle}\`.

Thumb: \`motion.div\` inside the track. \`style={{ position:'absolute', top:pad, x:thumbX, width:thumb, height:thumb, borderRadius:'50%', background:'white', boxShadow:thumbShadow, display:'flex', alignItems:'center', justifyContent:'center' }}\`.

Inside thumb: \`<svg viewBox="-1 -1 2 2" width={faceSize} height={faceSize}>\`:
- Two \`AnimatePresence mode="wait"\` blocks (left eye, right eye), each choosing happy arc path or dead × group based on \`isOn\`. Enter/exit: \`initial/exit { opacity:0, scale:0.3 }\`, \`animate { opacity:1, scale:1 }\`, transition = eyeSpring.
- \`<motion.path d={mouthPath} stroke={FACE_COLOR} strokeWidth={0.13} strokeLinecap="round" fill="none" transition={{ duration:0.28, ease:'easeInOut' }} />\` — the path \`d\` attribute is set to either the flat or smile path. Because both share the same M+Q structure, Framer Motion interpolates between them smoothly.

Use Manrope font.

## Typography
- Font: project default sans-serif`,
}
