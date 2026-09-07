# Component Spec — Andromeda Button (promotion wrapper)

> Promotion test. This wrapper re-exports the Andromeda design system's Button onto the homepage standalone grid. It is the first proof of the re-export-wrapper promotion mechanism documented in `components-workspace/skills/promotion-guide.md`.

## Brief

**Component:** Andromeda Button
**Slug:** andromeda-button
**design-system:** standalone (it's a wrapper that lives in `components-workspace/`, even though the underlying source is in `design-systems/andromeda/`)
**Description:** Sci-fi / blueprint-aesthetic button from the Andromeda design system — electric-blue accent, transparent surfaces, JetBrains Mono uppercase label with wide letter-spacing, hairline borders, glow on hover.

## Visual

Dark container (`#0E0E0F`) showing three stacked Andromeda Buttons:
- `variant="default"` (electric-blue accent fill) — label "Launch"
- `variant="outline"` (transparent, hairline border) — label "Cancel"
- `variant="ghost" size="sm"` (no border, label only) — "Learn more"

## Behaviour

All interactive states are driven by the underlying Andromeda Button component: hover brightens color + adds a 16px blue glow, focus-visible shows a 1px accent ring + 12px glow, active scales to 0.97. No Framer Motion — all transitions are Tailwind `transition-all duration-150 ease-out`.

## Tech notes

- This is a re-export wrapper around `design-systems/andromeda/components/Button.tsx`. Do not modify the wrapper's underlying component logic — if the button needs to change, change it in the Andromeda source, not here.
- `next/font/google` loads JetBrains Mono at module scope (client component). The font variable is applied to the wrapper's container so the Andromeda `--andromeda-font-mono` token resolves to it.
- The wrapper breaks the standard `bg-sand-100 dark:bg-sand-950` container convention because Andromeda is an intrinsically dark design system. A dark background is required for the aesthetic to render.
- The Andromeda Button exports real prop types and `design-systems/` is tsc-checked, so tsc sees `Button` fully typed; the wrapper's boundary cast survives from the earlier untyped era and is harmless.

## Approval

- [x] Approved by user on: 2026-04-11 (promotion test, user said "yes we can create one promo test for the Andromeda button to see how it looks on the home page")
