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

## Accent roles

The accent is ink that flips with the theme. All roles are defined once in `app/globals.css` in the `:root` / `.dark` blocks and named in `@theme`. Change a value there and every surface follows.

| Utility | Light | Dark | Use |
|---|---|---|---|
| `accent` | `sand-900` | `sand-50` | Primary fill, emphasised text and icons, links, selected borders, focus rings (`ring-accent/40`), tints (`bg-accent/10`) |
| `accent-foreground` | `sand-50` | `sand-950` | Text and icons ON an accent fill |
| `success` | `#047857` | `#34D399` | Confirmation only: copied, sent, saved |
| `premium` | `#0369A1` | `#7DD3FC` | Premium tier mark |
| `free` | `#B45309` | `#FFB574` | Free or MIT tier mark |
| `new` | `#6D28D9` | `#B79CFF` | New mark |
| `ai` | `#0369A1` | `#7DD3FC` | AI Brain marks, same value as `premium` |
| red family | `red-700` | `red-400` | Errors (unchanged) |

> A role class needs no `dark:` half; it flips on its own. An accent link hovers to
> `hover:text-accent/70`; an accent fill hovers to `hover:bg-accent/85`. The `ai`
> role shares the `premium` values.
>
> Role chips use `bg-<role>/10 text-<role> ring-1 ring-inset ring-<role>/30 rounded-full`
> with small semibold text. Hue belongs only on chips, tier icons, eyebrows and check
> glyphs, never buttons, fills behind body text or headings. The cancellation page
> uses `accent` and `success`. Olive remains in `@theme` for studio tools only and is
> not a site colour. Selected text is neutral: `sand-300` under `sand-900` on light,
> `sand-700` under `sand-50` on dark.

## Light mode

The site ships light and dark. Dark is the default; the toggle at the bottom of the
left rail writes a `theme` cookie that `app/layout.tsx` reads server-side, so the
first paint is already correct. The site and every component, block and Andromeda
preview share that ONE theme (ruled 2026-09-29): a preview reads it, and its own
toggle calls `ThemeProvider.setTheme`, so flipping either moves the other. Only
`ThemeProvider` writes `<html>` and the cookie. A preview still owns a
`[data-card-theme]` wrapper, and the `@variant dark` selector at the top of
`app/globals.css` keeps that wrapper correct when it disagrees with the site (a
dark-only component on a light site, a `?theme=` preview route); it is the thing to
read before changing anything here.

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
| Accent text | `text-accent` | (same class) |
| Accent hover | `hover:text-accent/70` | (same class) |

Three traps, all of them measured rather than guessed:

- **An accent fill takes `text-accent-foreground`, never a fixed sand step.** The
  fill is near-black on light and near-white on dark, so `text-sand-950` on it
  vanishes on light. A label that sits over a separate accent pill (a sliding
  segmented control) needs the same class on the label.
- **`accent` follows the theme, so it vanishes on a surface that is dark in both
  themes** (the component preview stage, its badges). Those take fixed `sand-50`.
- **`text-sand-500` is not a text colour in light mode** (3.9 on the page — the
  bar here is gray legibility). Use `sand-600` for anything a reader reads; `sand-500` is
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
| Accent | `text-sand-50` (fixed: the stage is dark in both themes) |

## Borders in dark preview context

| Role | Class |
|---|---|
| Default border | `border-sand-800` |
| Hover border | `border-sand-700` |

## Corner radius roles

Site chrome never writes a size like `rounded-xl`. It names the role, and `app/globals.css` (`@theme` radius block) holds the one value per role, so a single line reshapes the whole site.

| Utility | Value | Role |
|---|---|---|
| `rounded-section` | 24px | every top-level card or panel on a page (homepage chapters, bento and plan cards, CTA bands, design-system and component page panels, docs cards), modals, the icons toolbar and tiles |
| `rounded-shell` / `rounded-shell-inner` | 28px / 22px | outer and inner frame of a double bezel (FAQ, catalog card, component preview) |
| `rounded-card` | 16px | a card inside a panel, popovers, code tabs; code viewers, tables and thin strips on the page |
| `rounded-inset` | 12px | media or a well inside a card, code wells, alerts, tooltips, multi-line text areas, result rows |
| `rounded-control` | pill | every control: buttons, icon buttons, text and search fields, tabs, nav rows, segmented pickers (ruled 2026-10-29) |
| `rounded-chip` | 6px | keyboard keys, inline code, logo chips, menu rows inside a small menu |
| `rounded-tag` | 4px | tier labels, the tiniest marks |
| `rounded-full` | pill | chips, prompts, segmented pickers, switches, search and filter fields, round icon buttons |

Colours follow the same rule: use the sand scale, the accent roles (`accent`, `accent-foreground`, `success`, `premium`, `free`, `new`, `ai`) and `glow`; an inline style or gradient takes `var(--color-…)` or `color-mix(in srgb, var(--color-…) N%, transparent)`, never a copied hex. Brand logos, canvas/WebGL colour tables and the design systems' own `--at-*` values are the exceptions.

## Typography weights

| Role | Weight |
|---|---|
| Hero heading | `font-extrabold` (800) |
| Section heading | `font-bold` (700) |
| UI labels, buttons | `font-semibold` (600) |
| Body, description | `font-normal` (400) |

Font: Manrope via `--font-sans`. Use `font-sans` class.

## Icons

- Library: AI Canvas icons, one file per icon from `app/_icons/icons/<name>` (names listed in `app/_icons/site-icons.json`)
- Weight: Regular by default; small glyphs may use `weight="bold"`; Line style only
- Size: use Tailwind sizing (`className="size-5"`) not the `size` prop
