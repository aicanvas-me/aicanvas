# Reviewer — the component review checklist

Independent review of every built or modified component before the user previews it. The reviewer never modifies files — read, check, report. In the maintainer's environment this runs as a dedicated read-only subagent; the checklist below is the contract either way.

## Read before reviewing

- `supervisor/mistakes.md` — known recurring issues, check every item
- `components-workspace/CLAUDE.md` — the builder contract this checklist enforces
- For 3D/canvas work: the creative-3d anti-patterns; for animation quality: the motion-principles audit

## Checklist

### 1. TypeScript
- [ ] `npx tsc --noEmit` passes — any error = FAIL with the exact message

### 2. File structure
- [ ] `components-workspace/<slug>/index.tsx`, `prompts.ts`, `spec.md` all exist

### 3. index.tsx — structure
- [ ] `'use client'` is the very first line
- [ ] Exports a single **default** function (the copy-paste contract)
- [ ] Root element className contains `min-h-screen`, `w-full`, and the dual-theme background `bg-sand-100 dark:bg-sand-950`
- [ ] No `bg-zinc-950` anywhere (mistake #001)
- [ ] Top-of-file `// npm install ...` comment lists every non-React dependency

### 4. Animations
- [ ] Animation uses `framer-motion` (`motion.` present for animated components)
- [ ] No `useState` for animation values — MotionValues instead
- [ ] Every `useEffect` cleans up (cancel RAF, stop animations, unsubscribe)

### 5. Styling + type scale
- [ ] Inside the component: raw values, not site tokens (sand-*/olive-* belong to site chrome; the root container chrome is the one exception)
- [ ] Font sizes on the fixed scale (10/12/14/16/20/24/28); spacing on the 4px grid
- [ ] No hardcoded pixel dimensions on layout containers — fluid sizing

### 5b. Mobile
- [ ] Works at 320px; hover-only interactions have a touch equivalent
- [ ] Canvas/WebGL sizes from the container (ResizeObserver/ref), never hardcoded
- [ ] Readable text is at least 14px

### 6. Icons
- [ ] Phosphor imports from `@phosphor-icons/react`, `weight="regular"` everywhere except small glyphs (a checkmark or an X a few pixels across may use `bold` or `fill`) (mistake #002)

### 7. prompts.ts
- [ ] Exports `prompts` typed `Partial<Record<Platform, string>>`; `Platform` imported from `../../app/components/ComponentCard` (verify the union against that file, not docs)
- [ ] No empty strings or TODO placeholders; each prompt is self-contained

### 8. Spec compliance
- [ ] Built component matches `spec.md`; deviations flagged (not auto-failed)

## Output format

**PASS** — one sentence, plus any spec deviations listed after.
**FAIL** — numbered issues referencing checklist items, with file:line. One FAIL stops the pipeline.

Never guess: anything unverifiable is reported as "unable to verify: [reason]".
