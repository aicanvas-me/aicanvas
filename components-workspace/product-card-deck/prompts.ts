import type { Platform } from '../../app/components/ComponentCard'

const SPEC = `Build a "Product Card Deck": a draggable stack of product cards you flick through one at a time, looping endlessly. Deliver it as a single copy-paste-ready file with a default export, using React + TypeScript + Tailwind CSS + Framer Motion. Add a "// npm install framer-motion" comment at the top.

DATA
- An array CARDS of 5 items typed { title: string; image: string; label?: string }. Give ONE card an empty title (it renders as image only, no caption); the rest get a title plus label "Shop". Use any square product photos as placeholder image URLs.

CARD LAYOUT
- Card chrome: rounded 22px, background #D3DDEE, overflow hidden, a vertical flex column. Drop shadow is heavier on the top card ("0 30px 60px rgba(0,0,0,0.30), 0 10px 20px rgba(0,0,0,0.20)") than on the rest ("0 14px 30px rgba(0,0,0,0.18)").
- Container 1 (picture): flex 1, the image positioned absolute inset-0 with object-cover. It fills the whole card when there is no title.
- Container 2 (caption, only when a title exists): a flex row, padding "12px 12px 12px 16px", justify-between, align-center. Left: the product name (color #111111, 16px, weight 700, single line, ellipsis on overflow). Right: a pill button showing the label: background #141312, color #F5F1E8, fully rounded (borderRadius 9999), padding "8px 16px", 12px / weight 600.

STACK GEOMETRY
- Render VISIBLE = 4 cards at once. Slot 0 is the top (draggable) card; slots 1 to 3 peek behind it.
- Per-slot resting targets indexed by slot: y = [0, 12, 24, 36], scale = [1, 0.95, 0.9, 0.86], opacity = [1, 1, 0.92, 0.82], zIndex = 100 - slot. It is a straight stack with no resting rotation.
- Stage size: width clamp(220px, 72vw, 300px); height calc(clamp(220px, 72vw, 300px) + 56px) so the picture stays roughly square above the caption strip.

INTERACTION (Framer Motion)
- Each card owns its OWN motion values x, y, scale, opacity. This is important: it lets the top card drag freely while the others sit in their slots, with no visual hand-off when the deck advances (the card behind becomes the same element at slot 0).
- rotate = useTransform(x, [-200, 200], [-18, 18], { clamp: true }). The top card leans toward the horizontal drag (a gentle drag-tilt capped at plus or minus 18 degrees).
- The top card has drag enabled (free, no constraints). onDragEnd: compute speed = hypot(velocity) and dist = hypot(offset). If speed > 500 OR dist > 130 it is a FLICK; otherwise spring x and y back to the top slot. For the fly direction use the release velocity, but if speed < 220 (a slow but far drag) fall back to offset * 9 so the card still flies the way it was pushed.
- Fly-off: wrap the deck in AnimatePresence and use usePresence inside each card for a manual exit. When a card is removed, animate x and y to normalizedVelocity * 1500, scale to 0.85, opacity to 0 over about 0.5s, then call safeToRemove. Because rotate follows x, the card spins toward its tilt clamp as it leaves.
- Slot transitions: whenever a card's slot changes, animate y, scale, opacity to the new slot targets with a spring (stiffness 300, damping 30); background cards also recenter x to 0.
- Deck state: an array of { key, content }. On flick, drop the top item and append a fresh one at the back whose content is the next index (mod CARDS.length). This loops endlessly, and the card behind rises smoothly into the top slot instead of fading in.

BUTTON STATES
- The pill button is a motion.button with whileHover { scale: 1.06, backgroundColor: "#2C2825" } and whileTap { scale: 0.93, backgroundColor: "#000000" }, with a spring transition (stiffness 500, damping 30). Call stopPropagation on its onPointerDown and onClick so pressing the button never starts a card drag.

CHROME AND MOBILE
- Root element: min-h-screen, full width, flex centered, overflow hidden, className bg-[#E8E8DF] dark:bg-[#1A1A19], px-4. Put a small hint line below the deck, e.g. "grab the top card and flick it away".
- Set touchAction "none" on the draggable top card ONLY so a flick does not scroll the page. Size everything with clamp() so it works from 320px up, and use pointer events so it works with both mouse and touch.`

const CLAUDE_SPEC = SPEC
  .replace(
    'BUTTON STATES\n',
    'BUTTON STATES\n- Initialize addedProducts with useState<Set<string>>(() => new Set()). For each card, isAdded = addedProducts.has(card.title); pass it and an onToggleAdded callback through FlickCard to CardFace. The callback clones the Set, removes the title if present or adds it otherwise, then stores the new Set. Import Check from @phosphor-icons/react.\n',
  )
  .replace(
    'Add a "// npm install framer-motion" comment at the top.',
    'Add a "// npm install framer-motion @phosphor-icons/react" comment at the top.',
  )
  .replace(
    'Left: the product name (color #111111, 16px, weight 700, single line, ellipsis on overflow). Right: a pill button showing the label: background #141312, color #F5F1E8, fully rounded (borderRadius 9999), padding "8px 16px", 12px / weight 600.',
    'Left: the product name (color #111111, 16px, weight 700, lineHeight 1.4, single line, ellipsis on overflow). Right: a pill button that toggles between the label and a Phosphor Check (14, regular) plus "Added": background #141312, color #F5F1E8, fully rounded (borderRadius 9999), padding "8px 16px", 12px / weight 600.',
  )
  .replace(
    'The pill button is a motion.button with whileHover { scale: 1.06, backgroundColor: "#2C2825" } and whileTap { scale: 0.93, backgroundColor: "#000000" }, with a spring transition (stiffness 500, damping 30). Call stopPropagation on its onPointerDown and onClick so pressing the button never starts a card drag.',
    'The pill button is a motion.button with layout, layoutDependency={isAdded}, and aria-pressed={isAdded}. Its onClick stops propagation and toggles a deck-level addedProducts Set keyed by product title; onPointerDown also stops propagation so pressing it never starts a card drag. Crossfade the label and Check plus "Added" content with AnimatePresence mode="wait" over 0.12s. Use whileHover { scale: 1.06, backgroundColor: "#2C2825" } and whileTap { scale: 0.93, backgroundColor: "#000000" }, with a spring transition (stiffness 500, damping 30), so layout animates the pill width between states.',
  )

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `Verify this project has Tailwind CSS, TypeScript, and React set up, plus Framer Motion (npm install framer-motion). If anything is missing, initialize with the shadcn CLI:
  npx shadcn@latest init

---

${CLAUDE_SPEC}`,
  Lovable: SPEC,
  V0: SPEC,
}
