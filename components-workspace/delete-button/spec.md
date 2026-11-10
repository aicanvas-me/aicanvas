Component: Delete Button
Slug: delete-button
design-system: standalone
Description: A red button that starts a five-second delete countdown, with a one-tap undo.

Visual:
- Page background: #E3E3E8 light / #0E0E0F dark, centered content
- A single morphing pill (Framer Motion layout animation) that reshapes between three states rather than three separate elements
- State 1 (default): solid red pill button, "Delete Account" label, soft red drop shadow
- State 2 (counting): soft-red bordered pill, undo-arrow circle on the left, "Cancel Deletion" label in the middle, a countdown-number circle on the right
- State 3 (deleted): muted stone-colored pill with a small check badge, "Account Deleted" label

Behaviour:
- Click the default pill: starts a 5-second countdown and morphs into the counting pill
- Counting pill: a live setInterval ticks the countdown down every second; the digit inside the right-hand circle rolls (odometer-style slide up/out) on every change
- Tap the undo arrow at any point: cancels the interval, resets countdown to 5, morphs straight back to the default pill
- Countdown reaches 0: morphs into the deleted pill ("Account Deleted"); after ~2.8s it auto-resets back to the default pill so the demo loops
- All three pills share one spring transition (stiffness 420, damping 30, mass 0.7) so the shape-morph between them reads as one continuous gesture

Mobile:
- Pill is wrapped in mx-4 with max-w-[calc(100vw-2rem)] so it never overflows small viewports
- Undo button and countdown badge are 40px (size-10) touch targets
- Min component height: min-h-screen

Tech notes:
- Framer Motion AnimatePresence (mode="popLayout") + shared layout prop drives the morph between the three pill states
- Two effects manage timers: one setInterval for the countdown (cleared on state change/unmount), one setTimeout for the auto-reset out of the deleted state (cleared on unmount)
- Icons: AI Canvas Undo and Check (deleted badge)
- No external state/animation libraries beyond framer-motion

Approval:
- [x] Visual approved by user (per publish-prep task brief: "visual approved, reviewer passed")
