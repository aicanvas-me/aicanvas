import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Root element: className="relative min-h-screen w-full overflow-hidden"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named \`SphereLines\`.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A canvas-rendered wireframe sphere of latitude rings. A narrow traveling wave band auto-sweeps across the globe; the cursor creates a local gaussian distortion; the whole sphere rotates. Each ring is drawn twice: dim full 360° arc on the back, bright front-hemisphere arc using sin(θ+rot) visibility. No overlay text.

## Constants
- N_LATS = 42, N_STEPS = 240
- WAVE_PHI = 0.28 (radial amplitude of the traveling band)
- WAVE_FREQ_T = 2.0, WAVE_FREQ_P = 1.8
- WAVE_SPEED_IDLE = 0.003, WAVE_SPEED_HOVER = 0.012
- ROT_SPEED_IDLE = 0.003, ROT_SPEED_HOVER = 0.012
- BACK_A = 0.05 (dim back arc alpha)
- ALPHA_MIN = 0.12, ALPHA_MAX = 0.40 (front line alpha at pole vs equator)
- LW_MIN = 0.35, LW_MAX = 0.90
- BAND_SIGMA = 0.35 (radians, gaussian width of traveling band)
- BAND_FREQ = 2.5
- HOVER_RADIUS = 90 px, HOVER_AMP = 0.45
- TWO_PI = Math.PI*2

## Canvas setup
R = min(cw,ch)*0.42; cx=cw/2; cy=ch/2. DPR scaffolding standard. Circular clip: save, arc(cx,cy,R,0,2π), clip.

## Per frame
- hasHover = mouseRef != null
- hoverStr += ((hasHover?1:0) - hoverStr) * (hasHover?0.025:0.015)
- t += WAVE_SPEED_IDLE + hoverStr*(WAVE_SPEED_HOVER - WAVE_SPEED_IDLE)
- rot += ROT_SPEED_IDLE + hoverStr*(ROT_SPEED_HOVER - ROT_SPEED_IDLE)
- bandCenter = sin(t*BAND_FREQ) * (PI*0.4)
- dotRGB = dark ? '255,255,255' : '28,25,22'

Allocate xs,ys (Float32Array N_STEPS+1) ONCE outside the loop, reuse.

For i=0..N_LATS-1:
- phi = -π/2 + (i+1)*π/(N_LATS+1)
- depth = cos(phi); lineA = ALPHA_MIN + depth*(ALPHA_MAX-ALPHA_MIN); lw = LW_MIN + depth*(LW_MAX-LW_MIN)
- dist = phi - bandCenter; autoEnv = exp(-(dist²)/(2*BAND_SIGMA²)); autoAmp = WAVE_PHI*autoEnv

For j=0..N_STEPS:
- theta = j*2π/N_STEPS; tR = theta + rot
- autoDPhi = autoAmp * (sin(tR*WAVE_FREQ_T + phi*WAVE_FREQ_P + t) + 0.45*sin(tR*WAVE_FREQ_T*1.7 + phi*WAVE_FREQ_P*1.3 + t*1.4))
- localDPhi: if mouse && hoverStr>0.01: project undisplaced point sx=cx+R*cos(phi)*cos(tR), sy=cy-R*sin(phi); dx=sx-mouse.x; dy=sy-mouse.y; localEnv = exp(-(dx²+dy²)/HOVER_RADIUS²); localDPhi = HOVER_AMP*localEnv*hoverStr*sin(tR*3 + phi*2 + t*6). Else 0.
- phiD = phi + autoDPhi + localDPhi
- xs[j] = cx + R*cos(phiD)*cos(tR); ys[j] = cy - R*sin(phiD)

Back pass (full 360°): strokeStyle rgba(dotRGB,BACK_A); lineWidth 0.4. Walk j with midpoint quadraticCurveTo smoothing starting from midpoint of (N_STEPS-1, 0). closePath; stroke.

Front pass: use Math.sin(j*TWO_PI/N_STEPS + rot) >= 0 as front test. Find first back point startJ (sin<0). strokeStyle rgba(dotRGB,lineA); lineWidth lw. Walk jj=0..N_STEPS, j = (startJ+jj)%N_STEPS. On entering front: moveTo(x,y), inFront=true. Continuing: quadraticCurveTo(prevX,prevY, (prevX+x)/2, (prevY+y)/2). On leaving: lineTo(prevX,prevY), inFront=false. Tail lineTo if still inFront. Stroke.

Restore clip. Schedule next frame.

## Theme
isDark state + isDarkRef + observer (same pattern).

## JSX
div ref containerRef relative h-full w-full overflow-hidden, bg dark '#110F0C' / light '#F5F1EA'. Mouse/touch handlers on the div. Canvas absolute inset-0 100%/100%. No overlay.

Cleanup: alive=false; cancelAnimationFrame; ResizeObserver on canvas.parentElement; observer.disconnect.

## Typography
- Font: project default sans-serif`,

  'Lovable': `Create a React client component named \`SphereLines\`.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A canvas-rendered wireframe sphere of latitude rings. A narrow traveling wave band auto-sweeps across the globe; the cursor creates a local gaussian distortion; the whole sphere rotates. Each ring is drawn twice: dim full 360° arc on the back, bright front-hemisphere arc using sin(θ+rot) visibility. No overlay text.

## Constants
- N_LATS = 42, N_STEPS = 240
- WAVE_PHI = 0.28 (radial amplitude of the traveling band)
- WAVE_FREQ_T = 2.0, WAVE_FREQ_P = 1.8
- WAVE_SPEED_IDLE = 0.003, WAVE_SPEED_HOVER = 0.012
- ROT_SPEED_IDLE = 0.003, ROT_SPEED_HOVER = 0.012
- BACK_A = 0.05 (dim back arc alpha)
- ALPHA_MIN = 0.12, ALPHA_MAX = 0.40 (front line alpha at pole vs equator)
- LW_MIN = 0.35, LW_MAX = 0.90
- BAND_SIGMA = 0.35 (radians — gaussian width of traveling band)
- BAND_FREQ = 2.5
- HOVER_RADIUS = 90 px, HOVER_AMP = 0.45
- TWO_PI = Math.PI*2

## Canvas setup
R = min(cw,ch)*0.42; cx=cw/2; cy=ch/2. DPR scaffolding standard. Circular clip: save, arc(cx,cy,R,0,2π), clip.

## Per frame
- hasHover = mouseRef != null
- hoverStr += ((hasHover?1:0) - hoverStr) * (hasHover?0.025:0.015)
- t += WAVE_SPEED_IDLE + hoverStr*(WAVE_SPEED_HOVER - WAVE_SPEED_IDLE)
- rot += ROT_SPEED_IDLE + hoverStr*(ROT_SPEED_HOVER - ROT_SPEED_IDLE)
- bandCenter = sin(t*BAND_FREQ) * (PI*0.4)
- dotRGB = dark ? '255,255,255' : '28,25,22'

Allocate xs,ys (Float32Array N_STEPS+1) ONCE outside the loop, reuse.

For i=0..N_LATS-1:
- phi = -π/2 + (i+1)*π/(N_LATS+1)
- depth = cos(phi); lineA = ALPHA_MIN + depth*(ALPHA_MAX-ALPHA_MIN); lw = LW_MIN + depth*(LW_MAX-LW_MIN)
- dist = phi - bandCenter; autoEnv = exp(-(dist²)/(2*BAND_SIGMA²)); autoAmp = WAVE_PHI*autoEnv

For j=0..N_STEPS:
- theta = j*2π/N_STEPS; tR = theta + rot
- autoDPhi = autoAmp * (sin(tR*WAVE_FREQ_T + phi*WAVE_FREQ_P + t) + 0.45*sin(tR*WAVE_FREQ_T*1.7 + phi*WAVE_FREQ_P*1.3 + t*1.4))
- localDPhi: if mouse && hoverStr>0.01: project undisplaced point sx=cx+R*cos(phi)*cos(tR), sy=cy-R*sin(phi); dx=sx-mouse.x; dy=sy-mouse.y; localEnv = exp(-(dx²+dy²)/HOVER_RADIUS²); localDPhi = HOVER_AMP*localEnv*hoverStr*sin(tR*3 + phi*2 + t*6). Else 0.
- phiD = phi + autoDPhi + localDPhi
- xs[j] = cx + R*cos(phiD)*cos(tR); ys[j] = cy - R*sin(phiD)

Back pass (full 360°): strokeStyle rgba(dotRGB,BACK_A); lineWidth 0.4. Walk j with midpoint quadraticCurveTo smoothing starting from midpoint of (N_STEPS-1, 0). closePath; stroke.

Front pass: use Math.sin(j*TWO_PI/N_STEPS + rot) >= 0 as front test. Find first back point startJ (sin<0). strokeStyle rgba(dotRGB,lineA); lineWidth lw. Walk jj=0..N_STEPS, j = (startJ+jj)%N_STEPS. On entering front: moveTo(x,y), inFront=true. Continuing: quadraticCurveTo(prevX,prevY, (prevX+x)/2, (prevY+y)/2). On leaving: lineTo(prevX,prevY), inFront=false. Tail lineTo if still inFront. Stroke.

Restore clip. Schedule next frame.

## Theme
isDark state + isDarkRef + observer (same pattern).

## JSX
div ref containerRef relative h-full w-full overflow-hidden, bg dark '#110F0C' / light '#F5F1EA'. Mouse/touch handlers on the div. Canvas absolute inset-0 100%/100%. No overlay.

Cleanup: alive=false; cancelAnimationFrame; ResizeObserver on canvas.parentElement; observer.disconnect.

## Typography
- Font: project default sans-serif`,

  'V0': `Create a React client component named \`SphereLines\`.

Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

A canvas-rendered wireframe sphere of latitude rings. A narrow traveling wave band auto-sweeps across the globe; the cursor creates a local gaussian distortion; the whole sphere rotates. Each ring is drawn twice: dim full 360° arc on the back, bright front-hemisphere arc using sin(θ+rot) visibility. No overlay text.

## Constants
- N_LATS = 42, N_STEPS = 240
- WAVE_PHI = 0.28 (radial amplitude of the traveling band)
- WAVE_FREQ_T = 2.0, WAVE_FREQ_P = 1.8
- WAVE_SPEED_IDLE = 0.003, WAVE_SPEED_HOVER = 0.012
- ROT_SPEED_IDLE = 0.003, ROT_SPEED_HOVER = 0.012
- BACK_A = 0.05 (dim back arc alpha)
- ALPHA_MIN = 0.12, ALPHA_MAX = 0.40 (front line alpha at pole vs equator)
- LW_MIN = 0.35, LW_MAX = 0.90
- BAND_SIGMA = 0.35 (radians — gaussian width of traveling band)
- BAND_FREQ = 2.5
- HOVER_RADIUS = 90 px, HOVER_AMP = 0.45
- TWO_PI = Math.PI*2

## Canvas setup
R = min(cw,ch)*0.42; cx=cw/2; cy=ch/2. DPR scaffolding standard. Circular clip: save, arc(cx,cy,R,0,2π), clip.

## Per frame
- hasHover = mouseRef != null
- hoverStr += ((hasHover?1:0) - hoverStr) * (hasHover?0.025:0.015)
- t += WAVE_SPEED_IDLE + hoverStr*(WAVE_SPEED_HOVER - WAVE_SPEED_IDLE)
- rot += ROT_SPEED_IDLE + hoverStr*(ROT_SPEED_HOVER - ROT_SPEED_IDLE)
- bandCenter = sin(t*BAND_FREQ) * (PI*0.4)
- dotRGB = dark ? '255,255,255' : '28,25,22'

Allocate xs,ys (Float32Array N_STEPS+1) ONCE outside the loop, reuse.

For i=0..N_LATS-1:
- phi = -π/2 + (i+1)*π/(N_LATS+1)
- depth = cos(phi); lineA = ALPHA_MIN + depth*(ALPHA_MAX-ALPHA_MIN); lw = LW_MIN + depth*(LW_MAX-LW_MIN)
- dist = phi - bandCenter; autoEnv = exp(-(dist²)/(2*BAND_SIGMA²)); autoAmp = WAVE_PHI*autoEnv

For j=0..N_STEPS:
- theta = j*2π/N_STEPS; tR = theta + rot
- autoDPhi = autoAmp * (sin(tR*WAVE_FREQ_T + phi*WAVE_FREQ_P + t) + 0.45*sin(tR*WAVE_FREQ_T*1.7 + phi*WAVE_FREQ_P*1.3 + t*1.4))
- localDPhi: if mouse && hoverStr>0.01: project undisplaced point sx=cx+R*cos(phi)*cos(tR), sy=cy-R*sin(phi); dx=sx-mouse.x; dy=sy-mouse.y; localEnv = exp(-(dx²+dy²)/HOVER_RADIUS²); localDPhi = HOVER_AMP*localEnv*hoverStr*sin(tR*3 + phi*2 + t*6). Else 0.
- phiD = phi + autoDPhi + localDPhi
- xs[j] = cx + R*cos(phiD)*cos(tR); ys[j] = cy - R*sin(phiD)

Back pass (full 360°): strokeStyle rgba(dotRGB,BACK_A); lineWidth 0.4. Walk j with midpoint quadraticCurveTo smoothing starting from midpoint of (N_STEPS-1, 0). closePath; stroke.

Front pass: use Math.sin(j*TWO_PI/N_STEPS + rot) >= 0 as front test. Find first back point startJ (sin<0). strokeStyle rgba(dotRGB,lineA); lineWidth lw. Walk jj=0..N_STEPS, j = (startJ+jj)%N_STEPS. On entering front: moveTo(x,y), inFront=true. Continuing: quadraticCurveTo(prevX,prevY, (prevX+x)/2, (prevY+y)/2). On leaving: lineTo(prevX,prevY), inFront=false. Tail lineTo if still inFront. Stroke.

Restore clip. Schedule next frame.

## Theme
isDark state + isDarkRef + observer (same pattern).

## JSX
div ref containerRef relative h-full w-full overflow-hidden, bg dark '#110F0C' / light '#F5F1EA'. Mouse/touch handlers on the div. Canvas absolute inset-0 100%/100%. No overlay.

Cleanup: alive=false; cancelAnimationFrame; ResizeObserver on canvas.parentElement; observer.disconnect.

## Typography
- Font: project default sans-serif`,
}
