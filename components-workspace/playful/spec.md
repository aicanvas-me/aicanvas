# Playful

**Component:** Playful  
**Slug:** `playful`  
**design-system:** `standalone`

## Description
Interactive two-row typography where letters jump, drop, and rotate playfully based on cursor proximity, creating a bouncy kinetic text effect.

## Visual
Two stacked rows of large fluid text: "STAY" on row 1, "WEIRD" on row 2, in Science Gothic bold. Chunky 2px sticker-style drop shadow. Colors use inverted design-system palette between modes (raw hex, no tokens).

## Colors (inverted between modes)
- **Dark mode:** Olive-600 `#869631` text on sand-950 `#1A1A19` background
- **Light mode:** Sand-950 `#1A1A19` text on olive-600 `#869631` background

## Behaviour
Cursor-proximity based animation (600px influence radius):
- **Rotation:** Letters rotate up to ±75° based on cursor angle × influence (rotateDirection = sin(angle))
- **Alternating Jump/Drop:** Even-indexed letters jump UP (-100px at max), odd-indexed letters drop DOWN (+100px at max). Index runs continuously across both rows, so the zigzag pattern ripples through the full phrase
- **Scale:** Letters scale up to 1.4x at maximum influence
- Smooth continuous animation; eases back to default on cursor leave
- Physics: 0.15 easing active, 0.05 easing on exit for gentle elastic recovery

## Mobile
Touch-friendly — onTouchStart captures the first touch position to trigger the effect, onTouchEnd clears with 600ms delay so the effect stays visible briefly.

## Tech notes
- Science Gothic variable font from Google Fonts (weight 100 to 900), loaded by a style element with an @import inside the root, so it runs in any React app
- Per-letter state: rotate, translateY, scale — stored in a ref, updated via requestAnimationFrame
- CSS custom properties (`--rotate`, `--translate-y`, `--scale`) for per-letter animation state
- Combined transform: `translateY(var(--translate-y)) rotate(var(--rotate)) scale(var(--scale))`
- Text shadow: `2px 2px 0 rgba(0, 0, 0, 0.85)` dark, `2px 2px 0 rgba(0, 0, 0, 0.25)` light
- Theme detection via `closest('[data-card-theme]')` attribute (works in isolated card preview + site-wide theme)
- Fluid responsive sizing: clamp(1.6rem, 16vw, 9.6rem) — ~60-70% of viewport width
- Two-row layout: outer flex-col with gap-2 sm:gap-4, each row flex-nowrap with gap-1 sm:gap-2
- Smoothstep falloff for natural proximity curve
