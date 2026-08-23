import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Before writing any code, verify the project has Tailwind CSS v4, TypeScript, and React set up. If missing, use the shadcn CLI to scaffold them.

Build a single-file React component called \`RippleType\` with \`'use client'\` at the top. Install dependency: \`framer-motion\`.

---

## Concept

A kinetic-typography piece: the word \`RIPPLE\` rendered as large SVG text with an SVG turbulence + displacement-map filter that distorts the letters like rippling liquid. To the left of the word sits a small fan icon with an OFF/ON label below it. Click the fan to toggle. When ON, the displacement intensity ramps up over a second, the noise pattern morphs continuously, the fan blades spin, and the word skews to the right. When OFF, intensity decays (faster than the ramp-up), the blades coast to a stop, and the word settles back upright. Pure React + Framer Motion, no Three.js, no canvas, no other libraries.

---

## Constants (module scope)

\`\`\`ts
const WORD = 'RIPPLE'

// Amplitude ramp: 1 unit/sec up, 2.5 units/sec down.
const LEVEL_COUNT       = 1
const LEVEL_RAMP        = 1.0
const LEVEL_DECAY       = 2.5
const MAX_SCALE         = 36     // peak feDisplacementMap scale at full intensity
const OSCILLATION_HZ    = 0.09   // breathing oscillation frequency
const REST_FREQ         = 0.001  // baseFrequency at rest
const HOVER_FREQ        = 0.009  // baseFrequency target at full intensity
const RIPPLE_PHASE_RATE = 0.9    // radians/sec the noise morphs at full intensity

// Fan spin: 2π / 0.6s ≈ 10.47 rad/s at full speed.
const FAN_FULL_RATE    = (Math.PI * 2) / 0.6
const FAN_REDUCED_RATE = (Math.PI * 2) / 2.0
\`\`\`

---

## Theme & colors (raw hex, no Tailwind tokens)

Dual theme: the component listens for theme on a \`[data-card-theme]\` ancestor first (required for isolated card previews), falling back to \`document.documentElement.classList.contains('dark')\`.

- Dark: bg \`#0A0A0A\`, fg \`#EFEEE6\`, fan stroke \`#EFEEE6\`
- Light: bg \`#EFEEE6\`, fg \`#0A0A0A\`, fan stroke \`#0A0A0A\`

Vignette behind the layout:
- Dark: \`radial-gradient(70% 55% at 50% 50%, rgba(239,238,230,0.06) 0%, rgba(10,10,10,0) 70%)\`
- Light: \`radial-gradient(70% 55% at 50% 50%, rgba(10,10,10,0.05) 0%, rgba(239,238,230,0) 70%)\`

Inline \`useTheme(ref)\` hook:
1. From \`ref.current\`, walk up to find the closest \`[data-card-theme]\` ancestor. If found, theme = that attribute.
2. Otherwise, theme = \`html.dark\` ? 'dark' : 'light'.
3. Attach a \`MutationObserver\` to every ancestor from the root up to \`<html>\`, filtered to \`['class', 'data-card-theme']\`, re-reading on any change. Disconnect all observers on cleanup.

OFF/ON label uses fixed semantic colors (independent of theme): OFF = \`#EF4444\`, ON = \`#22C55E\`.

---

## Layout

- Root: \`relative min-h-screen w-full overflow-hidden\`, \`backgroundColor: bg\`.
- Vignette: an absolute \`inset: 0\` div behind everything with \`background: vignette\` and \`pointerEvents: 'none'\`.
- Single content wrapper (absolute \`inset: 0\`): \`display: flex; flexDirection: 'row'; alignItems: 'center'; justifyContent: 'center'; gap: 'clamp(14px, 3vw, 32px)'\`. Fan and text sit on one row at every viewport, never stacking into a column.

---

## Fan icon (left of the word)

Wrap the SVG in a \`<div role="button" aria-label="Toggle fan" aria-pressed={fanOn} tabIndex={0}>\` with column flex layout (icon above label, gap 4) and \`flexShrink: 0\`, \`cursor: 'pointer'\`, \`outline: 'none'\`, \`userSelect: 'none'\`, \`touchAction: 'manipulation'\`. Click and Space/Enter both toggle.

SVG: \`viewBox="0 0 100 100"\`, \`width: 'clamp(56px, 11vw, 112px)'\` (height matches), \`transform: 'perspective(220px) rotateY(38deg)'\` so the propeller appears tilted away from the viewer. Inside:
- Three concentric grille circles at \`r = 38\` (stroke 2, opacity 0.85), \`r = 30\` (stroke 1, opacity 0.35), \`r = 22\` (stroke 1, opacity 0.25), all using \`fanStroke\`, no fill.
- A blade group \`<g>\` with \`transformBox: 'view-box'\`, \`transformOrigin: '50px 50px'\`, \`willChange: 'transform'\`. Inside it, three petal paths rendered via \`[0, 120, 240].map((angle) => <path d="M50 50 C 56 34, 64 28, 70 26 C 66 34, 60 42, 50 50 Z" fill={fanStroke} opacity="0.9" transform={\\\`rotate(\${angle} 50 50)\\\`} />)\`.
- Center hub (drawn AFTER blades so it sits on top): \`<circle cx="50" cy="50" r="4.5" fill={fanStroke} />\` then \`<circle cx="50" cy="50" r="1.6" fill={bg} />\`.

Label below the SVG: a \`<span>\` reading \`'ON'\` or \`'OFF'\`, system sans, fontWeight 700, fontSize 11, letterSpacing \`0.18em\`, color = green when on / red when off, transition \`color 0.4s, opacity 0.4s\`.

---

## Word (right of the fan)

\`<svg viewBox="0 0 500 180" preserveAspectRatio="xMidYMid meet" role="img" aria-label={WORD}>\` with \`width: 'min(55vw, 500px)', height: 'auto', maxHeight: '70vh', overflow: 'visible'\`.

Inside \`<defs>\`, one filter:

\`\`\`tsx
<filter id={filterId} x="-15%" y="-15%" width="130%" height="130%">
  <feTurbulence ref={turbRef} type="fractalNoise" baseFrequency={REST_FREQ} numOctaves={1} seed={4} result="noise" />
  <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="noise" scale={0} xChannelSelector="R" yChannelSelector="G" />
</filter>
\`\`\`

The filter id must be unique per instance: use \`useId()\` and replace \`':'\` with \`'-'\` to keep it valid for \`url(#…)\` references. \`numOctaves={1}\` is intentional (a single octave gives the smooth liquid look, higher counts get noisy and chattery).

Then \`<g filter={\\\`url(#\${filterId})\\\`} fill={fg}>\` containing one \`<text x="250" y="140" textAnchor="middle">RIPPLE</text>\` with system sans (\`'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif'\`), fontWeight 900, fontSize 140, letterSpacing \`-0.04em\`, \`userSelect: 'none'\`.

The outer \`<svg>\` itself has a \`textSvgRef\`. Its CSS transform is \`skewX(...)\` (see animation loop).

---

## State + animation loop

Refs:
- \`turbRef\` (SVGFETurbulenceElement), \`dispRef\` (SVGFEDisplacementMapElement), \`bladesRef\` (SVGGElement), \`textSvgRef\` (SVGSVGElement).
- \`levelRef\` (number, 0..LEVEL_COUNT), \`fanAngleRef\` (radians), \`ripplePhaseRef\` (radians), \`lastTimeRef\` (number | null).
- \`fanOn\` state (boolean) + a \`fanOnRef\` mirrored via \`useEffect\` so the RAF callback always reads the current value.
- \`reducedMotion\` state from \`window.matchMedia('(prefers-reduced-motion: reduce)')\` with a \`change\` listener.

\`useAnimationFrame((t) => {...})\`:
1. \`dt = lastTimeRef.current == null ? 0 : Math.max(0, Math.min(0.05, (t - lastTimeRef.current) / 1000))\`. Cap dt to 50 ms so a tab-switch doesn't catapult the simulation.
2. If \`fanOnRef.current\`: \`levelRef.current = min(LEVEL_COUNT, levelRef.current + LEVEL_RAMP * dt)\`. Else: \`levelRef.current = max(0, levelRef.current - LEVEL_DECAY * dt)\`.
3. \`intensity = levelRef.current / LEVEL_COUNT\` (0..1).
4. \`secs = t / 1000\`; \`breath = sin(secs * 2π * OSCILLATION_HZ)\`.
5. \`peakScale = reducedMotion ? 14 : MAX_SCALE\`. \`scale = intensity * peakScale\`.
6. \`freq = max(0.002, REST_FREQ + (HOVER_FREQ - REST_FREQ) * intensity + 0.004 * breath * intensity)\`.
7. Advance noise phase: \`ripplePhaseRef.current += intensity * RIPPLE_PHASE_RATE * dt\`. Let \`p = ripplePhaseRef.current\`.
8. Compute live X/Y baseFrequencies that morph continuously while ON:
   - \`liveFreqX = max(0.002, freq + 0.007 * sin(p) * intensity)\`
   - \`liveFreqY = max(0.002, 0.028 + 0.012 * sin(p * 1.4 + 1) * intensity)\`
   - Two offset sine waves on X and Y keep the ripple alive without any texture-tile boundary jump.
9. Imperatively: \`turb.setAttribute('baseFrequency', \\\`\${liveFreqX} \${liveFreqY}\\\`)\` and \`disp.setAttribute('scale', String(scale))\`.
10. Skew: \`skew = reducedMotion ? 0 : intensity * 13\` (degrees). \`textSvgRef.current.style.transform = \\\`skewX(\${skew}deg)\\\`\`.
11. Blade spin: \`rate = reducedMotion ? FAN_REDUCED_RATE : FAN_FULL_RATE\`; \`fanAngleRef.current += rate * intensity * dt\`; wrap > 2π. \`bladesRef.current.style.transform = \\\`rotate(\${fanAngleRef.current * 180 / Math.PI}deg)\\\`\`.

All filter attribute updates and transforms are written imperatively, with no JSX state for animation values, no useState for per-frame data. This avoids React re-render churn at 60fps.

---

## Reduced motion

If \`(prefers-reduced-motion: reduce)\`:
- \`peakScale\` clamps to 14 (instead of 36) so the displacement is gentler.
- \`skew\` is forced to 0, so the word never tilts.
- Blade rate falls to one revolution every 2 seconds (vs ~0.6s).

The fan toggle still works; the ramp/decay still happens. Only peak amplitudes are reduced.

---

## Mobile

Single row at every breakpoint, never stacking into a column. Fan size, text size, and gap all use \`clamp()\` so the layout fluidly compresses. The text SVG width is \`min(55vw, 500px)\`, so even at 320 px viewport the word and fan both fit on one line.

---

## Cleanup

- Disconnect every theme \`MutationObserver\` on the ancestor chain on unmount.
- Remove the reduced-motion \`change\` listener.

Single file, default export \`RippleType\`. Must work copy-pasted into any project with Tailwind v4 + Framer Motion.`,

  Lovable: `Build a single-file React component called \`RippleType\` with \`'use client'\` at the top. Install dependency: \`framer-motion\`.

---

## Concept

A kinetic-typography piece: the word \`RIPPLE\` rendered as large SVG text with an SVG turbulence + displacement-map filter that distorts the letters like rippling liquid. To the left of the word sits a small fan icon with an OFF/ON label below it. Click the fan to toggle. When ON, the displacement intensity ramps up over a second, the noise pattern morphs continuously, the fan blades spin, and the word skews to the right. When OFF, intensity decays faster than it ramped, the blades coast to a stop, and the word settles upright. Pure React + Framer Motion — no Three.js, no canvas, no other libraries.

---

## Constants

\`\`\`ts
const WORD = 'RIPPLE'

const LEVEL_COUNT       = 1
const LEVEL_RAMP        = 1.0     // levels/sec on ramp-up
const LEVEL_DECAY       = 2.5     // levels/sec on decay
const MAX_SCALE         = 36      // peak feDisplacementMap scale
const OSCILLATION_HZ    = 0.09    // breathing freq
const REST_FREQ         = 0.001   // turbulence baseFrequency at rest
const HOVER_FREQ        = 0.009   // turbulence baseFrequency at full intensity
const RIPPLE_PHASE_RATE = 0.9     // rad/sec the noise morphs at full intensity

const FAN_FULL_RATE    = (Math.PI * 2) / 0.6   // ~10.47 rad/s
const FAN_REDUCED_RATE = (Math.PI * 2) / 2.0
\`\`\`

---

## Theme & colors (raw hex)

Dual theme. Listen first for a \`[data-card-theme]\` ancestor; fall back to \`html.dark\`.

- Dark: bg \`#0A0A0A\`, fg \`#EFEEE6\`, fan stroke \`#EFEEE6\`
- Light: bg \`#EFEEE6\`, fg \`#0A0A0A\`, fan stroke \`#0A0A0A\`

Vignette:
- Dark: \`radial-gradient(70% 55% at 50% 50%, rgba(239,238,230,0.06) 0%, rgba(10,10,10,0) 70%)\`
- Light: \`radial-gradient(70% 55% at 50% 50%, rgba(10,10,10,0.05) 0%, rgba(239,238,230,0) 70%)\`

\`useTheme(ref)\`: closest \`[data-card-theme]\` first, else \`html.dark\`. \`MutationObserver\` on every ancestor up to \`<html>\` watching \`['class', 'data-card-theme']\`. Disconnect all on cleanup.

OFF label \`#EF4444\`, ON label \`#22C55E\` (theme-independent).

---

## Layout

- Root: \`relative min-h-screen w-full overflow-hidden\`, \`backgroundColor: bg\`.
- Vignette div: absolute \`inset: 0\`, \`pointerEvents: 'none'\`.
- Content wrapper (absolute \`inset: 0\`): row flex, centered both axes, \`gap: 'clamp(14px, 3vw, 32px)'\`. Fan and text always share one row — never stack to a column.

---

## Fan icon

Wrap in a \`role="button" aria-label="Toggle fan" aria-pressed={fanOn} tabIndex={0}\` div with column flex (icon, gap 4, label), \`flexShrink: 0\`, \`cursor: 'pointer'\`, \`touchAction: 'manipulation'\`. Click and Space/Enter both toggle.

SVG: \`viewBox="0 0 100 100"\`, size \`clamp(56px, 11vw, 112px)\`, \`transform: perspective(220px) rotateY(38deg)\` so the propeller is angled away. Inside:
- Three concentric grille circles: \`r=38\` (stroke 2, opacity 0.85), \`r=30\` (stroke 1, opacity 0.35), \`r=22\` (stroke 1, opacity 0.25), no fill, color = fan stroke.
- Blade group \`<g>\` with \`transformBox: 'view-box'\`, \`transformOrigin: '50px 50px'\`, \`willChange: 'transform'\`. Inside it: three blade paths from \`[0, 120, 240].map\` with \`d="M50 50 C 56 34, 64 28, 70 26 C 66 34, 60 42, 50 50 Z"\`, fill = fan stroke, opacity 0.9, each rotated via \`transform="rotate(angle 50 50)"\`.
- Center hub drawn AFTER blades: \`<circle r="4.5" />\` filled with fan stroke, then \`<circle r="1.6" />\` filled with bg color.

Label: 11 px, fontWeight 700, letterSpacing \`0.18em\`, green when ON / red when OFF, transition \`color 0.4s, opacity 0.4s\`.

---

## Word

\`<svg viewBox="0 0 500 180" preserveAspectRatio="xMidYMid meet">\`, \`width: 'min(55vw, 500px)'\`, \`height: 'auto'\`, \`maxHeight: '70vh'\`, \`overflow: 'visible'\`. The outer \`<svg>\` is what gets the \`skewX(...)\` CSS transform.

\`\`\`tsx
<defs>
  <filter id={filterId} x="-15%" y="-15%" width="130%" height="130%">
    <feTurbulence ref={turbRef} type="fractalNoise" baseFrequency={REST_FREQ} numOctaves={1} seed={4} result="noise" />
    <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="noise" scale={0} xChannelSelector="R" yChannelSelector="G" />
  </filter>
</defs>
<g filter={\\\`url(#\${filterId})\\\`} fill={fg}>
  <text x="250" y="140" textAnchor="middle" style={{ fontFamily: 'ui-sans-serif, system-ui, ...', fontWeight: 900, fontSize: 140, letterSpacing: '-0.04em', userSelect: 'none' }}>RIPPLE</text>
</g>
\`\`\`

\`numOctaves={1}\` is deliberate — a single octave gives smooth liquid distortion; higher counts look noisy. Use \`useId().replace(/:/g, '-')\` for the filter id so \`url(#…)\` is valid.

---

## Animation loop

Refs: \`turbRef\`, \`dispRef\`, \`bladesRef\`, \`textSvgRef\`, \`levelRef\` (0..LEVEL_COUNT), \`fanAngleRef\` (rad), \`ripplePhaseRef\` (rad), \`lastTimeRef\`. \`fanOn\` state + a mirrored \`fanOnRef\` so the RAF reads the current value. \`reducedMotion\` from \`matchMedia('(prefers-reduced-motion: reduce)')\` with a change listener.

\`useAnimationFrame((t) => {...})\`:
1. \`dt = clamp((t - lastTimeRef) / 1000, 0, 0.05)\` (cap at 50 ms so tab-switches don't lurch).
2. Ramp: if ON, \`level += 1.0 * dt\` (clamp ≤ LEVEL_COUNT). If OFF, \`level -= 2.5 * dt\` (clamp ≥ 0).
3. \`intensity = level / LEVEL_COUNT\` (0..1).
4. \`breath = sin(2π * 0.09 * (t/1000))\`.
5. \`peakScale = reducedMotion ? 14 : 36\`. \`scale = intensity * peakScale\`.
6. \`freq = max(0.002, REST_FREQ + (HOVER_FREQ - REST_FREQ) * intensity + 0.004 * breath * intensity)\`.
7. Advance noise phase: \`ripplePhase += intensity * 0.9 * dt\`.
8. \`liveFreqX = max(0.002, freq + 0.007 * sin(ripplePhase) * intensity)\`.
9. \`liveFreqY = max(0.002, 0.028 + 0.012 * sin(ripplePhase * 1.4 + 1) * intensity)\`. Two offset sine waves on X and Y keep the noise morphing without any tile-boundary jump.
10. \`turb.setAttribute('baseFrequency', \\\`\${liveFreqX} \${liveFreqY}\\\`)\`, \`disp.setAttribute('scale', String(scale))\`.
11. Skew: \`skew = reducedMotion ? 0 : intensity * 13\`. \`textSvg.style.transform = \\\`skewX(\${skew}deg)\\\`\`.
12. Blade spin: \`rate = reducedMotion ? FAN_REDUCED_RATE : FAN_FULL_RATE\`; \`fanAngle += rate * intensity * dt\`; wrap > 2π. \`blades.style.transform = \\\`rotate(\${fanAngle * 180 / π}deg)\\\`\`.

All updates are imperative — never write filter attributes, transforms, or per-frame opacities through JSX state.

---

## Reduced motion

\`(prefers-reduced-motion: reduce)\` clamps peak displacement scale to 14 (vs 36), forces skew to 0, and slows blade rate to one rev per 2s. The fan still toggles, the ramp/decay still play.

## Mobile

Always one row — never column-stack. Fan size, gap, and text size all use \`clamp()\`. Text SVG width is \`min(55vw, 500px)\`, so the layout works down to 320 px wide.

## Cleanup

Disconnect every theme MutationObserver on unmount; remove the reduced-motion change listener.

Single file, default export \`RippleType\`.`,

  V0: `Build a single-file React component called \`RippleType\`. \`'use client'\` at top. Install: \`framer-motion\`.

Concept: large SVG word \`RIPPLE\` distorted by an SVG turbulence + displacement-map filter (liquid ripple). A small fan icon sits to its left with an OFF/ON label. Click the fan to toggle. ON → intensity ramps up, noise morphs, blades spin, word skews. OFF → intensity decays faster, blades coast, word settles. No Three.js, no canvas — just SVG filters + Framer Motion.

## Constants
\`\`\`ts
const WORD = 'RIPPLE'
const LEVEL_COUNT       = 1
const LEVEL_RAMP        = 1.0    // levels/sec ramp-up
const LEVEL_DECAY       = 2.5    // levels/sec decay
const MAX_SCALE         = 36     // peak displacement scale
const OSCILLATION_HZ    = 0.09   // breathing freq
const REST_FREQ         = 0.001  // turbulence baseFrequency at rest
const HOVER_FREQ        = 0.009  // turbulence baseFrequency at full intensity
const RIPPLE_PHASE_RATE = 0.9    // rad/sec noise morph rate
const FAN_FULL_RATE    = (Math.PI * 2) / 0.6
const FAN_REDUCED_RATE = (Math.PI * 2) / 2.0
\`\`\`

## Theme (raw hex)
- Dark: bg \`#0A0A0A\`, fg \`#EFEEE6\`, fan stroke \`#EFEEE6\`
- Light: bg \`#EFEEE6\`, fg \`#0A0A0A\`, fan stroke \`#0A0A0A\`
- Vignette dark: \`radial-gradient(70% 55% at 50% 50%, rgba(239,238,230,0.06), rgba(10,10,10,0) 70%)\`
- Vignette light: \`radial-gradient(70% 55% at 50% 50%, rgba(10,10,10,0.05), rgba(239,238,230,0) 70%)\`
- OFF label \`#EF4444\`, ON \`#22C55E\` (theme-independent).

\`useTheme(ref)\`: closest \`[data-card-theme]\` ancestor first, else \`html.dark\`. MutationObserver on every ancestor up to html watching \`['class', 'data-card-theme']\`. Disconnect on unmount.

## Layout
Root: \`relative min-h-screen w-full overflow-hidden\` with \`backgroundColor: bg\`. Absolute vignette div behind. Single absolute \`inset: 0\` flex row, centered both axes, \`gap: 'clamp(14px, 3vw, 32px)'\` — fan and word always share one row, never column-stack.

## Fan
\`role="button"\` div, column flex (icon, gap 4, label), \`flexShrink: 0\`, \`touchAction: 'manipulation'\`. Click + Space/Enter toggle.

SVG \`viewBox="0 0 100 100"\`, \`width: clamp(56px, 11vw, 112px)\`, \`transform: perspective(220px) rotateY(38deg)\`. Inside:
- 3 concentric grille circles \`r=38\` (stroke 2, op 0.85), \`r=30\` (stroke 1, op 0.35), \`r=22\` (stroke 1, op 0.25), color = fan stroke.
- Blade group \`<g>\` with \`transformBox: 'view-box'\`, \`transformOrigin: '50px 50px'\`. Three blades \`[0,120,240].map\` with path \`M50 50 C 56 34, 64 28, 70 26 C 66 34, 60 42, 50 50 Z\`, fill = fan stroke, opacity 0.9, transform \`rotate(angle 50 50)\`.
- Hub drawn LAST: \`<circle r="4.5" />\` filled with fan stroke, then \`<circle r="1.6" />\` filled with bg.

Label: 11px, fontWeight 700, letterSpacing 0.18em, green ON / red OFF, transition \`color 0.4s, opacity 0.4s\`.

## Word
\`<svg viewBox="0 0 500 180" preserveAspectRatio="xMidYMid meet">\`, \`width: min(55vw, 500px)\`, \`height: auto\`, \`maxHeight: 70vh\`, \`overflow: visible\`. The outer \`<svg>\` is what gets the \`skewX(...)\` CSS transform.

Inside \`<defs>\`:
\`\`\`tsx
<filter id={filterId} x="-15%" y="-15%" width="130%" height="130%">
  <feTurbulence ref={turbRef} type="fractalNoise" baseFrequency={REST_FREQ} numOctaves={1} seed={4} result="noise" />
  <feDisplacementMap ref={dispRef} in="SourceGraphic" in2="noise" scale={0} xChannelSelector="R" yChannelSelector="G" />
</filter>
\`\`\`
Then \`<g filter="url(#filterId)" fill={fg}><text x="250" y="140" textAnchor="middle">RIPPLE</text></g>\`. Text: system sans, fontWeight 900, fontSize 140, letterSpacing -0.04em, userSelect none.

\`numOctaves={1}\` is intentional — single octave = smooth liquid; higher = noisy. \`filterId = useId().replace(/:/g,'-')\` for valid \`url(#…)\`.

## Animation loop
Refs: turb, disp, blades, textSvg; levelRef (0..1), fanAngleRef, ripplePhaseRef, lastTimeRef. \`fanOn\` state + mirrored \`fanOnRef\`. \`reducedMotion\` via matchMedia.

\`useAnimationFrame((t) => ...)\`:
1. \`dt = clamp((t - lastTime)/1000, 0, 0.05)\`.
2. ON: \`level += 1.0 * dt\` (≤1). OFF: \`level -= 2.5 * dt\` (≥0). \`intensity = level\`.
3. \`breath = sin(2π * 0.09 * t/1000)\`.
4. \`peakScale = reducedMotion ? 14 : 36\`; \`scale = intensity * peakScale\`.
5. \`freq = max(0.002, 0.001 + 0.008*intensity + 0.004*breath*intensity)\`.
6. \`ripplePhase += intensity * 0.9 * dt\`.
7. \`liveFreqX = max(0.002, freq + 0.007*sin(ripplePhase)*intensity)\`.
8. \`liveFreqY = max(0.002, 0.028 + 0.012*sin(ripplePhase*1.4 + 1)*intensity)\`. Two offset sine waves keep the noise morphing without any tile-boundary jump.
9. Imperative: \`turb.setAttribute('baseFrequency', \\\`\${liveFreqX} \${liveFreqY}\\\`)\`, \`disp.setAttribute('scale', String(scale))\`.
10. Skew: \`skew = reducedMotion ? 0 : intensity * 13\`. \`textSvg.style.transform = skewX(\${skew}deg)\`.
11. Blades: \`rate = reducedMotion ? FAN_REDUCED_RATE : FAN_FULL_RATE\`; \`fanAngle += rate * intensity * dt\`; wrap >2π. \`blades.style.transform = rotate(\${fanAngle*180/π}deg)\`.

All per-frame updates are imperative — never JSX state.

## Reduced motion
Peak scale clamps to 14 (vs 36), skew forced to 0, blade rate one rev per 2s. Fan still toggles; ramp/decay still play.

## Mobile
Always one row, never column-stack. \`clamp()\` for fan size, gap, text size. Text SVG width \`min(55vw, 500px)\` works down to 320px.

## Cleanup
Disconnect all theme MutationObservers + remove reduced-motion change listener on unmount.

Single file, default export \`RippleType\`.`,
}
