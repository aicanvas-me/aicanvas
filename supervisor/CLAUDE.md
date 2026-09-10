# Component pipeline — routing, gates, and registry rules

The main session orchestrates all component work directly (there is no separate "Supervisor agent"). Every built or modified component gets an independent review against `reviewer/CLAUDE.md` before the user sees it. Integration mechanics: `integration/CLAUDE.md`. Recurring mistakes log: `supervisor/mistakes.md`.

## Routing — three tiers

The brief's `design-system:` field routes every task:

| `design-system:` | Rules | Spec location |
|---|---|---|
| `standalone` | `components-workspace/CLAUDE.md` (creative freedom, strict TS) | `components-workspace/<slug>/spec.md` |
| `andromeda` / `meridian` / named system | `design-systems/CLAUDE.md` + the system's `tokens.ts` (strict tokens) | `design-systems/<system>/specs/<slug>.md` |
| site chrome | `supervisor/skills/site-design-tokens.md` | n/a |

`tier: premium` (closed-source): pipeline is identical, but finished source is stored outside this repo and never committed here. Read `_private/premium-workflow.md` (gitignored) before delegating a premium brief. If tier is unspecified, ask — don't guess.

## Brief format (approval required before building)

```
Component: <name>          Slug: <kebab-case, permanent>
design-system: standalone | andromeda | meridian     tier: free | premium
Description / Visual / Behaviour / Mobile / Tech notes
```

## CREATE pipeline — 13 steps, 4 user gates (⚠️)

1. **Brief** → ⚠️ explicit approval before building.
2. **Build** → `index.tsx` only (no prompts yet) + temporary registry entry so `/components/<slug>` renders with full chrome. TypeScript check.
3. **Preview** at `/components/<slug>` (never bare `/preview/<slug>` — full page context prevents regressions).
4. **Adjust** → iterate. ⚠️ Until explicit visual approval ("looks good").
5. **Prompts** → written AFTER approval, against the final component (early prompts describe stale versions).
6. **Review** → independent pass against `reviewer/CLAUDE.md`. On FAIL: fix or get explicit user override (log it in `mistakes.md`).
7. **Sync spec** → update `spec.md` to match what actually shipped. Skip if accurate.
8. **Integrate** → finalize registry entry, screenshot, image URL (see `integration/CLAUDE.md`). Local only.
9. **JSON check** → `npm run validate:registry -- <slug>`. FAIL = STOP, surface the exact error, fix root cause (never hand-edit the JSON).
10. **Working confirmation** → user verifies `/components/<slug>` (both themes, copy, card thumbnail). ⚠️ Wait for explicit "commit".
11. **Commit** → local only. Not on GitHub, not deployed.
12. **Push live** → ⚠️ explicit "push" / "go live" only. Vercel auto-deploys; verify `aicanvas.me/r/<slug>.json` returns 200.
13. **Announce** → `npm run gsc:submit -- --url=https://aicanvas.me/components/<slug>` (fire-and-report, never blocks).

## MODIFY pipeline — for integrated components (3 gates)

1. Change request (confirm intent if non-trivial) → 2. **Scope check**: visuals → re-screenshot + cache-bust; behavior/props → prompts.ts update too; copy-only → screenshot only; metadata-only → registry only; imports changed → JSON deps MUST regenerate → 3. Modify → 4. Preview at `/components/<slug>` → 5. ⚠️ visual approval → 6. Regen: `node scripts/generate-component-codes.mjs && node scripts/generate-registry.mjs` → 7. prompts.ts only if behavior changed → 8. sync spec → 9. if visuals changed: `rm -rf .next/cache`, `npm run screenshot -- <slug>`, bump `?v=N` on the image URL (CDN caches ~1 year) → 10. JSON check must PASS → 11. ⚠️ "commit" (local) → 12. ⚠️ "push" → 13. gsc:submit.

Shortcuts: description/tag-only → skip 7-9. Bug fix with no visual change → skip 9. Prompts-only → skip 6/8/9. **Never skip the working-confirmation gate, even for "quick fixes".**

## Registry is a public contract

AI Canvas is in the official shadcn registry directory; `aicanvas.me/r/*.json` is a public API used via `npx shadcn add @aicanvas/<slug>`.

1. **Never rename the slug of an integrated component** — the slug is the URL; renames break every external install. Applies during refactors too.
2. **Never delete an integrated component without explicit user authorization** — even a brief delete-and-replace 404s the slug.
3. **JSON integrity**: regenerate after ANY source change (byte-for-byte parity is enforced); regenerate deps when imports change; never hand-edit `registry-data/*.json`; build failures block publication.
4. **Screenshots**: cache-bust (`?v=N`) whenever visuals change; clear `.next/cache` before capturing; a real ImageKit URL is required before push — no placeholders.
5. **After a deploy**: spot-check `curl https://aicanvas.me/r/<slug>.json`. A malformed JSON in production is an incident — fix or roll back immediately.

## Hard gates

- Integration requires: review PASS this session + non-empty `prompts.ts` + `spec.md` present.
- Publication requires: JSON check PASS on the freshly built `registry-data/<slug>.json`.
- Preserve all existing registry entries — append-only.
- The component inventory is `app/lib/component-registry.tsx` + live `/r/<slug>.json` checks; there is no separate status file to maintain.
