import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Create an interactive text component where each letter responds to cursor proximity with smooth variable font animations.

## Requirements

### Setup
- Use Next.js 16 with TypeScript
- Verify Tailwind CSS v4 is installed (configured via @theme inline in globals.css)
- Install: framer-motion, next/font
- The component should be a client-side React component ('use client')

### Typography & Text
- Display the text: "WHAT ?!"
- Use Science Gothic font from next/font/google with subsets: ['latin']
- Font size: clamp(5rem, 12vw, 9rem) to be responsive across all screen sizes
- Line height: 1
- Base letter spacing: 0.15em
- Word spacing: 0.8em
- Each letter is an inline-block element with select-none

### Theme Support (Dark & Light)
- Dark mode (default):
  - Background: #0d001a (dark navy)
  - Text color: #40FFA7 (neon cyan)
- Light mode:
  - Background: #40FFA7 (neon cyan)
  - Text color: #0d001a (dark navy)
- Import useTheme from ../../app/components/ThemeProvider to detect theme
- Use theme to set bgColor and textColor (as Tailwind className for text: text-[#40FFA7] or text-[#0d001a])

### Animation System

Each letter animates 5 properties based on cursor distance:

#### Influence Radius
- 300px from cursor center affects letters
- Distance-based influence: linear falloff from 1 to 0 across the radius
- Apply smoothstep easing: influence = influence² × (3 - 2 × influence)

#### Font Weight (CSS custom property --font-weight)
- Min: 100, Max: 900
- At cursor position (influence = 1): weight = 900
- Far from cursor (influence = 0): weight = 100
- Interpolate: targetWeight = 100 + (900 - 100) × influence

#### Font Stretch (CSS custom property --font-stretch)
- Min: 100%, Max: 200%
- At cursor: 200% (expanded)
- Far: 100% (normal)
- Interpolate: targetStretch = 100 + (200 - 100) × influence

#### Letter Spacing (CSS custom property --letter-spacing)
- Min: 0em, Max: 0.4em
- At cursor: 0.4em (expanded)
- Far: 0em (touching)
- Interpolate: targetLetterSpacing = 0 + (0.4 - 0) × influence

#### Italic (CSS custom property --italic as number 0-1)
- At cursor (influence = 1): italic = 0 (normal font-style)
- Far (influence = 0): italic = 1 (italic font-style)
- Inverse of influence: italicValue = 1 - influence
- In LetterSpan component: watch --italic CSS var and toggle fontStyle between 'italic' and 'normal' when value crosses 0.5

#### Skew Y (CSS custom property --skew in degrees)
- Min: 0°, Max: ±18°
- Direction depends on cursor angle relative to letter
- Calculate angle from cursor to letter: angle = atan2(dy, dx)
- Map to skew direction: skewDirection = sin(angle)
- Interpolate: targetSkew = 18 × influence × skewDirection
- Apply as transform: skewY(var(--skew, 0)deg)

### Animation & Physics

#### Hover State (cursor active)
- Spring: damping = 10, stiffness = 160
- Easing factor: 0.15 (smooth follow)
- Letters respond smoothly and quickly to cursor movement

#### Exit State (cursor leaves)
- Spring: damping = 6, stiffness = 35 (slower, more elastic)
- Easing factor: 0.05 (stretchy recovery)
- When cursor leaves (mouseRef.current = null), letters decay back to default state slowly

#### Animation Loop
- Use requestAnimationFrame to update all letters at 60fps
- For each letter:
  1. Get its bounding rect (getBoundingClientRect)
  2. Calculate distance to cursor center
  3. Calculate influence using smoothstep falloff
  4. Calculate target values for all 5 properties
  5. Ease current state toward target using exponential interpolation
  6. Update CSS custom properties on the element via setProperty()
- Maintain exit state object per letter to preserve animation during easing

### Component Structure

Create a LetterSpan component that:
1. Renders as a <span> with inline-block, select-none
2. Accepts props: letter (string), textColor (className), fontFamily (string from scienceGothic.style.fontFamily), forwardedRef
3. Uses useRef and useEffect to:
   - Monitor the --italic CSS variable via getComputedStyle()
   - Toggle fontStyle between 'italic' and 'normal' based on --italic > 0.5
   - Expose span via forwardedRef so parent can collect all letter refs
4. Styles: fontSize, fontWeight, fontStretch, fontFamily, fontStyle, lineHeight, letterSpacing, wordSpacing, transform via CSS vars

Wrap with motion(LetterSpanComponent) to enable Framer Motion.

Main ResponsiveLetters component:
1. Manages containerRef, lettersRef array, mouseRef, animIdRef, aliveRef
2. Tracks cursor position via onMouseMove (set mouseRef.current = { x, y })
3. Clears cursor on onMouseLeave (set mouseRef.current = null)
4. Add onTouchStart handler for mobile (optional, touch doesn't affect animation but shows component is touch-aware)
5. Runs animation loop in useEffect that:
   - Initializes exit state per letter (weight, stretch, letterSpacing, skew, italic all at default)
   - Calls animate() via requestAnimationFrame
   - Cleans up on unmount

### Responsive Design
- Container: flex, min-h-screen, w-full, items-center, justify-center
- Letter gaps: gap-0.5 (sm:gap-1) for mobile responsiveness
- Component must fill viewport and work on all screen sizes from 320px to 1200px
- No hardcoded widths/heights: use clamp() and Tailwind fluid utilities

### Code Structure
- Single file component exported as default function ResponsiveLetters
- All constants defined at module level (TEXT, INFLUENCE_RADIUS, MAX_WEIGHT, MIN_WEIGHT, etc.)
- Clean up all effects: cancel animIdRef on unmount, disconnect MutationObserver
- No TypeScript errors or use of 'any'

### Mobile Responsiveness
- Component supports touch (onTouchStart handler present)
- No hover-only interactions (cursor proximity is primary, but mobile still sees full animation)
- Text scales responsively via clamp()
- Gaps adjust via sm: breakpoint (gap-0.5 to gap-1)

Create this as a fully functional, copy-paste-ready component that showcases variable font animation with cursor-driven influence.`,

  Lovable: `Create an interactive text component where each letter responds to cursor proximity with smooth variable font animations.

## Requirements

### Setup
- Ensure TypeScript, React, Tailwind CSS v4, and framer-motion are available
- Font: Science Gothic from next/font/google
- Text: "WHAT ?!"

### Theme Support (Dark & Light)
- Dark mode (default):
  - Background: #0d001a (dark navy)
  - Text color: #40FFA7 (neon cyan)
- Light mode:
  - Background: #40FFA7 (neon cyan)
  - Text color: #0d001a (dark navy)

### Typography
- Font size: responsive clamp(5rem, 12vw, 9rem)
- Line height: 1
- Letter spacing: 0.15em (base)
- Word spacing: 0.8em
- Each letter is inline-block with select-none

### Animation System

Each letter animates based on cursor distance (300px influence radius):

**Five animated properties with smoothstep influence falloff:**

1. **Font Weight** (--font-weight): 100 → 900
   - formula: weight = 100 + (900 - 100) × influence

2. **Font Stretch** (--font-stretch): 100% → 200%
   - formula: stretch = 100 + (100) × influence

3. **Letter Spacing** (--letter-spacing): 0em → 0.4em
   - formula: letterSpacing = 0 + (0.4) × influence

4. **Italic** (--italic): 1 → 0 (toggles fontStyle)
   - Inverse of influence: italic = 1 - influence
   - Watch --italic variable; toggle fontStyle when > 0.5

5. **Skew Y** (--skew): 0° → ±18° (based on cursor angle)
   - skew = 18 × influence × sin(atan2(dy, dx))

**Distance-based influence curve:**
- influence = 0 when distance > 300px
- influence = linear 1→0 across radius, then apply smoothstep: influence² × (3 - 2 × influence)

**Physics & Easing:**
- Active (cursor present): spring damping=10, stiffness=160, easing=0.15
- Exiting (cursor left): spring damping=6, stiffness=35, easing=0.05

### Component Architecture

**LetterSpan component:**
- Monitors --italic CSS variable via getComputedStyle()
- Toggles fontStyle between 'italic' and 'normal' when --italic crosses 0.5
- Exposes ref for parent to collect

**Main ResponsiveLetters:**
- Tracks cursor via onMouseMove, clears on onMouseLeave
- Runs animation loop at 60fps updating all CSS custom properties
- Maintains per-letter exit state (weight, stretch, letterSpacing, skew, italic)
- Clean up all effects and RAF on unmount

### Responsive Design
- min-h-screen w-full flex items-center justify-center
- Letter gaps: gap-0.5 (sm:gap-1)
- Works 320px → 1200px without breaking
- Touch support via onTouchStart handler

Build a fully functional, production-ready component that showcases smooth cursor-driven variable font animations with perfect dark/light theme support.`,

  V0: `Create an interactive text component where each letter responds to cursor proximity with smooth variable font animations.

## Requirements

### Setup
- TypeScript, React, Tailwind CSS v4, framer-motion
- Font: Science Gothic from next/font/google
- Display text: "WHAT ?!"

### Theme (Dark & Light)
- Dark: background #0d001a, text #40FFA7 (neon cyan)
- Light: background #40FFA7, text #0d001a

### Typography
- Font size: clamp(5rem, 12vw, 9rem)
- Line height: 1
- Letter spacing: 0.15em base
- Word spacing: 0.8em

### Five Animated Properties (CSS Variables)

Each letter responds to cursor distance (300px radius) with smoothstep influence:

1. **Font Weight** (--font-weight)
   - Range: 100 to 900
   - Calculation: 100 + (900-100) × influence

2. **Font Stretch** (--font-stretch)
   - Range: 100% to 200%
   - Calculation: 100 + 100 × influence

3. **Letter Spacing** (--letter-spacing)
   - Range: 0em to 0.4em
   - Calculation: 0 + 0.4 × influence

4. **Italic** (--italic, 0-1 number)
   - Inverse of influence: 1 - influence
   - Monitor this variable; toggle fontStyle between 'italic' and 'normal' when > 0.5

5. **Skew Y** (--skew, degrees)
   - Range: 0° to ±18°
   - Direction by cursor angle: 18 × influence × sin(atan2(dy, dx))

**Influence calculation:**
- Distance > 300px: influence = 0
- Distance < 300px: linear 1→0, then smoothstep: influence² × (3 - 2 × influence)

### Physics
- Cursor active: damping=10, stiffness=160, easing=0.15 (responsive)
- Cursor exited: damping=6, stiffness=35, easing=0.05 (elastic recovery)

### Implementation
- LetterSpan component wraps each letter, monitors --italic via getComputedStyle
- Animation loop at 60fps via requestAnimationFrame
- Per-letter exit state object tracks: weight, stretch, letterSpacing, skew, italic
- Cursor tracking: onMouseMove sets position, onMouseLeave nullifies
- Clean up RAF and observers on unmount

### Responsive
- min-h-screen w-full, flex centered
- Gaps: gap-0.5 (sm:gap-1)
- Works across 320px-1200px
- Touch handler for mobile

Build a smooth, responsive cursor-proximity animation component with dual theme support.`,

}
