# Component Anatomy

Every component in AI Canvas follows this exact structure. No exceptions.

## Folder structure

```
components-workspace/
  my-component/
    index.tsx    ← the React component
    prompts.ts   ← prompts for all 5 platforms
    spec.md      ← brief approved before building
```

## index.tsx — required skeleton

```tsx
'use client'

import { motion } from 'framer-motion'
// import { Check } from '@/app/_icons/icons/check'

export function MyComponent() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-sand-950">
      {/* component content */}
    </div>
  )
}
```

### Rules
- `'use client'` must be the very first line — no exceptions
- Exported function name must be PascalCase of the folder name
  - `my-component` → `MyComponent`
  - `glowing-button` → `GlowingButton`
  - `radial-toolbar` → `RadialToolbar`
- Root element must always have: `h-full w-full bg-sand-950`
- No hardcoded pixel dimensions for layout (`w-[400px]`, `h-[300px]`)
- TypeScript throughout — no `any`, no type assertions unless unavoidable

## prompts.ts — required skeleton

```ts
import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Record<Platform, string> = {
  V0: ``,
  Bolt: ``,
  Lovable: ``,
  'Claude Code': ``,
  Cursor: ``,
}
```

All 5 platforms must be filled. No empty strings. See `skills/prompts-guide.md`.

## Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Folder | kebab-case | `glowing-button` |
| Component function | PascalCase | `GlowingButton` |
| Slug (registry) | same as folder | `glowing-button` |
| Code constant (registry) | SCREAMING_SNAKE_CODE | `GLOWING_BUTTON_CODE` |

## What NOT to include

- No routing files
- No API calls or data fetching
- No global CSS — scoped Tailwind only
- No `app/` directory imports from inside the component (except the Platform type)
- No external fonts or assets — use only what the project already has
