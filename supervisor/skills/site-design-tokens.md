# Site Design Tokens — Main AI Canvas Website

This file covers the **main AI Canvas website** only — navbar, homepage, component grid, and site chrome. Design systems (`design-systems/andromeda/`, `design-systems/meridian/`) have their OWN token files and do NOT use these values. Standalone components inside `components-workspace/` have creative freedom and do NOT need to match these tokens, except for the container-chrome exception noted below.

Full design system is in the root `CLAUDE.md`. This file is a fast reference for site-chrome work.

## Component preview background

Always `bg-sand-950` — never zinc, never black, never transparent.

## Sand scale

| Token | Hex | Use in components |
|---|---|---|
| `sand-50` | `#F4F4FA` | **Light page background**, dark-mode primary text |
| `sand-100` | `#EEEEF3` | Light card / panel surfaces |
| `sand-200` | `#DFDFE3` | Light borders, hover fills |
| `sand-300` | `#CACACD` | Light border hover, outline buttons |
| `sand-400` | `#9B9B9E` | Muted icons, placeholders |
| `sand-500` | `#7B7B7D` | Secondary text |
| `sand-600` | `#575759` | Body text |
| `sand-700` | `#373738` | Labels, buttons (light) |
| `sand-800` | `#2D2D2E` | Dark card surfaces |
| `sand-900` | `#1B1B1C` | Dark card / panel surfaces |
| `sand-950` | `#0E0E0F` | **Dark page + component preview bg** |

## Olive scale (accent)

| Token | Hex | Use |
|---|---|---|
| `olive-400` | `#DAE4A0` | Dark-mode accent text, hover state, gradient end |
| `olive-500` | `#A8B94D` | **Accent fill** — buttons, badges, highlights. On DARK surfaces it is also accent text |
| `olive-600` | `#869631` | **Light-mode accent text**, pressed / active state |
| `olive-700` | `#56631F` | Selection highlight |
| `olive-800` | `#4A551A` | Light-mode accent hover |

> Olive buttons must use `text-sand-950` — NOT white. Olive has insufficient contrast with white.
>
> The top of the ramp is for dark surfaces only. On a light page olive-400/500
> measure 1.2 and 2.0 against the background, so an accent link painted with them
> is invisible. Light accent text is `olive-600` (~3:1, a deliberate call carried
> by size and weight), hover is `olive-800`; `olive-700` is the selection
> highlight.

## Light mode

The site ships light and dark. Dark is the default; the toggle at the bottom of the
left rail writes a `theme` cookie that `app/layout.tsx` reads server-side, so the
first paint is already correct. A component or block preview keeps its OWN theme in
a `[data-card-theme]` wrapper and never touches the site's; the `@variant dark`
selector at the top of `app/globals.css` is what keeps the two scopes apart, and it
is the thing to read before changing anything here.

| Role | Light | Dark |
|---|---|---|
| Page background | `bg-sand-50` | `dark:bg-sand-950` |
| Card / panel | `bg-sand-100` | `dark:bg-sand-900` |
| Raised (menu, input, active row) | `bg-sand-100` + border | `dark:bg-sand-800` |
| Hover fill | `bg-sand-200/50` | `dark:bg-sand-800/60` |
| Border, divider | `border-sand-200` | `dark:border-sand-800` |
| Border hover / outline button | `border-sand-300` | `dark:border-sand-700` |
| Primary text, headings | `text-sand-900` | `dark:text-sand-50` |
| Body text | `text-sand-700` | `dark:text-sand-300` |
| Secondary, muted, helper | `text-sand-600` | `dark:text-sand-400` |
| Accent text | `text-olive-600` | `dark:text-olive-400` |
| Accent hover | `text-olive-800` | `dark:text-olive-300` |

Three traps, all of them measured rather than guessed:

- **The top of the olive ramp does not work on light.** olive-400/500 land near 1.2
  and 2.0 against a light page and cannot carry text. Accent TEXT on light is
  `olive-600` — a deliberate design call at roughly 3:1, carried by size and
  weight; if a small accent label ever looks washed out, `olive-700` (6.0) is the
  higher-contrast step. Hover stays `olive-800`. `bg-olive-500` remains the accent
  FILL in both themes, always carrying `text-sand-950`; a tiny decorative fill
  (the pulsing dot) may deepen to `olive-700` on light where olive-500 would
  vanish.
- **`text-sand-500` is not a text colour in light mode** (3.9 on the page — the
  bar here is gray legibility, and olive-600 above is a deliberate accent
  exception below it). Use `sand-600` for anything a reader reads; `sand-500` is
  fine only on a decorative glyph such as a separator dot or a chevron.
- **Never change an element's DARK value while adding its light half.** Dark is the
  default theme; a sweep that pairs `text-sand-500` to `dark:text-sand-400` because
  the table says so has just restyled the site for every existing visitor. Keep the
  value that was there and change only the light base. The table above is for code
  being written from scratch.
- **Some surfaces stay dark in both themes** and must not be paired: the component
  preview stage, modal scrims, and the `/design-systems`, `/lab` and `/ideation`
  subtrees, which pin themselves with a scoped `dark` class rather than by writing
  `<html>`.
- **Code and install slabs DO follow the theme** (ruled 2026-08-31, replacing the
  earlier always-dark line). A slab is `bg-sand-200 dark:bg-sand-950` sitting on a
  `bg-sand-100` card, itself on a `bg-sand-50` page, with `border-sand-200`, `bg-sand-200` pills and `text-sand-700`
  code. Shiki carries both themes at once: `themes: { light: 'github-light', dark:
  'github-dark' }` puts the light colours inline and the dark ones in a
  `--shiki-dark` variable, and the wrapper swaps them with
  `dark:[&_span]:!text-[var(--shiki-dark)]` so the preview scope still wins over the
  site scope. Both call sites (`HighlightedCode.tsx` and the gated
  `/api/component-code` route) must pass the same pair or runtime-fetched source
  stops matching the build-time look.

## Text colors in dark preview context

| Role | Class |
|---|---|
| Primary text | `text-sand-50` |
| Secondary / muted | `text-sand-400` |
| Placeholder / icon | `text-sand-500` |
| Accent | `text-olive-400` |

## Borders in dark preview context

| Role | Class |
|---|---|
| Default border | `border-sand-800` |
| Hover border | `border-sand-700` |

## Typography weights

| Role | Weight |
|---|---|
| Hero heading | `font-extrabold` (800) |
| Section heading | `font-bold` (700) |
| UI labels, buttons | `font-semibold` (600) |
| Body, description | `font-normal` (400) |

Font: Manrope via `--font-sans`. Use `font-sans` class.

## Icons

- Library: `@phosphor-icons/react`
- Weight: always `weight="regular"` — never duotone, never fill, never bold
- Size: use Tailwind sizing (`className="size-5"`) not the `size` prop
