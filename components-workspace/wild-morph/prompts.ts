import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Before writing any code, verify the project has Tailwind CSS v4, TypeScript, and React set up. If missing, use the shadcn CLI to scaffold them.

Build a single-file React component called \`WildMorph\` with \`'use client'\` at the top. Install dependency: \`framer-motion\`.

---

## Visual & Theme

Single full-viewport container (\`min-h-screen w-full flex items-center justify-center\`). The container IS both the background and the interaction zone.

**Dual theme, inverted palette:**
- Dark mode: background \`#1a1a19\`, text \`#efeee6\`
- Light mode: background \`#efeee6\`, text \`#1a1a19\`

Detect theme via \`element.closest('[data-card-theme]')\` first (for isolated card previews), falling back to \`document.documentElement.classList.contains('dark')\`. Use a MutationObserver walking up the ancestor chain to react to theme changes.

Inside, centered: a single italic word in the Anton font (loaded via \`@import url('https://fonts.googleapis.com/css2?family=Anton&display=swap')\` injected as a \`<style>\` tag). Responsive font size: JS-computed \`clamp(64px, 12vw, 144px)\`, recalculated on \`resize\`. Use raw hex values and inline styles, no Tailwind design tokens inside the component.

The word defaults to \`'wild'\` and is configurable via a \`text\` prop. Render the word as SVG \`<text>\` (not an HTML span) so glyphs re-rasterize at native resolution under extreme stretch. Measure the text's bounding box via \`getBBox()\` after each font-size/text change and use those pixel dimensions to size the \`<svg>\` element exactly.

---

## Warp technique: 2D homography → CSS matrix3d

Maintain **eight Framer Motion \`MotionValue<number>\`s**, one X and one Y offset per corner: \`tlX, tlY, trX, trY, blX, blY, brX, brY\`. All start at 0.

On every frame (subscribe via \`useMotionValueEvent\` on all eight), recompute a \`matrix3d\` string and imperatively write it to \`warpRef.current.style.transform\`. Do NOT use \`<motion.div>\` or re-render; drive the DOM directly.

The matrix is a **2D projective (homography) transform** that maps the element's natural rect \`[(0,0),(w,0),(w,h),(0,h)]\` onto a target quadrilateral built from the corner offsets:
- TL = \`(0 + tlX, 0 + tlY)\`
- TR = \`(w + trX, 0 + trY)\`
- BR = \`(w + brX, h + brY)\`
- BL = \`(0 + blX, h + blY)\`

Solve the homography with **Gaussian elimination** (8×8 linear system, partial pivoting). The 8 unknowns \`[a, b, c, d, e, f, g, h]\` come from: for each of the 4 corner pairs \`(u,v) → (x,y)\`:
\`\`\`
x-row:  a·u + c·v + e − g·u·x − h·v·x = x
y-row:  b·u + d·v + f − g·u·y − h·v·y = y
\`\`\`
Embed the 3×3 result H into a **4×4 CSS matrix3d** (column-major):
\`\`\`
matrix3d(a, b, 0, g,  c, d, 0, h,  0, 0, 1, 0,  e, f, 0, 1)
\`\`\`
If the system is degenerate (pivot < 1e-12), fall back to identity \`[1,0,0,1,0,0,0,0]\`. Always set \`transformOrigin: '0 0'\` on the warp container.

Track natural element size with a \`ResizeObserver\` on the warp container and store it in a ref.

---

## Interaction modes

Three modes tracked in a ref (\`'none' | 'top' | 'bottom'\`):

- **\`none\`** (pointer outside): all 8 offsets → 0.
- **\`top\`** (pointer in the **upper half**): TL and TR corners pull up + outward; BL and BR stay pinned at 0.
  - \`tlX = -1.0 × w\`, \`tlY = -1.55 × h\`
  - \`trX = +1.05 × w\`, \`trY = -1.48 × h\`
  - \`blX = blY = brX = brY = 0\`
- **\`bottom\`** (pointer in the **lower half**): BL and BR pull down + outward; TL and TR stay pinned at 0.
  - \`blX = -1.0 × w\`, \`blY = +1.55 × h\`
  - \`brX = +1.05 × w\`, \`brY = +1.48 × h\`
  - \`tlX = tlY = trX = trY = 0\`

Determine mode from the pointer's \`clientY\` vs the container's bounding rect midline.

---

## Spring physics

Use Framer Motion's imperative \`animate(motionValue, target, options)\`:

- **Enter / midline cross**: \`{ type: 'spring', stiffness: 280, damping: 14, mass: 1.8 }\`. Underdamped: corners overshoot and bounce 2–3 times.
- **Release**: \`{ type: 'spring', stiffness: 280, damping: 16, mass: 1.8 }\`. Slightly more damped, settles gently.

On every mode change: cancel all 8 in-flight animations (store \`AnimationPlaybackControls[]\` in a ref), then start fresh animations for all 8 motion values.

---

## Pointer handling

Unified pointer events on the container, no separate touch handlers needed:
- \`onPointerDown\`: call \`e.currentTarget.setPointerCapture(e.pointerId)\` then apply mode from \`e.clientY\`.
- \`onPointerMove\`: apply mode from \`e.clientY\`.
- \`onPointerUp\` / \`onPointerLeave\` / \`onPointerCancel\`: return to rest.

Set \`touchAction: 'none'\` and \`cursor: 'crosshair'\` on the container. Set \`perspective: 1400px\` and \`perspectiveOrigin: 50% 50%\` on the container for the 3D effect.

---

## Cleanup

Stop all animation controls on unmount. The component is fully self-contained in one file with a default export.`,

  Lovable: `Build a single-file React component called \`WildMorph\`. Install dependency: \`framer-motion\`.

---

## Visual & Theme

Single full-viewport container (\`min-h-screen w-full flex items-center justify-center\`). The container IS the background and interaction zone.

**Dual theme — inverted:**
- Dark mode: background \`#1a1a19\`, text \`#efeee6\`
- Light mode: background \`#efeee6\`, text \`#1a1a19\`

Detect theme via \`element.closest('[data-card-theme]')\` first, then \`document.documentElement.classList.contains('dark')\`. MutationObserver on ancestor chain for reactivity.

Centered italic word in Anton font (\`@import\` injected as \`<style>\` tag). Responsive font size: JS \`clamp(64px, 12vw, 144px)\`, recomputed on resize. Word defaults to \`'wild'\`, configurable via \`text\` prop. Render as SVG \`<text>\`, sized from \`getBBox()\`.

---

## Warp: 2D homography → matrix3d

Eight \`MotionValue<number>\` corner offsets (tlX/Y, trX/Y, blX/Y, brX/Y). On each change, solve the homography via Gaussian elimination (8×8), embed in CSS \`matrix3d\`, write imperatively to \`warpRef.current.style.transform\`. \`transformOrigin: '0 0'\`.

Corner targets by mode:
- **top**: \`tlX=-w, tlY=-1.55h, trX=1.05w, trY=-1.48h\`, BL/BR=0
- **bottom**: \`blX=-w, blY=1.55h, brX=1.05w, brY=1.48h\`, TL/TR=0
- **none**: all 0

Springs: enter \`{stiffness:280, damping:14, mass:1.8}\`, release \`{stiffness:280, damping:16, mass:1.8}\`.

---

## Pointer handling

\`onPointerDown\` (setPointerCapture + apply mode), \`onPointerMove\` (apply mode), \`onPointerUp/Leave/Cancel\` (none). \`touchAction:'none'\`. Mode from \`clientY\` vs container midline.`,

  V0: `Build a single-file React component called \`WildMorph\`. Install: \`framer-motion\`.

## Theme
- Dark: bg \`#1a1a19\`, text \`#efeee6\`
- Light: bg \`#efeee6\`, text \`#1a1a19\`
- Detect via \`closest('[data-card-theme]')\` then html .dark class. MutationObserver for reactivity.

## Layout
Single \`min-h-screen w-full flex items-center justify-center\` container — IS the bg + interaction zone. \`perspective: 1400px\`, \`touchAction: none\`, \`cursor: crosshair\`.

## Word
Anton font via \`<style>\` @import. Font size \`clamp(64px, 12vw, 144px)\` from JS, resize listener. Default prop \`text='wild'\`. SVG \`<text>\` element, sized from \`getBBox()\`.

## Warp
8 MotionValues (corner X/Y). On change: solve 8×8 homography (Gaussian elimination) → \`matrix3d\` → write to \`warpRef.style.transform\`. \`transformOrigin: '0 0'\`.

Modes (clientY vs rect midline):
- top: TL=(-w, -1.55h), TR=(+1.05w, -1.48h), BL/BR=0
- bottom: BL=(-w, +1.55h), BR=(+1.05w, +1.48h), TL/TR=0
- none: all 0

Springs: enter \`{stiffness:280,damping:14,mass:1.8}\`, release \`{stiffness:280,damping:16,mass:1.8}\`.

## Pointer events
\`onPointerDown\` (setPointerCapture + mode), \`onPointerMove\` (mode), \`onPointerUp/Leave/Cancel\` (none). Cancel in-flight animations on mode change.`,
}
