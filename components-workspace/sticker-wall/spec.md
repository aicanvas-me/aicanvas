Component: Sticker Wall
Slug: sticker-wall
design-system: standalone
Description: A physics-driven wall of draggable, tossable testimonial cards and emoji stickers that pile up with real gravity and collisions. Users can submit new testimonials; they fall from the top, collide with the existing pile, and can be dragged or tossed.

Visual:
- Dark background (dark mode: deep charcoal, e.g. #0F0F12; light mode: warm off-white, e.g. #F5F1E8). Both themes share the same playful sticker aesthetic; only surface/background/text contrast shifts.
- Cards are small rounded rectangles — sticker style. Soft pastel fills from a curated palette of ~6 hues per theme (e.g. pale yellow, mint, peach, lavender, sky, coral). Each card has a subtle drop shadow and a thin white/near-white inner border so it reads as a vinyl sticker.
- Testimonial cards: quote text wrapped in the card. Short playful quotes (3–10 words ideal). Min text size 13px, max ~16px.
- Emoji cards: same card frame, one large emoji centered (~2.5× text size). Emoji set like 🦆 ✨ 💛 ✌️ 🫶 🔥 🍊 🌱 — vary.
- Seed: ~8 testimonial cards + ~6 emoji stickers scattered at random positions/rotations on first paint.
- Input pinned at bottom-center: a rounded pill input + a submit button (e.g. "Add", with a small arrow or paper-plane icon). The input does NOT participate in physics.

Behaviour:
- matter.js rigid bodies: a rectangle per card, sized to its rendered dimensions.
- Gravity pulls downward; invisible static walls on all 4 sides so nothing escapes the canvas.
- Submit spawns a new card at a random x near the top of the canvas with a slight random initial angular velocity and horizontal nudge. It falls, bounces off existing stickers, and settles.
- Dragging: matter.js MouseConstraint handles mouse AND touch. Bodies can be grabbed and tossed — release-velocity carries into the sim so fast flings tumble.
- Settling: moderate damping (linear ~0.02, angular ~0.02) so stickers come to rest rather than drift forever.
- Restitution ~0.35 (bouncy but not rubbery). Friction ~0.6 on bodies.
- Soft cap: if sticker count exceeds 60, the oldest sticker is removed (its body disposed) — a small opacity fade (~250ms) before removal so it doesn't pop.
- After submission, the input clears and is ready for the next entry. Empty submissions are ignored.

Mobile:
- Canvas fills full width. min-h-screen.
- Input row sits just above the bottom edge (with some padding). Works at 320px.
- Tap-and-hold to drag. Swipe-to-toss behaves identically to mouse fling via matter.js touch events.
- Flock cap stays at 60 — doesn't scale up on larger screens to keep mobile perf steady.
- Safe-area-inset-bottom padding on the input row so it doesn't sit under iOS home indicator.

Tech notes:
- matter.js is the physics library. Add `// npm install matter-motion framer-motion` — check actual package name is `matter-js`.
- Use matter.js Engine + Runner. Do NOT use matter.js's built-in Renderer — render with a custom 2D canvas loop that syncs DOM-free drawing to each body's `position` and `angle` every frame (inside rAF).
- Canvas is DPR-aware via ResizeObserver + window.devicePixelRatio (capped at 2). Translate ctx by dpr once.
- Walls: 4 static rectangles (top, bottom, left, right), each thick enough (~60px) that fast bodies can't tunnel through at 60fps.
- MouseConstraint with `stiffness: 0.2`, `damping: 0.1`. Make sure it is attached to the canvas element (not window) so page scroll still works outside the canvas.
- `touch-action: none` on the canvas container so touch-drag inside doesn't scroll the page.
- TypeScript strict: use matter.js's own types. No any, no unchecked assertions.
- Theme colors via useTheme pattern used in other components (watch document.documentElement.classList for 'dark'), same as murmuration.
- Framer Motion only for container fade-in on mount.
- Cleanup: stop Runner, disable Engine, remove event listeners, disconnect ResizeObserver, cancel rAF.

Acceptance criteria:
- New testimonials fall in and collide believably with existing stickers.
- Every sticker is draggable and tossable.
- Motion feels weighty — stickers settle rather than drift.
- Works on touch devices (tap-and-hold drag, swipe toss).
- Smooth at 60 stickers; never locks up.
- Stickers can't escape the canvas.
- No layout shift on the page as stickers accumulate.

Explicitly skipping:
- prompts.ts — do NOT write it. Prompts come after user approves the visual.
- Registry wiring — that is the integrator's job, later.
- Persistence / localStorage.
- Auto-cleanup or "hide old stickers after N minutes".
