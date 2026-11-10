# Radial Cards

**Slug:** `radial-cards`
**design-system:** `standalone`
**Status:** integrated

## Description

Seven health-metric cards bloom into a slowly rotating flower — tap any petal to pull it forward and read your stats up close.

## Visual

### Layout
- 7 cards share a single anchor at the canvas centre. Each card pivots from its **bottom-left corner** (`transform-origin: 0% 100%`), extends upward, and is placed at a hand-tuned slot angle so the bouquet fans out organically.
- `SLOT_ANGLES` (degrees): `[-35.55, 22.14, 71.01, 122.25, 161.58, -150.4, -108.41]`
- Stage: `clamp(300px, 50vw, 560px)`. Card: `240 × 138 px`.

### Per-card visual
Two-layer structure:
- **Outer shell**: `linear-gradient(to bottom, PASTEL, GRADIENT_END)`, `border-radius 24px`, no border. Shadow: `-8px 16px 32px rgba(0,0,0,0.12), -3px 6px 14px rgba(0,0,0,0.18)`. Padding `12px 4px 4px 4px`.
- **Header row**: icon (12px, color=DARK) + title (12px, weight 500, `#1a1a1a`). 8px gap, 6px left padding.
- **Inner panel**: `#f7f7f5`, `border-radius 20px`, `padding 12px`, inner shadow `0px 1px 12px rgba(0,0,0,0.25)`.
  - Top-right: delta pill (DARK bg, white 10px semibold text, `5px 10px` padding, `999px` radius).
  - Bottom-left: LABEL (10px, 600, `#1a1a1a`, `0.48px` tracking) above VALUE (23px, 600, DARK, `-0.28px` tracking).
  - Bottom-right: 54×36 sparkline SVG (4-point Catmull-Rom curve, gradient fill, no dot).

### 7 Metrics

| # | Title    | Label      | Value  | Delta   | PASTEL    | GRADIENT_END | DARK      | Icon       |
|---|----------|------------|--------|---------|-----------|--------------|-----------|------------|
| 0 | Steps    | TODAY      | 20.5K  | +5K     | `#EAF6AE` | `#ACC13C`    | `#5C662A` | Footprints |
| 1 | Calories | BURNED     | 1,820  | +120    | `#F9C8A7` | `#D4783A`    | `#853C0B` | Fire       |
| 2 | Sleep    | LAST NIGHT | 7h 42m | +18m    | `#C1C2FA` | `#7B7DF0`    | `#363885` | Moon       |
| 3 | Water    | TODAY      | 2.1 L  | +0.4 L  | `#96D9F7` | `#4BB8F0`    | `#085B80` | Droplet    |
| 4 | Heart    | RESTING    | 72 BPM | −4      | `#FBB1BE` | `#F07090`    | `#862334` | Heart      |
| 5 | Active   | THIS WEEK  | 48 min | +12 min | `#9BE6DD` | `#48C7B8`    | `#0B655B` | Bolt       |
| 6 | Distance | THIS WEEK  | 8.4 km | +1.2 km | `#FAD79C` | `#E8B040`    | `#875706` | Route      |

### Theme
- Dark bg: `#1A1A19`. Light bg: `#F0F0E8`. Detected via inline `useTheme` (MutationObserver on `data-card-theme` + `document.documentElement`).

## Behaviour

### Idle
- Single shared `useMotionValue<number>` (degrees) advances at 360/45 deg/s (`SECONDS_PER_TURN = 45`) in `useAnimationFrame`, mod-clamped to `[0, 360)`.
- Each card's pivot rotates via `FOLLOW mode`: `cardRotation = SLOT_ANGLES[i] + idleRotation`, updated by a `useMotionValueEvent` listener (no spring lag).

### Click to engage
- `engagedIndex` (useState) tracks the focused card.
- Click a card → it glides to canvas centre, lifts `translateZ(120px)`, scales to `1.18×`. Click again or tap outside to release.
- Springs: `LIFT_SPRING = { stiffness: 140, damping: 28, mass: 1 }`.
- `cardBodyTransform`: interpolates `translate(${-50*cf}%, calc(-50% - 50% * (1-cf)))` as `centeringFactor` goes 0→1.

### Rotation: shortest path
- **Engaging**: spring `cardRotation` to 0 via `animate()` with LIFT_SPRING. `shortestEquivalent()` clamps arc to ≤180°.
- **Releasing**: instantly set `cardRotation = SLOT_ANGLES[i] + idleRotation` (invisible while card centred on pivot), immediately re-enable FOLLOW mode. The visual return is handled by the `centeringFactor` / `lift` / `scale` springs.

### Z-order
- `useTransform(lift, z => z > 4 ? 50 : engaged ? 40 : isTop ? 30 : 1)`
- `topIndex` persists last-clicked card above unclicked neighbours until a different card is clicked.

### Reduced motion
- Idle rotation frozen. Lift Z → 30px. Scale → 1.06. Siblings dim to 70% opacity.

## Tech notes
- `'use client'` + `// npm install framer-motion react`
- Pure CSS 3D + Framer Motion. No Three.js.
- Inline `useTheme` hook (MutationObserver pattern, copy-paste safe).
- No design tokens — raw hex values throughout.
