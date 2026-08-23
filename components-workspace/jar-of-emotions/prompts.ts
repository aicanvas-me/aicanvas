import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Build a standalone React component called JarOfEmotions in a single file.

Stack: Next.js App Router, TypeScript strict, Tailwind CSS v4, Framer Motion. No shadcn, no extra UI libs. Verify these are set up before writing code.

Install: npm install matter-js framer-motion && npm install -D @types/matter-js

---

## Overview
A physics-based reaction widget called "Emoji Reaction Jar". A centered SVG glass jar holds emoji reactions inside. Clicking a reaction button springs the lid open and a matching emoji flies up out of the jar, then bounces down onto the clicked button. Emojis accumulate on the button row with real 2D physics.

---

## Layout (top → bottom, vertically centered on screen)
1. SVG jar (largest element)
2. Title "Emoji Reaction Jar" + tagline "Reactions on tap" (below the jar)
3. Row of 6 reaction buttons

Container: flex-col, justify-center, gap-7. Root: min-h-screen, bg-sand-100 dark:bg-sand-950 (or equivalent neutral dark/light surfaces).

---

## Emotion buttons
Six buttons in a horizontal wrap row, each with an emoji above a short label:
🔥 Banger | 👌 Perfect | 😄 Pure joy | 😭 Crying | 🧑‍🍳 Cooking | 🐐 GOAT

Button style: rounded pill, subtle border, dark glass fill. All labels use the same muted light color (not per-emotion color). Gap between emoji and label: gap-2. Framer Motion whileHover y:-2, whileTap scale:0.94.

---

## SVG jar
ViewBox 0 0 200 240. Scaled to min(62vw, 280px) wide, aspect-ratio preserved.

**Jar body path (closed, glass fill):**
M 28 44 Q 22 120, 30 218 Q 32 234, 100 236 Q 168 234, 170 218 Q 178 120, 172 44 Z

Apply a horizontal glass gradient: left edge white 35% opacity → center near-transparent → right edge black 18% opacity.

**Collar:** rect x=24 y=36 width=152 height=12 rx=4, same glass treatment, 85% opacity.

**Lid:** rect x=26 y=22 width=148 height=18 rx=6. Metallic gradient top-to-bottom: white highlight → gold mid → darker gold bottom. Framer Motion spring rotation around left-edge hinge (x=26, y=31). Closes: 0°. Opens: -70°. Spring stiffness 260 open / 200 close, damping 14 open / 22 close.

**Glass highlights (clipped to jar shape via clipPath matching jar body path):**
- Left specular: tall narrow white ellipse, 30% opacity
- Right inner shadow: gradient rect right-to-left, 18% opacity
- Bottom glow: path matching jar curved bottom (not a rect), radial gradient white→transparent

**Ground shadow:** blurred ellipse below jar, feGaussianBlur stdDeviation=6.

---

## Physics (matter-js, dynamic import)

Use Matter.Runner.run + requestAnimationFrame tick that calls setRenderTick(t+1) every frame to sync React renders to body positions.

**Static bodies:**
- Jar left/right inner walls (JAR_WALL_THICKNESS=24px, from collar to bottom)
- Curved jar floor: 6 angled rectangle segments tracing points (30,218)→(40,226)→(65,233)→(100,236)→(135,233)→(160,226)→(170,218) in SVG coords. Scale to container coords, center each segment between adjacent pts, angle = atan2(dy,dx)
- Button floors: one thin rectangle per button, at the button's top edge
- Outer walls: left, right, floor, top ceiling

**Dynamic bodies:** circle r=17px per emoji, friction=0.55, frictionAir=0.06, restitution=0.05, density=0.0018.

**Seeding:** on mount, spawn one body per emotion inside the jar at random positions in the lower 60% of the interior.

**Dispense on click:**
1. Open lid (setLidOpen true), schedule close after 900ms
2. Find a matching interior body; if none, use a mouth-level spawn
3. Teleport the body to just above the jar mouth (exitY = jarTop - 18)
4. Apply velocity: upKick = -14 (upward), hVel = (targetButtonCenter - mouthX) / 60
5. Mark body as 'outside'; increment dispensedTotal
6. After 600ms delay, spawn a replacement at the jar interior top (below the collar) so it falls naturally onto the pile

**Cap:** max 30 outside bodies (remove oldest when exceeded). Max 8 inside bodies.

**Render:** inside bodies render in a z-[15] abs overlay (no animation). Outside bodies render in a z-20 abs overlay with Framer Motion fade-in (opacity 0→1, scale 0.6→1, duration 0.2s). Both use absolute positioning synced to body.position each frame.

---

## Banner
After 30 total dispenses, show a red banner (bg #ef4444, hard box-shadow 4px 4px 0px black 50%) centered on the jar with text "Full. Please Stop." Spring animate in (scale 0.75→1). Banner is z-50 inside a relative wrapper that wraps only the jar, so left-1/2 top-1/2 -translate centers on the jar, not the full container.

---

## Dual theme
Dark default. Light mode: lighter glass fill, darker stroke, adjusted lid colors. Both modes use useTheme() from ThemeProvider. All inline style colors switch on isDark.

---

## Requirements
- 'use client' at top
- export default function JarOfEmotions()
- Cleanup: cancel RAF, stop runner, clear world, disconnect ResizeObserver on unmount
- ResizeObserver rebuilds all static bodies on container resize
- Works at 320px width without overflow`,

  'Lovable': `Build a standalone React component called JarOfEmotions in a single file.

Stack: TypeScript strict, Tailwind CSS, Framer Motion. No shadcn, no extra UI libs.

Install: npm install matter-js framer-motion && npm install -D @types/matter-js

---

## Overview
A physics-based reaction widget called "Emoji Reaction Jar". A centered SVG glass jar holds emoji reactions inside. Clicking a reaction button springs the lid open and a matching emoji flies up out of the jar, then bounces down onto the clicked button. Emojis accumulate on the button row with real 2D physics.

---

## Layout (top → bottom, vertically centered on screen)
1. SVG jar (largest element)
2. Title "Emoji Reaction Jar" + tagline "Reactions on tap" (below the jar)
3. Row of 6 reaction buttons

Container: flex-col, justify-center, gap-7. Root: min-h-screen with neutral dark/light surface.

---

## Emotion buttons
Six buttons in a horizontal wrap row, each with an emoji above a short label:
🔥 Banger | 👌 Perfect | 😄 Pure joy | 😭 Crying | 🧑‍🍳 Cooking | 🐐 GOAT

Button style: rounded pill, subtle border, dark glass fill. All labels use the same muted light color. Gap between emoji and label: gap-2. Framer Motion whileHover y:-2, whileTap scale:0.94.

---

## SVG jar
ViewBox 0 0 200 240. Scaled to min(62vw, 280px) wide, aspect-ratio preserved.

Jar body path (closed): M 28 44 Q 22 120, 30 218 Q 32 234, 100 236 Q 168 234, 170 218 Q 178 120, 172 44 Z — horizontal glass gradient (left white specular → right shadow).

Collar: rect at y=36, height=12, rx=4.

Lid: rect x=26 y=22 w=148 h=18 rx=6 with metallic gradient. Framer Motion spring rotation from 0° (closed) to -70° (open) around hinge at (26, 31). Spring: stiffness 260 open, 200 close.

Glass highlights clipped to jar shape: left specular ellipse, right inner shadow gradient, bottom curved glow path.

Ground shadow: blurred ellipse using feGaussianBlur stdDeviation=6.

---

## Physics (matter-js, dynamic import)
- Matter.Runner.run for physics tick
- requestAnimationFrame loop calls setRenderTick each frame to sync DOM
- Static jar walls (left/right inner walls + 6-segment curved floor matching the jar bezier bottom)
- Static button floors (one rect per button at button top edge)
- Dynamic emoji circles: r=17, friction=0.55, restitution=0.05
- Seed one emoji per emotion inside jar at mount
- On click: teleport matching interior emoji above jar mouth, launch with upward kick (-14) + horizontal velocity toward target button
- Replacement spawns 600ms later at jar interior top to avoid visual collision
- 30-body outside cap; 8-body inside cap

---

## Banner
After 30 total dispenses, spring-animate in a red banner (#ef4444) centered on the jar: "Full. Please Stop." z-50 above physics overlay.

---

## Dual theme
Support light and dark mode with useTheme hook or a local useState toggle. All colors switch per theme.

Single file, export default function JarOfEmotions(). Cleanup all RAF/runner/ResizeObserver on unmount.`,

  'V0': `Build a standalone React component called JarOfEmotions in a single file.

Stack: TypeScript strict, Tailwind CSS, Framer Motion. No shadcn, no extra UI libs.

Install: npm install matter-js framer-motion && npm install -D @types/matter-js

---

## Overview
A physics-based reaction widget called "Emoji Reaction Jar". A centered SVG glass jar holds emoji reactions inside. Clicking a reaction button springs the lid open and a matching emoji flies up out of the jar, then bounces down onto the clicked button. Emojis accumulate on the button row with real 2D physics.

---

## Layout (top → bottom, vertically centered on screen)
1. SVG jar (largest element)
2. Title "Emoji Reaction Jar" + tagline "Reactions on tap" (below the jar)
3. Row of 6 reaction buttons

Container: flex-col, justify-center, gap-7. Root: min-h-screen with neutral dark/light surface.

---

## Emotion buttons
Six buttons in a horizontal wrap row, each with an emoji above a short label:
🔥 Banger | 👌 Perfect | 😄 Pure joy | 😭 Crying | 🧑‍🍳 Cooking | 🐐 GOAT

Button style: rounded pill, subtle border, dark glass fill. All labels use the same muted light color. Gap between emoji and label: gap-2. Framer Motion whileHover y:-2, whileTap scale:0.94.

---

## SVG jar
ViewBox 0 0 200 240. Scaled to min(62vw, 280px) wide, aspect-ratio preserved.

Jar body path (closed): M 28 44 Q 22 120, 30 218 Q 32 234, 100 236 Q 168 234, 170 218 Q 178 120, 172 44 Z — horizontal glass gradient (left white specular → right shadow).

Collar: rect at y=36, height=12, rx=4.

Lid: rect x=26 y=22 w=148 h=18 rx=6 with metallic gradient. Framer Motion spring rotation from 0° (closed) to -70° (open) around hinge at (26, 31). Spring: stiffness 260 open, 200 close.

Glass highlights clipped to jar shape: left specular ellipse, right inner shadow gradient, bottom curved glow path.

Ground shadow: blurred ellipse using feGaussianBlur stdDeviation=6.

---

## Physics (matter-js, dynamic import)
- Matter.Runner.run for physics tick
- requestAnimationFrame loop calls setRenderTick each frame to sync DOM
- Static jar walls (left/right inner walls + 6-segment curved floor matching the jar bezier bottom)
- Static button floors (one rect per button at button top edge)
- Dynamic emoji circles: r=17, friction=0.55, restitution=0.05
- Seed one emoji per emotion inside jar at mount
- On click: teleport matching interior emoji above jar mouth, launch with upward kick (-14) + horizontal velocity toward target button
- Replacement spawns 600ms later at jar interior top to avoid visual collision
- 30-body outside cap; 8-body inside cap

---

## Banner
After 30 total dispenses, spring-animate in a red banner (#ef4444) centered on the jar: "Full. Please Stop." z-50 above physics overlay.

---

## Dual theme
Support light and dark mode with a theme toggle or local state. All colors switch per theme.

Single file, export default function JarOfEmotions(). Cleanup all RAF/runner/ResizeObserver on unmount.`,
}
