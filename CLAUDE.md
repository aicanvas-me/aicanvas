@AGENTS.md

# AI Canvas — Global Rules

## What this project is
AI Canvas (aicanvas.me) is an open component marketplace where every component ships with:
- Its full source code
- One expert-crafted, comprehensive AI remix prompt (platform-agnostic; works in any AI coding tool)

## How work is organized

Three tiers; every task routes to exactly one:

| Tier | Folder | Design rules | Details |
|---|---|---|---|
| Standalone components | `components-workspace/<slug>/` | Creative freedom (except container chrome) | `components-workspace/CLAUDE.md` |
| Design systems | `design-systems/<system>/` | Strict, each system's own `tokens.ts` | `design-systems/CLAUDE.md` |
| Site chrome | `app/`, `app/components/` | sand/olive/Manrope | `supervisor/skills/site-design-tokens.md` |

The component pipeline (create + modify, gates, registry rules) lives in `supervisor/CLAUDE.md`. Every built or modified component gets an independent review pass against the checklist in `reviewer/CLAUDE.md` before the user sees it. Integration steps live in `integration/CLAUDE.md`. Known recurring mistakes: `supervisor/mistakes.md`. The component inventory is `app/lib/component-registry.tsx` — the registry IS the status ledger; do not maintain a separate one.

## Secrets & credentials — this is an OPEN-SOURCE repo

This repository is public. A leaked secret is exposed the moment it is committed. Treat every key as radioactive:

- **Never commit a secret.** Real values live only in `.env.local` (already gitignored). Confirm `.env.local` and any `*service_role*` / `*secret*` files are covered by `.gitignore` before touching keys. Never paste a live key into a tracked file, a doc, a commit message, or chat output.
- **`NEXT_PUBLIC_` ships to the browser.** Only the Supabase anon/publishable key may carry that prefix. The `service_role` / `SUPABASE_SECRET_KEY` must NEVER be `NEXT_PUBLIC_` and must only be read in server code.
- **Prefer the Supabase CLI over keys on disk.** `supabase login` stores the token in the OS keychain, not the repo — nothing to accidentally commit. Use a `service_role` key in `.env.local` only as a last resort, never beyond it.
- **Supabase access is read-only by default.** Run writes/migrations only when the user explicitly asks, one at a time, showing the SQL first. It is the production project — no destructive or schema changes without sign-off.
- If a secret is ever found in tracked history, treat it as compromised: rotate it in the provider, don't just delete the line.

## Tech stack
- **Framework**: Next.js 16 App Router (`app/` directory)
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4 (configured via CSS `@theme inline`, no `tailwind.config.ts`)
- **Animations**: Framer Motion (required for all animated components)
- **Icons**: `@phosphor-icons/react` — always use `weight="regular"`
- **Font**: Manrope (loaded via `next/font/google`, registered as `--font-sans`)
- **3D**: Three.js (optional, only when truly needed)

## Design system (site chrome)

- **Default theme**: dark. The toggle lives at the bottom of the left rail and persists to a `theme` cookie, read server-side in `app/layout.tsx` so the first byte carries the right class and there is no flash. Dark is class-based (`.dark` on `<html>`, Tailwind v4 `@variant dark`). Aesthetic: Phosphor-inspired — neutral cool-gray surfaces, editorial typography, olive accent.
- **Site theme and preview theme are separate scopes, and the relationship is one-directional.** `ThemeProvider` is the only writer of `<html>` and the cookie; a component or block preview owns its own `[data-card-theme]` wrapper and never touches either. The site SEEDS a preview (a preview opens in whatever the site is set to) until the visitor uses the preview's own toggle, after which that preview is pinned. So the site can move a preview; a preview can never move the site. The `@variant dark` selector at the top of `app/globals.css` is what keeps them apart, and its comment explains both directions. Do not make a preview call into `ThemeProvider`: that is the exact bug that got the first site toggle deleted.
- **Full token reference** (sand + olive scales, hex values, typography table, spacing grid): `supervisor/skills/site-design-tokens.md` — the single source of truth for site-chrome styling.

Semantic quick reference:

| Role | Light | Dark |
|---|---|---|
| Page background | `bg-sand-50` | `dark:bg-sand-950` |
| Card / surface | `bg-sand-100` | `dark:bg-sand-900` |
| Primary text | `text-sand-900` | `dark:text-sand-50` |
| Body text | `text-sand-700` | `dark:text-sand-300` |
| Secondary text | `text-sand-600` | `dark:text-sand-400` |
| Border | `border-sand-200` | `dark:border-sand-800` |
| Border hover | `border-sand-300` | `dark:border-sand-700` |
| Accent text | `text-olive-600` | `dark:text-olive-400` |
| Accent hover | `text-olive-800` | `dark:text-olive-300` |

The olive ramp was drawn to glow on `sand-950`, so olive-400 and olive-500 cannot carry accent text on a light page. Light accent text is `olive-600` (a deliberate design call at roughly 3:1, carried by size and weight), its hover is `olive-800`, and `olive-700` is the selection highlight. `bg-olive-500` stays the accent FILL in both themes, always with `text-sand-950` on it; a tiny decorative fill may deepen to `olive-700` on light. `text-sand-500` is not a text colour in light mode (3.9:1); it survives only on a decorative glyph.

This table is for NEW code. When adding a light half to an element that already had only a dark value, keep that element's existing dark value exactly and change only the light base: dark is the default theme and must not shift. `lib/theme/scope.test.ts` guards the scope contract itself.

- Olive buttons use `text-sand-950`, never white (contrast). Component preview backgrounds are always `bg-sand-950` regardless of theme. Typography weights: 800 hero h1, 700 section headings, 600 UI labels/buttons, 400 body.

## Prompt file contract
Every `prompts.ts` exports a `prompts` object typed `Partial<Record<Platform, string>>`. The `Platform` union is defined in `app/components/ComponentCard.tsx` — verify against that file, not docs. The UI surfaces ONE general prompt per component: the `'Claude Code'` lane (the comprehensive, platform-agnostic one), shown in the Remix side panel and server-rendered for SEO. Legacy `'Lovable'`/`'V0'` lanes remain valid data on older components but are never surfaced and no longer authored. Write new components with the `'Claude Code'` lane only.

```ts
import type { Platform } from '../../app/components/ComponentCard'
export const prompts: Partial<Record<Platform, string>> = { 'Claude Code': `...` }
```

## Component registry
`app/lib/component-registry.tsx` is the single source of truth. It imports `PreviewComponent: ComponentType` (not JSX elements) and the code/prompts strings for each component. Append-only: never delete or rename existing entries (slugs are a public contract — see `supervisor/CLAUDE.md`).

## Next.js conventions
- `params` in dynamic routes is `Promise<{ slug: string }>` — always `await params`
- `generateStaticParams()` required for all `[slug]` routes
- Server components pass `<PreviewComponent />` JSX as `children` to client components (never store JSX in module-level data)
- `'use client'` required on all interactive components

## Visual verification
The maintainer reviews all visual changes himself — do not run browser tooling or screenshots to self-verify UI work, and never block on a screenshot you cannot take. The one exception is the component-card screenshot pipeline (`npm run screenshot -- <slug>` via `scripts/screenshot.mjs`), which is part of publishing. A screenshot shared by the maintainer IS the bug report: diagnose and fix from it.

"Do not invoke superpowers skills automatically. Only use them when I explicitly ask."
