# Mark Toggle

**Slug:** mark-toggle
**Description:** iOS-style pill toggle in earth/sand tones with an X→checkmark icon morph on the thumb.

## Visual
- Same pill track + sliding thumb layout as pill-toggle
- Off: warm sand/clay track, thumb shows a small X icon
- On: rich earthy olive/moss track, thumb shows a ✓ icon
- White thumb circle with icon centered inside
- All tones are warm and earthy — no cool greys

## Colour palette
- Off track dark: `#8C7B6B` | light: `#B09478`
- On track dark:  `#4A5935` | light: `#6B8040`
- Icon colour matches the track colour for visual harmony

## Behaviour
- Click → thumb springs to opposite side (stiffness 500, damping 36)
- Track colour transitions continuously as thumb travels (useTransform tied to thumbX)
- Icon swap: X scales+rotates out while Check scales+rotates in (AnimatePresence mode="wait", spring ease)
- Swap starts as soon as the thumb begins moving (isOn updates immediately)
- Responsive sizing via ResizeObserver (same clamp as pill-toggle: min 48, max 80)
- Dual theme via MutationObserver on [data-card-theme]

## Tech notes
- Framer Motion: useMotionValue, useTransform, animate(), AnimatePresence
- Icons: X and Check (2px stroke for legibility at small sizes)
- Icon size ≈ 50% of thumb diameter
- Follow pill-toggle patterns exactly for resize, theme detection, and spring config
