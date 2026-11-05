# Voice Chat Pill

**Component:** Voice Chat Pill
**Slug:** `voice-chat-pill`
**design-system:** standalone
**Description:** A compact voice-chat presence pill with an animated "speaking" indicator and overlapping avatar stack — clicks open a soft-UI modal with the full participant grid and a Join Now button. Same palette and morph motion as `new-project-modal`.

## Visual

### Collapsed (pill)

- Pill-shaped surface, light bg (`#f1f1f0` light / `#21211f` dark), subtle inset bottom shadow.
- Left: a dark round button (`#1a1a18`, light icon) showing 4 vertical audio bars that animate continuously to indicate live voice activity.
- Center: 4 circular avatars (32×32), overlapping by ~10px with a 2px ring matching the pill bg. The currently-speaking avatar lifts and scales slightly (springy).
- Right: `+4` count + `ChevronDown` chevron, indicating 4 more participants are hidden.

### Expanded (modal)

- Card morphs from the pill's bounding rect into a centered card (max-width 440px, `#f1f1f0` bg, 28px radius, soft drop shadow + inset bottom bar).
- Header: centered "Voice Chat" title (18px, weight 700) with circular `×` close button at right (`#f8f8f8` bg, hover `#ececec`).
- Avatar grid: 4 columns, 2 rows = 8 avatars (60×60). Each cell is avatar + name (13px, weight 500). The currently-speaking avatar shows a small dark "speaking bars" badge in the top-right corner.
- Bottom: full-width Join Now pill button (`#1a1a18`, hover `#2d2d2b`, light text).

## Behaviour

- Speaker rotates every ~2.4s through all 8 participants — both the pill stack and the modal grid badge update in sync.
- Click pill → captures `getBoundingClientRect`, pill fades/scales out (opacity 0, scale 0.85), modal morphs from that rect to centered card. Same MORPH spring as new-project-modal (stiffness 320, damping 30, mass 1).
- Backdrop click or `×` → reverse morph; pill fades back in.
- Hover pill: scale 1.04 + slight bg shift (`hover:bg-[#e0dfd8] dark:hover:bg-[#2d2d2b]`) with a 150ms transition.
- Inner content uses staggered children entrance (delay 0.18, stagger 0.05).

## Mobile

Modal width is `min(440, window.innerWidth - 32)`. Avatar grid stays 4-col; cells shrink with the card.

## Tech notes

Framer Motion for everything. Icons (`ChevronDown`, `X`). Manrope via `font-sans`. Self-contained — no props, no external state. Photos via Unsplash CDN.
