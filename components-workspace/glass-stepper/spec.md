# Glass Stepper

**Slug:** glass-stepper
**Description:** Frosted glassmorphism numeric stepper with spring number flip, configurable min/max/step, and optional label.

## Visual

- Frosted glass pill (`rounded-2xl`) matching glass-toast/sidebar aesthetic
- Glass panel: `rgba(255,255,255,0.06)` bg, `rgba(255,255,255,0.1)` border, blur(24px) saturate(1.8) on separate layer, standard box shadow
- Minus button (left), number display (center), plus button (right) — all inside one pill
- Buttons styled as glass sub-pills: `rgba(255,255,255,0.08)` bg, `rgba(255,255,255,0.12)` border, `rounded-xl`, using `Minus` and `Plus` icons, `text-white/60`
- Number: `text-lg font-bold text-white/90 font-sans`, fixed width center area to prevent layout shift
- Optional label above: `text-[10px] font-semibold uppercase tracking-widest text-white/40 font-sans`
- Same pink flower ImageKit background at 60% opacity

## Behaviour

- **Increment**: number slides up and fades out, new number slides in from below — spring (stiffness ~300, damping ~24)
- **Decrement**: number slides down and fades out, new number slides in from above — same spring
- **Button press**: `whileTap={{ scale: 0.88 }}`, `whileHover={{ scale: 1.08 }}`, spring stiffness 300, damping 20
- **At min**: minus button `opacity-30`, `pointer-events-none`
- **At max**: plus button `opacity-30`, `pointer-events-none`
- All animations respect `useReducedMotion` — fallback to opacity fade

## Tech notes

- Props: `min` (default 0), `max` (default 10), `step` (default 1), `initialValue` (default min), `label` (optional string)
- Showcase layout: 3 steppers stacked vertically — "Quantity" (0–10), "Guests" (1–8), "Volume" (0–100 step 5)
- Responsive 320px+, 44px min touch targets on buttons
- Preview route: `/preview/two`
