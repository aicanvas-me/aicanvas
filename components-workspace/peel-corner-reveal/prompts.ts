import type { Platform } from '../../app/components/ComponentCard'

const CORE_SPEC = `A single-file React client component called \`PeelCornerReveal\`. It renders a tall portrait card with the BR (bottom-right) corner folded up as a green triangular flap, revealing a scannable Wi-Fi QR code underneath. The peel is driven entirely by a spring and responds to hover (peek) and tap/click/keyboard (toggle fully open).

Deps: \`framer-motion\` and \`qrcode.react\`. Add \`// npm install framer-motion qrcode.react\` right after \`'use client'\`.

# File & export
- Path: \`components-workspace/peel-corner-reveal/index.tsx\`
- \`'use client'\` at the very top
- \`export default function PeelCornerReveal()\`

# Theme detection (inline hook, no external imports)
Define an inline \`useTheme\` hook that takes a \`ref: RefObject<HTMLElement | null>\` parameter, returns \`'light' | 'dark'\`, and reacts to theme changes. It checks both a \`[data-card-theme]\` parent element (for preview embedding) and \`document.documentElement\`. A single \`MutationObserver\` watches both targets:

\`\`\`tsx
function useTheme(ref: RefObject<HTMLElement | null>): 'light' | 'dark' {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  useEffect(() => {
    if (typeof document === 'undefined') return
    const el = ref.current
    const update = () => {
      const card = el?.closest('[data-card-theme]') ?? null
      const dark = card
        ? card.classList.contains('dark')
        : document.documentElement.classList.contains('dark')
      setTheme(dark ? 'dark' : 'light')
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const cardWrapper = el?.closest('[data-card-theme]')
    if (cardWrapper) {
      observer.observe(cardWrapper, { attributes: true, attributeFilter: ['class'] })
    }
    return () => observer.disconnect()
  }, [ref])
  return theme
}
\`\`\`

Do NOT import \`useTheme\` from any external path. The hook must live in the same file as the component. Call it as \`const theme = useTheme(containerRef)\` where \`containerRef\` is the \`useRef<HTMLDivElement>(null)\` attached to the outer wrapper div.

# Palette
Module-level constants (do not change with theme):
- \`PEEL_FILL = '#1A9D51'\`: flat green face of the flap
- \`PEEL_FILL_DEEP = '#127A3D'\`: darker band along the fold (gradient stop 0%)
- \`PEEL_INK = '#FFFFFF'\`

Theme-aware values derived inside the component from \`const theme = useTheme(containerRef)\`:
- \`PAGE_BG\` = dark? \`'#2E2E2C'\` : \`'#D0CCC4'\`
- \`CARD_FILL\` = dark? \`'#FFFFFF'\` : \`'#121212'\` (card inverts: white in dark mode, near-black in light mode)
- \`CARD_INK\` = dark? \`'#0A0A0A'\` : \`'#F5F5F0'\` (ink always reads against the card)
- \`FOLD_STROKE\` = dark? \`'rgba(0,0,0,0.28)'\` : \`'rgba(255,255,255,0.22)'\`, a thin highlight line along the fold
- \`DIVIDER_STROKE\` = dark? \`CARD_INK\` : \`'#FFFFFF'\`, always rendered at \`opacity={0.15}\`
- \`DROP_SHADOW\` = dark? \`'4px 4px 24px rgba(0,0,0,0.55)'\` : \`'4px 4px 24px rgba(20,15,10,0.28)'\`

# Layout & geometry constants (all SVG units)
\`\`\`
VB_W = 500          // viewBox width
VB_H = 620          // viewBox height
CARD_W = 320
CARD_H = 440
CARD_X = 90         // top-left x of card within the viewBox
CARD_Y = 70         // top-left y of card within the viewBox
CARD_RADIUS = 12    // corner radius for TL, TR, BL corners (BR is carved by the peel, no arc)
\`\`\`
Derived corners: \`TL = {CARD_X, CARD_Y}\`, \`TR = {CARD_X+CARD_W, CARD_Y}\`, \`BR = {CARD_X+CARD_W, CARD_Y+CARD_H}\`, \`BL = {CARD_X, CARD_Y+CARD_H}\`.

Peel progress endpoints (percent of card dimension):
\`\`\`
REST_W_PCT = 0.22   REST_H_PCT = 0.18
OPEN_W_PCT = 0.78   OPEN_H_PCT = 0.9
\`\`\`
Idle bob amplitude: \`BOB_AMPLITUDE = 2.4\` (SVG units of vertical travel).

# Root wrapper
A \`<div ref={containerRef}>\` with Tailwind classes \`relative flex min-h-screen w-full items-center justify-center overflow-hidden px-6 py-10\` and an inline \`style={{ background: PAGE_BG }}\`.

Inside it, a \`motion.div\` that wraps the SVG:
- \`role="button"\`, \`tabIndex={0}\`, \`aria-pressed={isOpen}\`, \`aria-label\` reads "Show Wi-Fi credentials" / "Hide Wi-Fi credentials"
- \`onTap\` toggles \`isOpen\`; \`onKeyDown\` toggles on Enter or Space (preventDefault)
- \`onPointerEnter/Leave\` set \`isHovered\`
- \`whileHover={{ scale: 1.015 }}\`, \`transition={{ type: 'spring', stiffness: 260, damping: 22 }}\`
- Tailwind: \`relative w-full max-w-[440px] cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A9D51] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent rounded-[20px]\`
- \`style={{ y: bobY, filter: \\\`drop-shadow(\${DROP_SHADOW})\\\` }}\`: idle bob MotionValue plus theme-aware CSS drop-shadow

# Interaction → progress
Keep a plain \`target = useMotionValue(0)\`. In a \`useEffect([isOpen, isHovered])\`:
- if \`isOpen\` → \`target.set(1)\`
- else if \`isHovered\` → \`target.set(0.18)\` (small peek)
- else → \`target.set(0)\`

Then \`const progress = useSpring(target, { stiffness: 170, damping: 22, mass: 0.9 })\`. This single 0..1 MotionValue drives every animated SVG attribute.

# Fold math
From \`progress\`:
- \`w = useTransform(progress, [0,1], [REST_W_PCT*CARD_W, OPEN_W_PCT*CARD_W])\`
- \`h = useTransform(progress, [0,1], [REST_H_PCT*CARD_H, OPEN_H_PCT*CARD_H])\`

Fold endpoints A (on bottom edge) and B (on right edge) of the card:
- \`Ax = useTransform(w, v => BR.x - v)\`, \`Ay = useMotionValue(BR.y)\`
- \`Bx = useMotionValue(BR.x)\`, \`By = useTransform(h, v => BR.y - v)\`

C is the reflection of BR across line A–B. Derive it via the standard reflection-of-point-across-line formula, computed inside \`useTransform([Ax, By], ...)\`:
\`\`\`
dx = BR.x - ax;  dy = by - BR.y;  len2 = dx*dx + dy*dy
t  = (dx*dx) / len2
footX = ax + t*dx ; footY = BR.y + t*dy
Cx = 2*footX - BR.x ; Cy = 2*footY - BR.y
\`\`\`
Guard \`len2 === 0\` by returning BR.

Fold angle in degrees: \`angle = useTransform([Ax, By], ([ax, by]) => Math.atan2(by - BR.y, BR.x - ax) * 180 / Math.PI)\`.

# Rounded card path
The card shape is a \`motion.path\` (not a polygon) built with \`useMotionTemplate\`. TL, TR, and BL corners are rounded to \`CARD_RADIUS\` using quarter-circle arcs. The BR corner stays as straight line endpoints (points A and B) so the peel fold math works untouched.

\`\`\`
cardPath = useMotionTemplate\`M \${TL.x + CARD_RADIUS} \${TL.y}
  L \${TR.x - CARD_RADIUS} \${TR.y}
  A \${CARD_RADIUS} \${CARD_RADIUS} 0 0 1 \${TR.x} \${TR.y + CARD_RADIUS}
  L \${Bx} \${By}
  L \${Ax} \${Ay}
  L \${BL.x + CARD_RADIUS} \${BL.y}
  A \${CARD_RADIUS} \${CARD_RADIUS} 0 0 1 \${BL.x} \${BL.y - CARD_RADIUS}
  L \${TL.x} \${TL.y + CARD_RADIUS}
  A \${CARD_RADIUS} \${CARD_RADIUS} 0 0 1 \${TL.x + CARD_RADIUS} \${TL.y}
  Z\`
\`\`\`

Path walkthrough:
1. Start at TL right-tangent point, run to TR left-tangent
2. Arc TR (clockwise, sweep-flag=1)
3. Line to B (right edge fold point), then to A (bottom edge fold point)
4. Line to BL right-tangent, arc BL (clockwise)
5. Line to TL bottom-tangent, arc TL (clockwise) back to start

Also keep \`peelPoints = useMotionTemplate\\\`\${Ax},\${Ay} \${Bx},\${By} \${Cx},\${Cy}\\\`\` for the green flap polygon.

# SVG
One \`motion.svg viewBox="0 0 500 620"\` with \`className="block h-auto w-full"\` and \`style={{ rotate: 3, transformOrigin: '50% 50%' }}\` (the whole card tilts +3° for personality). \`aria-hidden\`.

Inside \`<defs>\`:
1. \`<motion.linearGradient id="pcr-peel-gradient" gradientUnits="userSpaceOnUse">\` with \`x1={foldMidX}\` \`y1={foldMidY}\` \`x2={Cx}\` \`y2={Cy}\`, where \`foldMidX/Y\` are useTransforms of \`(Ax+Bx)/2\` and \`(Ay+By)/2\`. Stops: 0% \`PEEL_FILL_DEEP\`, 22% \`PEEL_FILL\`, 100% \`PEEL_FILL\`. This creates a darker band hugging the fold that fades into flat green across the face.
2. \`<clipPath id="pcr-peel-clip">\` wrapping a \`motion.polygon points={peelPoints}\`.
3. \`<clipPath id="pcr-card-clip">\` wrapping a \`motion.path d={cardPath}\`. This uses the rounded path, NOT a polygon.

Render order (painter's algorithm):
1. **Card body**: \`<motion.g>\` wrapping \`<motion.path d={cardPath} fill={CARD_FILL} />\`. This draws the rounded card shape with the BR corner carved off.
2. **Card front content**: a \`<g clipPath="url(#pcr-card-clip)">\` containing:
   - **Pulsing Wi-Fi icon** positioned at the top-left of the card. \`<g transform={\\\`translate(\${CARD_X + 24}, \${CARD_Y + 62}) scale(1.5)\\\`} stroke={PEEL_FILL} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" fill="none">\`. Inside:
     - a filled dot: \`<circle cx="8" cy="12.5" r="1.4" fill={PEEL_FILL} />\`
     - three nested arcs that pulse on a staggered 2.2-second loop, all using custom easing \`[0.22, 1, 0.36, 1]\`:
       - \`d="M4 9 Q8 5 12 9"\` with \`opacity: [0.15, 1, 0.15]\`, \`times: [0, 0.2, 1]\`, delay 0
       - \`d="M1 6 Q8 -1 15 6"\` with \`opacity: [0.1, 0.9, 0.1]\`, \`times: [0, 0.25, 1]\`, delay 0.25
       - \`d="M-2 3 Q8 -7 18 3"\` with \`opacity: [0.05, 0.6, 0.05]\`, \`times: [0, 0.3, 1]\`, delay 0.5
     - All three: \`repeat: Infinity\`, \`duration: 2.2\`. The asymmetric \`times\` arrays make the peaks lean early, so the signal reads as emanating outward.
   - **Display type**: two stacked \`<text>\` lines at \`x={CARD_X+24}\` with \`fill={CARD_INK}\`, \`fontFamily="var(--font-sans, ui-sans-serif, system-ui, sans-serif)"\`, \`fontSize={96}\`, \`fontWeight={900}\`, \`letterSpacing={-3}\`, inline \`style={{ lineHeight: 0.9 }}\`. First line "Free" at \`y={CARD_Y + 190}\`, second "Wi-Fi" at \`y={CARD_Y + 276}\`.
   - **Divider**: single \`<line x1={CARD_X+40} y1={CARD_Y+316} x2={CARD_X+140} y2={CARD_Y+316} stroke={DIVIDER_STROKE} strokeWidth={1} opacity={0.15} />\`. Subtle hairline under the title.
   - **Bottom CTA**: \`<text x={CARD_X+24} y={CARD_Y + CARD_H - 20} fill={PEEL_FILL} fontSize={9} fontWeight={900} letterSpacing={2.5}>\` reading \`TAP TO SCAN\`. Same font-family var.
3. **Peel flap**: \`<motion.g>\` wrapping \`<motion.polygon points={peelPoints} fill="url(#pcr-peel-gradient)" />\`.
4. **Fold highlight line**: \`<motion.line x1={Ax} y1={Ay} x2={Bx} y2={By} stroke={FOLD_STROKE} strokeWidth={1.1} strokeLinecap="round" />\`. Thin stroke along the fold sells paper thickness.
5. **QR code group**: \`<motion.g clipPath="url(#pcr-peel-clip)" style={{ opacity: revealOpacity }}>\` with \`revealOpacity = useTransform(progress, [0.35, 0.75], [0, 1])\`, so the QR fades in after the flap has clearly started lifting.

There is NO caption or hint label below the card. The \`motion.div\` wrapper contains only the SVG.

# QR positioning
QR constants:
\`\`\`
QR_SIZE = 110
QR_ALONG_FRAC = 0.3   // position along the fold A→B (0=at A, 1=at B)
QR_PERP_FRAC  = 0.7   // perpendicular position from fold toward C (0=on fold, 1=at C)
QR_OFFSET_X = 54
QR_OFFSET_Y = 18
\`\`\`
Anchor (center of QR) in SVG coords:
\`\`\`
qrAnchorX = ax + QR_ALONG_FRAC*(bx - ax) + (QR_PERP_FRAC/2)*(cx - BR.x) + QR_OFFSET_X
qrAnchorY = ay + QR_ALONG_FRAC*(by - ay) + (QR_PERP_FRAC/2)*(cy - BR.y) + QR_OFFSET_Y
\`\`\`
(Each is a \`useTransform\` over \`[Ax, Bx, Cx]\` / \`[Ay, By, Cy]\`.) Rotation: \`qrAngle = useTransform(angle, a => a + 31)\`.

The transform string \`translate(qrAnchorX qrAnchorY) rotate(qrAngle)\` is built with \`useMotionTemplate\` but applied imperatively to the inner \`<g ref={qrGroupRef}>\` via \`useMotionValueEvent(qrTransform, 'change', latest => qrGroupRef.current?.setAttribute('transform', latest))\` plus an \`useEffect\` that seeds the initial value. This is because Framer Motion's SVG transform attribute doesn't animate reliably through a template on a plain \`<g>\`.

Inside the inner \`<g ref={qrGroupRef}>\`, place a \`<foreignObject x={-QR_SIZE/2} y={-QR_SIZE/2} width={QR_SIZE} height={QR_SIZE}>\` containing a plain \`<div>\` styled \`{ width: QR_SIZE, height: QR_SIZE, padding: 6, background: '#FFFFFF', borderRadius: 6, boxSizing: 'border-box' }\`. Inside that div, render:
\`\`\`tsx
<QRCodeSVG
  value="WIFI:S:SlowBrew_4G;T:WPA;P:BREW_ME_BABY!;;"
  size={QR_SIZE - 12}
  level="M"
  bgColor="#FFFFFF"
  fgColor="#0A0A0A"
  style={{ display: 'block' }}
/>
\`\`\`
The \`WIFI:S:…;T:WPA;P:…;;\` format is the standard Wi-Fi QR payload, so a real phone scan will join the network.

# Idle bob
Only on the closed card, fading out as it opens:
- \`bobRaw = useMotionValue(0)\`. In an effect, run a \`requestAnimationFrame\` loop that sets \`bobRaw\` to \`Math.sin(elapsedSeconds * 1.2) * BOB_AMPLITUDE\`. Clean up with \`cancelAnimationFrame\` and an \`alive\` flag.
- \`bobGate = useTransform(progress, [0, 0.4], [1, 0])\`.
- \`bobY = useTransform([bobRaw, bobGate], ([b, g]) => b * g)\`, combined with the drop-shadow in the outer motion.div: \`style={{ y: bobY, filter: \\\`drop-shadow(\${DROP_SHADOW})\\\` }}\`.

# Mobile / resilience
- Component fills its container; no hardcoded widths on the wrapper. The SVG uses \`w-full h-auto\` so it scales cleanly from 320px to 1200px.
- Tap-to-toggle works on touch (Framer Motion's \`onTap\`). Hover peek is desktop-only bonus. On mobile the component is still fully usable via tap.

# Cleanup / correctness
- Cancel the bob RAF on unmount.
- Disconnect the theme MutationObserver on unmount.
- Use \`useMotionValue\` / \`useTransform\` for animation state, no \`useState\` for numeric animation values.
- TypeScript strict: event type is \`React.KeyboardEvent<HTMLDivElement>\`, QR group ref is \`useRef<SVGGElement>(null)\`, containerRef is \`useRef<HTMLDivElement>(null)\`, useTheme param is \`RefObject<HTMLElement | null>\`. No \`any\`.`

const ENV_PREAMBLE = `Before writing code: verify this project has Tailwind CSS v4, TypeScript, and React set up. If any are missing, run the shadcn CLI to scaffold them (\`npx shadcn@latest init\`). This component relies on Tailwind utilities for layout and inline SVG styles for the theme-aware palette.\n\n`

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': ENV_PREAMBLE + CORE_SPEC,
  Lovable: CORE_SPEC,
  V0: ENV_PREAMBLE + CORE_SPEC,
}
