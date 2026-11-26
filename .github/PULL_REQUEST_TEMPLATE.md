## What this changes

<!-- One or two lines. What is different after this PR. -->

## Why

<!-- The bug it fixes, or the gap it fills. Link the issue if there is one. -->

## Checklist

- [ ] `npm run generate`, then `npx tsc --noEmit` and `npm test`, pass locally
- [ ] Works in light and dark
- [ ] Checked on a phone width (375px) if anything visual changed
- [ ] A new component has its `prompts.ts` and an `app/lib/component-registry.tsx` entry
- [ ] No existing slug renamed or removed (slugs are a public contract)
- [ ] No secrets, no `.env.local`, no premium files
