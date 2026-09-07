# Design Systems — Agent Rules

This folder contains **strict design systems**. Every component here is part of a cohesive visual language governed by a token file. These are NOT creative experiments — for those, see `components-workspace/` and its `skills/aesthetic-freedom.md`.

## Current systems

| System | Components | Aesthetic | Showcase |
|---|---|---|---|
| `andromeda/` | a growing set of components <!-- TODO: reconcile count after parity --> | Sci-fi / blueprint. Transparent surfaces, 1px corner markers, JetBrains Mono only, turquoise accent. | `/design-systems/andromeda` and `/design-systems/andromeda/showcase` |
| `meridian/` | 9 | Editorial dashboard. Intentionally smaller surface area today; will grow over time to match Andromeda's coverage. | `/design-systems/meridian` |

## The three pillars of a design system

Every Andromeda-style system is governed by three files, each with a distinct role:

1. **Tokens** — `design-systems/<system>/tokens.ts`. Source of truth for VALUES (colors, spacing, radius, typography). Change a token and it propagates everywhere.
2. **Code** — `design-systems/<system>/components/`. Source of truth for STRUCTURE (how a Button forwards refs, how a Card composes its header/content/footer). The shape of the system.
3. **Brain** — `design-systems/<system>/rules.md`. Source of truth for INTENT (when accent color is allowed, which components forbid glow, what counts as a measurement). The judgment of the system.

A new component or modification needs all three to be correct. Tokens give you the values, components give you the patterns, the brain tells you which combinations are right.

## Token-first workflow

Before writing or modifying ANY component inside `design-systems/<system>/`:

1. **Read `design-systems/<system>/rules.md` first.** This is the system's brain — the design intent and anti-patterns. Most mistakes are correctable in advance by reading this once. If `rules.md` doesn't exist for the target system yet, treat its absence as a TODO and ask before proceeding with non-trivial work.
2. **Read `design-systems/<system>/tokens.ts`.** Tokens are the single source of truth for colors, spacing, radius, typography, and layout values. A change to tokens propagates to every component; a change to a component that bypasses tokens is technical debt.
3. **Never hardcode colors or spacing in components.** Use the `var(--andromeda-…)` / `var(--meridian-…)` CSS custom properties emitted by the system's helper (e.g. `andromedaVars()`), or reference `tokens.xxx` directly when that pattern is already established.
4. **Match existing component patterns.** If `Button.tsx` uses `cva` + `forwardRef` + `andromedaVars()`, a new `Select.tsx` should follow the same shape. Consistency inside a system is more important than micro-optimizations.
5. **One system per folder.** Do not import tokens, helpers, or components from `meridian/` into an `andromeda/` component, or vice versa.
6. **Examples are examples, not library code.** Files under `<system>/examples/` demonstrate how a system composes into a real UI (mission-control dashboard, editorial dashboard). Don't import FROM `examples/` INTO `components/` — data flows the other way.
7. **When the user corrects a design decision, write the rule back to `rules.md` immediately.** The brain is a living document — every correction should land before the session ends, so the same mistake never costs time twice.

## TypeScript status

Every tracked file in this folder is real TypeScript: typed props, typed `forwardRef` signatures, no `@ts-nocheck`. The folder is part of the tsc program (it is NOT in `tsconfig.exclude`), so `npx tsc --noEmit` checks all of it, including systems no page imports yet.

- Components export their prop types; examples annotate their data against those exported types.
- Do NOT add a `@ts-nocheck` header to any file here. If the checker complains, fix the types.
- The JSDoc `@typedef` blocks above components feed the auto-generated props tables; keep them in sync with the TS types.
- Vault-injected free-lane files (MetricChart, Gauge, Waveform, MediaCard, DataTable, MusicPlayer and vault-side examples) are copied in at build time; their typing lives in the vault source, not here.

## Promotion to standalones

A DS component can be "promoted" onto the homepage standalone grid via a thin re-export wrapper in `components-workspace/<wrapper-name>/`. The wrapper owns its own `prompts.ts` and registers via the normal pipeline; the DS source stays untouched. See `components-workspace/skills/promotion-guide.md` for the pattern.

Promotion is a per-component user decision. Never promote a component speculatively.

## Brief format for DS work

Briefs for work in this folder MUST include a `design-system:` field with a valid system name:

```
Component: <name>
Slug: <kebab-case>
design-system: andromeda                  ← or meridian, etc.
Description: <one sentence>
Visual: <what it looks like>
Behaviour: <interactions, animations>
Tech notes: <any special requirements>
```

Specs for DS work should be saved at `design-systems/<system>/specs/<slug>.md` (parallel to how standalone specs live at `components-workspace/<slug>/spec.md`). The Supervisor routes briefs based on the `design-system:` field.

## Browser verification — design systems
Before reporting any DS change complete, screenshot the affected page on the running dev server. For Andromeda the canonical routes are `/design-systems/andromeda` and `/design-systems/andromeda/showcase`; for Meridian, `/design-systems/meridian`. If your change touches an example, also screenshot that example page directly.

- **Token resolution check**: the screenshot must show that every color, spacing, radius, and typography value resolved through the system's CSS custom properties (`--andromeda-*` / `--meridian-*`). Visually that means: no rogue Tailwind colors slipping in, no off-system shadows or radii, JetBrains Mono everywhere in Andromeda. If the screenshot looks "almost right but slightly off," suspect a hardcoded value bypassing tokens — find it before reporting done.
- **Compositional integrity**: zoom mentally to the level that matters. A change to `Button.tsx` should be screenshot-verified inside an example that actually uses it (mission-control for Andromeda, the editorial dashboard for Meridian) — not just in isolation.
- **Console**: read it. `// @ts-nocheck` masks compile-time errors but not runtime ones (key warnings, hydration mismatches, missing CSS vars rendering as empty strings).
- **No drift, no exceptions**: if the screenshot reveals visual drift from the system's existing language, the fix is to align to tokens — not to ship the drift and "address it later." That's how the system rots.

## Skills

- [`skills/designing-a-system.md`](skills/designing-a-system.md) — philosophy and workflow for creating or extending a DS (stub, TODO: flesh out)

## Relationship to other agents

- The **Supervisor** (`supervisor/CLAUDE.md`) delegates DS work to the Builder the same way it delegates standalone work — except the brief includes the `design-system:` field and the Builder reads THIS file instead of `components-workspace/CLAUDE.md`.
- The **Builder** has two modes: standalone mode (rules in `components-workspace/CLAUDE.md`) and DS mode (rules here). The `design-system:` field in the brief determines which mode applies.
- The **Reviewer** and **Integrator** operate identically for both modes.
