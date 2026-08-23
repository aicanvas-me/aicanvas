# Builder Agent Rules — Standalone Components

You build new components in isolation. Your job ends when the component works. Integration into the website is handled by a separate agent.

## Scope of this file

**This file covers STANDALONE components only.** Everything in `components-workspace/` is a standalone — an experimental, creatively-free component that lives alongside ~40 others on the homepage grid. Standalones follow the rules in this file.

If your brief has `design-system: andromeda` (or `meridian`, etc.) — you are NOT working on a standalone. Stop reading this file and go to [`../design-systems/CLAUDE.md`](../design-systems/CLAUDE.md). Design-system work has a completely different ruleset: token-locked, no creative freedom, follow the existing system's patterns exactly.

If your brief has `design-system: standalone` (or omits the field), continue.

**`tier: premium`?** This is a closed-source standalone. Build and preview it here exactly like any other standalone — same rules in this file — but tag every file with the premium marker and store the finished source in the private `aicanvas-premium` repo; it must never be committed to this public repo. Read `_private/premium-workflow.md` (gitignored) for the marker value, the manifest entry, and the `PREMIUM_LOCAL_PATH` preview command.

## Skills library — read before building

### Standalone-specific skills (this folder)

- [`skills/aesthetic-freedom.md`](skills/aesthetic-freedom.md) — your primary creative guide (stub, TODO: flesh out). Permission-giving direction: use any colors/gradients/motion you want; the only hard constraint is container chrome (`bg-sand-100 dark:bg-sand-950`).
- [`skills/promotion-guide.md`](skills/promotion-guide.md) — how to promote a design-system component to a standalone via a re-export wrapper (stub, TODO).
- [`skills/card-stack-pattern.md`](skills/card-stack-pattern.md) — slot-based card stacks: swipe-to-dismiss, fan-out, order cycling, spring constants, dot indicators. Read this for ANY component involving stacked or fanned cards.

### Shared tech skills (root `skills/`)

These live at the project root, one level up from this file:

- `../skills/component-anatomy.md` — required structure, naming conventions, what to avoid
- `../skills/animation-patterns.md` — Framer Motion patterns, spring presets, cleanup patterns
- `../skills/prompts-guide.md` — how to write the 3 platform prompts
- `../skills/tailwind-v4.md` — Tailwind v4 patterns, what is different from v3
- `../skills/typescript-patterns.md` — TypeScript patterns, event types, MotionValue types

### Site design tokens (when you need them)

- `../supervisor/skills/site-design-tokens.md` — the main AI Canvas sand/olive/Manrope system. You rarely need this for a standalone's internals (creative freedom), but the **container chrome** uses sand-100/sand-950 from this file, and if a standalone deliberately echoes the site's look you can reference it here.
- `../supervisor/skills/seo-metadata.md` — SEO rules for writing the `description` field. The description you write in `spec.md` and the registry entry becomes the component's Google meta description. Read this before writing any description.

## Extended skills (`.claude/skills/`) — read for complex visual components

- **`.claude/skills/creative-3d-components/SKILL.md`** — Read this for ANY 3D, particle, canvas, or visually complex component. Contains specific visual recipes (glass, glow, liquid, wireframe), creative direction, color palettes for dark backgrounds, mathematical patterns (noise, parametric curves, springs), and interaction patterns. This is not API docs — it's opinionated creative guidance with code.
- **`.claude/skills/design-motion-principles/SKILL.md`** — Read when tuning animation quality. Perspectives from three motion designers (Emil Kowalski, Jakub Krehel, Jhey Tompkins) with context-aware recommendations.

## Your scope
- Build inside `components-workspace/<component-name>/` only
- Create `index.tsx` (the component) and `prompts.ts` (3 platform prompts: Claude Code, Lovable, V0 — any subset applicable to the component)
- Do NOT touch `app/`, routing, the navbar, or any website logic

## Component requirements

### index.tsx
- `'use client'` at the top (always)
- Export a single **default** function that matches the folder name in PascalCase (e.g. folder `glowing-button` → `export default function GlowingButton()`)
- Add a `// npm install` comment after `'use client'` listing external npm packages (e.g. `// npm install framer-motion @phosphor-icons/react`). Omit for React-only components. This gives users a copy-pasteable install command.
- Root element must fill the viewport standalone: `className="flex min-h-screen w-full items-center justify-center bg-sand-100 dark:bg-sand-950"` — use `min-h-screen` (not `h-full`) so the component works when copy-pasted into any project without a parent height chain
- **`min-h-screen` belongs on the root element ONLY.** For inner elements that need to fill their parent, use `h-full`. The build's registry generator transforms the root `h-full` → `min-h-screen` automatically; never write `min-h-screen` on an inner className. `scripts/lint-registry-json.mjs` enforces this on every build and will fail Vercel deploy if violated.
- **Single root element.** The `return (...)` of your component must contain a single JSX element (not a Fragment with multiple top-level children). The build's root-detector reads attributes from the first JSX element after `return (` — Fragment-wrapped multi-roots break detection. If you need a `<style>` or similar sibling, place it inside the root `<div>` instead.
- **Support both light AND dark mode** — always use `dark:` Tailwind variants so the component looks great in both themes. The preview page has a theme toggle; the user will check both modes.
- For colors set via inline styles (e.g. custom hex values), import `useTheme` from `../../app/components/ThemeProvider` and pick different values per theme.
- Design a distinct but cohesive light version — lighter surface, darker/adjusted accent colors that maintain contrast on light backgrounds.
- **Be creative** — components are visual showcases. You are NOT required to use the site's sand/olive design tokens inside component internals. Use whatever colors, gradients, and styles make the component look its best in both modes.
- Use **Framer Motion** for all animations — no CSS-only keyframes
- Use `@phosphor-icons/react` with `weight="regular"` for any icons. Small glyphs (a checkmark or an X only a few pixels across) may use `bold` or `fill` where regular reads too thin.
- No hardcoded widths/heights — components must look good in a 480×480 preview box

### prompts.ts
- Must export `prompts: Partial<Record<Platform, string>>` (import `Platform` type from `../../app/components/ComponentCard`). `Platform = 'Claude Code' | 'Lovable' | 'V0'`. Lanes can be legitimately absent.
- Write 3 prompts — one per platform
- Each prompt must be self-contained: include all constants, animation specs, and implementation details so the target AI can recreate the component from scratch without seeing the code
- Prompt strategy:
  - **'Claude Code'** — mid-density spec, trust Claude on idiomatic React + Framer Motion, "inline everything, single file". Prepend the env-check preamble: verify Tailwind CSS v4 + TypeScript + React are set up (shadcn CLI if missing).
  - **'Lovable'** — same content as Claude Code prompt, without the env preamble. Works universally for designers in Lovable.
  - **'V0'** — same content as Claude Code prompt. Claude-style prompts outperform V0-specific prompts even in V0.

## Mobile responsiveness — mandatory

Every component must work on mobile. This is not optional.

- **No fixed layout dimensions** — never use `width: Xpx` or `height: Xpx` for layout elements. Use `%`, `vw/vh`, `clamp()`, or Tailwind fluid utilities. The component must fill any container from 300px to 1200px wide without breaking.
- **Touch interactions** — if the primary interaction is hover, add a tap/touch equivalent. On mobile, hover does not fire. Use `onTap`, `onClick`, or pointer events that work on both mouse and touch.
- **Text must be legible at small sizes** — minimum `text-sm` (14px) for any readable text. Labels can be smaller but must remain readable.
- **Canvas/WebGL components** — DPR-aware sizing only. Never hardcode canvas `width` or `height` — derive from `container.clientWidth / clientHeight` with a ResizeObserver.
- **Test at 320px** — before finishing, mentally verify the component at 320px wide (smallest common mobile screen). Nothing should overflow or be inaccessible.

## Coding standards
- TypeScript throughout — no `any`, no type assertions unless unavoidable
- Framer Motion MotionValues for animation state (avoid `useState` for animation values)
- Clean up all effects: cancel RAF, stop animations, unsubscribe from MotionValues
- Dynamic import browser-only APIs (e.g. Three.js, canvas) with `alive` guard pattern

## Before finishing a BUILD task
1. Verify `index.tsx` exports the correct **default** function
2. Verify there are no TypeScript errors in the files you created
3. Do NOT write `prompts.ts` during the initial build — prompts are written in a separate step AFTER the user approves the final visual
4. **Add a preliminary registry entry** in `app/lib/component-registry.tsx` with:
   - Imports for the component and (empty) prompts module
   - A temporary entry in `COMPONENTS_RAW` with: slug, name, placeholder description (can be a draft, refined at Integrate step), tags, `dualTheme: true` if applicable, `image: ''` (empty — replaced with the real ImageKit URL at step 8), `PreviewComponent`, `code: componentCodes[slug]`, `prompts: {}` (or the real prompts once written)
   - This makes `/components/<slug>` render with full page chrome (title, description, Light/Dark toggle) so the user can iterate with real page context — the Supervisor's new Preview flow lives on `/components/<slug>`, not the bare `/preview/<slug>` route
   - The registry is regenerated automatically when you run `node scripts/generate-component-codes.mjs && node scripts/generate-registry.mjs` — don't forget to run this
   - The Integrator will FINALIZE this entry at step 8 (real image URL, reviewed description, real prompts)

## Before finishing a PROMPTS task
When the Supervisor delegates a prompts-only task (after the user has approved the component):
1. Read the FINAL `index.tsx` carefully — the component may have changed since the spec
2. Write `prompts.ts` based on what the component ACTUALLY does, not what the spec says
3. Verify the platforms specified in the brief are filled in and each prompt is self-contained (components may legitimately omit some platforms — check the brief)

## Browser verification — standalones
Before reporting a BUILD complete, screenshot the component in the running dev server. The route is `/components/<slug>` (the live registry-rendered page), not `/preview/<slug>`.

- **Both themes**: take TWO screenshots — once with the page in dark mode, once after toggling to light. The component must look intentional in both. Standalones that "kind of work" in light mode are not done.
- **Mobile width**: also verify at a narrow viewport (~375px) — the mobile responsiveness rules above are not optional, and the screenshot is where you catch overflow, illegible text, or dead hover-only interactions.
- **Console**: read the console after the page loads. Framer Motion warnings, hydration mismatches, and missing `'use client'` errors all surface here.
- **Container chrome**: confirm the root has the standalone container (`bg-sand-100 dark:bg-sand-950`) and that no inner element is using `min-h-screen` (only the root may).
- **If the screenshot reveals a problem**: fix it before handing back. Don't ship a "ready for review" status the screenshot contradicts.

## Template
Copy from `components-workspace/_template/` to get started.
