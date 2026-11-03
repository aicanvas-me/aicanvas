# Good Vibes

**Component:** Good Vibes  
**Slug:** `good-vibes`  
**design-system:** `standalone`

## Description
Interactive typography component where letters respond to cursor proximity by becoming bolder and scaling 2x larger. Each letter independently animates its font weight from thin to bold as the cursor approaches, creating a dynamic, eye-catching interactive experience. Ideal for headers and promotional content that rewards user interaction.

## Visual
Large, responsive text reading "GOOD VIBES" in Science Gothic font. Default state: thin letters (weight 100) on burnt sienna (#ED7550) background. On cursor proximity: letters animate to bold (weight 700) while scaling 2x and expanding letter-spacing. Supports both dark mode (charcoal background) and light mode (light gray background) with consistent burnt sienna text.

## Behaviour
Cursor-proximity based animation:
- Each letter responds individually based on distance from cursor center
- **Font weight:** animates from 100 (thin) → 700 (bold) as cursor approaches
- **Scale:** animates from 1x → 2x at maximum influence
- **Letter spacing:** expands from 0em → 0.3em for visual breathing room
- **Influence radius:** 300px — letters outside this radius remain at default state
- **Physics:** smooth 0.15 easing on hover, slower 0.05 easing on exit for elastic recovery
- Smooth continuous animation as cursor moves across text; eases back to thin state on cursor leave

## Mobile
Works on both mouse and touch. Component is fully interactive on mobile with no hover-only limitations.

## Tech notes
- Science Gothic variable font from Google Fonts (weight 100 to 900), loaded by a style element with an @import inside the root, so it runs in any React app
- Cursor-proximity per-letter animation using requestAnimationFrame at 60fps
- Three animated properties per letter: font-weight, transform scale, letter-spacing (via CSS custom properties)
- Distance-based influence curve with smoothstep falloff for natural feel
- Responsive sizing: clamp(2.1rem, 7vw, 5.6rem) adapts from 320px to 1200px+
- Dual theme support: charcoal (#1a1a1a) / light gray (#f5f5f5) backgrounds with consistent burnt sienna (#ED7550) text
- Gap between letters: gap-4 (1rem) mobile, gap-6 (1.5rem) desktop for proper word separation
