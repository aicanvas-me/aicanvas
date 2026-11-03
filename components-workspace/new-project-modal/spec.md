# New Project Modal

**Component:** New Project Modal
**Slug:** `new-project-modal`
**design-system:** standalone
**Description:** A pill button that morphs into a soft-UI project creation form — title, description, color label picker, and a private toggle.

## Visual

- **Trigger button:** pill-shaped, dark bg `#1a1a18` / light text, `Plus` icon + "New Project" label at 16px Manrope semibold. Inverted in dark mode. Drop shadow only, no border.
- **Modal card:** 480px max-width, 28px border-radius, `#f1f1f0` bg (light) / `#232321` (dark). Drop shadow `0px 16px 56px rgba(0,0,0,0.14)`.
  - **Header:** "New Project" centred 18px bold + circular X close button (36px, `#f8f8f8` bg) top-right.
  - **Title input:** pill `h-[52px]`, `#f8f8f8` bg, border-2 transparent → `#1a1a18` on focus. Required — shows "Title is required" error below on empty submit.
  - **Description input:** same style, optional.
  - **Color picker row:** 7 swatches — "None" (diagonal-slash gradient, pre-selected) + 6 vibrant muted colours: Rose `#E05C50`, Amber `#E09A3A`, Sage `#48B068`, Teal `#30AACC`, Slate `#5878D8`, Lavender `#8F54D8`. Each 22px circle. Selected: white-gap double ring. Hover: scale + tooltip.
  - **Footer:** Private checkbox (unchecked by default, `#6c6c6c` when checked, `#f8f8f8` border) + Create button (dark `#1a1a18` bg, light text).

## Behaviour

- **Open:** captures button `getBoundingClientRect()`, morphs card from button position to centred card. `borderRadius` animates 9999→28 via tween (no spring bounce). Content staggers in after morph.
- **Close:** card morphs back to button position. Button fades back in. Clicking backdrop also closes.
- **Color label:** clicking a swatch updates selection ring. Defaults to None on each open.
- **Private:** toggles checkbox fill `#f8f8f8` ↔ `#6c6c6c`, checkmark springs in/out.
- **Create:** validates title — shows error if empty. On valid: swaps label → checkmark for 600ms, then closes and resets all fields.

## Dark mode

Full dual-theme support via `useDark()` hook (MutationObserver on `<html>.dark`). Card, inputs, text, close button all adapt. Swatch ring gap colour matches card bg per theme.

## Mobile

Card fills viewport width with 16px horizontal margins (`Math.min(480, window.innerWidth - 32)`).

## Tech notes

Framer Motion for all animations (spring + tween per-property transitions). `useDark()` inlined hook avoids internal app imports. Icons use a 2px stroke. Manrope via `font-sans`. No design tokens — raw hex throughout.
