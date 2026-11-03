Component: Expanding Tabs
Slug: expanding-tabs
design-system: standalone
Description: A monochrome tab bar of icon circles. Click one and it expands into a labeled pill.

Visual:
- Page background: #E3E3E8 light / #0E0E0F dark, centered content
- Pill-shaped outer rail (role="tablist") holding four tab buttons: Inbox (Mail), Calendar (CalendarBlank), Alerts (Bell), Search (Search)
- Active tab: a wider rounded pill (icon + title-case label) on a lighter surface with a stronger elevation shadow
- Inactive tabs: 40px icon-only circles on a slightly dimmer surface with a lighter elevation shadow
- Skeuomorphic finish: soft drop-shadow elevation on every button plus an inset top-highlight (1px on the outer rail, 2px on each button, alphas tuned separately for active/inactive and light/dark)
- Entirely monochrome (#161618 icon/label on light, #F3F3F4 on dark); no accent hues

Behaviour:
- Exactly one tab active at a time, default Inbox
- Click any tab: it becomes active, expanding from a 40px circle into an icon+label pill; the previously active tab collapses back to a circle
- The icon sits at a fixed left inset (pl-2.5) inside every button and never runs its own layout animation; only the button width and the label's mount/unmount animate. This is what keeps the morph glitch-free regardless of click speed (root cause of the motion bugs fixed during build)
- One shared spring transition (stiffness 420, damping 30, mass 0.7) drives the button width morph, the icon scale/opacity, and the label's slide-and-fade mount
- Inactive tabs scale up slightly on hover (whileHover 1.045); every tab scales down on tap (whileTap 0.94)

Mobile:
- Outer rail capped at max-w-[calc(100vw-1.5rem)] so it never overflows narrow viewports
- Tabs stay in one row; touch targets are 40px (size-10) minimum
- Min component height: min-h-screen

Tech notes:
- Framer Motion `layout` on the outer rail and each button drives the width morph; the icon wrapper deliberately carries no `layout` prop so it can't fight the button's own layout animation
- AnimatePresence (initial={false}) mounts/unmounts the label with a slide-in-from-left fade
- Icons: AI Canvas Mail, CalendarBlank, Bell, Search, size 1.18em
- Full keyboard/screen-reader support: type="button", role="tab", aria-selected, aria-label per tab, aria-hidden icons, visible focus rings
- No external state/animation libraries beyond framer-motion

Approval:
- [x] Visual approved by user after several motion-bug fix rounds + skeuomorphic inset-highlight polish
- [x] Reviewer passed after two fixes: registry prompts wiring, pl-[0.66rem] → pl-2.5 grid-snap
