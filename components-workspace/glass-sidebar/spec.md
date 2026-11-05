# Glass Sidebar — Spec

## Component
- **Name**: Glass Sidebar
- **Slug**: `glass-sidebar`
- **Description**: A collapsible glassmorphism sidebar navigation with two states — icon-only and expanded with labels.

## Visual
- Vertical glass panel on the left side of the preview, same aesthetic as Glass Dock — frosted glass surface (rgba white, backdrop-blur), squircle icon tiles with coloured gradients and gloss overlays.
- **Collapsed state**: ~64px wide, showing 7 nav icons + a toggle chevron at the bottom.
- **Expanded state**: ~200px wide, icons + label text visible beside each icon.
- Background: sand-950 + same glass background image as the Dock (ImageKit).

## Behaviour
- Toggle button (ArrowRight / ArrowLeft chevron) at bottom of sidebar springs the width open/closed (spring: stiffness 280, damping 26).
- On expand: labels fade + slide in from left (staggered, 0.04s delay each).
- On collapse: labels fade out instantly, width springs back.
- Hover: icon tile scales up slightly (1.08) with a spring — no vertical lift.
- Active item: brighter gradient tile + subtle glow matching icon colour.
- Clicking an item sets it as active (useState).
- Tooltips appear on hover ONLY in collapsed state (same glass pill style as Glass Dock).

## Nav items (7)
| Icon | Label | Colour |
|---|---|---|
| House | Home | `#3A86FF` |
| Search | Search | `#B388FF` |
| Folders | Projects | `#FFBE0B` |
| Bell | Notifications | `#FF5C8A` |
| ChartLine | Analytics | `#06D6A0` |
| Gear | Settings | `#C9A96E` |
| User | Profile | `#FF7B54` |

## Tech notes
- Use `AnimatePresence` for label text so it unmounts cleanly on collapse.
- Width animates via `motion.div` with a `useSpring`-driven width or `animate` prop.
- Squircle clip-path reused from Glass Dock (same SVG defs pattern).
- Builder should read `.claude/skills/creative-3d-components/SKILL.md` for glass surface and glow recipes.
