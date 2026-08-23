import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Build a standalone React component called RadialCards.

Stack: React + TypeScript + Framer Motion + @phosphor-icons/react. Single file, 'use client', default export, min-h-screen wrapper.
// npm install framer-motion @phosphor-icons/react

--- LAYOUT ---
7 health-metric cards arranged as a rotating flower. All cards share a single anchor at the canvas centre. Each card pivots from its bottom-left corner (transform-origin: 0% 100%), extends upward from the anchor, and is rotated by its hand-tuned slot angle so the bouquet fans out organically.

SLOT_ANGLES (degrees): [-35.55, 22.14, 71.01, 122.25, 161.58, -150.4, -108.41]

Stage size: clamp(300px, 50vw, 560px), centred in a min-h-screen container.
Card dimensions: 240 × 138 px.

--- IDLE ANIMATION ---
A single shared useMotionValue<number> (degrees) advances in useAnimationFrame at 360/45 deg/s (one revolution per 45 s), mod-clamped to [0,360). Each card's pivot div receives a rotate(\${slotAngle + idleRotation}deg) transform via a useMotionValueEvent listener (FOLLOW mode, no spring lag).

--- CARD VISUAL ---
Each card is a two-layer structure:
  Outer shell: linear-gradient top→bottom from PASTEL to GRADIENT_END, border-radius 24px, no border. Box shadow: -8px 16px 32px rgba(0,0,0,0.12), -3px 6px 14px rgba(0,0,0,0.18).
  Padding: 12px 4px 4px 4px. Gap: 10px. Font: Manrope.

  Header row: Phosphor icon (14px, weight="regular", color=DARK) + title text (12px, weight 500, #1a1a1a). 8px gap, 6px left padding.

  Inner panel: background #f7f7f5, border-radius 20px, padding 12px, inner shadow 0px 1px 12px rgba(0,0,0,0.25). Two rows:
    Top: pill (right-aligned), background DARK, white text 10px semibold, padding 5px 10px, border-radius 999px.
    Bottom: left side has LABEL (10px, 600, #1a1a1a, letter-spacing 0.48px) above VALUE (23px, 600, color=DARK, letter-spacing -0.28px). Right side has a 54×36 sparkline SVG.

Sparkline: 4-point Catmull-Rom cubic bezier curve (smooth, no kinks). Area fill with linearGradient (DARK at 12% opacity top → 0% bottom). Stroke: DARK, 1.5px, round caps/joins. No end dot.

--- 7 METRICS ---
| # | Title     | Label      | Value  | Delta    | PASTEL  | GRADIENT_END | DARK    | Icon       | Sparkline (y, 0=top, 36=bottom) |
|---|-----------|------------|--------|----------|---------|--------------|---------|------------|---------------------------------|
| 0 | Steps     | TODAY      | 20.5K  | +5K      | #EAF6AE | #ACC13C      | #5C662A | Footprints | [28, 18, 10, 6]                 |
| 1 | Calories  | BURNED     | 1,820  | +120     | #F9C8A7 | #D4783A      | #853C0B | Fire       | [30, 8, 20, 6]                  |
| 2 | Sleep     | LAST NIGHT | 7h 42m | +18m     | #C1C2FA | #7B7DF0      | #363885 | Moon       | [22, 30, 14, 18]                |
| 3 | Water     | TODAY      | 2.1 L  | +0.4 L   | #96D9F7 | #4BB8F0      | #085B80 | Drop       | [26, 14, 20, 4]                 |
| 4 | Heart     | RESTING    | 72 BPM | −4       | #FBB1BE | #F07090      | #862334 | Heart      | [8, 22, 16, 28]                 |
| 5 | Active    | THIS WEEK  | 48 min | +12 min  | #9BE6DD | #48C7B8      | #0B655B | Lightning  | [32, 20, 10, 4]                 |
| 6 | Distance  | THIS WEEK  | 8.4 km | +1.2 km  | #FAD79C | #E8B040      | #875706 | Path       | [24, 12, 20, 6]                 |

--- CLICK INTERACTION ---
engagedIndex: number | null, a single useState in parent.
topIndex: number | null, tracks the last-clicked card for persistent z-order.

Click a card: it glides to the canvas centre, lifts forward (translateZ 120px), scales to 1.18×. Click again or tap outside to release.

Per-card springs:
  centeringFactor (0→1): LIFT_SPRING {stiffness:140, damping:28, mass:1}
  lift (0→120): LIFT_SPRING
  scale (1→1.18): LIFT_SPRING

Card body transform: translate(\${-50*cf}%, calc(-50% - (50%)*(1-cf))). This interpolates from bottom-left slot to centred on anchor as centeringFactor goes 0→1.

--- ROTATION: SHORTEST PATH ---
Each card tracks a per-card cardRotation MotionValue with two modes:
  FOLLOW mode (non-engaged): cardRotation = SLOT_ANGLES[i] + idleRotation, updated by useMotionValueEvent listener.
  SPRING mode (engagement transitions): for engaging → spring cardRotation to 0 via animate() with LIFT_SPRING. For releasing → instantly set cardRotation = SLOT_ANGLES[i] + idleRotation (invisible while card is centred on pivot), immediately re-enable FOLLOW mode.
  Use shortestEquivalent(current, target) to clamp spring arc to ≤180°.

--- Z-INDEX ---
  useTransform(lift, z => z > 4 ? 50 : engaged ? 40 : isTop ? 30 : 1)
  Nudge lift.set(lift.get()) on engaged/isTop change to force recompute.

--- DUAL THEME ---
  import useTheme from ThemeProvider.
  Dark bg: #1A1A19. Light bg: #F0F0E8.
  Card visuals (gradients, panel) are self-contained, so no theme switching is needed inside cards.

--- REDUCED MOTION ---
  prefers-reduced-motion: freeze idle rotation at start angle, lift Z → 30px, scale → 1.06, dim siblings 70%.`,

  Lovable: `Build a standalone React component called RadialCards.

Stack: React + TypeScript + Framer Motion + @phosphor-icons/react. Single file, 'use client', default export, min-h-screen wrapper.

--- LAYOUT ---
7 health-metric cards arranged as a rotating flower. All cards share a single anchor at the canvas centre. Each card pivots from its bottom-left corner (transform-origin: 0% 100%), extends upward from the anchor, and is rotated by its hand-tuned slot angle so the bouquet fans out organically.

SLOT_ANGLES (degrees): [-35.55, 22.14, 71.01, 122.25, 161.58, -150.4, -108.41]

Stage size: clamp(300px, 50vw, 560px), centred in a min-h-screen container.
Card dimensions: 240 × 138 px.

--- IDLE ANIMATION ---
A single shared useMotionValue<number> (degrees) advances in useAnimationFrame at 360/45 deg/s (one revolution per 45 s), mod-clamped to [0,360). Each card's pivot div receives a rotate(\${slotAngle + idleRotation}deg) transform via a useMotionValueEvent listener (FOLLOW mode — no spring lag).

--- CARD VISUAL ---
Each card is a two-layer structure:
  Outer shell: linear-gradient top→bottom from PASTEL to GRADIENT_END, border-radius 24px, no border. Box shadow: -8px 16px 32px rgba(0,0,0,0.12), -3px 6px 14px rgba(0,0,0,0.18).
  Padding: 12px 4px 4px 4px. Gap: 10px. Font: Manrope.

  Header row: Phosphor icon (14px, weight="regular", color=DARK) + title text (12px, weight 500, #1a1a1a). 8px gap, 6px left padding.

  Inner panel: background #f7f7f5, border-radius 20px, padding 12px, inner shadow 0px 1px 12px rgba(0,0,0,0.25). Two rows:
    Top: pill (right-aligned) — background DARK, white text 10px semibold, padding 5px 10px, border-radius 999px.
    Bottom: left side has LABEL (10px, 600, #1a1a1a, letter-spacing 0.48px) above VALUE (23px, 600, color=DARK, letter-spacing -0.28px). Right side has a 54×36 sparkline SVG.

Sparkline: 4-point Catmull-Rom cubic bezier curve (smooth). Area fill with linearGradient (DARK at 12% opacity top → 0% bottom). Stroke: DARK, 1.5px, round caps/joins. No end dot.

--- 7 METRICS ---
| # | Title     | Label      | Value  | Delta    | PASTEL  | GRADIENT_END | DARK    | Icon       | Sparkline y-values |
|---|-----------|------------|--------|----------|---------|--------------|---------|------------|--------------------|
| 0 | Steps     | TODAY      | 20.5K  | +5K      | #EAF6AE | #ACC13C      | #5C662A | Footprints | [28, 18, 10, 6]    |
| 1 | Calories  | BURNED     | 1,820  | +120     | #F9C8A7 | #D4783A      | #853C0B | Fire       | [30, 8, 20, 6]     |
| 2 | Sleep     | LAST NIGHT | 7h 42m | +18m     | #C1C2FA | #7B7DF0      | #363885 | Moon       | [22, 30, 14, 18]   |
| 3 | Water     | TODAY      | 2.1 L  | +0.4 L   | #96D9F7 | #4BB8F0      | #085B80 | Drop       | [26, 14, 20, 4]    |
| 4 | Heart     | RESTING    | 72 BPM | −4       | #FBB1BE | #F07090      | #862334 | Heart      | [8, 22, 16, 28]    |
| 5 | Active    | THIS WEEK  | 48 min | +12 min  | #9BE6DD | #48C7B8      | #0B655B | Lightning  | [32, 20, 10, 4]    |
| 6 | Distance  | THIS WEEK  | 8.4 km | +1.2 km  | #FAD79C | #E8B040      | #875706 | Path       | [24, 12, 20, 6]    |

--- CLICK INTERACTION ---
engagedIndex (useState) tracks which card is focused. Click to engage, click again or tap outside to release. Engaged card glides to canvas centre with centeringFactor spring (stiffness 140, damping 28, mass 1), lifts translateZ 120px, scales to 1.18×.

Rotation uses FOLLOW mode (tracks slot+idle via MotionValue listener) and SPRING mode (animate to 0 on engage, instant reset on release). Shortest-path arc clamped to ≤180°.

Z-index: useTransform on lift value — animating: 50, engaged: 40, last-clicked: 30, default: 1.

Background: dark #1A1A19 / light #F0F0E8 via theme detection.`,

  V0: `Build a standalone React component called RadialCards.

Stack: React + TypeScript + Framer Motion + @phosphor-icons/react. Single file, 'use client', default export, min-h-screen wrapper.

--- LAYOUT ---
7 health-metric cards arranged as a rotating flower. All cards share a single anchor at the canvas centre. Each card pivots from its bottom-left corner (transform-origin: 0% 100%), extends upward from the anchor, and is rotated by its hand-tuned slot angle so the bouquet fans out organically.

SLOT_ANGLES (degrees): [-35.55, 22.14, 71.01, 122.25, 161.58, -150.4, -108.41]

Stage size: clamp(300px, 50vw, 560px), centred in a min-h-screen container.
Card dimensions: 240 × 138 px.

--- IDLE ANIMATION ---
A single shared useMotionValue<number> (degrees) advances in useAnimationFrame at 360/45 deg/s (one revolution per 45 s), mod-clamped to [0,360). Each card's pivot div receives a rotate(\${slotAngle + idleRotation}deg) transform via a useMotionValueEvent listener (FOLLOW mode — no spring lag).

--- CARD VISUAL ---
Each card is a two-layer structure:
  Outer shell: linear-gradient top→bottom from PASTEL to GRADIENT_END, border-radius 24px, no border. Box shadow: -8px 16px 32px rgba(0,0,0,0.12), -3px 6px 14px rgba(0,0,0,0.18).
  Padding: 12px 4px 4px 4px. Gap: 10px. Font: Manrope.

  Header row: Phosphor icon (14px, weight="regular", color=DARK) + title text (12px, weight 500, #1a1a1a). 8px gap, 6px left padding.

  Inner panel: background #f7f7f5, border-radius 20px, padding 12px, inner shadow 0px 1px 12px rgba(0,0,0,0.25). Two rows:
    Top: pill (right-aligned) — background DARK, white text 10px semibold, padding 5px 10px, border-radius 999px.
    Bottom: left side has LABEL (10px, 600, #1a1a1a, letter-spacing 0.48px) above VALUE (23px, 600, color=DARK, letter-spacing -0.28px). Right side has a 54×36 sparkline SVG.

Sparkline: 4-point Catmull-Rom cubic bezier curve (smooth). Area fill with linearGradient (DARK at 12% opacity top → 0% bottom). Stroke: DARK, 1.5px, round caps/joins. No end dot.

--- 7 METRICS ---
| # | Title     | Label      | Value  | Delta    | PASTEL  | GRADIENT_END | DARK    | Icon       | Sparkline y-values |
|---|-----------|------------|--------|----------|---------|--------------|---------|------------|--------------------|
| 0 | Steps     | TODAY      | 20.5K  | +5K      | #EAF6AE | #ACC13C      | #5C662A | Footprints | [28, 18, 10, 6]    |
| 1 | Calories  | BURNED     | 1,820  | +120     | #F9C8A7 | #D4783A      | #853C0B | Fire       | [30, 8, 20, 6]     |
| 2 | Sleep     | LAST NIGHT | 7h 42m | +18m     | #C1C2FA | #7B7DF0      | #363885 | Moon       | [22, 30, 14, 18]   |
| 3 | Water     | TODAY      | 2.1 L  | +0.4 L   | #96D9F7 | #4BB8F0      | #085B80 | Drop       | [26, 14, 20, 4]    |
| 4 | Heart     | RESTING    | 72 BPM | −4       | #FBB1BE | #F07090      | #862334 | Heart      | [8, 22, 16, 28]    |
| 5 | Active    | THIS WEEK  | 48 min | +12 min  | #9BE6DD | #48C7B8      | #0B655B | Lightning  | [32, 20, 10, 4]    |
| 6 | Distance  | THIS WEEK  | 8.4 km | +1.2 km  | #FAD79C | #E8B040      | #875706 | Path       | [24, 12, 20, 6]    |

--- CLICK INTERACTION ---
engagedIndex (useState) tracks which card is focused. Click to engage, click again or tap outside to release. Engaged card glides to canvas centre with centeringFactor spring (stiffness 140, damping 28, mass 1), lifts translateZ 120px, scales to 1.18×.

Rotation uses FOLLOW mode (tracks slot+idle via MotionValue listener) and SPRING mode (animate to 0 on engage, instant reset on release). Shortest-path arc clamped to ≤180°.

Z-index: useTransform on lift value — animating: 50, engaged: 40, last-clicked: 30, default: 1.

Background: dark #1A1A19 / light #F0F0E8 via theme detection.`,
}
