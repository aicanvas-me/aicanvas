# New Component Template

## How to build a new component

### 1. Copy this template
```
cp -r components-workspace/_template components-workspace/your-component-name
```
Use **kebab-case** for the folder name (e.g. `glowing-button`, `wave-text`).

### 2. Edit `index.tsx`
- Rename `ComponentName` to the PascalCase version of your folder name
- Build the component inside `<div className="flex h-full w-full items-center justify-center bg-sand-100 dark:bg-sand-950">`
- The preview container is **480×480px** — design for this viewport
- Use **Framer Motion** for all animations
- Use AI Canvas icons, one file per icon, e.g. `import { Sun } from '@/app/_icons/icons/sun'` (never a barrel import, Line style by default)
- Mark the file `'use client'`
- Clean up all effects (cancel RAF, stop animations, unsubscribe MotionValues)

### 3. Edit `prompts.ts`
Fill in up to 3 platform prompts (Claude Code, Lovable, V0 — any subset applicable to the component). Each prompt must be **fully self-contained** — the AI reading it should be able to recreate the component without seeing your code. Include:
- All constants and their values
- Animation timing, easing, and keyframes
- Color values and class names
- Any library-specific API calls (e.g. Framer Motion patterns)
- File path and export name

### 4. Test
Verify the component renders without errors before handing off to the integrator.

### 5. Done
Your job ends here. The Integrator Agent will:
- Add the component to `app/lib/component-registry.tsx`
- Make it available on the website at `/components/your-component-name`
- Add it to the homepage grid automatically

---

## Rules
- Do NOT touch `app/` or any website files
- Do NOT register the component yourself
- Keep `index.tsx` and `prompts.ts` — no other files needed
