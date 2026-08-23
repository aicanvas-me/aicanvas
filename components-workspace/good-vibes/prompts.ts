import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Create an interactive typography component where each letter responds to cursor proximity by becoming bolder and scaling larger.

## Requirements

### Setup
- Use Next.js 16 with TypeScript
- Verify Tailwind CSS v4 is installed (configured via @theme inline in globals.css)
- Install: framer-motion, next/font
- The component should be a client-side React component ('use client')

### Typography & Text
- Display the text: "GOOD VIBES"
- Use Science Gothic font from next/font/google with subsets: ['latin']
- Font size: clamp(2.1rem, 7vw, 5.6rem) to be responsive across all screen sizes
- Line height: 1
- Each letter is an inline-block element with select-none

### Theme Support (Dark & Light)
- Dark mode (default):
  - Background: #1a1a1a (charcoal)
  - Text color: #ed7550 (burnt sienna)
- Light mode:
  - Background: #f5f5f5 (light gray)
  - Text color: #ed7550 (burnt sienna)
- Import useTheme from ../../app/components/ThemeProvider to detect theme
- Use theme to set bgColor and use burnt sienna text color for both modes

### Animation System

Each letter animates 3 properties based on cursor distance:

#### Influence Radius
- 300px from cursor center affects letters
- Distance-based influence: linear falloff from 1 to 0 across the radius
- Apply smoothstep easing: influence = influence² × (3 - 2 × influence)

#### Font Weight (CSS custom property --font-weight)
- Min: 100, Max: 700
- At cursor position (influence = 1): weight = 700 (bold)
- Far from cursor (influence = 0): weight = 100 (thin)
- Interpolate: targetWeight = 100 + (700 - 100) × influence

#### Scale (CSS custom property --scale)
- Min: 1, Max: 2
- At cursor: 2x scale
- Far: 1x (normal)
- Interpolate: targetScale = 1 + (2 - 1) × influence
- Apply as transform: scale(var(--scale, 1))

#### Letter Spacing (CSS custom property --letter-spacing)
- Min: 0em, Max: 0.3em
- At cursor: 0.3em (expanded)
- Far: 0em (default)
- Interpolate: targetLetterSpacing = 0 + (0.3 - 0) × influence

### Animation & Physics

#### Hover State (cursor active)
- Easing factor: 0.15 (smooth follow)
- Letters respond smoothly and quickly to cursor movement

#### Exit State (cursor leaves)
- Easing factor: 0.05 (stretchy recovery)
- When cursor leaves (mouseRef.current = null), letters decay back to default state slowly

#### Animation Loop
- Use requestAnimationFrame to update all letters at 60fps
- For each letter:
  1. Get its bounding rect (getBoundingClientRect)
  2. Calculate distance to cursor center
  3. Calculate influence using smoothstep falloff
  4. Calculate target values for all 3 properties
  5. Ease current state toward target using exponential interpolation
  6. Update CSS custom properties on the element via setProperty()
- Maintain state object per letter

### Component Structure

Create a LetterSpan component that:
1. Renders as a <span> with inline-block, select-none
2. Accepts props: letter (string), textColor (className), fontFamily (string from scienceGothic.style.fontFamily), forwardedRef
3. Uses useRef and useEffect to expose span via forwardedRef so parent can collect all letter refs
4. Styles: fontSize, fontWeight, letterSpacing, fontFamily, lineHeight, transform via CSS vars

Wrap with motion(LetterSpanComponent) to enable Framer Motion.

Main GoodVibes component:
1. Manages containerRef, lettersRef array, mouseRef, animIdRef, aliveRef
2. Tracks cursor position via onMouseMove (set mouseRef.current = { x, y })
3. Clears cursor on onMouseLeave (set mouseRef.current = null)
4. Runs animation loop in useEffect that:
   - Initializes state per letter (weight, scale, letterSpacing all at default)
   - Calls animate() via requestAnimationFrame
   - Cleans up on unmount

### Responsive Design
- Container: flex, min-h-screen, w-full, items-center, justify-center
- Letter gaps: gap-4 (sm:gap-6) for mobile responsiveness and word separation
- Component must fill viewport and work on all screen sizes from 320px to 1200px
- No hardcoded widths/heights: use clamp() and Tailwind fluid utilities

### Code Structure
- Single file component exported as default function GoodVibes
- All constants defined at module level (TEXT, INFLUENCE_RADIUS, MAX_WEIGHT, MIN_WEIGHT, MAX_SCALE, MIN_SCALE, MAX_LETTER_SPACING, MIN_LETTER_SPACING, EASE_DURATION)
- Clean up all effects: cancel animIdRef on unmount
- No TypeScript errors or use of 'any'

### Mobile Responsiveness
- No hover-only interactions (cursor proximity is primary)
- Text scales responsively via clamp()
- Gaps adjust via sm: breakpoint (gap-4 to gap-6)

Create this as a fully functional, copy-paste-ready component that showcases variable font animation with cursor-driven influence.`,

  Lovable: `Create an interactive typography component where each letter responds to cursor proximity by becoming bolder and scaling larger.

## Requirements

### Setup
- Ensure TypeScript, React, Tailwind CSS v4, and framer-motion are available
- Font: Science Gothic from next/font/google
- Text: "GOOD VIBES"

### Theme Support (Dark & Light)
- Dark mode (default):
  - Background: #1a1a1a (charcoal)
  - Text color: #ed7550 (burnt sienna)
- Light mode:
  - Background: #f5f5f5 (light gray)
  - Text color: #ed7550 (burnt sienna)

### Typography
- Font size: responsive clamp(2.1rem, 7vw, 5.6rem)
- Line height: 1
- Each letter is inline-block with select-none

### Animation System

Each letter animates based on cursor distance (300px influence radius):

**Three animated properties with smoothstep influence falloff:**

1. **Font Weight** (--font-weight): 100 → 700
   - formula: weight = 100 + (700 - 100) × influence

2. **Scale** (--scale): 1 → 2
   - formula: scale = 1 + (2 - 1) × influence
   - apply as transform: scale(var(--scale, 1))

3. **Letter Spacing** (--letter-spacing): 0em → 0.3em
   - formula: letterSpacing = 0 + (0.3) × influence

**Distance-based influence curve:**
- influence = 0 when distance > 300px
- influence = linear 1→0 across radius, then apply smoothstep: influence² × (3 - 2 × influence)

**Physics & Easing:**
- Active (cursor present): easing = 0.15 (responsive)
- Exiting (cursor left): easing = 0.05 (stretchy recovery)

### Component Architecture

**LetterSpan component:**
- Renders span with inline-block and select-none
- Exposes ref for parent to collect

**Main GoodVibes:**
- Tracks cursor via onMouseMove, clears on onMouseLeave
- Runs animation loop at 60fps updating all CSS custom properties
- Maintains per-letter state (weight, scale, letterSpacing)
- Clean up all effects and RAF on unmount

### Responsive Design
- min-h-screen w-full flex items-center justify-center
- Letter gaps: gap-4 (sm:gap-6)
- Works 320px → 1200px without breaking

Build a fully functional, production-ready component that showcases smooth cursor-driven typography animations with perfect dark/light theme support.`,

  V0: `Create an interactive typography component where each letter responds to cursor proximity by becoming bolder and scaling larger.

## Requirements

### Setup
- TypeScript, React, Tailwind CSS v4, framer-motion
- Font: Science Gothic from next/font/google
- Display text: "GOOD VIBES"

### Theme (Dark & Light)
- Dark: background #1a1a1a, text #ed7550 (burnt sienna)
- Light: background #f5f5f5, text #ed7550

### Typography
- Font size: clamp(2.1rem, 7vw, 5.6rem)
- Line height: 1

### Three Animated Properties (CSS Variables)

Each letter responds to cursor distance (300px radius) with smoothstep influence:

1. **Font Weight** (--font-weight)
   - Range: 100 to 700
   - Calculation: 100 + (700-100) × influence

2. **Scale** (--scale)
   - Range: 1 to 2
   - Calculation: 1 + 1 × influence
   - Apply as transform: scale(var(--scale, 1))

3. **Letter Spacing** (--letter-spacing)
   - Range: 0em to 0.3em
   - Calculation: 0 + 0.3 × influence

**Influence calculation:**
- Distance > 300px: influence = 0
- Distance < 300px: linear 1→0, then smoothstep: influence² × (3 - 2 × influence)

### Physics
- Cursor active: easing = 0.15 (responsive)
- Cursor exited: easing = 0.05 (elastic recovery)

### Implementation
- LetterSpan component wraps each letter
- Animation loop at 60fps via requestAnimationFrame
- Per-letter state object tracks: weight, scale, letterSpacing
- Cursor tracking: onMouseMove sets position, onMouseLeave nullifies
- Clean up RAF on unmount

### Responsive
- min-h-screen w-full, flex centered
- Gaps: gap-4 (sm:gap-6)
- Works across 320px-1200px

Build a smooth, responsive cursor-proximity animation component with dual theme support.`,

}
