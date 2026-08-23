import type { Platform } from '../../app/components/ComponentCard'

const claudeCode = `Create \`components-workspace/cube-carousel/index.tsx\`. Export default function \`CubeCarousel\`.

Environment check first. This prompt assumes Tailwind CSS v4, TypeScript, React 18+, and Framer Motion. If any are missing, install via shadcn CLI: \`npx shadcn@latest init\` then \`npm i framer-motion\`.

Visual:
- A flat 3D photo cube floating in the center of a full-viewport container.
- Box dimensions ratio W : H : D = 16 : 9 : 9, so front/back/top/bottom faces are 16:9 and left/right caps are square.
- Six face divs, each full-bleed image with an inset \`box-shadow\` vignette (\`inset 0 0 36px 0 rgba(0,0,0,0.32)\`) overlaid on top.
- No labels, no chevrons, no dots.
- Soft radial vignette behind the cube; blurred elliptical drop shadow beneath (filter: blur(22px), opacity 0.32).
- Container background: \`bg-[#E8E8DF] dark:bg-[#1A1A19]\`.

Behaviour:
- Drag on the cube to rotate it.
- Horizontal drag rotates the Y axis. Vertical drag rotates the X axis. Use Framer Motion's \`onPan\` / \`onPanStart\` / \`onPanEnd\`.
- IMPORTANT: put the pan handlers on a separate flat 2D shield div (\`absolute inset-0 z-10\`) that overlays the cube area, NOT on the rotating cube itself. The cube has \`pointerEvents: 'none'\`. Reason: hit-testing on a 3D-rotated element fails at edge-on angles because \`backface-visibility: hidden\` rounds the wrong way, freezing the drag. A flat shield never rotates, so its hit area is constant.
- DRAG_SENSITIVITY = 0.5. Map drag offset to rotation: \`rotateY = startRotY + offset.x * 0.5\`, \`rotateX = startRotX - offset.y * 0.5\`.
- Stash starting rotation in a ref on \`onPanStart\` so \`onPan\` can compute relative offsets.
- On \`onPanEnd\`, project ~180ms of release momentum and animate to that projected position with a soft spring: \`{ type: 'spring', stiffness: 40, damping: 22, velocity }\`. Velocity comes from \`info.velocity\` (Framer's tracker, deg/sec after multiplying by DRAG_SENSITIVITY).
- Stop in-flight animations on \`onPanStart\` so a new drag tracks cleanly.
- No snap-to-nearest-90. The cube stays exactly where the coast settles.

Implementation:
- \`rotateX\` / \`rotateY\` as \`useMotionValue\`s, initial (-14, -22) so the cube starts tilted with three faces visible.
- Cube container: \`<div style={{ perspective: '1400px' }}>\` wrapping the rotating motion.div.
- Inner motion.div uses CSS custom properties to drive face sizing:
\`\`\`
'--w': 'clamp(210px, 56vw, 420px)',
'--h': 'calc(var(--w) * 9 / 16)',
'--d': 'var(--h)',
'--half-w': 'calc(var(--w) / 2)',
'--half-h': 'calc(var(--h) / 2)',
'--half-d': 'calc(var(--d) / 2)',
\`\`\`
- Six faces with transforms:
  - Front:  \`translateZ(var(--half-d))\`, W × H
  - Back:   \`rotateY(180deg) translateZ(var(--half-d))\`, W × H
  - Top:    \`rotateX(90deg) translateZ(var(--half-h))\`, W × H
  - Bottom: \`rotateX(-90deg) translateZ(var(--half-h))\`, W × H
  - Right:  \`rotateY(90deg) translateZ(var(--half-w))\`, D × H, centered horizontally with \`left: calc((var(--w) - var(--d)) / 2)\`
  - Left:   \`rotateY(-90deg) translateZ(var(--half-w))\`, D × H, same centering
- Each face needs \`transformStyle: 'preserve-3d'\` on its parent, \`backfaceVisibility: 'hidden'\` on itself.
- Set \`touchAction: 'none'\` on the drag motion.div so touch drags don't scroll the page.
- Use six Unsplash photos (any 16:9 + square crops at \`images.unsplash.com/photo-<id>?w=960&h=540&fit=crop&auto=format&q=80\` for wide, \`?w=720&h=720\` for square).

Layout root: \`<div className="flex min-h-screen w-full items-center justify-center bg-[#E8E8DF] dark:bg-[#1A1A19]">\`. Single JSX root. \`'use client'\` at the top.`

const v0 = `Create a draggable 3D photo cube called Cube Carousel.

It's a flat rectangular box floating in the center of the screen, wider than it is tall, with a 16:9 front face. Six photographs cover the six faces. Each face has a soft dark vignette inset around the edges so the corners look like 3D lighting rather than cutouts.

Click and drag on the cube to rotate it. Drag left-right spins it around its vertical axis. Drag up-down tilts it around its horizontal axis. Diagonal drag does both at once. When you let go, the cube coasts a little in the direction you flicked it, then settles wherever it lands. No snapping to a "nearest face" position. No buttons or controls. Drag is the only interaction.

The box has a soft blurred shadow underneath and a subtle radial vignette behind it on the page. Container background is light cream in light mode, near-black in dark mode (#E8E8DF / #1A1A19).

Use Next.js, Tailwind CSS, and Framer Motion. Use \`useMotionValue\` for the rotation values and Framer's \`onPan\` handlers (not raw pointer events). The release-coast is a Framer spring animation with low stiffness (around 40) and moderate damping (around 22), with the spring's initial velocity passed in from the pan info.

The cube sizes fluidly with the viewport, \`clamp(210px, 56vw, 420px)\` wide. Width:Height:Depth ratio is 16:9:9, so the four "wide" faces (front, back, top, bottom) are 16:9 and the two side caps are square. Six Unsplash photos cover the faces.`

const lovable = `I'd love a 3D photo cube called Cube Carousel.

It feels like a physical object you can pick up and turn over in your hands. A flat rectangular box, wider than tall, with photographs on all six sides. The corners catch a little shadow from the inside, like light hitting the rim of a real cardboard box. Soft, intentional, gives it weight.

Click and drag anywhere on the cube and it rotates with your finger. Side to side, up and down, any direction. Let go and it doesn't snap or jump. It just coasts a tiny bit further in the direction you flicked it, like physical momentum, then settles where you left it. You can pick it up again immediately and keep playing. No buttons, no controls, no instructions. Just drag.

Visually it's quiet. Light cream background in light mode, near-black in dark mode. A soft blurred shadow on the ground beneath gives it floating presence. Six Unsplash photographs as the demo content, but the cube should accept any six images.

Tech stack: Next.js, Tailwind CSS, Framer Motion. Drag is handled with Framer's onPan handlers so it stays smooth across mouse and touch. The release coast uses a soft spring (stiffness around 40, damping around 22) seeded with the release velocity, so the cube feels alive without being twitchy. Width-to-height-to-depth ratio of 16:9:9, so the four horizontal faces are 16:9 widescreen and the two side caps are square.`

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': claudeCode,
  Lovable: lovable,
  V0: v0,
}
