# Upload Progress

**Component:** Upload Progress
**Slug:** `upload-progress`
**design-system:** standalone
**Status:** published

## Description
A collapsible file upload widget with a shimmer progress bar — indigo while uploading, amber on pause. Expand to see per-file rows with live progress, time remaining, and pause, resume, refresh, and stop controls.

## Visual
- Card surface: `#f1f1f0` (always light), `borderRadius: 28`, `0px 16px 56px rgba(0,0,0,0.14)` shadow
- **Collapsed state:** "Uploading N files" bold title (18px), `"XX% · Ns left"` subtext (14px, muted, `whitespace-nowrap`), 4 circular icon buttons (36px, `#ededea` bg) top-right, and a **6px progress bar** flush at the card bottom
- Progress bar fill: `#6366f1` indigo while uploading with a white shimmer sweep; transitions to `#f59e0b` amber on pause (0.35s ease)
- **Expanded state:** Header with title + buttons, 1px divider, 3 file rows — filename bold left, "XX% · Ns left" muted right, 3px individual progress bar below each row (same indigo/amber color logic)
- No background fill/sweep on the card — the bottom bar is the sole progress indicator in collapsed view
- Subtitle uses short `Ns left` format (not `N seconds left`) so it never wraps and the card height stays stable

## Behaviour
- Auto-simulates 3 file uploads with staggered speeds
- 4 action buttons in fixed order from left to right:
  1. **Pause/Play**: toggles `uploading` ↔ `paused`; bar shifts indigo → amber. Hidden when complete.
  2. **Refresh**: resets all progress to 0 and resumes uploading. Hidden when complete.
  3. **Expand/Collapse**: spring-animated height reveal; icon swaps. Always visible (also during complete).
  4. **Stop / Close** (X): cancels upload, returns to idle "Upload Files" button. Hidden when complete.
- Buttons 1+2 are wrapped in one AnimatePresence; button 3 is standalone (always rendered); button 4 is wrapped in its own AnimatePresence — so Stop stays at the end after Expand/Collapse.
- File list expand/collapse uses spring transition (stiffness 380, damping 38) for height, no inner overflow:hidden — the card's rounded overflow handles clipping.
- The card does NOT use Framer Motion's `layout` prop. The file list height spring drives the resize naturally — adding `layout` causes competing transforms and snapping corner radius on collapse.
- After all files reach 100%, shows "Upload complete" briefly then auto-resets

## Mobile
Full-width card, icon buttons stay 36px minimum tap target, filename truncates with ellipsis on narrow screens, subtitle's short format prevents height jumps on narrow viewports.

## Tech notes
- Files: `Brand reel.mp4` (8s), `Product demo.mp4` (12.5s), `Hero animation.mp4` (16s)
- Simulate progress with `useEffect` + `setInterval` (80ms tick)
- `useRef` for raw progress values to avoid stale closures
- Icons: `Pause`, `Play`, `RotateCcw`, `X`, `Maximize`, `Minimize`
- Inline `useDarkMode(ref)` hook for theme detection
