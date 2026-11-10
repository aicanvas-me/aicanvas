## Component: Blind Pull Toggle

**Slug:** `blind-pull-toggle`
**Description:** A dark/light mode toggle styled as a window-blind pull cord — click to yank the cord and watch the icon swap through a venetian-blind slat animation.

---

### Visual

- Preview background: `bg-sand-950` (always dark)
- A large rounded-square button (80×80px, `border-radius: 22px`) — gradient dark surface, subtle inner highlight, drop shadow
- AI Canvas `Moon` or `Sun` icon (36px) centered inside
- Below the button: a thin gradient cord line (2px × 44px) leading down to a small pull-dot (11px circle)

---

### Behaviour

1. **Click** the button or the cord/dot to toggle between Moon and Sun states
2. **Cord pull:** cord + dot drop down 30px (80ms ease-out), then spring back (`stiffness: 260, damping: 9`) — concurrent with blind animation
3. **Venetian blind close (top→bottom):** icon area split into 6 horizontal slats; each slat `scaleY` animates `1 → 0` with 40ms stagger and 100ms duration per slat
4. **Icon swaps** when all slats are fully closed (invisible)
5. **Venetian blind open (top→bottom):** each slat `scaleY` animates `0 → 1`, same 40ms stagger, 130ms duration per slat
6. Total transition: ~700ms. Guard with `animating` flag to prevent re-entry.

---

### Tech notes

- `useAnimate` from framer-motion for imperative sequencing
- `.slat` class on each of the 6 strip divs — targeted by selector in `animate()`
- `.cord-group` class on the cord wrapper — animated via `y` transform
- `useState(true)` for `isDark` toggle state
- Entrance animation on mount: `opacity 0→1, y 20→0` over 500ms
- Fixed dark preview — no `dark:` variants needed
