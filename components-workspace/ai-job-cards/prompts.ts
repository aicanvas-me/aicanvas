import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion @phosphor-icons/react

Root element: className="flex min-h-screen w-full items-center justify-center"
The root ships full height with min-h-screen and the CLI install delivers it exactly as shown, so a standalone paste needs no change. Drop it into a container of your own and that container needs a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Build an AI Job Cards component in a single 'use client' TypeScript file.

## What it is
Three stacked card columns, one each for Anthropic, Perplexity, and Google. Each column is a stack of 3 overlapping job cards. The front card is fully visible; the middle and back cards peek below it like a fan. Drag or swipe the front card up or down to cycle to the next card in that column.

## Layout
- Pale blue-grey outer bg (#CADBDD light / #0d0d0c dark), padding: clamp(16px, 5%, 40px)
- Row of 3 stacks on wide screens, single column when container width < 480px (ResizeObserver)
- Stacks max-width 760px

## Card anatomy (top → bottom)
1. Rate badge ($120/hr) left, BookmarkSimple icon (phosphor) top-right, click to toggle filled/outline + scale-pop spring
2. Job title (bold 20px, up to 2 lines, maxWidth 72%), vertical pagination dots column on the right
3. Divider
4. Brand logo (24px inline SVG) + company + role label, dark pill "View" button

## Stack constants
\`\`\`ts
const CARD_H = 234
const PEEK   = 20
const SLOTS = [
  { y: 0,        scale: 1,    z: 3 },
  { y: PEEK,     scale: 0.96, z: 2 },
  { y: PEEK * 2, scale: 0.92, z: 1 },
]
\`\`\`

## Cycle animation
- Front card exits: y: ±160, scale: 0.88, opacity: 0 over 380ms ease [0.4,0,0.2,1]
- Other cards spring into new slots: stiffness 280, damping 26
- Exiting card instantly returns to back slot (duration: 0) then snaps to position
- direction tracked in a ref: swipe up → exit to top, swipe down → exit to bottom

## Interaction
- Front card has drag="y" with dragElastic: 0.2, dragConstraints top/bottom: 0
- Trigger cycle if |offset.y| > 60 OR |velocity.y| > 400
- Pagination dots button (top-right of title row) also cycles on click
- Hover lift: front card y - 4, spring stiffness 300, damping 24

## Card colours (theme-aware)
- Card bg: #1e1e1c (dark) / #F7F7EF (light)
- Title: #F5F5F0 / #141412; Rate: 55% opacity; Divider: 8% opacity
- Bookmark filled = #e05c6a; dot active = #E5E5E0 (dark) / #2a2a28 (light)
- View button: dark pill in light, light pill in dark

## Brand logos (inline SVG, no external libs)
- Anthropic: Claude anthropic spiral, fill #d97757
- Perplexity: Bootstrap Icons P star mark, fill white (dark) / #1C1C1C (light)
- Google: Gemini 4-pointed star with gradient #4893FC → #969DFF → #BD99FE

## Borders
- 1px solid at 10% opacity of the brand colour
- Anthropic: #d97757, Perplexity: #FFFFFF dark / #1C1C1C light, Google: #4893FC

## Theme detection
useIsDark hook uses MutationObserver on document.documentElement watching the 'class' attribute.

## Data (3 stacks × 3 cards each)
Anthropic: Prompt Engineer $120/hr, AI Safety Researcher $145/hr, Interpretability Lead $155/hr
Perplexity: Generative AI Lead $160/hr, ML Engineer $135/hr, Search AI Researcher $140/hr
Google: LLM Platform Engineer $130-160/hr, AI Research Scientist $150/hr, Multimodal AI Lead $165/hr

Inline everything. Single file. Use Framer Motion for all animation.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 12px, 20px
- Weights: 500, 600, 700, 800`,

  'Lovable': `Build an AI Job Cards component in a single 'use client' TypeScript file.

## What it is
Three stacked card columns — one each for Anthropic, Perplexity, and Google. Each column is a stack of 3 overlapping job cards. The front card is fully visible; the middle and back cards peek below it like a fan. Drag or swipe the front card up or down to cycle to the next card in that column.

## Layout
- Pale blue-grey outer bg (#CADBDD light / #0d0d0c dark), padding: clamp(16px, 5%, 40px)
- Row of 3 stacks on wide screens, single column when container width < 480px (ResizeObserver)
- Stacks max-width 760px

## Card anatomy (top → bottom)
1. Rate badge ($120/hr) left — BookmarkSimple icon (phosphor) top-right, click to toggle filled/outline + scale-pop spring
2. Job title (bold 20px, up to 2 lines, maxWidth 72%) — vertical pagination dots column on the right
3. Divider
4. Brand logo (24px inline SVG) + company + role label — dark pill "View" button

## Stack constants
\`\`\`ts
const CARD_H = 234
const PEEK   = 20
const SLOTS = [
  { y: 0,        scale: 1,    z: 3 },
  { y: PEEK,     scale: 0.96, z: 2 },
  { y: PEEK * 2, scale: 0.92, z: 1 },
]
\`\`\`

## Cycle animation
- Front card exits: y: ±160, scale: 0.88, opacity: 0 over 380ms ease [0.4,0,0.2,1]
- Other cards spring into new slots: stiffness 280, damping 26
- Exiting card instantly returns to back slot (duration: 0) then snaps to position
- direction tracked in a ref: swipe up → exit to top, swipe down → exit to bottom

## Interaction
- Front card has drag="y" with dragElastic: 0.2, dragConstraints top/bottom: 0
- Trigger cycle if |offset.y| > 60 OR |velocity.y| > 400
- Pagination dots button (top-right of title row) also cycles on click
- Hover lift: front card y - 4, spring stiffness 300, damping 24

## Card colours (theme-aware)
- Card bg: #1e1e1c (dark) / #F7F7EF (light)
- Title: #F5F5F0 / #141412; Rate: 55% opacity; Divider: 8% opacity
- Bookmark filled = #e05c6a; dot active = #E5E5E0 (dark) / #2a2a28 (light)
- View button: dark pill in light, light pill in dark

## Brand logos (inline SVG — no external libs)
- Anthropic: Claude anthropic spiral, fill #d97757
- Perplexity: Bootstrap Icons P star mark, fill white (dark) / #1C1C1C (light)
- Google: Gemini 4-pointed star with gradient #4893FC → #969DFF → #BD99FE

## Borders
- 1px solid at 10% opacity of the brand colour
- Anthropic: #d97757, Perplexity: #FFFFFF dark / #1C1C1C light, Google: #4893FC

## Theme detection
useIsDark hook uses MutationObserver on document.documentElement watching the 'class' attribute.

## Data (3 stacks × 3 cards each)
Anthropic: Prompt Engineer $120/hr, AI Safety Researcher $145/hr, Interpretability Lead $155/hr
Perplexity: Generative AI Lead $160/hr, ML Engineer $135/hr, Search AI Researcher $140/hr
Google: LLM Platform Engineer $130-160/hr, AI Research Scientist $150/hr, Multimodal AI Lead $165/hr

Inline everything. Single file. Use Framer Motion for all animation.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 12px, 20px
- Weights: 500, 600, 700, 800`,

  'V0': `Build an AI Job Cards component in a single 'use client' TypeScript file.

## What it is
Three stacked card columns — one each for Anthropic, Perplexity, and Google. Each column is a stack of 3 overlapping job cards. The front card is fully visible; the middle and back cards peek below it like a fan. Drag or swipe the front card up or down to cycle to the next card in that column.

## Layout
- Pale blue-grey outer bg (#CADBDD light / #0d0d0c dark), padding: clamp(16px, 5%, 40px)
- Row of 3 stacks on wide screens, single column when container width < 480px (ResizeObserver)
- Stacks max-width 760px

## Card anatomy (top → bottom)
1. Rate badge ($120/hr) left — BookmarkSimple icon (phosphor) top-right, click to toggle filled/outline + scale-pop spring
2. Job title (bold 20px, up to 2 lines, maxWidth 72%) — vertical pagination dots column on the right
3. Divider
4. Brand logo (24px inline SVG) + company + role label — dark pill "View" button

## Stack constants
\`\`\`ts
const CARD_H = 234
const PEEK   = 20
const SLOTS = [
  { y: 0,        scale: 1,    z: 3 },
  { y: PEEK,     scale: 0.96, z: 2 },
  { y: PEEK * 2, scale: 0.92, z: 1 },
]
\`\`\`

## Cycle animation
- Front card exits: y: ±160, scale: 0.88, opacity: 0 over 380ms ease [0.4,0,0.2,1]
- Other cards spring into new slots: stiffness 280, damping 26
- Exiting card instantly returns to back slot (duration: 0) then snaps to position
- direction tracked in a ref: swipe up → exit to top, swipe down → exit to bottom

## Interaction
- Front card has drag="y" with dragElastic: 0.2, dragConstraints top/bottom: 0
- Trigger cycle if |offset.y| > 60 OR |velocity.y| > 400
- Pagination dots button (top-right of title row) also cycles on click
- Hover lift: front card y - 4, spring stiffness 300, damping 24

## Card colours (theme-aware)
- Card bg: #1e1e1c (dark) / #F7F7EF (light)
- Title: #F5F5F0 / #141412; Rate: 55% opacity; Divider: 8% opacity
- Bookmark filled = #e05c6a; dot active = #E5E5E0 (dark) / #2a2a28 (light)
- View button: dark pill in light, light pill in dark

## Brand logos (inline SVG — no external libs)
- Anthropic: Claude anthropic spiral, fill #d97757
- Perplexity: Bootstrap Icons P star mark, fill white (dark) / #1C1C1C (light)
- Google: Gemini 4-pointed star with gradient #4893FC → #969DFF → #BD99FE

## Borders
- 1px solid at 10% opacity of the brand colour
- Anthropic: #d97757, Perplexity: #FFFFFF dark / #1C1C1C light, Google: #4893FC

## Theme detection
useIsDark hook uses MutationObserver on document.documentElement watching the 'class' attribute.

## Data (3 stacks × 3 cards each)
Anthropic: Prompt Engineer $120/hr, AI Safety Researcher $145/hr, Interpretability Lead $155/hr
Perplexity: Generative AI Lead $160/hr, ML Engineer $135/hr, Search AI Researcher $140/hr
Google: LLM Platform Engineer $130-160/hr, AI Research Scientist $150/hr, Multimodal AI Lead $165/hr

Inline everything. Single file. Use Framer Motion for all animation.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 12px, 20px
- Weights: 500, 600, 700, 800`,
}
