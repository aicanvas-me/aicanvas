import type { Platform } from '../../app/components/ComponentCard'

const SPEC = `Create a new file called CuriousAi.tsx. It exports a React client component that renders a morphing 3D AI orb in Three.js with two glowing magenta robot-eye pills that track the cursor and blink.

Requirements
- 'use client' at the top
- Imports: useEffect, useRef, useState from 'react'; motion, useMotionValue, useSpring from 'framer-motion'; * as THREE from 'three'
- Single default export, root element fills viewport: className="relative flex min-h-screen w-full items-center justify-center" with style={{ backgroundColor }} set per theme (dark: '#0A0A09', light: '#E8E8DF')
- Inside the root, an aspect-square stage box: className="relative aspect-square h-full max-h-[min(42vh,42vw)] w-full max-w-[min(42vh,42vw)] cursor-pointer select-none touch-none"
- An absolutely-positioned canvas-host div fills the stage. The stage also holds an absolutely-centred motion.div containing the two eye pills.

Inline theme reader (no external imports)
- A useScopedTheme(ref) hook that returns 'dark' | 'light'.
- Reads the closest [data-card-theme] ancestor first; falls back to document.documentElement.classList.contains('dark').
- Uses MutationObserver to watch class/data-card-theme changes on the element, every ancestor, and document.documentElement.

Three.js scene (in useEffect with cleanup)
- PerspectiveCamera(38, W/H, 0.1, 100), z = 4.4
- WebGLRenderer({ antialias: true, alpha: true }), setClearColor(0x000000, 0), DPR clamped to 2
- IcosahedronGeometry(1, W < 400 ? 32 : 64)
- ResizeObserver on the canvas host to keep renderer + camera in sync
- Respect prefers-reduced-motion: set a uReduce uniform to 0 to freeze time
- Animation loop using THREE.Clock; rotation.y += dt * 0.04, rotation.x += dt * 0.015
- Cleanup: cancelAnimationFrame, dispose geometry/material/renderer, remove canvas

ShaderMaterial: uniforms
- uTime: 0
- uActive: 0 (0..1, smoothly lerped toward "alert")
- uLook: Vector2(0, 0), current look direction (-1..1)
- uReduce: 1 (0 freezes motion)
- uBase: dark teal Color (0.050, 0.075, 0.085) in dark mode; (0.075, 0.105, 0.120) in light
- uRimA: cyan Color (0.380, 0.860, 0.940)
- uRimB: magenta Color (0.730, 0.330, 0.940)
- uSpeckA: electric pink Color (0.880, 0.275, 0.985)
- uSpeckB: electric cyan Color (0.400, 0.910, 1.000)

Vertex shader (GLSL)
- Pass varyings: vNormal, vViewDir, vLocalPos, vViewPos.
- Save vLocalPos = position (untouched original).
- Slow anisotropic stretch: pos *= vec3(1 + sin(t*0.27)*0.16, 1 + sin(t*0.19 + 1.7)*0.20, 1 + sin(t*0.23 + 3.1)*0.12).
- Two octaves of 3D simplex noise (use the Ashima/Stefan Gustavson MIT snoise(vec3) implementation):
  nLow = snoise(pos * 0.55 + vec3(t*0.18, t*0.13, -t*0.15))
  nMid = snoise(pos * 1.45 + vec3(-t*0.22, t*0.20, t*0.18))
- Look-direction bulge: lookDir = vec3(uLook, 0.55); facing = clamp(dot(normalize(pos), normalize(lookDir)), 0, 1); bulge = pow(facing, 2.5) * (0.08 + uActive*0.10).
- Breath: sin(t*0.55) * 0.022.
- displacement = (nLow*0.66 + nMid*0.34) * mix(0.20, 0.34, uActive) + bulge + breath; pos += normal * displacement.
- vViewPos = (modelViewMatrix * vec4(pos, 1)).xyz; vNormal = normalize(normalMatrix * normal); vViewDir = normalize(-mv.xyz).

Fragment shader (GLSL): includes the SAME snoise(vec3) function for speckle sampling.
- Derive true surface normal from view-position derivatives:
  vec3 n = normalize(cross(dFdx(vViewPos), dFdy(vViewPos)));
  vec3 v = normalize(-vViewPos);
  float fres = 1 - clamp(dot(n, v), 0, 1);
- Diffuse key + fill light:
  keyDir = normalize(vec3(-0.45, 0.70, 0.85));
  fillDir = normalize(vec3(0.65, -0.35, 0.55));
  lit = uBase * (0.30 + max(0, dot(n, keyDir)) * 0.95 + max(0, dot(n, fillDir)) * 0.45)
- Two-tone rim lights:
  dirCyan = normalize(vec3(-0.70, 0.55, 0.50)), dirMagenta = normalize(vec3(0.75, -0.30, 0.50))
  rimCyan = pow(max(0, dot(n, dirCyan)), 1.3) * pow(fres, mix(2.2, 1.7, uActive))
  rimMagenta = pow(max(0, dot(n, dirMagenta)), 1.3) * pow(fres, mix(2.2, 1.7, uActive))
- Specular highlight: halfKey = normalize(keyDir + v); specKey = pow(max(0, dot(n, halfKey)), 32.0) * 0.55
- Combine: col = lit + uRimA*rimCyan*mix(1.10, 1.55, uActive) + uRimB*rimMagenta*mix(1.00, 1.45, uActive) + specKey*vec3(0.80, 0.95, 1.00)
- Iridescent speckles (stuck to local surface):
  speckBig = snoise(vLocalPos * 10.0); speckSmall = snoise(vLocalPos * 24.0 + 1.7)
  maskBig = smoothstep(0.66, 0.74, speckBig); maskSmall = smoothstep(0.72, 0.78, speckSmall) * 0.40
  speckMask = max(maskBig, maskSmall)
  colorPick = snoise(vLocalPos * 4.0 + 5.3); speckColor = mix(uSpeckA, uSpeckB, smoothstep(0.55, 0.75, colorPick))
  speckBody = 1 - smoothstep(0.55, 0.95, fres)
  col += speckColor * speckMask * speckBody * 0.85
- gl_FragColor = vec4(col, 1.0)

Pointer / activity handling: events on the OUTER container (not the stage), so eyes drift toward the cursor anywhere on the page
- Compute cursor coords relative to the stage centre:
  rect = stageRef.getBoundingClientRect(); centerX, centerY at rect centre; radius = rect.width / 2.
  nx = clamp((clientX - centerX) / radius, -1, 1); ny = clamp((clientY - centerY) / radius, -1, 1).
- onOrb = sqrt(nx^2 + ny^2) < 0.62
- Maintain refs: lookTargetRef ({x,y}), lookCurrentRef ({x,y}), hoverActiveRef (bool), activeRef + targetRef (number).
- On orb: targetRef = 1, lookTarget = (nx, ny), open = 0.32.
- In container, off orb: targetRef = 0.35, lookTarget = (nx*0.40, ny*0.40), open = 0.70.
- Pointer leave: hoverActive = false, targetRef = 0, open = 0.85, trigger a blink.
- Pointer enter or down: trigger a blink, then call update().
- pointerup uses a 500 ms grace period before treating as leave (handles taps).
- Bind pointermove / pointerenter / pointerleave / pointerdown / pointerup / pointercancel.

Idle look-around script: runs unless hoverActive is true
- Sequence: { x:-0.65, y:0, dur:2400 } → { x:0.32, y:0, dur:2800 } → { x:-0.24, y:0, dur:2200 } → { x:0, y:-0.55, dur:2800 } → { x:0, y:0, dur:2600 } → repeat.
- Each step calls setTimeout(step, dur). If !hoverActive, lookTargetRef = current step's (x,y).
- Clean up the timeout on unmount.

RAF loop drives everything from lookCurrentRef
- Smoothing rate: 7 when hoverActive, 2.2 when idle (snappier under cursor).
- Exponential smoothing: k = 1 - exp(-dt * speed); lc += (lt - lc) * k.
- Set uLook = (lc.x, -lc.y).
- Orb lean: lean = 0.12 + activeRef * 0.06; mesh.position.x → lc.x * lean (smoothed); mesh.position.y → -lc.y * lean.
- Eye offset: range = canvasWidth * 0.18; eyeX.set(lc.x * range); eyeY.set(lc.y * range).
- The eye motion must out-pace the orb lean so eyes carry the personality.

Eyes: two vertical pink pills
- A motion.div wrapper sits centred in the stage with width 11% and height 15% of the stage, translated by useSpring versions of eyeX/eyeY ({ stiffness: 200, damping: 22, mass: 0.4 }).
- Layout: flex justify-between, two child Eye components.
- Each Eye is a motion.div with width 32% (of wrapper), height 100%, borderRadius 9999, background = eye colour (rgba(255, 140, 245, 0.85) in dark, rgba(255, 150, 248, 0.88) in light).
- boxShadow: three-layer halo for LED look:
  '0 0 4px 0 \${eyeColor}, 0 0 14px 1px \${eyeGlow}, 0 0 28px 4px \${eyeGlow}'
  eyeGlow: rgba(225, 90, 230, 0.70) dark / rgba(225, 100, 230, 0.75) light.
- animate={{ scaleY: open }} with spring { stiffness: 240, damping: 22, mass: 0.4 }.
- A nested motion.div with key={blinkKey} re-runs a blink keyframe [1, 0.05, 1] over 180 ms whenever the parent bumps blinkKey.

Idle blink scheduler
- setTimeout chain with wait = 3800 + Math.random() * 3200; on fire, bump blinkKey state then schedule next.
- Skip entirely if prefers-reduced-motion is set.
- Clean up the timeout on unmount.

Mobile
- Detail level on the geometry drops to 32 below 400 px width.
- Touch interactions: pointerdown awakens, pointerup uses a 500 ms grace period; pointercancel = leave.
- The component must keep 60 fps on a phone.

Theme
- Light vs dark only changes the page background and the orb's base + eye palette (per the values above). The orb is intrinsically dark/luminous in both modes.

Output a single self-contained file.`

const CC_PREAMBLE = `Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

`

const V0_PROMPT = `Build a CuriousAi React component in Three.js. Render a morphing 3D orb on a dark teal body (#0D131A-ish) with cyan-from-upper-left and magenta-from-lower-right rim lights, iridescent pink/cyan speckles stuck to the surface, and two glowing magenta-pink vertical robot-eye pills that track the cursor and blink. Use IcosahedronGeometry(1, 64) and a custom ShaderMaterial. In the vertex shader, apply a slow anisotropic stretch (sin-driven X/Y/Z scaling), then two octaves of 3D simplex noise displacement (frequencies 0.55 and 1.45, weights 0.66 + 0.34), plus a small breath pulse and a look-direction bulge. Pass view-space position to the fragment shader; there, compute the true surface normal from dFdx/dFdy of that varying so wrinkles actually shade in 3D. Add a key + fill diffuse pair (key from upper-left-front, fill from lower-right) multiplying the base colour, then directional fresnel rim lights for cyan and magenta, then a Blinn-half specular off the key for glossy ridge highlights. Sample two octaves of simplex on local position for procedural speckles, with thresholds 0.66/0.74 and 0.72/0.78 so they're sparse and concentrated on the body, faded near the silhouette. The eyes are two narrow vertical pink pills (3.5% × 15% of stage, hot pink rgba(255, 140, 245, 0.85)) inside a wrapper motion.div translated by springs that follow the cursor at ~18% of stage width; three-layer box-shadow halo for an LED look; scaleY animates open level (0.85 idle off-page, 0.70 in container off-orb, 0.32 on-orb) plus periodic blinks (180 ms keyframe). Pointer events go on the OUTER min-h-screen container so the eyes still drift slightly when the cursor is anywhere on the page, with onOrb detection based on distance from the stage centre (< 0.62 of half-radius). When idle, an autonomous look-around script cycles left, slightly right, slightly left, top, back. Respect prefers-reduced-motion. 'use client', TypeScript, no design tokens. Single self-contained file.`

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': CC_PREAMBLE + SPEC,
  Lovable: SPEC,
  V0: V0_PROMPT,
}
