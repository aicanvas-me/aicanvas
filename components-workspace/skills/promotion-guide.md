# Promotion Guide — Surfacing a Design-System Component on the Homepage

When a design-system component (something living under `design-systems/<system>/components/`) is good enough to feature on the main AI Canvas homepage grid alongside the standalones, we **promote** it. Promotion does NOT mean "move" or "copy" — the DS source stays exactly where it is and remains the single source of truth. Instead, we create a thin **re-export wrapper** under `components-workspace/`, register the wrapper in the registry, screenshot it, and treat it like any other standalone from that point on.

This guide documents the full workflow using the first real promotion — `andromeda-button` — as the worked example. Everything below is taken from that wrapper's actual code. When new promotions surface new patterns, extend this file.

## The folder shape

```
components-workspace/andromeda-button/
  index.tsx      ← re-exports Button from design-systems/andromeda/components/Button
                    and renders it inside a preview-friendly container
  prompts.ts     ← prompts written as if the reader has never heard of Andromeda
  spec.md        ← the brief that justified the promotion
```

## Naming convention

Prefix the wrapper folder with the DS name: `andromeda-button`, `andromeda-card`, `meridian-stat-tile`, `meridian-input`, etc. This:

- Makes the relationship obvious in the folder list
- Prevents name collisions with pure standalones (e.g. if someone builds a non-DS `button` experiment later)
- Gives the homepage card a unique slug — `/components/andromeda-button` reads clearly as "the Andromeda design system's Button"

The wrapper's exported function matches the folder in PascalCase: `andromeda-button/` → `export function AndromedaButton()`.

## Pattern 1 — Boundary retyping for untyped DS code

**This is the pattern that makes promotion work at all.** The rest of the guide depends on understanding it.

Historical context: `design-systems/*/components/*.tsx` files used to carry a `// @ts-nocheck` header, so TypeScript resolved their `forwardRef(function(...))` signatures to `ForwardRefExoticComponent<RefAttributes<unknown>>` and rejected every prop at the wrapper's call site. The DS typing pass removed the pragmas and added real prop types, so this failure mode is gone for new wrappers.

The fix: **cast at the import boundary.** Define a minimal structural type for the props you care about, import the raw component under a different name, and cast it once.

From `components-workspace/andromeda-button/index.tsx`:

```tsx
import type { ComponentType, ReactNode } from 'react'
import { Button as RawButton } from '../../design-systems/andromeda/components/Button'

// Andromeda Button has no explicit TS prop types — retype at the boundary.
type AndromedaButtonProps = {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'link'
  size?: 'sm' | 'md' | 'lg'
  icon?: ComponentType<{ size?: number }>
  children?: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
}
const Button = RawButton as unknown as ComponentType<AndromedaButtonProps>
```

Rules for writing the boundary type:

- **Only type the props you actually use in the wrapper.** Don't try to mirror the whole DS component's API — that's busywork, and it'll drift. The wrapper is a preview, not a general-purpose import surface.
- **Use `as unknown as ComponentType<...>`** — the double-cast is necessary because the raw exported type is incompatible with your narrower type, and TypeScript needs the `unknown` step to accept the conversion.
- **`icon` props that accept React components must be typed as `ComponentType<{ size?: number }>`** (or whatever props the icon receives) — not as `ReactNode`. Icons are components, not elements.
- **Name the raw import `RawButton` / `RawCard` / etc.** and re-alias to the clean name after the cast. That way the rest of the file reads like normal React code — `<Button variant="default">` not `<RawButton variant="default">`.

**The typing pass has landed**: DS components now export real prop interfaces, so NEW promotion wrappers import and use them directly with no boundary cast. Existing wrappers keep their casts (harmless); remove one opportunistically when you touch its wrapper anyway.

## Pattern 2 — Replicate the DS showcase, don't reinvent the preview

The wrapper's job is to show the DS component **exactly as it appears on the DS's own overview page**. The user already spent effort designing the showcase layout (Variants / Sizes / With icon / Disabled rows for the Andromeda Button); the wrapper should reuse that layout one-to-one, not invent a different one.

For `andromeda-button`, this meant copying the `Row` helper from `app/design-systems/andromeda/showcase/page.tsx` and using it directly in the wrapper:

```tsx
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          marginBottom: 12,
          fontFamily: "var(--andromeda-font-mono, 'JetBrains Mono', monospace)",
          fontSize: 10,
          color: 'rgba(255,255,255,0.22)',
          textTransform: 'uppercase',
          letterSpacing: '0.22em',
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        {children}
      </div>
    </div>
  )
}
```

Then the wrapper renders the same rows the showcase does:

```tsx
<Row label="Variants">
  <Button variant="default">Default</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="ghost">Ghost</Button>
  <Button variant="destructive">Destructive</Button>
  <Button variant="link">Link</Button>
</Row>
<Row label="Sizes">
  <Button size="sm">Small</Button>
  <Button size="md">Medium</Button>
  <Button size="lg">Large</Button>
</Row>
<Row label="With icon">
  <Button icon={Notification}>Notifications</Button>
  <Button variant="outline" icon={Settings}>Settings</Button>
  <Button variant="destructive" icon={Notification}>Abort</Button>
</Row>
<Row label="Disabled">
  <Button disabled>Default</Button>
  <Button variant="outline" disabled>Outline</Button>
  <Button variant="destructive" disabled>Destructive</Button>
</Row>
```

**Rules:**
- Inline the `Row` helper in the wrapper file. Don't extract to a shared helper — every DS has a different showcase style, and the row styling should match the source DS's own conventions.
- The wrapper may wrap into multiple lines on a 480×480 homepage card. That's expected and acceptable — `flexWrap: 'wrap'` in the row handles it. The detail page has more width and renders everything in straight rows.
- Match the sample labels to the showcase page exactly. If the showcase calls it "Notifications", don't change it to "Notify" in the wrapper.

## Pattern 3 — Dark-only design systems break container-chrome convention

Standalones normally render inside a `className="flex h-full w-full items-center justify-center bg-sand-100 dark:bg-sand-950"` container — the sand-100/sand-950 pair is the "container chrome" rule in `components-workspace/CLAUDE.md`.

**Promotion wrappers of intrinsically-dark design systems break this rule.** Andromeda is a sci-fi / blueprint system — transparent hairline surfaces on a near-black canvas. If you drop an Andromeda Button onto `sand-100` in light mode, the transparent surfaces render against a pale tan background and the aesthetic completely collapses.

The fix: **override the container background to match the DS's void color, in both themes.**

```tsx
<div
  className={'relative flex h-full w-full items-center justify-center ' + jetbrainsMono.variable}
  style={{ background: '#0E0E0F' }}
>
```

Precedent: existing dark-only standalones (`x-grid`, `grid-lines`, `dot-grid`) already do this — they set their own dark backgrounds regardless of site theme. Promotion wrappers of dark DSes are the same case.

**Per-DS background values** (document new ones here as systems are added):

| System   | Container background       | Why                                    |
|----------|---------------------------|----------------------------------------|
| Andromeda | `#0E0E0F` (void)          | DS tokens define this as `surface.void` — the canvas color every Andromeda example uses |
| Meridian  | TBD — first promotion of a Meridian component will fill this in |

If a future DS is **intrinsically light or neutral** and its components render correctly against `sand-100 dark:bg-sand-950`, then the standard container-chrome rule applies and no override is needed. This has not happened yet.

## Pattern 4 — Font variables must be loaded in the wrapper

DS components often reference fonts via CSS custom properties (`--andromeda-font-mono`, etc.) that are set by the DS token file. The variables resolve to a font stack that starts with a specific font (e.g. JetBrains Mono), and the DS expects the font to be loaded via `next/font/google` at route scope.

**The wrapper must load the font itself.** Without it, the CSS var falls back to the system monospace and the component looks wrong.

```tsx
'use client'
import { JetBrains_Mono } from 'next/font/google'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export function AndromedaButton() {
  return (
    <div className={'relative flex h-full w-full items-center justify-center ' + jetbrainsMono.variable}>
      ...
    </div>
  )
}
```

`next/font/google` works in client components (`'use client'`) as long as it's called at **module scope**, not inside the component body. The `.variable` className needs to be applied to an ancestor of the DS component so the CSS custom property cascades down to it.

If the DS uses a different font, swap the import:
- JetBrains Mono → `import { JetBrains_Mono } from 'next/font/google'` (Andromeda)
- Any other Google Font → `import { Font_Name } from 'next/font/google'` with matching `variable: '--font-font-name'`

## Writing the description

The registry entry's `description` field is **user-facing copy** that appears on the homepage card and the detail page header. It must describe **what the component is and does**, NOT that it's a promotion wrapper or that the source lives in a DS folder. Users don't care about the mechanism.

**Good** (from `andromeda-button`):

> A sci-fi / blueprint-aesthetic button with five variants (default, outline, ghost, destructive, link), three sizes (small, medium, large), optional leading icon, and full hover / focus / active / disabled state coverage. Transparent hairline surfaces sit on a near-black canvas, with an electric-blue accent that brightens and glows on interaction.

What makes it good: names the aesthetic ("sci-fi / blueprint"), lists the variants/sizes/states the viewer will see in the preview, describes the surface treatment and accent, mentions the interaction (hover glow). Reads like any other standalone description.

**Bad** (what NOT to write):

> Promotion wrapper for the Andromeda design system's Button. Re-exports from `design-systems/andromeda/components/Button.tsx`. Source of truth lives in the DS.

What's wrong: it talks about the mechanism, not the component. The reader doesn't care where the code lives or that it's a wrapper.

## Writing the prompts

Promoted components follow the **same 3-lane prompt contract** as standalones (`Claude Code`, `Lovable`, `V0`), but with a critical twist:

**The prompt must teach the reader how to rebuild the component from scratch in their own project — NOT how to import it from the design system.**

A reader who finds Andromeda Button on aicanvas.me and opens its drawer has never heard of Andromeda. They want a self-contained recipe they can paste into their project. The prompt must inline:

- All required dependencies (`@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge`)
- The full `cva` variants object with every variant's Tailwind classes
- The helper that emits the CSS custom properties (e.g. `andromedaVars()` renamed to `spaceVars()` or `tokens()` — whatever makes sense in prose)
- The exact token values the CSS vars resolve to (hex colors, rgba alpha values, spacing numbers)
- The structural classes applied to every variant
- The `forwardRef` signature with explicit prop types (the prompt audience is building fresh code, so they get the types the wrapper has to cast for)
- The `next/font/google` setup if a specific font is required
- An example usage showing 3–5 button variants rendered on the dark background

Do NOT write prompts that say "import from the Andromeda design system" or reference any file under `design-systems/`. The promoted component must be reproducible by someone who only has the prompt and the four libraries above.

**Lane-specific notes** (same as regular standalones, covered in `../skills/prompts-guide.md`): Claude Code = mid-density spec with env-check preamble, Lovable = same content as Claude Code without the preamble, V0 = same content as Claude Code (Claude-style prompts outperform V0-specific ones even in V0).

For the first promotion (`andromeda-button`), only the Claude Code lane was filled in as proof of mechanism. Future polished promotions should cover all three lanes — **but if the component is complex and the lanes would take a long session, start with Claude Code and flesh out the others later.** Partial prompts are fine; the drawer UI filters to lanes that have content.

## Full integration steps

Once the wrapper folder exists with `index.tsx`, `prompts.ts`, and `spec.md`, follow these steps to get the card on the homepage grid. This is the same flow as any standalone integration — the `integration/CLAUDE.md` file documents it, and promotion adds no special cases.

1. **Register imports** in `app/lib/component-registry.tsx`:
   ```tsx
   import { AndromedaButton } from '../../components-workspace/andromeda-button'
   import { prompts as andromedaButtonPrompts } from '../../components-workspace/andromeda-button/prompts'
   ```

2. **Add a code constant** that mirrors the wrapper source (for the detail page's code panel). Name it `<SLUG>_CODE` in uppercase snake case:
   ```tsx
   const ANDROMEDA_BUTTON_CODE = `...wrapper source as a template literal...`
   ```
   If the wrapper's source uses template literals with `${...}` interpolation, you must either escape them as `\${...}` inside the code string OR rewrite the wrapper to use string concatenation so the code string can be a clean copy-paste. The andromeda-button wrapper does the latter for exactly this reason.

3. **Append an entry** to the `COMPONENTS` array at the bottom of the registry:
   ```tsx
   {
     slug: 'andromeda-button',
     name: 'Andromeda Button',
     description: '…natural user-facing copy…',
     image: 'https://ik.imagekit.io/aitoolkit/andromeda-button.png',  // filled in after step 5
     tags: [
       { label: 'Buttons & Toggles', accent: true },
       { label: 'Design System', accent: true },
       { label: 'Andromeda' },
     ],
     PreviewComponent: AndromedaButton,
     code: ANDROMEDA_BUTTON_CODE,
     prompts: andromedaButtonPrompts,
   }
   ```
   **Always include a `Design System` tag and a tag with the DS name.** Users filtering by "Design System" should see all promoted components; users filtering by "Andromeda" should see only Andromeda promotions.

4. **Add the slug to `scripts/screenshot.mjs`** — append to `ALL_SLUGS`. If the component needs a hover or click to look right in the preview, add an `INTERACTIONS` entry too. For most DS components (buttons, cards, badges), no interaction is needed — the default render is the content.

5. **Run the screenshot**. Dev server must be running:
   ```bash
   npm run screenshot -- andromeda-button
   ```
   Copy the printed ImageKit URL and paste it into the registry entry's `image` field. The entry is not complete until the `image` field is a real ImageKit URL (not empty, not a placeholder).

6. **Verify with `npx tsc --noEmit`** — must be exit 0. Any type error here usually means the boundary retyping (Pattern 1) missed a prop you're using in the JSX.

7. **Smoke test in the browser**: open `http://localhost:3000/` and confirm the card appears at the end of the grid with the uploaded screenshot. Click into `http://localhost:3000/components/<slug>` and confirm the detail page renders the live component and shows the prompts drawer.

## Un-promotion

If a promoted component needs to be removed from the homepage (e.g., the DS is deprecated or the user decides it shouldn't be featured):

1. Remove the registry entry from `COMPONENTS[]`
2. Remove the two `import` lines at the top of the registry
3. Remove the `<SLUG>_CODE` constant
4. Remove the slug from `ALL_SLUGS` in `scripts/screenshot.mjs` (and any `INTERACTIONS` entry)
5. Delete the ImageKit file via the API (see `feedback_screenshot_cleanup` memory — use `scripts/screenshot.mjs`'s private key for auth)
6. Delete the `components-workspace/<wrapper-name>/` folder

The DS source at `design-systems/<system>/components/<Component>.tsx` is NEVER touched during un-promotion. It stays exactly as it was before the wrapper existed.

## Updating a promoted component

Two separate cases:

**Case A: the DS source changed.** If someone updates `design-systems/andromeda/components/Button.tsx` (new variant, adjusted tokens, different prop API), the wrapper automatically reflects the change because it re-exports from the source. **But the wrapper's boundary type might drift** — if a new variant was added to the DS but the wrapper's `AndromedaButtonProps.variant` union still lists only the old ones, TypeScript will flag new usages. Update the boundary type to match the new DS API.

The `code` string in the registry will also be out of date after a wrapper change. If the wrapper was updated (not just the DS source), re-copy the new wrapper source into the `<SLUG>_CODE` template literal.

**Case B: the wrapper itself needs tweaking.** Changing the preview layout, swapping background colors, updating sample labels. Edit the wrapper file, sync the `code` constant, re-run the screenshot, verify the new ImageKit URL (same filename overwrites the old one because the upload script sets `overwriteFile: true`), clear `.next/cache/images/` so localhost serves the fresh image, smoke test.

## When NOT to promote

Some DS components don't make sense as homepage cards. Don't promote them.

- **Layout-dependent components.** Andromeda's `CornerMarkers` is a decorative overlay that only reads correctly when it wraps an outer container in a real UI layout. On its own in a 480×480 card, it's just four disconnected brackets. Not worth promoting.
- **Composition-only components.** `CardHeader`, `CardContent`, `CardFooter` — these are sub-parts of `Card`. Promote `Card` (which includes them), not the sub-parts individually.
- **Data-dependent components.** Things that only look right when filled with real data (`StatTile` might qualify if the stat value is the interesting part). You can still promote them by hard-coding plausible sample data in the wrapper, but consider whether the hardcoded data tells a complete story on its own.
- **Dashboard-scale compositions.** Don't promote entire example dashboards (like Andromeda's `mission-control` or Meridian's `dashboard`). Those live under `examples/` and are showcased at the DS's own route — they're not standalone components.

## Worked example inventory

| DS component | Wrapper slug | Status | Notes |
|---|---|---|---|
| `andromeda/components/Button.tsx` | `andromeda-button` | ✅ Integrated | First promotion. Boundary retyping pattern originated here. `#0E0E0F` container override. Only Claude prompt lane filled. |

Extend this table as new components are promoted.
