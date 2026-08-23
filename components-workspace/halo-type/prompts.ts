import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Before writing any code, verify the project has Tailwind CSS v4, TypeScript, and React set up. If missing, use the shadcn CLI to scaffold them.

Build a single-file React component called \`HaloType\` with \`'use client'\` at the top. Install dependency: \`framer-motion\`.

This is a kinetic-typography component: a horizontal ring of text (a tilted halo) that continuously rotates on its Y-axis. Each character on the front arc reads upright in the foreground color; each character on the back arc reads upside-down in a dimmer color. The ring is pure CSS 3D, no Three.js, no WebGL.

---

## Constants (at module scope)

\`\`\`ts
const PHRASE = 'COPY ✦ PASTE ✦ SHIP ✦ REPEAT ✦ '
const TILT_REST = 24          // rotateX at rest, a flat-ish ellipse
const TILT_HOVER = 24         // rotateX while hovered, no tilt change on hover
const SECONDS_PER_TURN = 14   // full rotation duration at rest
const SPEED_HOVER = 0.3       // hover slows spin to 30% of rest speed
const RADIUS_FRACTION = 0.35  // ring radius ≈ 35% of min(w, h) → diameter ≈ 70%
const STAR_SCALE = 0.65       // ✦ separators render at 65% of letter font-size
\`\`\`

---

## Theme & colors

Dual theme, raw hex only (no Tailwind tokens inside the component). Back-arc letters use a dimmer hue so the front arc reads as the hero.

- **Dark**: bg \`#0A0A0A\`, fg \`#F5F1E8\`, fgBack \`#7A756C\`
- **Light**: bg \`#F5F1E8\`, fg \`#0A0A0A\`, fgBack \`#6A655C\`

Detect theme with an inline \`useTheme(ref)\` hook that:
1. Walks up from \`ref.current\` to find the nearest \`[data-card-theme]\` ancestor. If present, theme = that attribute (\`'dark'\` or \`'light'\`). This is required so the component works inside an isolated card preview that has its own theme toggle.
2. Otherwise, theme = \`document.documentElement.classList.contains('dark') ? 'dark' : 'light'\`.
3. Attaches a \`MutationObserver\` on every ancestor from the root element up to \`<html>\`, observing \`attributes\` filtered to \`['class', 'data-card-theme']\`, so the component re-reads theme on any change in the chain. Disconnect all observers on cleanup.

Add a soft radial vignette under the ring:
- Dark: \`radial-gradient(60% 60% at 50% 52%, rgba(245,241,232,0.10) 0%, rgba(245,241,232,0.04) 35%, rgba(10,10,10,0) 70%)\`
- Light: \`radial-gradient(60% 60% at 50% 52%, rgba(10,10,10,0.08) 0%, rgba(10,10,10,0.03) 35%, rgba(245,241,232,0) 70%)\`

---

## Layout

- Root: \`flex min-h-screen w-full items-center justify-center\`, background = bg.
- Wrapper (inside root): \`relative flex h-[min(100vh,100vw)] w-full items-center justify-center overflow-hidden\`. This is where pointer events are bound and where the edge mask lives.
  - Apply \`touchAction: 'none'\`.
  - Apply \`maskImage\` and \`WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)'\` so the extreme left/right edges of the stage fade out. This hides any residual seam pixels at the ±90° transition.
- Perspective stage (child of wrapper, centered): a square \`size × size\` div with \`perspective: 1200px\`, \`perspectiveOrigin: '50% 50%'\`, \`position: relative\`.
- Ring container (child of stage): \`position: absolute; inset: 0; transformStyle: 'preserve-3d'; willChange: 'transform'\`. Its transform comes from two MotionValues (see below).

Measure \`size\` from the wrapper's \`getBoundingClientRect()\` via a \`ResizeObserver\`: \`size = Math.max(260, Math.min(rect.width, rect.height))\`.

Derived geometry:
- \`radius = size * RADIUS_FRACTION\`
- \`fontSize = Math.max(20, Math.min(48, radius * 0.22))\`
- \`circumference = 2 * Math.PI * radius\`

---

## Per-character width measurement (critical)

Equal angular spacing looks broken: \`I\` gets the same slice as \`W\`. Fix this with DOM-based measurement.

Render a hidden absolute-positioned \`<span>\` sibling with \`visibility: hidden\`, \`pointerEvents: 'none'\`, \`whiteSpace: 'pre'\`, and the exact same font stack, weight (800), line-height (1), and letter-spacing (\`-0.01em\`) as the live glyphs. Inside it, map \`PHRASE.split('')\` to one \`<span data-m-char="" style={{ display: 'inline-block', whiteSpace: 'pre', fontSize: ch === '✦' ? fontSize * STAR_SCALE : fontSize }}>{ch}</span>\` per character.

In a \`useLayoutEffect\` keyed on \`fontSize\`:
1. Query all \`[data-m-char]\` children, read \`getBoundingClientRect().width\` for each, store as \`phraseWidths: number[]\`.
2. Attach a \`ResizeObserver\` to the hidden span so widths re-measure when the font actually loads (e.g. Manrope swapping in after a system-font fallback). Without this the ring stays spaced by the fallback font's metrics.
3. If \`document.fonts?.ready\` exists, also \`fonts.ready.then(measure)\`.
4. Disconnect the observer on cleanup.

Tile the phrase around the ring proportional to measured widths:
- \`phraseWidth = sum(phraseWidths)\`
- \`repeats = Math.max(1, Math.round(circumference / phraseWidth))\` (fall back to an estimate based on \`PHRASE.length * fontSize * 0.55\` on the very first render before measurement lands)
- \`characters = PHRASE.repeat(repeats).split('')\`
- \`totalTiledWidth = phraseWidth * repeats\`
- Per-character center angle (degrees): walk the tiled string accumulating width, \`charAngles[i] = ((cum + w/2) / totalTiledWidth) * 360\` where \`w = phraseWidths[i % PHRASE.length]\`. Fall back to equal spacing \`(i / totalChars) * 360\` before measurements exist.

---

## Rotation + per-letter opacity (the halo trick)

Do NOT use \`backface-visibility: hidden\`. At near-perpendicular angles it produces pixel-shred artifacts. Instead, render TWO glyph twins per character and fade them smoothly via \`cos(angle)\`.

Motion state (Framer Motion):
- \`engagement = useMotionValue(0)\`, driven to \`1\` on hover/press and \`0\` on release.
- \`engagementSmooth = useSpring(engagement, { stiffness: 120, damping: 22, mass: 0.6 })\`.
- \`tilt = useTransform(engagementSmooth, [0, 1], [TILT_REST, TILT_HOVER])\`.
- \`speedMul = useTransform(engagementSmooth, [0, 1], [1, SPEED_HOVER])\`.
- \`rotateY = useMotionValue(0)\`.
- \`ringTransform = useTransform([tilt, rotateY], ([x, y]) => \\\`rotateX(\${x}deg) rotateY(\${y}deg)\\\`)\`. This is the ring container's \`transform\`.

Animation loop via \`useAnimationFrame((t) => {...})\`:
- If \`prefers-reduced-motion: reduce\` (tracked in state via \`matchMedia\`): \`rotateY.set(30)\` and skip the integrator so the ring freezes at 30°, both arcs visible.
- Otherwise, integrate: keep a \`prevTs\` ref, compute \`dt = (t - prev) / 1000\`, advance \`rotateY\` by \`(360 / SECONDS_PER_TURN) * speedMul.get() * dt\`, wrap mod 360.
- Then, for each character index \`i\`:
  - \`eff = mod(rotateY.get() + charAngles[i], 360)\`
  - \`norm = eff > 180 ? eff - 360 : eff\` (map to −180…180)
  - \`c = Math.cos(norm * Math.PI / 180)\`
  - \`frontOpacity = c > 0 ? c : 0\`
  - \`backOpacity = c < 0 ? -c : 0\`
  - Write these imperatively: \`frontRefs.current[i].style.opacity = String(frontOpacity)\` and \`backRefs.current[i].style.opacity = String(backOpacity)\`.

Do NOT set opacity in JSX \`style\`: on any React re-render (theme change, resize) the letters would flash to 0 and pop in again.

---

## Glyph twins

For each character \`ch\` at index \`i\` with angle \`a = charAngles[i]\`:
- Compute \`base = \\\`translate(-50%, -50%) rotateY(\${a}deg) translateZ(\${radius}px)\\\`\`.
- Compute \`glyphSize = ch === '✦' ? fontSize * STAR_SCALE : fontSize\`.
- Shared glyph style: \`position: absolute; top: 50%; left: 50%; transformOrigin: '50% 50%'; fontFamily: 'var(--font-sans), ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif'; fontWeight: 800; fontSize: glyphSize; lineHeight: 1; letterSpacing: '-0.01em'; userSelect: 'none'; whiteSpace: 'pre'\`.
  - \`transformOrigin: '50% 50%'\` is LOAD-BEARING. With the default \`0 0\`, a narrow letter like \`I\` ends up at a different 3D position than a wide letter at the same ring-angle. It looks like SHIP's \`I\` floats on a different plane.
- Render two \`<span>\`s inside a \`React.Fragment\`:
  - **Front twin**: \`transform: base\`, \`color: fg\`. Store in \`frontRefs.current[i]\`.
  - **Back twin**: \`transform: \\\`\${base} rotateY(180deg) rotateZ(180deg)\\\`\`, \`color: fgBack\`. Store in \`backRefs.current[i]\`. The \`rotateY(180) rotateZ(180)\` composition makes the back glyph face inward AND flip upright-reversed, so it reads upside-down on the back arc rather than mirror-flipped.

Display a space character as a literal \`' '\` so it occupies an angular slot but renders blank.

Set \`aria-label={PHRASE.trim()}\` on the ring container for screen readers.

---

## Pointer handling

Unified pointer events on the wrapper, cover both mouse and touch in one set of handlers:
- \`onPointerEnter\` → \`engagement.set(1)\`
- \`onPointerLeave\` → \`engagement.set(0)\`
- \`onPointerDown\` → \`engagement.set(1)\`
- \`onPointerUp\` → \`engagement.set(0)\`
- \`onPointerCancel\` → \`engagement.set(0)\`

Hover lowers spin speed to 30% (via \`SPEED_HOVER\` feeding \`speedMul\`) but the tilt stays identical at 24°. The rest/hover tilt is the same by design so hover feels like "slow to read" rather than "tip forward".

---

## Cleanup

- Disconnect the \`ResizeObserver\` on the wrapper.
- Disconnect the measurement \`ResizeObserver\`.
- Disconnect every theme \`MutationObserver\` on the ancestor chain.
- Remove the reduced-motion \`change\` listener.

Single file, default export \`HaloType\`. Must work copy-pasted into any project with Tailwind v4 + Framer Motion.`,

  Lovable: `Build a single-file React component called \`HaloType\` with \`'use client'\` at the top. Install dependency: \`framer-motion\`.

This is a kinetic-typography component: a horizontal ring of text (a tilted halo) that continuously rotates on its Y-axis. Each character on the front arc reads upright in the foreground color; each character on the back arc reads upside-down in a dimmer color. Pure CSS 3D — no Three.js.

---

## Constants

\`\`\`ts
const PHRASE = 'COPY ✦ PASTE ✦ SHIP ✦ REPEAT ✦ '
const TILT_REST = 24
const TILT_HOVER = 24         // tilt does NOT change on hover
const SECONDS_PER_TURN = 14
const SPEED_HOVER = 0.3       // hover slows spin to 30%
const RADIUS_FRACTION = 0.35
const STAR_SCALE = 0.65       // ✦ smaller than letters
\`\`\`

---

## Theme & colors (raw hex, no tokens)

- Dark: bg \`#0A0A0A\`, fg \`#F5F1E8\`, fgBack \`#7A756C\`
- Light: bg \`#F5F1E8\`, fg \`#0A0A0A\`, fgBack \`#6A655C\`

Theme detection via inline \`useTheme\` hook:
1. Closest \`[data-card-theme]\` ancestor wins (required for isolated card previews).
2. Otherwise \`document.documentElement.classList.contains('dark')\`.
3. \`MutationObserver\` on every ancestor from the root up to \`<html>\`, filtered to \`['class', 'data-card-theme']\`. Disconnect all on cleanup.

Radial vignette behind the ring:
- Dark: \`radial-gradient(60% 60% at 50% 52%, rgba(245,241,232,0.10) 0%, rgba(245,241,232,0.04) 35%, rgba(10,10,10,0) 70%)\`
- Light: \`radial-gradient(60% 60% at 50% 52%, rgba(10,10,10,0.08) 0%, rgba(10,10,10,0.03) 35%, rgba(245,241,232,0) 70%)\`

---

## Layout

- Root: \`flex min-h-screen w-full items-center justify-center\`, background = bg.
- Wrapper: \`relative flex h-[min(100vh,100vw)] w-full items-center justify-center overflow-hidden\` with \`touchAction: 'none'\` and horizontal edge mask \`linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)\` (both \`maskImage\` and \`WebkitMaskImage\`) to fade the left/right corners.
- Perspective stage (square \`size × size\`): \`perspective: 1200px\`, \`perspectiveOrigin: '50% 50%'\`.
- Ring container: \`position: absolute; inset: 0; transformStyle: 'preserve-3d'; willChange: 'transform'\`.

\`size\` tracked via \`ResizeObserver\` on the wrapper: \`Math.max(260, Math.min(rect.width, rect.height))\`. Derived: \`radius = size * 0.35\`, \`fontSize = Math.max(20, Math.min(48, radius * 0.22))\`, \`circumference = 2πr\`.

---

## Per-character width measurement

Equal angular spacing would look broken (\`I\` = \`W\`). Render a hidden absolute-positioned sibling \`<span>\` (visibility: hidden, pointerEvents: none, whiteSpace: pre) with the same font stack, weight 800, lineHeight 1, letterSpacing -0.01em as the live glyphs. Map \`PHRASE.split('')\` to per-char \`<span data-m-char="" style={{ display: 'inline-block', whiteSpace: 'pre', fontSize: ch === '✦' ? fontSize * STAR_SCALE : fontSize }}>{ch}</span>\`.

In a \`useLayoutEffect\` keyed on fontSize, read each child's \`getBoundingClientRect().width\` into \`phraseWidths: number[]\`. Attach a \`ResizeObserver\` to the hidden span so widths re-measure when the real webfont loads (otherwise the ring stays spaced by fallback-font metrics). Also call \`document.fonts?.ready.then(measure)\`.

Tile proportionally: \`repeats = Math.max(1, Math.round(circumference / phraseWidth))\`. Walk the tiled string accumulating width to compute each \`charAngles[i] = ((cum + w/2) / totalTiledWidth) * 360\`.

---

## Rotation + per-letter opacity (the halo trick)

Do NOT use \`backface-visibility\` — it shows pixel-shred at ±90°. Instead, render two glyph twins per character and fade via \`cos(angle)\`.

Motion state:
- \`engagement = useMotionValue(0)\`, driven 0→1 on hover/press.
- \`engagementSmooth = useSpring(engagement, { stiffness: 120, damping: 22, mass: 0.6 })\`.
- \`tilt = useTransform(engagementSmooth, [0, 1], [TILT_REST, TILT_HOVER])\` — stays flat at 24° always.
- \`speedMul = useTransform(engagementSmooth, [0, 1], [1, SPEED_HOVER])\`.
- \`rotateY = useMotionValue(0)\`.
- \`ringTransform = useTransform([tilt, rotateY], ([x, y]) => \\\`rotateX(\${x}deg) rotateY(\${y}deg)\\\`)\`.

\`useAnimationFrame((t) => ...)\`:
- If \`prefers-reduced-motion: reduce\`: \`rotateY.set(30)\` and skip integration.
- Otherwise integrate: \`rotateY += (360 / SECONDS_PER_TURN) * speedMul.get() * dt\`, wrap mod 360.
- For each character: \`eff = mod(rotateY + charAngles[i], 360)\`, \`norm = eff > 180 ? eff - 360 : eff\`, \`c = cos(norm°)\`. Write \`frontRefs[i].style.opacity = max(c, 0)\` and \`backRefs[i].style.opacity = max(-c, 0)\` imperatively — NEVER through JSX style (re-renders would flash letters to 0).

---

## Glyph twins

For each character at angle \`a\`, \`base = translate(-50%, -50%) rotateY(a) translateZ(radius)\`. Glyph size = \`fontSize\` for letters, \`fontSize * STAR_SCALE\` for \`✦\`.

Shared glyph style: \`position: absolute; top: 50%; left: 50%; transformOrigin: '50% 50%'\` (critical — default \`0 0\` makes narrow letters sit on a different 3D ring than wide ones), fontFamily \`'var(--font-sans), ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif'\`, fontWeight 800, lineHeight 1, letterSpacing -0.01em, userSelect none, whiteSpace pre.

Two \`<span>\`s per character:
- **Front**: \`transform: base\`, \`color: fg\`, ref into \`frontRefs[i]\`.
- **Back**: \`transform: \${base} rotateY(180deg) rotateZ(180deg)\`, \`color: fgBack\`, ref into \`backRefs[i]\`. The combined 180° rotations make the back glyph read upside-down (not mirror-flipped) when viewed from the back arc.

\`aria-label={PHRASE.trim()}\` on the ring container.

---

## Pointer handling

One set of unified handlers on the wrapper covers mouse AND touch:
- \`onPointerEnter\` / \`onPointerDown\` → \`engagement.set(1)\`
- \`onPointerLeave\` / \`onPointerUp\` / \`onPointerCancel\` → \`engagement.set(0)\`

Hover drops the spin to 30% of rest speed so the viewer can read the front arc; tilt stays 24° identical.

---

## Cleanup

Disconnect all ResizeObservers and theme MutationObservers on unmount. Remove the reduced-motion matchMedia listener.

Single file, default export \`HaloType\`.`,

  V0: `Build a single-file React component called \`HaloType\`. Install: \`framer-motion\`. \`'use client'\` at top.

Concept: a tilted ring of text rotating continuously on its Y-axis — a halo. Front arc reads upright in foreground color; back arc reads upside-down in a dimmer color. Pure CSS 3D (no Three.js).

## Constants
\`\`\`ts
const PHRASE = 'COPY ✦ PASTE ✦ SHIP ✦ REPEAT ✦ '
const TILT_REST = 24, TILT_HOVER = 24  // tilt does NOT change on hover
const SECONDS_PER_TURN = 14
const SPEED_HOVER = 0.3                // hover slows to 30%
const RADIUS_FRACTION = 0.35
const STAR_SCALE = 0.65                // ✦ smaller than letters
\`\`\`

## Theme (raw hex)
- Dark: bg \`#0A0A0A\`, fg \`#F5F1E8\`, fgBack \`#7A756C\`
- Light: bg \`#F5F1E8\`, fg \`#0A0A0A\`, fgBack \`#6A655C\`

Inline \`useTheme\`: closest \`[data-card-theme]\` ancestor first, else \`html.dark\`. MutationObserver on every ancestor up to html watching class + data-card-theme. Vignette radial-gradient behind ring tuned per theme.

## Layout
Root \`flex min-h-screen w-full items-center justify-center\` (bg = theme bg). Wrapper \`relative h-[min(100vh,100vw)] w-full overflow-hidden\` with \`touchAction: none\` and horizontal edge mask \`linear-gradient(to right, transparent 0%, black 18%, black 82%, transparent 100%)\` (mask + WebkitMask) to fade corners. Perspective stage \`size × size\` square, \`perspective: 1200px\`. Ring container \`absolute inset-0 transformStyle preserve-3d\`.

\`size = max(260, min(rect.w, rect.h))\` from ResizeObserver on wrapper. \`radius = size * 0.35\`, \`fontSize = clamp(20, radius * 0.22, 48)\`.

## Per-character width measurement
Equal angular spacing looks wrong (\`I\` ≠ \`W\`). Render a hidden absolute span (visibility hidden, whiteSpace pre, same font stack, weight 800, lineHeight 1, letterSpacing -0.01em). One inline-block child per phrase character with \`data-m-char\` and \`fontSize: ch==='✦' ? fontSize*STAR_SCALE : fontSize\`.

Read each child's \`getBoundingClientRect().width\` into \`phraseWidths[]\`. Attach ResizeObserver to the hidden span so widths re-measure when Manrope (or your webfont) actually loads — otherwise the ring stays spaced by fallback metrics. Also \`document.fonts?.ready.then(measure)\`.

Tile proportionally: \`repeats = round(circumference / phraseWidth)\`. \`charAngles[i] = ((cum + w/2) / totalTiledWidth) * 360\`.

## Rotation + opacity (halo trick)
No \`backface-visibility\` — shows pixel-shred at ±90°. Two glyph twins per character; fade via cos(angle).

- \`engagement = useMotionValue(0)\`, hover/press → 1.
- \`engagementSmooth = useSpring(engagement, { stiffness: 120, damping: 22, mass: 0.6 })\`.
- \`tilt = useTransform(engagementSmooth, [0,1], [24, 24])\` — constant 24°.
- \`speedMul = useTransform(engagementSmooth, [0,1], [1, 0.3])\`.
- \`rotateY = useMotionValue(0)\`.
- \`ringTransform = useTransform([tilt, rotateY], ([x,y]) => \`rotateX(\${x}deg) rotateY(\${y}deg)\`)\`.

\`useAnimationFrame((t) => ...)\`:
- reduced-motion: \`rotateY.set(30)\`, skip integration.
- Otherwise: \`rotateY += (360/14) * speedMul.get() * dt\` mod 360.
- Per character: \`eff = mod(rotateY + charAngles[i], 360)\`, \`norm = eff > 180 ? eff - 360 : eff\`, \`c = cos(norm°)\`. Imperatively set \`frontRefs[i].style.opacity = max(c, 0)\`, \`backRefs[i].style.opacity = max(-c, 0)\`. Not via JSX style — avoids re-render flashes.

## Glyph twins
\`base = translate(-50%,-50%) rotateY(a) translateZ(radius)\`. Shared style: absolute, top/left 50%, \`transformOrigin: '50% 50%'\` (CRITICAL — default 0 0 puts narrow letters on a different 3D ring than wide ones), fontWeight 800, lineHeight 1, letterSpacing -0.01em, userSelect none.

- Front twin: \`transform: base\`, \`color: fg\`, ref \`frontRefs[i]\`.
- Back twin: \`transform: \${base} rotateY(180deg) rotateZ(180deg)\`, \`color: fgBack\`, ref \`backRefs[i]\`. The combined 180°s make the back glyph read upside-down (not mirror-flipped).

\`aria-label={PHRASE.trim()}\` on ring container.

## Pointer
Unified handlers on wrapper (mouse + touch): \`onPointerEnter\`/\`onPointerDown\` → engagement 1; \`onPointerLeave\`/\`onPointerUp\`/\`onPointerCancel\` → engagement 0. Hover slows spin to 30%, tilt unchanged at 24°.

## Cleanup
Disconnect all ResizeObservers + theme MutationObservers, remove reduced-motion listener.

Single file, default export \`HaloType\`.`,
}
