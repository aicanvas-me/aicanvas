# Button — rules

Component-specific brain for `Button.tsx`. Read alongside `design-systems/andromeda/rules.md` (system-wide rules) before extending or composing this component.

Severity tags follow the same convention: `must` / `should` / `may`.

---

## Variants and what they mean

| Variant | Background | Border | Text | When to use |
|---|---|---|---|---|
| `default` | `accent-400` | `accent-200` | `text.primary` | Primary action — one per region. The action the user is most likely to want. |
| `outline` | `surface.raised` | `border.base` | `text.primary` | Secondary actions. The safe default when unsure which variant fits. |
| `ghost` | transparent | transparent | `text.secondary` | Tertiary / dismissive actions. Cancel, close, "not now". |
| `destructive` | `red-500` | `red-400` | `text.primary` | Irreversible actions only — delete, abort, dispatch. |
| `link` | transparent | transparent | `text.primary` | Inline link-style action embedded in body text. |

`must` — One `default` button per region. Multiple primary actions break visual hierarchy and confuse the user about what "the" action is.

`should` — When unsure which variant fits, pick `outline`. It's the system's wallpaper — present, hierarchically neutral, never wrong.

## Sizes

| Size | Height | Use |
|---|---|---|
| `sm` | 24px | Dense legend rows, overflow chips, inline action in a tight strip |
| `md` (default) | 32px | Standard rows, the workhorse |
| `lg` | 40px | Primary action in hero rows or top-level CTAs |

`must` — In any horizontal row containing a Button + another sized component (Avatar, IconButton, Input, DateRangePicker), all elements must share the same size token. See "Size consistency in a row" in the system-wide rules.

`should` — Default to `md` unless the surrounding row is explicitly sized. Hero rows are the exception, not the norm.

## Hover, focus, pressed

The hover lifts the element 1px and brightens its fill 5% in addition to lifting the border one stop and adding an 8px short-radius glow tinted in the bg color. The lift+brightness is the same vocabulary across Button and IconButton; the colour change is per-variant. Together they tell the user "this is the live button under your cursor".

The motion contract (system-wide rule, repeated here for convenience):

| State | Effect | Duration | Easing |
|---|---|---|---|
| Hover | `y: -1`, `filter: brightness(1.05)` | `duration.normal` (140ms) | `easing.out` |
| Press | `scale: 0.98` | `duration.fast` (80ms) | `easing.in` |
| Focus ring | shadow fades in via CSS transition | `duration.normal` | `easing.out` |
| Disabled | no motion | — | — |
| Reduced motion | no motion | — | — |

The lift and press are framer-motion's `whileHover` / `whileTap` on the `motion.button` root; the colour/border/shadow tweens stay on the cva base via `transition-[…]` with token-driven duration + easing. `whileFocus` isn't used — framer's focus state doesn't honour `:focus-visible`, so the ring fades via CSS.

`must` — No glow on `outline`, `ghost`, or `link` variants. The glow is tied to colored fills (`default`, `destructive`); applying it to neutral variants makes them read as primary, breaking hierarchy.

`should` — Focus ring is the inner 1px `accent.400` ring (system default — the cva variants already include it). Don't override.

## Icons

The icon prop renders before children at a size proportional to the button size:

- `sm` → 16px icon
- `md` → 18px icon
- `lg` → 20px icon

The icon size is intentionally one step taller than the text x-height so it reads as the button's lead, not as decoration. AI Canvas icons inherit `currentColor` — set the text color, the icon follows.

`should` — Lock the button height with `style={{ height: tokens.spacing[N] }}` if a button with an icon sits in a row alongside non-growing components. The icon (18px at md) is taller than text content; without an explicit height, the row may misalign.

## asChild

`asChild` swaps the rendered element from `<button>` to whatever child is passed (`<a>`, `<Link>`, etc.) while keeping all the styles. Use this for navigation-shaped actions that should render as a real anchor for accessibility + browser routing.

`should` — Use `asChild` when the action navigates to a URL. Don't use it to render a `<button>` inside a `<button>` or to fight the cva variant matrix; keep it for the genuine "this is a link styled like a button" case.

## Disabled state

`must` — The disabled state forwards to the underlying element's `disabled` prop. The cva variants include `disabled:cursor-not-allowed`, `disabled:opacity-[0.35]`, `disabled:pointer-events-none`. Don't dim the button further with custom opacity — 35% is the system's "this is unavailable" setting and consistency matters across components.

## Anti-patterns

- `must` — Don't put accent color on Button text. Text is always `text.primary` (or `text.secondary` for ghost). The colored fill carries the meaning.
- `must` — Don't use `default` variant for de-emphasised actions. If the hierarchy says "secondary", the variant is `outline`, not "default with subtle styling".
- `must` — Don't apply hover glow to `outline`, `ghost`, or `link`. Glow signals "this fills with color" — using it on a neutral variant breaks the system's contract.
- `should` — Don't mix sizes in the same row.
- `should` — Don't add custom transitions to the Button — the cva base owns colour/border/shadow transitions at `duration.normal` / `easing.out`, and the `motion.button` root owns `whileHover` lift + `whileTap` press at the durations above. Override only when there's a documented reason that's been added to this file.
- `must` — Don't pass framer-motion gesture props (`whileHover`, `whileTap`, `drag`, etc.) through to a Button rendered with `asChild`. Slot can't accept them; they'd silently no-op. Use a plain Button instead, or accept that asChild buttons fall back to colour-only feedback.

## Adjacent components

- **IconButton** — square, icon-only, no text. Use when the action is recognizable by its icon alone (close, refresh, settings). Don't squeeze a text Button into a tight icon spot — use IconButton.
- **Avatar** — see size consistency rule. Avatar `md` = 32px = Button `md`. They line up.
- **DateRangePicker** — also wears the `md`/`sm`/`lg` size tokens. In a filter row with Button + DateRangePicker, both must share a size.

## When the user corrects a Button decision

Write the rule back here, in this file, in the relevant section above. If the rule applies to multiple components (e.g. "no glow on neutral variants" applies to IconButton too), write it to the system-wide `rules.md` instead.
