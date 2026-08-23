import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install class-variance-authority clsx tailwind-merge @carbon/icons-react

Root element must use min-h-screen.
The root ships full height with min-h-screen and the CLI install delivers it exactly as shown, so a standalone paste needs no change. Drop it into a container of your own and that container needs a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Build a Andromeda Button, a sci-fi / blueprint-style button with shadcn-style variants, fully self-contained in a single file. The button should feel like it belongs on a dark mission-control UI: transparent fills, 1px hairline borders, electric-blue accent, JetBrains Mono uppercase label with wide letter-spacing.

## File structure
Single file: \`andromeda-button.tsx\`. No external component library except Radix Slot (\`@radix-ui/react-slot\`), cva (\`class-variance-authority\`), clsx, and tailwind-merge, all of which are already in most Next.js starters. Do not extract helpers into separate files.

## Required dependencies
- \`react\` (with \`forwardRef\`)
- \`@radix-ui/react-slot\`: for \`asChild\`
- \`class-variance-authority\`: for the variants object
- \`clsx\` + \`tailwind-merge\`: for the \`cn\` helper
- Tailwind CSS v4 (the button is fully styled via arbitrary-value Tailwind classes referencing CSS custom properties)

## Visual spec
Render a dark container (\`background: #0E0E0F\`) showing three buttons stacked vertically with 12px gap:
1. \`<Button variant="default">Launch</Button>\`: electric-blue accent fill, accent border, glow on hover
2. \`<Button variant="outline">Cancel</Button>\`: transparent, white hairline border, subtle raised surface on hover
3. \`<Button variant="ghost" size="sm">Learn more</Button>\`: no border, label only, subtle background on hover

## Variants (cva)
5 variants × 3 sizes. Every state expressed as Tailwind arbitrary-value classes referencing \`var(--andromeda-...)\` custom properties. The properties are emitted onto the button's own style prop by a helper \`andromedaVars()\` (below), so each button is self-contained.

Variants:
- \`default\`: text \`var(--andromeda-accent-base)\`, bg \`var(--andromeda-accent-glow-soft)\`, border \`var(--andromeda-accent-dim)\`, hover brightens everything and adds a 16px glow shadow
- \`outline\`: text \`var(--andromeda-text-primary)\`, bg \`var(--andromeda-surface-raised)\`, border \`var(--andromeda-border-base)\`, hover surface + brighter border
- \`ghost\`: transparent bg & border, text \`var(--andromeda-text-secondary)\`, hover brightens text and fills background
- \`destructive\`: red-tinted version of default, uses \`var(--andromeda-fault-*)\` tokens
- \`link\`: transparent, accent text, underline on hover, no focus ring

Sizes:
- \`sm\`: px-3 py-[5px], text-[10px]
- \`md\`: px-4 py-2, text-[12px]
- \`lg\`: px-5 py-[11px], text-[14px]

Default variants: \`variant: 'default'\`, \`size: 'md'\`.

## Tokens (inline in the file)
Put this at the top of the file and spread its return value onto each button's \`style\` prop via \`{...andromedaVars(), ...style}\`:

\`\`\`ts
const andromedaVars = () => ({
  '--andromeda-text-primary':   'rgba(255,255,255,0.96)',
  '--andromeda-text-secondary': 'rgba(255,255,255,0.62)',
  '--andromeda-surface-raised': 'rgba(255,255,255,0.025)',
  '--andromeda-surface-hover':  'rgba(255,255,255,0.06)',
  '--andromeda-surface-active': 'rgba(255,255,255,0.09)',
  '--andromeda-border-base':    'rgba(255,255,255,0.08)',
  '--andromeda-border-bright':  'rgba(255,255,255,0.32)',
  '--andromeda-accent-base':      '#60A5FA',
  '--andromeda-accent-bright':    '#93C5FD',
  '--andromeda-accent-dim':       'rgba(96,165,250,0.55)',
  '--andromeda-accent-glow':      'rgba(96,165,250,0.18)',
  '--andromeda-accent-glow-soft': 'rgba(96,165,250,0.08)',
  '--andromeda-fault':     '#EF4444',
  '--andromeda-fault-dim': 'rgba(239,68,68,0.50)',
  '--andromeda-fault-glow':'rgba(239,68,68,0.10)',
  '--andromeda-fault-ring':'rgba(239,68,68,0.25)',
  '--andromeda-font-mono': "'JetBrains Mono', 'IBM Plex Mono', Menlo, Monaco, monospace",
  '--andromeda-weight-medium':  '500',
  '--andromeda-tracking-wider': '0.14em',
  '--andromeda-leading-tight':  '1.1',
  '--andromeda-radius-none':    '0',
  '--andromeda-2': '8px',
  '--andromeda-3': '12px',
  '--andromeda-4': '16px',
  '--andromeda-5': '20px',
}) as React.CSSProperties
\`\`\`

## Structural classes (applied to every variant)
\`\`\`
'relative inline-flex items-center justify-center select-none whitespace-nowrap'
'gap-[var(--andromeda-2)] border border-solid rounded-[var(--andromeda-radius-none)]'
'[font-family:var(--andromeda-font-mono)] font-[number:var(--andromeda-weight-medium)]'
'uppercase [letter-spacing:var(--andromeda-tracking-wider)] [line-height:var(--andromeda-leading-tight)]'
'cursor-pointer transition-all duration-150 ease-out active:scale-[0.97]'
'[backdrop-filter:blur(2px)] [-webkit-backdrop-filter:blur(2px)]'
'focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--andromeda-accent-dim),0_0_12px_var(--andromeda-accent-glow)]'
'disabled:cursor-not-allowed disabled:opacity-[0.35] disabled:pointer-events-none'
\`\`\`

## API shape
\`\`\`ts
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'default', size = 'md', asChild = false, icon: Icon, children, style, type = 'button', ...props },
  ref,
) { ... })
\`\`\`

- \`asChild: boolean\`. When true, renders via Radix Slot (merges props/styles into the only child)
- \`icon?: React.ComponentType<{ size?: number }>\`. Optional icon component rendered before children; size 16/18/20 for sm/md/lg
- All other \`ButtonHTMLAttributes<HTMLButtonElement>\` are passed through via \`...props\`

## Page wrapper
Render the demo with \`JetBrains_Mono\` from \`next/font/google\` (variable: \`--font-jetbrains-mono\`). Put the font's \`.variable\` className on the root container so the \`--andromeda-font-mono\` token resolves to the loaded font.

## Checklist before you finish
- [ ] The file has \`'use client'\` at the top
- [ ] \`andromedaVars()\` is spread onto every button's \`style\` prop (so tokens cascade without a context)
- [ ] All three size steps work (sm/md/lg)
- [ ] Hover on the default variant brightens text, background, border AND adds a blue glow shadow
- [ ] Focus-visible shows a 1px accent ring + 12px accent glow (not a browser default outline)
- [ ] \`active:scale-[0.97]\` is present
- [ ] \`asChild\` with a single \`<a>\` child renders an anchor, not a button, with the same styles

## Typography
- Font: JetBrains Mono
- Sizes: 10px, 12px, 14px`,

  'Lovable': `Build a Andromeda Button — a sci-fi / blueprint-style button with shadcn-style variants, fully self-contained in a single file. The button should feel like it belongs on a dark mission-control UI: transparent fills, 1px hairline borders, electric-blue accent, JetBrains Mono uppercase label with wide letter-spacing.

## File structure
Single file: \`andromeda-button.tsx\`. No external component library except Radix Slot (\`@radix-ui/react-slot\`), cva (\`class-variance-authority\`), clsx, and tailwind-merge — all of which are already in most Next.js starters. Do not extract helpers into separate files.

## Required dependencies
- \`react\` (with \`forwardRef\`)
- \`@radix-ui/react-slot\` — for \`asChild\`
- \`class-variance-authority\` — for the variants object
- \`clsx\` + \`tailwind-merge\` — for the \`cn\` helper
- Tailwind CSS v4 (the button is fully styled via arbitrary-value Tailwind classes referencing CSS custom properties)

## Visual spec
Render a dark container (\`background: #0E0E0F\`) showing three buttons stacked vertically with 12px gap:
1. \`<Button variant="default">Launch</Button>\` — electric-blue accent fill, accent border, glow on hover
2. \`<Button variant="outline">Cancel</Button>\` — transparent, white hairline border, subtle raised surface on hover
3. \`<Button variant="ghost" size="sm">Learn more</Button>\` — no border, label only, subtle background on hover

## Variants (cva)
5 variants × 3 sizes. Every state expressed as Tailwind arbitrary-value classes referencing \`var(--andromeda-...)\` custom properties. The properties are emitted onto the button's own style prop by a helper \`andromedaVars()\` (below), so each button is self-contained.

Variants:
- \`default\` — text \`var(--andromeda-accent-base)\`, bg \`var(--andromeda-accent-glow-soft)\`, border \`var(--andromeda-accent-dim)\`, hover brightens everything and adds a 16px glow shadow
- \`outline\` — text \`var(--andromeda-text-primary)\`, bg \`var(--andromeda-surface-raised)\`, border \`var(--andromeda-border-base)\`, hover surface + brighter border
- \`ghost\` — transparent bg & border, text \`var(--andromeda-text-secondary)\`, hover brightens text and fills background
- \`destructive\` — red-tinted version of default, uses \`var(--andromeda-fault-*)\` tokens
- \`link\` — transparent, accent text, underline on hover, no focus ring

Sizes:
- \`sm\` — px-3 py-[5px], text-[10px]
- \`md\` — px-4 py-2, text-[12px]
- \`lg\` — px-5 py-[11px], text-[14px]

Default variants: \`variant: 'default'\`, \`size: 'md'\`.

## Tokens (inline in the file)
Put this at the top of the file and spread its return value onto each button's \`style\` prop via \`{...andromedaVars(), ...style}\`:

\`\`\`ts
const andromedaVars = () => ({
  '--andromeda-text-primary':   'rgba(255,255,255,0.96)',
  '--andromeda-text-secondary': 'rgba(255,255,255,0.62)',
  '--andromeda-surface-raised': 'rgba(255,255,255,0.025)',
  '--andromeda-surface-hover':  'rgba(255,255,255,0.06)',
  '--andromeda-surface-active': 'rgba(255,255,255,0.09)',
  '--andromeda-border-base':    'rgba(255,255,255,0.08)',
  '--andromeda-border-bright':  'rgba(255,255,255,0.32)',
  '--andromeda-accent-base':      '#60A5FA',
  '--andromeda-accent-bright':    '#93C5FD',
  '--andromeda-accent-dim':       'rgba(96,165,250,0.55)',
  '--andromeda-accent-glow':      'rgba(96,165,250,0.18)',
  '--andromeda-accent-glow-soft': 'rgba(96,165,250,0.08)',
  '--andromeda-fault':     '#EF4444',
  '--andromeda-fault-dim': 'rgba(239,68,68,0.50)',
  '--andromeda-fault-glow':'rgba(239,68,68,0.10)',
  '--andromeda-fault-ring':'rgba(239,68,68,0.25)',
  '--andromeda-font-mono': "'JetBrains Mono', 'IBM Plex Mono', Menlo, Monaco, monospace",
  '--andromeda-weight-medium':  '500',
  '--andromeda-tracking-wider': '0.14em',
  '--andromeda-leading-tight':  '1.1',
  '--andromeda-radius-none':    '0',
  '--andromeda-2': '8px',
  '--andromeda-3': '12px',
  '--andromeda-4': '16px',
  '--andromeda-5': '20px',
}) as React.CSSProperties
\`\`\`

## Structural classes (applied to every variant)
\`\`\`
'relative inline-flex items-center justify-center select-none whitespace-nowrap'
'gap-[var(--andromeda-2)] border border-solid rounded-[var(--andromeda-radius-none)]'
'[font-family:var(--andromeda-font-mono)] font-[number:var(--andromeda-weight-medium)]'
'uppercase [letter-spacing:var(--andromeda-tracking-wider)] [line-height:var(--andromeda-leading-tight)]'
'cursor-pointer transition-all duration-150 ease-out active:scale-[0.97]'
'[backdrop-filter:blur(2px)] [-webkit-backdrop-filter:blur(2px)]'
'focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--andromeda-accent-dim),0_0_12px_var(--andromeda-accent-glow)]'
'disabled:cursor-not-allowed disabled:opacity-[0.35] disabled:pointer-events-none'
\`\`\`

## API shape
\`\`\`ts
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'default', size = 'md', asChild = false, icon: Icon, children, style, type = 'button', ...props },
  ref,
) { ... })
\`\`\`

- \`asChild: boolean\` — when true, renders via Radix Slot (merges props/styles into the only child)
- \`icon?: React.ComponentType<{ size?: number }>\` — optional icon component rendered before children; size 16/18/20 for sm/md/lg
- All other \`ButtonHTMLAttributes<HTMLButtonElement>\` are passed through via \`...props\`

## Page wrapper
Render the demo with \`JetBrains_Mono\` from \`next/font/google\` (variable: \`--font-jetbrains-mono\`). Put the font's \`.variable\` className on the root container so the \`--andromeda-font-mono\` token resolves to the loaded font.

## Checklist before you finish
- [ ] The file has \`'use client'\` at the top
- [ ] \`andromedaVars()\` is spread onto every button's \`style\` prop (so tokens cascade without a context)
- [ ] All three size steps work (sm/md/lg)
- [ ] Hover on the default variant brightens text, background, border AND adds a blue glow shadow
- [ ] Focus-visible shows a 1px accent ring + 12px accent glow (not a browser default outline)
- [ ] \`active:scale-[0.97]\` is present
- [ ] \`asChild\` with a single \`<a>\` child renders an anchor, not a button, with the same styles

## Typography
- Font: JetBrains Mono
- Sizes: 10px, 12px, 14px`,

  'V0': `Build a Andromeda Button — a sci-fi / blueprint-style button with shadcn-style variants, fully self-contained in a single file. The button should feel like it belongs on a dark mission-control UI: transparent fills, 1px hairline borders, electric-blue accent, JetBrains Mono uppercase label with wide letter-spacing.

## File structure
Single file: \`andromeda-button.tsx\`. No external component library except Radix Slot (\`@radix-ui/react-slot\`), cva (\`class-variance-authority\`), clsx, and tailwind-merge — all of which are already in most Next.js starters. Do not extract helpers into separate files.

## Required dependencies
- \`react\` (with \`forwardRef\`)
- \`@radix-ui/react-slot\` — for \`asChild\`
- \`class-variance-authority\` — for the variants object
- \`clsx\` + \`tailwind-merge\` — for the \`cn\` helper
- Tailwind CSS v4 (the button is fully styled via arbitrary-value Tailwind classes referencing CSS custom properties)

## Visual spec
Render a dark container (\`background: #0E0E0F\`) showing three buttons stacked vertically with 12px gap:
1. \`<Button variant="default">Launch</Button>\` — electric-blue accent fill, accent border, glow on hover
2. \`<Button variant="outline">Cancel</Button>\` — transparent, white hairline border, subtle raised surface on hover
3. \`<Button variant="ghost" size="sm">Learn more</Button>\` — no border, label only, subtle background on hover

## Variants (cva)
5 variants × 3 sizes. Every state expressed as Tailwind arbitrary-value classes referencing \`var(--andromeda-...)\` custom properties. The properties are emitted onto the button's own style prop by a helper \`andromedaVars()\` (below), so each button is self-contained.

Variants:
- \`default\` — text \`var(--andromeda-accent-base)\`, bg \`var(--andromeda-accent-glow-soft)\`, border \`var(--andromeda-accent-dim)\`, hover brightens everything and adds a 16px glow shadow
- \`outline\` — text \`var(--andromeda-text-primary)\`, bg \`var(--andromeda-surface-raised)\`, border \`var(--andromeda-border-base)\`, hover surface + brighter border
- \`ghost\` — transparent bg & border, text \`var(--andromeda-text-secondary)\`, hover brightens text and fills background
- \`destructive\` — red-tinted version of default, uses \`var(--andromeda-fault-*)\` tokens
- \`link\` — transparent, accent text, underline on hover, no focus ring

Sizes:
- \`sm\` — px-3 py-[5px], text-[10px]
- \`md\` — px-4 py-2, text-[12px]
- \`lg\` — px-5 py-[11px], text-[14px]

Default variants: \`variant: 'default'\`, \`size: 'md'\`.

## Tokens (inline in the file)
Put this at the top of the file and spread its return value onto each button's \`style\` prop via \`{...andromedaVars(), ...style}\`:

\`\`\`ts
const andromedaVars = () => ({
  '--andromeda-text-primary':   'rgba(255,255,255,0.96)',
  '--andromeda-text-secondary': 'rgba(255,255,255,0.62)',
  '--andromeda-surface-raised': 'rgba(255,255,255,0.025)',
  '--andromeda-surface-hover':  'rgba(255,255,255,0.06)',
  '--andromeda-surface-active': 'rgba(255,255,255,0.09)',
  '--andromeda-border-base':    'rgba(255,255,255,0.08)',
  '--andromeda-border-bright':  'rgba(255,255,255,0.32)',
  '--andromeda-accent-base':      '#60A5FA',
  '--andromeda-accent-bright':    '#93C5FD',
  '--andromeda-accent-dim':       'rgba(96,165,250,0.55)',
  '--andromeda-accent-glow':      'rgba(96,165,250,0.18)',
  '--andromeda-accent-glow-soft': 'rgba(96,165,250,0.08)',
  '--andromeda-fault':     '#EF4444',
  '--andromeda-fault-dim': 'rgba(239,68,68,0.50)',
  '--andromeda-fault-glow':'rgba(239,68,68,0.10)',
  '--andromeda-fault-ring':'rgba(239,68,68,0.25)',
  '--andromeda-font-mono': "'JetBrains Mono', 'IBM Plex Mono', Menlo, Monaco, monospace",
  '--andromeda-weight-medium':  '500',
  '--andromeda-tracking-wider': '0.14em',
  '--andromeda-leading-tight':  '1.1',
  '--andromeda-radius-none':    '0',
  '--andromeda-2': '8px',
  '--andromeda-3': '12px',
  '--andromeda-4': '16px',
  '--andromeda-5': '20px',
}) as React.CSSProperties
\`\`\`

## Structural classes (applied to every variant)
\`\`\`
'relative inline-flex items-center justify-center select-none whitespace-nowrap'
'gap-[var(--andromeda-2)] border border-solid rounded-[var(--andromeda-radius-none)]'
'[font-family:var(--andromeda-font-mono)] font-[number:var(--andromeda-weight-medium)]'
'uppercase [letter-spacing:var(--andromeda-tracking-wider)] [line-height:var(--andromeda-leading-tight)]'
'cursor-pointer transition-all duration-150 ease-out active:scale-[0.97]'
'[backdrop-filter:blur(2px)] [-webkit-backdrop-filter:blur(2px)]'
'focus-visible:outline-none focus-visible:shadow-[0_0_0_1px_var(--andromeda-accent-dim),0_0_12px_var(--andromeda-accent-glow)]'
'disabled:cursor-not-allowed disabled:opacity-[0.35] disabled:pointer-events-none'
\`\`\`

## API shape
\`\`\`ts
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'default', size = 'md', asChild = false, icon: Icon, children, style, type = 'button', ...props },
  ref,
) { ... })
\`\`\`

- \`asChild: boolean\` — when true, renders via Radix Slot (merges props/styles into the only child)
- \`icon?: React.ComponentType<{ size?: number }>\` — optional icon component rendered before children; size 16/18/20 for sm/md/lg
- All other \`ButtonHTMLAttributes<HTMLButtonElement>\` are passed through via \`...props\`

## Page wrapper
Render the demo with \`JetBrains_Mono\` from \`next/font/google\` (variable: \`--font-jetbrains-mono\`). Put the font's \`.variable\` className on the root container so the \`--andromeda-font-mono\` token resolves to the loaded font.

## Checklist before you finish
- [ ] The file has \`'use client'\` at the top
- [ ] \`andromedaVars()\` is spread onto every button's \`style\` prop (so tokens cascade without a context)
- [ ] All three size steps work (sm/md/lg)
- [ ] Hover on the default variant brightens text, background, border AND adds a blue glow shadow
- [ ] Focus-visible shows a 1px accent ring + 12px accent glow (not a browser default outline)
- [ ] \`active:scale-[0.97]\` is present
- [ ] \`asChild\` with a single \`<a>\` child renders an anchor, not a button, with the same styles

## Typography
- Font: JetBrains Mono
- Sizes: 10px, 12px, 14px`,
}
