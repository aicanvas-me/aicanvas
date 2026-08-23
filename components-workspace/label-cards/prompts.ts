import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion

Root element: className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#E8E8DF] dark:bg-[#1A1A19]"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Build a "Label Cards" component in React + Framer Motion ('use client', single file).

Five 16:9 label cards (base 300×169px) scattered at random angles across the canvas. Each card has a bold solid-colour background. Tap any card to spring it to centre; tap again to release. All cards stay fully visible at all times, no fading.

**Card data (5 entries):**
| title | sub1 | sub2 | since | bg | fg |
|---|---|---|---|---|---|
| Mobile Apps | Native iOS & Android | Interaction Design | 2023 | #5CAD60 | #162217 |
| Web Design | React & Next.js | Frontend Systems | 2021 | #EDD540 | #241F05 |
| Branding | Visual Identity | Brand Strategy | 2020 | #1C2E8A | #E8EDF8 |
| Editorial | Magazine & Print | Typography Systems | 2022 | #D43C3C | #FAE8E8 |
| Motion | Animation & Micro-UX | Interaction Patterns | 2023 | #E08030 | #2A1A06 |

Idle scatter positions (applied as Framer Motion x/y):
Cards 0–4: {x:-82,y:-70,r:-11}, {x:-48,y:66,r:9}, {x:12,y:-14,r:-4}, {x:68,y:62,r:14}, {x:84,y:-86,r:18}

**Card anatomy (top→bottom, 16:9 ratio):**
- Title row: ✳ glyph (weight 900) + bold title left; "Since YYYY" uppercase right (both in \`fg\` colour)
- 1px divider (fg, 22% opacity)
- Body: sub1 (weight 600) stacked above sub2 (weight 400, 60% opacity)
- Bottom bar: barcode left + logo mark right

**Barcode:** 28 thin vertical \`div\` bars, widths from pattern \`[1,2,1,1,3,1,2,1,1,3,1,1,2,1,2,1,3,1,1,2,1,3,1,2,1,1,2,1]\` × 1.5px each, 80% opacity, 1.2px gap.

**Logo mark:** 28px circle (fg border 1.5px) with "AI" text inside; "CANVAS" label below at 6.5px.

**Mobile-responsive scaling:**
Use ResizeObserver to measure container width. Derive:
\`\`\`ts
const cardW = Math.min(300, Math.floor(containerW / 1.56))
const cardH = Math.round(cardW * 9 / 16)
const scale = cardW / 300
\`\`\`
Multiply ALL px values (font sizes, padding, gap, border widths, scatter offsets) by \`scale\`.

**Animation:**
- Idle → selected: spring { stiffness: 340, damping: 28 }, animate to x:0, y:0, rotate:0, scale:1.05, zIndex:10
- Selected → idle: spring { stiffness: 240, damping: 24 }
- No hover effects: cards only respond to click/tap
- Hint text "tap a card to focus" fades out (opacity 0) when any card is selected

Container: \`className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#E8E8DF] dark:bg-[#1A1A19]"\` with a subtle 28px dot-grid background pattern.

## Typography
- Font: project default sans-serif
- Sizes: 6.5px, 7.5px, 9px, 11px, 11.5px, 16px, 18px
- Weights: 400, 600, 700, 800, 900`,

  'Lovable': `Build a "Label Cards" component in React + Framer Motion ('use client', single file).

Five 16:9 label cards (base 300×169px) scattered at random angles across the canvas. Each card has a bold solid-colour background. Tap any card to spring it to centre; tap again to release. All cards stay fully visible at all times — no fading.

**Card data (5 entries):**
| title | sub1 | sub2 | since | bg | fg |
|---|---|---|---|---|---|
| Mobile Apps | Native iOS & Android | Interaction Design | 2023 | #5CAD60 | #162217 |
| Web Design | React & Next.js | Frontend Systems | 2021 | #EDD540 | #241F05 |
| Branding | Visual Identity | Brand Strategy | 2020 | #1C2E8A | #E8EDF8 |
| Editorial | Magazine & Print | Typography Systems | 2022 | #D43C3C | #FAE8E8 |
| Motion | Animation & Micro-UX | Interaction Patterns | 2023 | #E08030 | #2A1A06 |

Idle scatter positions (applied as Framer Motion x/y):
Cards 0–4: {x:-82,y:-70,r:-11}, {x:-48,y:66,r:9}, {x:12,y:-14,r:-4}, {x:68,y:62,r:14}, {x:84,y:-86,r:18}

**Card anatomy (top→bottom, 16:9 ratio):**
- Title row: ✳ glyph (weight 900) + bold title left; "Since YYYY" uppercase right (both in \`fg\` colour)
- 1px divider (fg, 22% opacity)
- Body: sub1 (weight 600) stacked above sub2 (weight 400, 60% opacity)
- Bottom bar: barcode left + logo mark right

**Barcode:** 28 thin vertical \`div\` bars, widths from pattern \`[1,2,1,1,3,1,2,1,1,3,1,1,2,1,2,1,3,1,1,2,1,3,1,2,1,1,2,1]\` × 1.5px each, 80% opacity, 1.2px gap.

**Logo mark:** 28px circle (fg border 1.5px) with "AI" text inside; "CANVAS" label below at 6.5px.

**Mobile-responsive scaling:**
Use ResizeObserver to measure container width. Derive:
\`\`\`ts
const cardW = Math.min(300, Math.floor(containerW / 1.56))
const cardH = Math.round(cardW * 9 / 16)
const scale = cardW / 300
\`\`\`
Multiply ALL px values (font sizes, padding, gap, border widths, scatter offsets) by \`scale\`.

**Animation:**
- Idle → selected: spring { stiffness: 340, damping: 28 }, animate to x:0, y:0, rotate:0, scale:1.05, zIndex:10
- Selected → idle: spring { stiffness: 240, damping: 24 }
- No hover effects — cards only respond to click/tap
- Hint text "tap a card to focus" fades out (opacity 0) when any card is selected

Container: \`className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#E8E8DF] dark:bg-[#1A1A19]"\` with a subtle 28px dot-grid background pattern.

## Typography
- Font: project default sans-serif
- Sizes: 6.5px, 7.5px, 9px, 11px, 11.5px, 16px, 18px
- Weights: 400, 600, 700, 800, 900`,

  'V0': `Build a "Label Cards" component in React + Framer Motion ('use client', single file).

Five 16:9 label cards (base 300×169px) scattered at random angles across the canvas. Each card has a bold solid-colour background. Tap any card to spring it to centre; tap again to release. All cards stay fully visible at all times — no fading.

**Card data (5 entries):**
| title | sub1 | sub2 | since | bg | fg |
|---|---|---|---|---|---|
| Mobile Apps | Native iOS & Android | Interaction Design | 2023 | #5CAD60 | #162217 |
| Web Design | React & Next.js | Frontend Systems | 2021 | #EDD540 | #241F05 |
| Branding | Visual Identity | Brand Strategy | 2020 | #1C2E8A | #E8EDF8 |
| Editorial | Magazine & Print | Typography Systems | 2022 | #D43C3C | #FAE8E8 |
| Motion | Animation & Micro-UX | Interaction Patterns | 2023 | #E08030 | #2A1A06 |

Idle scatter positions (applied as Framer Motion x/y):
Cards 0–4: {x:-82,y:-70,r:-11}, {x:-48,y:66,r:9}, {x:12,y:-14,r:-4}, {x:68,y:62,r:14}, {x:84,y:-86,r:18}

**Card anatomy (top→bottom, 16:9 ratio):**
- Title row: ✳ glyph (weight 900) + bold title left; "Since YYYY" uppercase right (both in \`fg\` colour)
- 1px divider (fg, 22% opacity)
- Body: sub1 (weight 600) stacked above sub2 (weight 400, 60% opacity)
- Bottom bar: barcode left + logo mark right

**Barcode:** 28 thin vertical \`div\` bars, widths from pattern \`[1,2,1,1,3,1,2,1,1,3,1,1,2,1,2,1,3,1,1,2,1,3,1,2,1,1,2,1]\` × 1.5px each, 80% opacity, 1.2px gap.

**Logo mark:** 28px circle (fg border 1.5px) with "AI" text inside; "CANVAS" label below at 6.5px.

**Mobile-responsive scaling:**
Use ResizeObserver to measure container width. Derive:
\`\`\`ts
const cardW = Math.min(300, Math.floor(containerW / 1.56))
const cardH = Math.round(cardW * 9 / 16)
const scale = cardW / 300
\`\`\`
Multiply ALL px values (font sizes, padding, gap, border widths, scatter offsets) by \`scale\`.

**Animation:**
- Idle → selected: spring { stiffness: 340, damping: 28 }, animate to x:0, y:0, rotate:0, scale:1.05, zIndex:10
- Selected → idle: spring { stiffness: 240, damping: 24 }
- No hover effects — cards only respond to click/tap
- Hint text "tap a card to focus" fades out (opacity 0) when any card is selected

Container: \`className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#E8E8DF] dark:bg-[#1A1A19]"\` with a subtle 28px dot-grid background pattern.

## Typography
- Font: project default sans-serif
- Sizes: 6.5px, 7.5px, 9px, 11px, 11.5px, 16px, 18px
- Weights: 400, 600, 700, 800, 900`,
}
