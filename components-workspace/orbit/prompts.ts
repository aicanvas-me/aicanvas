import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Root element: className="flex min-h-screen w-full items-center justify-center"
The root ships full height with min-h-screen and the CLI install delivers it exactly as shown, so a standalone paste needs no change. Drop it into a container of your own and that container needs a real height, or the root collapses and takes its absolute layers with it.

Create a circular typography component where a looping phrase rotates continuously around a wheel, with letters responding to cursor proximity.

## Requirements

### Setup
- Use Next.js 16 with TypeScript
- Verify Tailwind CSS v4 is installed (configured via @theme inline in globals.css)
- Install: react, next/font
- The component should be a client-side React component ('use client')

### Typography & Text
- Text content: "KEEP MOVING • KEEP MOVING • " repeated twice to fill the circle (FULL_TEXT = BASE_TEXT + BASE_TEXT)
- Use Anton font from next/font/google with subsets: ['latin'], weight: '400'
- Font size: size * 0.076 (proportional to container, calibrated for Anton's character widths at 56 chars)
- Each letter is an inline-block span with userSelect: none

### Theme Support (Dark & Light)
- Dark mode (default):
  - Background: #1A1A19 (sand-950)
  - Text color: #E8E8DF (sand-100)
- Light mode:
  - Background: #E8E8DF (sand-100)
  - Text color: #1A1A19 (sand-950)
- Detect theme via \`closest('[data-card-theme]')\` attribute first, falling back to \`document.documentElement.classList.contains('dark')\`
- Use a MutationObserver walking up the ancestor chain to react to theme changes

### Circular Layout
- Container (wheelRef): position relative, width/height clamp(200px, 48vw, 420px)
- Measure container size with ResizeObserver + useLayoutEffect (setSize on mount and resize)
- Each letter, outer span:
  - position absolute
  - angle = (i / TOTAL) * 2π - π/2 (start from 12 o'clock)
  - x = radius + textRadius * cos(angle), y = radius + textRadius * sin(angle)
  - transform: translate(-50%, -50%) rotate(\${rotDeg}deg) where rotDeg = angle * 180/π + 90
  - textRadius = radius * 0.88
- Each letter, inner span (ref'd):
  - handles hover animation via CSS custom properties
  - transform: translate(var(--push-x, 0px), var(--push-y, 0px)) scale(var(--scale, 1))

### Center Decoration
- A 2×2 grid of four 4px circular dots centered over the wheel
- Dots positioned at absolute center (top: 50%, left: 50%) of a wrapper div
- Wrapper counter-rotates at 1.5× the wheel speed (opposite direction)
- Dot color matches textColor
- Grid: display grid, gridTemplateColumns: '1fr 1fr', gap: 6px

### Wheel Rotation (JS-driven via requestAnimationFrame)
- Track rotation in rotationRef (degrees), speed in speedRef
- SPEED_NORMAL = 0.3 deg/frame (~20s per revolution at 60fps)
- SPEED_SLOW = 0.075 deg/frame (hover state)
- Speed easing: speedRef += (targetSpeed - speedRef) * 0.03 each frame
- Apply to wheel: wheelRef.current.style.transform = \`rotate(\${rotation}deg)\`
- Apply to dot grid (counter-rotate): dotRef.current.style.transform = \`translate(-50%, -50%) rotate(\${-rotation * 1.5}deg)\`
- isHoveredRef controls whether target speed is SLOW or NORMAL

### Per-Letter Proximity Effect
Influence radius: 400px. Smoothstep falloff:
- influence = 1 - dist / INFLUENCE_RADIUS, then smoothstep: influence² × (3 - 2 × influence)

**Two animated properties via CSS custom properties on the inner span:**

1. **Scale** (--scale): 1 → 1.5
   - targetScale = 1 + 0.5 × influence

2. **Radial Push** (--push-x, --push-y): 0 → 22px outward from wheel center
   - Get wheel center from wheelRef.getBoundingClientRect()
   - Get letter center from inner span's getBoundingClientRect()
   - Direction = normalize(letterCenter - wheelCenter)
   - targetPushX = direction.x × 22 × influence
   - targetPushY = direction.y × 22 × influence

### Physics & Easing
- Cursor active: easing = 0.15
- Cursor exited: easing = 0.05
- Per-letter state: { scale, pushX, pushY }

### Mobile
- onTouchStart captures first touch position to trigger effect
- onTouchEnd clears cursor with 600ms delay

### Code Structure
- Single file, default export function Orbit
- Constants at module level: BASE_TEXT, FULL_TEXT, LETTERS, TOTAL, INFLUENCE_RADIUS, MAX_SCALE (1.5), MAX_PUSH (22), EASE_ACTIVE, EASE_EXIT, SPEED_NORMAL, SPEED_SLOW, SPEED_EASE, TEXT_RADIUS_RATIO (0.88)
- Outer wrapper div (position relative) contains both wheelRef div and dotRef div
- Clean up all effects: cancel animIdRef, disconnect ResizeObserver and MutationObservers
- No TypeScript errors

Build a fully functional copy-paste-ready component that showcases a circular rotating kinetic typography wheel with smooth deceleration and radial letter push on hover.`,

  V0: `Create a circular typography component where letters arranged around a rotating wheel respond to cursor proximity.

## Setup
- TypeScript, React, Tailwind CSS v4, next/font
- Font: Anton from next/font/google (weight: '400')
- Text: "KEEP MOVING • KEEP MOVING • " repeated twice around the full circle

## Theme
- Dark: background #1A1A19, text #E8E8DF
- Light: background #E8E8DF, text #1A1A19

## Circular Layout
- wheelRef container: position relative, clamp(200px, 48vw, 420px) square
- Measure size with ResizeObserver + useLayoutEffect
- Per letter outer span: placed at angle on circle (textRadius = radius * 0.88, starting 12 o'clock)
  - x = radius + textRadius * cos(angle), y = radius + textRadius * sin(angle)
  - transform: translate(-50%, -50%) rotate(\${angle*180/π + 90}deg)
- Font size: size * 0.076
- Inner span per letter: transform: translate(var(--push-x), var(--push-y)) scale(var(--scale))

## Center Decoration
- 2×2 grid of four 4px dots (border-radius 50%) centered over the wheel
- Counter-rotates at 1.5× wheel speed in opposite direction
- Same color as text

## Wheel Rotation (JS-driven, NOT CSS animation)
- SPEED_NORMAL = 0.3 deg/frame, SPEED_SLOW = 0.075 deg/frame on hover
- Speed easing factor: 0.03 per frame
- Apply: wheelRef.style.transform = rotate(\${rotation}deg)
- Dot grid: translate(-50%, -50%) rotate(\${-rotation * 1.5}deg)

## Per-Letter Proximity Effect (400px radius, smoothstep)
1. **Scale** (--scale): 1 → 1.5
2. **Radial Push** (--push-x, --push-y): 0 → 22px away from wheel center
   - Direction = normalize(letterCenter - wheelCenter) via live getBoundingClientRect

## Physics
- Cursor active easing: 0.15 | exit easing: 0.05

## Layout
- min-h-screen w-full flex items-center justify-center
- Outer wrapper: position relative, contains wheel + dot grid

Build a smooth copy-paste-ready circular typography component.`,

  Lovable: `Create a circular typography component where a looping phrase rotates continuously around a wheel, with letters responding to cursor proximity.

## Setup
- TypeScript, React, Tailwind CSS v4, next/font
- Font: Anton from next/font/google (weight: '400')
- Text: "KEEP MOVING • KEEP MOVING • " repeated twice (FULL_TEXT = BASE_TEXT + BASE_TEXT)

## Theme
- Dark mode: background #1A1A19, text #E8E8DF
- Light mode: background #E8E8DF, text #1A1A19
- Detect via \`closest('[data-card-theme]')\` first, fallback to html .dark class

## Circular Layout
- Container: clamp(200px, 48vw, 420px) square, position relative
- Measure actual size with ResizeObserver + useLayoutEffect
- Per letter: outer span positioned at (radius + textRadius*cos(angle), radius + textRadius*sin(angle))
  - textRadius = radius * 0.88, angle starts at -π/2 (12 o'clock)
  - Letter rotation = angle * 180/π + 90 (tangent to circle)
- Font size: size * 0.076
- Inner span per letter handles hover via CSS vars

## Center Decoration
- Four 4px circular dots in a 2×2 grid (gap: 6px), centered over the wheel
- Counter-rotates at 1.5× wheel speed in opposite direction
- Same color as text

## Wheel Rotation
- JS-driven via requestAnimationFrame (enables smooth deceleration)
- Normal: 0.3 deg/frame | Hover: 0.075 deg/frame
- Speed eases toward target at 0.03 factor per frame

## Hover Effect (400px proximity radius, smoothstep falloff)
- Scale: 1 → 1.5 via --scale
- Radial push: 0 → 22px away from wheel center via --push-x / --push-y
- Active easing 0.15, exit easing 0.05

## Mobile
- onTouchStart triggers effect, onTouchEnd clears after 600ms delay

Build a smooth, production-ready circular kinetic typography component with dual theme support.`,
}
