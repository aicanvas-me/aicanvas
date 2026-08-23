import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion

Root element: className="relative flex min-h-screen w-full flex-col items-center justify-center gap-5 overflow-hidden"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named \`TextBlurReveal\`: words animate into view one by one with a blur-to-sharp entrance over a dark dot-grid background, followed by a subtext line and a gradient CTA button. Plays once on mount, no loop.

Write this as a single self-contained \`'use client'\` file. No props on the exported component. No \`any\` types.

## Font
The headline uses Geist Pixel Circle, registered as the CSS variable \`--font-geist-pixel-circle\` (from the \`geist\` npm package). Apply it via \`style={{ fontFamily: 'var(--font-geist-pixel-circle)' }}\` on every word span.

## Constants
\`\`\`
const WORDS = ['Craft', 'interfaces', 'that', 'feel', 'like', 'magic.']
const ACCENTED = new Set([1, 5]) // "interfaces", "magic."
const STAGGER = 100   // ms between each word
const DURATION = 650  // ms per word animation
const LAST_WORD_END = (WORDS.length - 1) * STAGGER + DURATION // 1150 ms
const SHOW_BUTTON_AT = LAST_WORD_END + 150  // 1300 ms
\`\`\`

## State & timing
\`showCTA: boolean\` (default false). \`useEffect([], [])\`: single-run on mount: \`const t = setTimeout(() => setShowCTA(true), SHOW_BUTTON_AT)\`. Return \`() => clearTimeout(t)\`. Animation plays once, no loop.

## Background
Root: \`relative flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden\`.

Dot grid (pointer-events-none absolute inset-0): \`backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)'\`, \`backgroundSize: '24px 24px'\`.

Indigo glow (pointer-events-none absolute inset-0 flex items-center justify-center): inner div \`h-40 w-80 rounded-full bg-indigo-600/20 blur-3xl\`.

## Animated words
\`relative flex flex-wrap justify-center gap-x-[0.4em] gap-y-1\`. Map WORDS. Each is a \`motion.span\` with \`key={i}\`:
- \`initial={{ opacity: 0, y: 22, filter: 'blur(14px)' }}\`
- \`animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}\`
- \`transition={{ duration: DURATION / 1000, delay: (i * STAGGER) / 1000, ease: [0.21, 0.47, 0.32, 0.98] }}\`
- \`style={{ fontFamily: 'var(--font-geist-pixel-circle)' }}\` on every span
- Accented className: \`'bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-4xl tracking-tight text-transparent'\`
- Normal className: \`'text-4xl tracking-tight text-white'\`

## Subtext
\`motion.p\` with \`key="sub"\`, \`initial={{ opacity: 0, y: 8 }}\`, \`animate={{ opacity: 1, y: 0 }}\`, \`transition={{ duration: 0.55, delay: ((WORDS.length - 1) * STAGGER + 200) / 1000, ease: 'easeOut' }}\`, className \`relative text-base text-zinc-400\`. Text: "Drop any phrase. Works with any text."

## CTA
Wrap in \`<div className="flex h-10 items-center justify-center">\` (fixed height prevents layout shift). Inside \`<AnimatePresence>\` render when \`showCTA\`:
\`motion.button\` \`initial={{ opacity: 0, y: 6 }}\` \`animate={{ opacity: 1, y: 0 }}\` \`exit={{ opacity: 0, y: 6 }}\` \`transition={{ duration: 0.35, ease: 'easeOut' }}\` \`whileHover={{ scale: 1.04 }}\` \`whileTap={{ scale: 0.97 }}\` className \`relative rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-opacity hover:opacity-90\`. Label: "Start building".

## Typography
- Font: project default sans-serif
- Sizes: 14px, 16px, 36px
- Weights: 600`,

  'Lovable': `Create a React client component named \`TextBlurReveal\` — words animate into view one by one with a blur-to-sharp entrance over a dark dot-grid background, followed by a subtext line and a gradient CTA button. Plays once on mount, no loop.

Write this as a single self-contained \`'use client'\` file. No props on the exported component. No \`any\` types.

## Font
The headline uses Geist Pixel Circle, registered as the CSS variable \`--font-geist-pixel-circle\` (from the \`geist\` npm package). Apply it via \`style={{ fontFamily: 'var(--font-geist-pixel-circle)' }}\` on every word span.

## Constants
\`\`\`
const WORDS = ['Craft', 'interfaces', 'that', 'feel', 'like', 'magic.']
const ACCENTED = new Set([1, 5]) // "interfaces", "magic."
const STAGGER = 100   // ms between each word
const DURATION = 650  // ms per word animation
const LAST_WORD_END = (WORDS.length - 1) * STAGGER + DURATION // 1150 ms
const SHOW_BUTTON_AT = LAST_WORD_END + 150  // 1300 ms
\`\`\`

## State & timing
\`showCTA: boolean\` (default false). \`useEffect([], [])\`: single-run on mount — \`const t = setTimeout(() => setShowCTA(true), SHOW_BUTTON_AT)\`. Return \`() => clearTimeout(t)\`. Animation plays once, no loop.

## Background
Root: \`relative flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden\`.

Dot grid (pointer-events-none absolute inset-0): \`backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)'\`, \`backgroundSize: '24px 24px'\`.

Indigo glow (pointer-events-none absolute inset-0 flex items-center justify-center): inner div \`h-40 w-80 rounded-full bg-indigo-600/20 blur-3xl\`.

## Animated words
\`relative flex flex-wrap justify-center gap-x-[0.4em] gap-y-1\`. Map WORDS — each is a \`motion.span\` with \`key={i}\`:
- \`initial={{ opacity: 0, y: 22, filter: 'blur(14px)' }}\`
- \`animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}\`
- \`transition={{ duration: DURATION / 1000, delay: (i * STAGGER) / 1000, ease: [0.21, 0.47, 0.32, 0.98] }}\`
- \`style={{ fontFamily: 'var(--font-geist-pixel-circle)' }}\` on every span
- Accented className: \`'bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-4xl tracking-tight text-transparent'\`
- Normal className: \`'text-4xl tracking-tight text-white'\`

## Subtext
\`motion.p\` with \`key="sub"\`, \`initial={{ opacity: 0, y: 8 }}\`, \`animate={{ opacity: 1, y: 0 }}\`, \`transition={{ duration: 0.55, delay: ((WORDS.length - 1) * STAGGER + 200) / 1000, ease: 'easeOut' }}\`, className \`relative text-base text-zinc-400\`. Text: "Drop any phrase. Works with any text."

## CTA
Wrap in \`<div className="flex h-10 items-center justify-center">\` (fixed height prevents layout shift). Inside \`<AnimatePresence>\` render when \`showCTA\`:
\`motion.button\` \`initial={{ opacity: 0, y: 6 }}\` \`animate={{ opacity: 1, y: 0 }}\` \`exit={{ opacity: 0, y: 6 }}\` \`transition={{ duration: 0.35, ease: 'easeOut' }}\` \`whileHover={{ scale: 1.04 }}\` \`whileTap={{ scale: 0.97 }}\` className \`relative rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-opacity hover:opacity-90\`. Label: "Start building".

## Typography
- Font: project default sans-serif
- Sizes: 14px, 16px, 36px
- Weights: 600`,

  'V0': `Create a React client component named \`TextBlurReveal\` — words animate into view one by one with a blur-to-sharp entrance over a dark dot-grid background, followed by a subtext line and a gradient CTA button. Plays once on mount, no loop.

Write this as a single self-contained \`'use client'\` file. No props on the exported component. No \`any\` types.

## Font
The headline uses Geist Pixel Circle, registered as the CSS variable \`--font-geist-pixel-circle\` (from the \`geist\` npm package). Apply it via \`style={{ fontFamily: 'var(--font-geist-pixel-circle)' }}\` on every word span.

## Constants
\`\`\`
const WORDS = ['Craft', 'interfaces', 'that', 'feel', 'like', 'magic.']
const ACCENTED = new Set([1, 5]) // "interfaces", "magic."
const STAGGER = 100   // ms between each word
const DURATION = 650  // ms per word animation
const LAST_WORD_END = (WORDS.length - 1) * STAGGER + DURATION // 1150 ms
const SHOW_BUTTON_AT = LAST_WORD_END + 150  // 1300 ms
\`\`\`

## State & timing
\`showCTA: boolean\` (default false). \`useEffect([], [])\`: single-run on mount — \`const t = setTimeout(() => setShowCTA(true), SHOW_BUTTON_AT)\`. Return \`() => clearTimeout(t)\`. Animation plays once, no loop.

## Background
Root: \`relative flex h-full w-full flex-col items-center justify-center gap-5 overflow-hidden\`.

Dot grid (pointer-events-none absolute inset-0): \`backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)'\`, \`backgroundSize: '24px 24px'\`.

Indigo glow (pointer-events-none absolute inset-0 flex items-center justify-center): inner div \`h-40 w-80 rounded-full bg-indigo-600/20 blur-3xl\`.

## Animated words
\`relative flex flex-wrap justify-center gap-x-[0.4em] gap-y-1\`. Map WORDS — each is a \`motion.span\` with \`key={i}\`:
- \`initial={{ opacity: 0, y: 22, filter: 'blur(14px)' }}\`
- \`animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}\`
- \`transition={{ duration: DURATION / 1000, delay: (i * STAGGER) / 1000, ease: [0.21, 0.47, 0.32, 0.98] }}\`
- \`style={{ fontFamily: 'var(--font-geist-pixel-circle)' }}\` on every span
- Accented className: \`'bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-4xl tracking-tight text-transparent'\`
- Normal className: \`'text-4xl tracking-tight text-white'\`

## Subtext
\`motion.p\` with \`key="sub"\`, \`initial={{ opacity: 0, y: 8 }}\`, \`animate={{ opacity: 1, y: 0 }}\`, \`transition={{ duration: 0.55, delay: ((WORDS.length - 1) * STAGGER + 200) / 1000, ease: 'easeOut' }}\`, className \`relative text-base text-zinc-400\`. Text: "Drop any phrase. Works with any text."

## CTA
Wrap in \`<div className="flex h-10 items-center justify-center">\` (fixed height prevents layout shift). Inside \`<AnimatePresence>\` render when \`showCTA\`:
\`motion.button\` \`initial={{ opacity: 0, y: 6 }}\` \`animate={{ opacity: 1, y: 0 }}\` \`exit={{ opacity: 0, y: 6 }}\` \`transition={{ duration: 0.35, ease: 'easeOut' }}\` \`whileHover={{ scale: 1.04 }}\` \`whileTap={{ scale: 0.97 }}\` className \`relative rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-opacity hover:opacity-90\`. Label: "Start building".

## Typography
- Font: project default sans-serif
- Sizes: 14px, 16px, 36px
- Weights: 600`,
}
