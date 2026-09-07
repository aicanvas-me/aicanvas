# Designing a Design System

**Status: stub — flesh out in a dedicated session.**

This skill file explains the philosophy and workflow for creating or extending a design system inside `design-systems/<system-name>/`. Unlike standalone components (which live in `components-workspace/` and have creative freedom), design systems are token-driven, opinionated, and internally consistent. A user dropping into Andromeda for the first time should recognize a Andromeda component at a glance, and every new Andromeda component should feel like it was always there.

When fleshed out, this file should cover:

- **Token-first workflow.** Tokens (`tokens.ts`) come before components. If a color or spacing value you need isn't in `tokens.ts`, add it there first — don't hardcode in the component.
- **When to start a new system vs. extend an existing one.** Meridian is intentionally small today (9 components) and will grow; Andromeda is broader (19 components) but still opinionated. Neither is a "complete" system — both are governed by a consistent aesthetic that any new addition must respect.
- **Variant naming and surface semantics.** How to decide variant names (`default` | `outline` | `ghost` | `destructive` | `link`), how to think about surface layers (base / raised / overlay / hover / active), and how to avoid accidentally re-inventing shadcn.
- **When a component belongs in a DS vs. as a standalone.** If the component is a showpiece (experimental motion, novel interaction, one-off aesthetic) → standalone. If it's a primitive that a real product could compose into a UI (button, input, card, dialog) → design system.
- **The promotion mechanism.** A DS component can be promoted to the homepage grid via a thin re-export wrapper in `components-workspace/`. See `components-workspace/skills/promotion-guide.md`.
- **TypeScript status.** All DS files are properly typed and the folder is tsc-checked (no `@ts-nocheck`). Give any new file real prop types from the start. See `design-systems/CLAUDE.md`.

TODO: replace this stub with real content once at least one new DS component has been built end-to-end under the new folder structure, so the workflow can be documented from experience rather than guessed.
