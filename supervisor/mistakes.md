# Known Mistakes & Recurring Issues

The Reviewer checks this list on every review. The Supervisor logs here after every failed review or user correction.

---

## #001 — Wrong preview background color
- **Issue**: Used `bg-zinc-950` instead of `bg-sand-950` for the component root element
- **Rule**: Always use `bg-sand-950` for component preview backgrounds (never zinc)
- **Affected files**: `components-workspace/_template/index.tsx` (fixed at setup)
- **Detected**: Initial system setup

## #002 — Wrong icon weight
- **Issue**: Used `weight="duotone"` on Phosphor icons instead of `weight="regular"`
- **Rule**: Always use `weight="regular"` for all `@phosphor-icons/react` icons
- **Affected files**: `components-workspace/CLAUDE.md` (fixed at setup)
- **Detected**: Initial system setup

## #003 — Used `text-white` instead of design system tokens
- **Issue**: Template used `text-white` for text on dark backgrounds
- **Rule**: Always use `text-sand-50` for primary text in dark context, not `text-white`
- **Affected files**: `components-workspace/_template/index.tsx` (fixed at review)
- **Detected**: Session review

## #004 — Documentation hex mismatch with CSS source of truth
- **Issue**: `sand-200` was documented as `#EDE8DF` but actual `globals.css` has `#EDEAE5`
- **Rule**: Always verify token values against `app/globals.css` — it is the single source of truth for all colors
- **Affected files**: Root `CLAUDE.md`, `skills/design-tokens.md` (both fixed at review)
- **Detected**: Session review

## #005 — Component integrated without screenshot (missing `image` field)
- **Issue**: `silk-lines` was added to the registry without an `image` field, so its card on the homepage showed the old placeholder (dot grid + icon) instead of the screenshot + fade gradient
- **Rule**: Integration is NOT complete until the `image` field in the registry entry contains a real ImageKit URL. The Integrator must run `npm run screenshot -- <slug>`, add the URL to the registry, and only then report back to the Supervisor. The Supervisor must verify the `image` field exists before marking status as `integrated`.
- **For active-state components**: The screenshot must capture the component in its active/hover state. Add the slug to `scripts/screenshot.mjs` `INTERACTIONS` map before running the script.
- **Affected files**: `integration/CLAUDE.md`, `supervisor/CLAUDE.md` (both updated with hard gates)
- **Detected**: 2026-04-02

## #007 — Component covers the preview back button on mobile

- **Issue**: Components that fill the viewport with a background and start content at y=0 can visually cover or block interaction with the back button (`absolute top-4 left-4`) in the preview page. Framer Motion animated elements also create stacking contexts that can elevate component content above overlays with no explicit z-index.
- **Root cause**: The back button had no z-index, and components with transformed children (Framer Motion) can generate stacking contexts that render above it.
- **Fix applied**: Added `z-[100]` to the back button in `app/preview/[slug]/page.tsx`. This is a systemic fix — all future components are covered.
- **Component rule**: Components must use `items-center` (not `items-start`) on the root so content is vertically centred and doesn't crowd y=0 where the back button lives.
- **Detected**: 2026-04-15

## #008 — Pushed to GitHub without explicit "push it" instruction

- **Issue**: User said "just integrate it." Supervisor delegated to Integrator which wired the component locally and passed the JSON check — then immediately committed and pushed without waiting for the user to say "push it."
- **Rule**: "integrate" = steps 8–9 only (wire locally, run JSON check, report result). "push it" = step 10 (commit + push). These are two separate explicit commands. Never commit or push after step 9 unless the user explicitly says "push it" or equivalent.
- **Detected**: 2026-04-23

## #006 — Prompts file out of sync with actual component
- **Issue**: `silk-lines/prompts.ts` (now `wave-lines/prompts.ts`) described constants and behaviour that no longer matched `index.tsx`. The prompts said `SPACING=8, AMP=44, HOVER_BOOST=1.3` and a single sine wave; the real component had `SPACING=32, AMP=18, HOVER_BOOST=5.0`, a layered secondary wave, a Y-drift breath, and quadratic-curve smoothing through midpoints. An AI given those prompts would have produced a meaningfully different component than what's deployed.
- **Rule**: Whenever a component is adjusted after `prompts.ts` is written, the prompts MUST be regenerated against the FINAL `index.tsx`. The Builder rule already says "Read the FINAL `index.tsx` carefully — the component may have changed since the spec" — but this needs to be enforced for *adjustments*, not just initial builds. Reviewer should diff the prompts against the component on every review and fail if constants or core behaviour drift.
- **Detection rule**: If a Reviewer or Supervisor sees the user request a visual change (e.g. "make the lines waver more"), they must remember that the next prompt-write step needs to capture that change. Don't trust an old `prompts.ts` to still be accurate.
- **Affected files**: `components-workspace/wave-lines/prompts.ts` (rewritten), `app/lib/component-registry.tsx` (already inlines the real source code, so it stayed accurate)
- **Detected**: 2026-04-08

## #009 — Inlined `useTheme` reads `<html>` only, ignores the preview's `[data-card-theme]` toggle
- **Issue**: `crypto-swap` inlined its own `useTheme` that read `document.documentElement.classList.contains('dark')`. The per-component preview toggle on `/components/<slug>` does NOT toggle `<html>` — it flips a `dark` class on a local `[data-card-theme]` wrapper (the dark variant is `@variant dark (&:where(.dark, .dark *):not([data-card-theme="light"] *))`). So clicking Light did nothing for the component (it stayed dark). Tailwind-`dark:`-based components work because they cascade from the wrapper; inline-`useTheme` components that read `<html>` do not.
- **Rule**: Any standalone that drives inline styles from theme MUST resolve theme **wrapper-first**: take the component's root element ref, `const card = el?.closest('[data-card-theme]')`; if present use `card.classList.contains('dark')`, else fall back to `document.documentElement.classList.contains('dark')`. Observe BOTH the card wrapper (`attributeFilter: ['class','data-card-theme']`) and `<html>` (`['class']`). This stays copy-paste portable (no `[data-card-theme]` in a user project → falls back to `<html>`).
- **Reference (correct pattern)**: `components-workspace/charging-widget/index.tsx`, `peel-corner-reveal/index.tsx`, `radial-cards/index.tsx`. Copy one of these when inlining `useTheme`.
- **Affected files**: `components-workspace/crypto-swap/index.tsx` (fixed)
- **Detected**: 2026-06-14
- **Update 2026-09-29**: the site and preview themes are now linked, so the preview toggle also flips `<html>` through `ThemeProvider.setTheme` and the story above (Light doing nothing) no longer happens on the site. The rule stands: a preview can still differ from `<html>` (a dark-only component on a light site, a `?theme=` preview route, a copy-pasted component in another project), so resolve wrapper-first.

## #010 — Live component preview paints over the mobile menu / site chrome (z-index escape)

- **Issue**: On `/components/product-card-deck`, opening the mobile burger menu showed the card deck floating ON TOP of the open drawer. The component's top card uses `position: absolute; zIndex: 100` (slot-based stacking). The preview container was `relative overflow-hidden` — but **`relative` without a `z-index`, and `overflow-hidden`, do NOT create a stacking context**. So the card's `z-index: 100` escaped the preview box and competed at page level against the drawer's `z-50` — and 100 > 50, so the component won.
- **Root cause**: A live-preview container that renders arbitrary component children must trap those children's z-indexes. Components legitimately use any z-index they want internally; the container is responsible for scoping them.
- **Fix applied (systemic)**: Added `isolate` (`isolation: isolate`) to every container that renders a live `<PreviewComponent />` / component `children`: the main preview box and the fullscreen panel in `app/components/[slug]/ComponentPageView.tsx`. `isolate` creates a stacking context with `z-index: auto`, so ALL descendant z-indexes (even `z-9999`) are scoped inside the box and can never exceed site chrome (drawer z-50, modals, etc.). This is future-proof — no per-component discipline required.
- **Rule**: Any new surface that renders a live component preview MUST carry `isolate`. Never rely on the drawer/site-chrome z-index being "high enough" — components can use arbitrary z-indexes. (The homepage `ComponentCard` grid is safe because it renders static screenshot `<img>`s, not live components.)
- **Related**: #007 (component covering the preview back button) is the same class of bug; `isolate` on the container is the general fix that supersedes per-element z-index bumps.
- **Affected files**: `app/components/[slug]/ComponentPageView.tsx` (main preview box + fullscreen panel)
- **Detected**: 2026-06-17
