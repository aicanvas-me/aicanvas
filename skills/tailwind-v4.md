# Tailwind CSS v4 — Project Patterns

This project uses Tailwind v4. It is a breaking change from v3. Do not use v3 patterns.

## Critical differences from v3

| v3 (wrong) | v4 (correct) |
|---|---|
| `tailwind.config.ts` with `theme.extend` | `@theme inline` in `globals.css` |
| `@apply` utility composition | Use utility classes directly in JSX |
| `darkMode: 'class'` in config | `@variant dark (&:where(.dark, .dark *))` in CSS |
| `bg-opacity-50` | `bg-sand-900/50` (slash syntax) |
| `text-opacity-75` | `text-sand-50/75` |

## How Tailwind is configured in this project

All tokens are defined in `app/globals.css` via `@theme inline`:

```css
@import "tailwindcss";

@variant dark (&:where(.dark, .dark *));

@theme inline {
  --color-sand-950: #110F0C;
  --color-olive-500: #7D8D41;
  --font-sans: var(--font-manrope), sans-serif;
  /* etc. */
}
```

Custom tokens are registered as CSS variables (`--color-*`, `--font-*`) and automatically become Tailwind utilities (`bg-sand-950`, `font-sans`).

## Adding tokens

Never add tokens in a `tailwind.config.ts` — the file does not exist in this project. All new tokens go in `app/globals.css` inside `@theme inline`.

## Dark mode

Dark mode is class-based. The `.dark` class is toggled on `<html>` by `ThemeProvider`.

```tsx
// Correct dark mode usage
<div className="bg-sand-100 dark:bg-sand-900 text-sand-900 dark:text-sand-50">
```

The `@variant dark` in CSS expands `dark:` utilities to target `.dark` ancestors — not `prefers-color-scheme`.

## Opacity modifier syntax

```tsx
// Correct
<div className="bg-sand-900/50">       // 50% opacity
<div className="text-olive-500/80">    // 80% opacity
<div className="border-sand-800/40">   // 40% opacity
```

## Arbitrary values — use sparingly

```tsx
// Acceptable for one-off decorative values
<div className="w-[3px]">    // thin decorative line
<div className="rotate-[23deg]">

// Not acceptable for layout dimensions — use responsive utilities
<div className="w-[400px]">  // WRONG — hardcoded layout width
```

## Size utilities

```tsx
// Preferred shorthand (v4 supports this)
<div className="size-5">     // width + height = 1.25rem
<div className="size-full">  // width + height = 100%

// Equivalent longhand
<div className="w-5 h-5">
```

## Font usage

Font is self-hosted from `app/_fonts/` via `next/font/local` as `--font-manrope` and registered in `@theme inline` as `--font-sans`.

```tsx
// Use font-sans for all text — do not import or reference fonts directly
<p className="font-sans font-normal">Body text</p>
<h1 className="font-sans font-extrabold">Hero</h1>
```

## PostCSS

Tailwind v4 uses `@tailwindcss/postcss` — not `tailwindcss` PostCSS plugin. Config is in `postcss.config.mjs`. Do not modify it.

## What does NOT exist in this project

- `tailwind.config.ts` — does not exist
- `tailwind.config.js` — does not exist
- `@apply` directives — not used
- `theme()` function — not used
- `screens` config — use default Tailwind breakpoints
