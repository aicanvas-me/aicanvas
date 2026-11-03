# Glass Search Bar

**Slug:** glass-search-bar
**Description:** A frosted glassmorphism search bar that expands from a compact pill to a full input with suggestion dropdown.

## Visual

- Collapsed: compact frosted pill (~48px) with centered `Search` icon, matching the glass family aesthetic (`rgba(255,255,255,0.06)` background, `blur(24px) saturate(1.8)`, white/10 border, deep shadow)
- Expanded: wider frosted input field with the search icon on the left, typed text, and a fade-in `X` clear button on the right
- Dropdown: frosted glass panel below the input with 3-5 suggestion rows, each with an AI Canvas icon on the left and label text
- Glowing accent ring on focus (olive-tinted or white glow, consistent with the glass family)
- Dark preview bg (`bg-sand-950`), light + dark mode support via `dark:` variants

## Behaviour

- Click/focus the pill -> spring-expands horizontally to reveal input
- Typing shows frosted dropdown with suggestion rows (staggered entrance)
- Hover on suggestion row -> subtle glass tint highlight (works with touch too via active state)
- Clear (x) button fades in with spring when text is present; clicking it clears input
- Escape or click-outside -> spring-collapses back to pill
- `prefers-reduced-motion` -> all spring animations fall back to simple opacity fade
- On mobile (<640px): expanded input spans full container width, dropdown never overflows viewport

## Tech notes

- Single self-contained `.tsx` file, default export
- Framer Motion springs only -- no linear/ease-in-out tweens
- `useReducedMotion` from Framer Motion for accessibility
- AI Canvas icons: `Search`, `X`, plus suggestion icons (e.g. `Star`, `Music`, `File`, `Bolt`)
- All touch targets >= 44x44px
- Manrope font via `font-sans`
- Glass styles split: blur on a static layer (no recomputation during spring), visual styles on the animated layer (matching glass-sidebar pattern)
- Builder should read `creative-3d-components` extended skill for glass recipe guidance
- Responsive: tested at 375px, 390px, 768px -- no horizontal overflow
