import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Create an interactive typography component where letters jump, drop, and rotate playfully based on cursor proximity.

## Requirements

### Setup
- Use Next.js 16 with TypeScript
- Verify Tailwind CSS v4 is installed (configured via @theme inline in globals.css)
- Install: framer-motion, next/font
- The component should be a client-side React component ('use client')

### Typography & Text
- Display the text as TWO rows:
  - Row 1: "STAY"
  - Row 2: "WEIRD"
- Use Science Gothic font from next/font/google with subsets: ['latin']
- Font size: clamp(1.6rem, 16vw, 9.6rem) (fluid, ~60-70% of viewport width)
- Font weight: 700 (bold)
- Line height: 1
- Each letter is an inline-block element with select-none

### Theme Support (Dark & Light): INVERTED
- Dark mode (default):
  - Background: #1A1A19 (sand-950, near-black)
  - Text color: #869631 (olive-600)
- Light mode:
  - Background: #869631 (olive-600)
  - Text color: #1A1A19 (sand-950)
- Detect theme via \`closest('[data-card-theme]')\` attribute first (for isolated card previews), falling back to \`document.documentElement.classList.contains('dark')\` for standalone usage
- Use a MutationObserver walking up the ancestor chain to react to theme changes

### Text Shadow (chunky sticker style, 2px offset, no blur)
- Dark mode: \`2px 2px 0 rgba(0, 0, 0, 0.85)\`
- Light mode: \`2px 2px 0 rgba(0, 0, 0, 0.25)\`

### Animation System

Each letter animates 3 properties based on cursor distance:

#### Influence Radius
- 600px from cursor center affects letters
- Distance-based influence: linear falloff from 1 to 0 across the radius
- Apply smoothstep easing: influence = influence² × (3 - 2 × influence)

#### Rotation (CSS custom property --rotate)
- Max: ±75°
- Direction depends on cursor angle relative to letter (creates natural tilt)
- Calculate angle from cursor to letter: angle = atan2(dy, dx)
- Map to rotation direction: rotateDirection = sin(angle)
- Interpolate: targetRotate = 75 × influence × rotateDirection

#### TranslateY (CSS custom property --translate-y): ALTERNATING
- Max: ±100px
- **Even-indexed letters (0, 2, 4, ...) jump UP** (negative Y, translate -100px at max)
- **Odd-indexed letters (1, 3, 5, ...) drop DOWN** (positive Y, translate +100px at max)
- Index is counted continuously across both rows (Row 1 letters are 0-3, Row 2 letters are 4-8)
- Formula: direction = i % 2 === 0 ? -1 : 1; targetTranslateY = 100 × influence × direction
- Creates a wavy zigzag motion as cursor moves across the text

#### Scale (CSS custom property --scale)
- Min: 1, Max: 1.4
- At cursor: 1.4x scale (40% size boost)
- Far: 1x (normal)
- Interpolate: targetScale = 1 + (1.4 - 1) × influence

Apply all three via transform: \`translateY(var(--translate-y, 0px)) rotate(var(--rotate, 0deg)) scale(var(--scale, 1))\`

### Animation & Physics

#### Hover State (cursor active)
- Easing factor: 0.15 (smooth follow)

#### Exit State (cursor leaves)
- Easing factor: 0.05 (gentle elastic recovery)
- When cursor leaves (mouseRef.current = null), letters decay back to default state slowly

#### Animation Loop
- Use requestAnimationFrame to update all letters at 60fps
- For each letter (across both rows):
  1. Get its bounding rect (getBoundingClientRect)
  2. Calculate distance to cursor center
  3. Calculate influence using smoothstep falloff
  4. Calculate target rotation, translateY, and scale
  5. Ease current state toward target using exponential interpolation
  6. Update CSS custom properties on the element via setProperty()

### Component Structure

Create a LetterSpan component that:
1. Renders as a <span> with inline-block, select-none
2. Accepts props: letter, textColor, fontFamily, textShadow, forwardedRef
3. Exposes span via forwardedRef so parent can collect all letter refs
4. Styles: fontSize, fontWeight: 700, lineHeight: 1, textShadow, transform via CSS vars, willChange: 'transform'

Wrap with motion(LetterSpanComponent) to enable Framer Motion.

Main Playful component:
1. Manages containerRef, lettersRef array (indexed continuously across both rows), mouseRef, animIdRef, aliveRef
2. Tracks cursor position via onMouseMove + onTouchStart (for mobile)
3. Clears cursor on onMouseLeave + onTouchEnd (with 600ms delay so touch users can see effect)
4. Runs animation loop in useEffect that initializes state per letter and cleans up RAF on unmount

### Layout: Two rows stacked
- Outer container: flex flex-col items-center justify-center gap-2 sm:gap-4
- Each row: flex flex-nowrap items-center justify-center gap-1 sm:gap-2
- Row 1 maps letters with key index i, ref stored at lettersRef.current[i]
- Row 2 maps letters with key i + TEXT_ROW_1.length, ref stored at lettersRef.current[i + TEXT_ROW_1.length]
- This ensures the animation loop sees both rows as one continuous letter array

### Responsive Design
- Container: flex, min-h-screen, w-full, items-center, justify-center, px-6 sm:px-10
- Letter gaps: gap-1 (sm:gap-2) within each row
- Component must fill viewport and work on all screen sizes from 320px to 1200px+
- Touch support: onTouchStart captures first touch position, onTouchEnd clears after 600ms

### Code Structure
- Single file component exported as default function Playful
- All constants at module level (TEXT_ROW_1, TEXT_ROW_2, ALL_LETTERS, INFLUENCE_RADIUS, MAX_ROTATION, MAX_TRANSLATE_Y, MAX_SCALE, MIN_SCALE, EASE_ACTIVE, EASE_EXIT)
- Clean up all effects: cancel animIdRef on unmount, disconnect all MutationObservers
- No TypeScript errors or use of 'any'

Create this as a fully functional, copy-paste-ready component that showcases a playful kinetic typography effect.`,

  Lovable: `Create an interactive typography component where letters jump, drop, and rotate playfully based on cursor proximity.

## Requirements

### Setup
- Ensure TypeScript, React, Tailwind CSS v4, and framer-motion are available
- Font: Science Gothic from next/font/google
- Text displayed in two stacked rows: "STAY" on row 1, "WEIRD" on row 2

### Theme Support (Dark & Light) — INVERTED palette
- Dark mode: background #1A1A19, text #869631 (olive green)
- Light mode: background #869631 (olive green), text #1A1A19

### Typography
- Font size: fluid clamp(1.6rem, 16vw, 9.6rem) — scales ~60-70% of viewport width
- Font weight: 700 bold
- Line height: 1
- Chunky sticker-style text shadow: 2px 2px 0 rgba(0, 0, 0, 0.85) on dark, 2px 2px 0 rgba(0, 0, 0, 0.25) on light

### Animation System

Each letter animates based on cursor distance (600px influence radius):

**Three animated properties with smoothstep influence falloff:**

1. **Rotation** (--rotate): 0 → ±75° based on cursor angle
   - rotateDirection = sin(atan2(dy, dx))
   - formula: rotate = 75 × influence × rotateDirection

2. **TranslateY** (--translate-y): 0 → ±100px ALTERNATING
   - Even-indexed letters jump UP (negative Y)
   - Odd-indexed letters drop DOWN (positive Y)
   - Index runs continuously across both rows (row 1 = 0-3, row 2 = 4-8)
   - formula: direction = i % 2 === 0 ? -1 : 1; translateY = 100 × influence × direction

3. **Scale** (--scale): 1 → 1.4
   - formula: scale = 1 + 0.4 × influence

Apply via transform: translateY(var(--translate-y)) rotate(var(--rotate)) scale(var(--scale))

**Distance-based influence curve:**
- influence = 0 when distance > 600px
- influence = linear 1→0 across radius, then apply smoothstep: influence² × (3 - 2 × influence)

**Physics & Easing:**
- Active (cursor present): easing = 0.15 (responsive)
- Exiting (cursor left): easing = 0.05 (gentle elastic recovery)

### Layout
- Outer container: min-h-screen w-full flex flex-col items-center justify-center
- Inner wrapper: flex flex-col items-center gap-2 sm:gap-4 (stacks the two rows)
- Each row: flex flex-nowrap items-center justify-center gap-1 sm:gap-2

### Component Architecture

**LetterSpan component:**
- Renders span with inline-block, select-none, fontWeight: 700
- Applies textShadow + transform via CSS variables
- Exposes ref for parent to collect

**Main Playful:**
- Tracks cursor via onMouseMove + onTouchStart, clears on onMouseLeave + onTouchEnd (600ms delay)
- Runs animation loop at 60fps updating all CSS custom properties
- Maintains per-letter state (rotate, translateY, scale)
- Letter index is continuous across both rows for alternating direction logic
- Clean up all effects and RAF on unmount

### Responsive Design
- Works 320px → 1200px+ without breaking
- Touch support baked in (not hover-only)
- fontSize scales fluidly via clamp() with vw unit

Build a fully functional, production-ready component that showcases smooth playful kinetic typography with perfect dark/light theme support.`,

  V0: `Create an interactive typography component where letters jump, drop, and rotate playfully based on cursor proximity.

## Requirements

### Setup
- TypeScript, React, Tailwind CSS v4, framer-motion
- Font: Science Gothic from next/font/google
- Two rows: "STAY" on top, "WEIRD" below

### Theme (Dark & Light) — INVERTED colors
- Dark: background #1A1A19, text #869631 (olive green)
- Light: background #869631, text #1A1A19

### Typography
- Font size: clamp(1.6rem, 16vw, 9.6rem) — fluid, ~60-70% of viewport
- Font weight: 700 bold
- Line height: 1
- Text shadow 2px 2px 0 — dark mode alpha 0.85, light mode 0.25

### Three Animated Properties (CSS Variables)

Each letter responds to cursor distance (600px radius) with smoothstep influence:

1. **Rotation** (--rotate)
   - Range: ±75° based on cursor angle
   - Calculation: 75 × influence × sin(atan2(dy, dx))

2. **TranslateY** (--translate-y) — ALTERNATING direction
   - Range: ±100px
   - Even letters (index 0, 2, 4...) jump UP (-100px at max)
   - Odd letters (1, 3, 5...) drop DOWN (+100px at max)
   - Index runs continuously across both rows

3. **Scale** (--scale)
   - Range: 1 to 1.4
   - Calculation: 1 + 0.4 × influence

**Influence calculation:**
- Distance > 600px: influence = 0
- Distance < 600px: linear 1→0, then smoothstep: influence² × (3 - 2 × influence)

### Physics
- Cursor active: easing = 0.15 (responsive)
- Cursor exited: easing = 0.05 (gentle recovery)

### Implementation
- LetterSpan wraps each letter with inline-block, select-none
- Apply combined transform: translateY(var) rotate(var) scale(var)
- Animation loop at 60fps via requestAnimationFrame
- Per-letter state object tracks: rotate, translateY, scale
- Cursor tracking: onMouseMove + onTouchStart set position; onMouseLeave + onTouchEnd clear
- Clean up RAF on unmount

### Layout
- min-h-screen w-full, flex centered
- Outer wrapper: flex-col with gap-2 sm:gap-4 between rows
- Each row: flex flex-nowrap with gap-1 sm:gap-2 between letters
- Works across 320px-1200px+

Build a smooth, responsive cursor-proximity animation component with inverted dual theme support and playful bouncy motion.`,

}
