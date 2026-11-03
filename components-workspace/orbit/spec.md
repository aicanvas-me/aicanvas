# Orbit

**Component:** Orbit  
**Slug:** `orbit`  
**design-system:** `standalone`

## Description
Circular typography wheel where "KEEP MOVING • KEEP MOVING •" rotates continuously. On cursor proximity letters scale and push outward radially, slowing the wheel.

## Visual
Full circle of text in Anton bold. Four 4px dots in a 2×2 grid centered in the wheel, counter-rotating at 1.5× speed. Dark: `#1A1A19` bg, `#E8E8DF` text. Light: `#E8E8DF` bg, `#1A1A19` text.

## Text
`'KEEP MOVING • KEEP MOVING • '` repeated twice (BASE_TEXT + BASE_TEXT = 56 chars total)

## Colours
- **Dark mode:** bg `#1A1A19`, text `#E8E8DF`
- **Light mode:** bg `#E8E8DF`, text `#1A1A19`

## Behaviour
- Continuous clockwise rotation (~20s/rev, JS-driven via RAF)
- Hover decelerates wheel to ~80s/rev (speed easing factor 0.03)
- Per-letter proximity (400px radius): scale 1→1.5, radial push 0→22px
- Smoothstep influence falloff
- Easing: 0.15 active, 0.05 exit
- Center dot grid counter-rotates at −1.5× wheel rotation

## Mobile
- onTouchStart captures first touch, onTouchEnd clears with 600ms delay

## Tech notes
- Anton from Google Fonts (weight 400, single-weight font), loaded by a style element with an @import inside the root, so it runs in any React app
- Circle layout: outer spans positioned via trigonometry (not SVG)
  - textRadius = radius * 0.88
  - angle = (i / TOTAL) * 2π − π/2
  - rotDeg = angle * 180/π + 90
- fontSize = size * 0.076 (calibrated for 56 chars + Anton proportions)
- Container: `clamp(200px, 48vw, 420px)` — responsive via ResizeObserver + useLayoutEffect
- JS rotation: speedRef eased toward SPEED_NORMAL (0.3) or SPEED_SLOW (0.075) at factor 0.03
- CSS vars per letter: --push-x, --push-y, --scale on inner span
- Radial push direction = normalize(letterCenter − wheelCenter) from live getBoundingClientRect
- Theme detection via `closest('[data-card-theme]')` first, then html .dark class
- MutationObserver walking ancestor chain for theme reactivity
