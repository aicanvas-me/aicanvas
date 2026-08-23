import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion

Root element: className="relative flex min-h-screen w-full cursor-pointer select-none items-center justify-center overflow-hidden bg-zinc-950"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named PolaroidStack, a pile of five small polaroid cards that fans out into an arc on click, lets you hover/select individual cards, then restacks on another click. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Constants: CARD_W = 110, CARD_H = 140.

Cards data (5 entries, each { id, label, from, to }):
0: 'Sunset'  #FF6B6B → #FF8E53
1: 'Ocean'   #14B8A6 → #67E8F9
2: 'Dream'   #8B5CF6 → #C4B5FD
3: 'Golden'  #F59E0B → #FDE68A
4: 'Mist'    #64748B → #CBD5E1

STACKED positions (x,y,rotate):
[ (-6, 2, -12), (3, -4, -5), (1, 1, 2), (-4, 3, 8), (5, -2, 14) ]

FANNED positions:
[ (-160, 30, -22), (-80, 8, -11), (0, -4, 0), (80, 8, 11), (160, 30, 22) ]

State: fanned=false, hoveredId=null, selectedId=null. Click on background toggles fanned and clears hoveredId + selectedId.

Layout: root div className "relative flex h-full w-full cursor-pointer select-none items-center justify-center bg-zinc-950" onClick=toggle. Inside a fixed stage div style {width:460, height:220} className "relative".

Inject the Caveat google font once with an inline <style> block: @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap');

Each card is rendered as a nested motion.div pair inside an absolute-positioned outer at left-1/2 top-1/2.

Outer motion.div (fan/stack transform): animate {x: pos.x - CARD_W/2, y: pos.y - CARD_H/2, rotate: isSelected ? 0 : pos.rotate}, zIndex (isSelected ? 30 : isHovered ? 20 : i), transition {type:'spring', stiffness:280, damping:22, delay: fanned ? i*0.06 : (CARDS.length-1-i)*0.05}. (So fanning staggers left→right, restacking right→left.)

Inner motion.div (hover lift + selected pop): animate {y: isSelected ? -28 : isHovered ? -18 : 0, scale: isSelected ? 1.4 : isHovered ? 1.1 : 1}, transition {type:'spring', stiffness:420, damping:26}. cursor 'pointer' when fanned else 'inherit'. onHoverStart sets hoveredId if fanned. onHoverEnd clears. onClick (only when fanned): stopPropagation, toggle selectedId (if === card.id else set), clear hoveredId.

Card frame (div inside the inner motion.div): width CARD_W, height CARD_H, white background, borderRadius 2, flex column, padding '8px 8px 0 8px'. boxShadow: if isSelected '0 32px 64px rgba(0,0,0,0.7), 0 12px 24px rgba(0,0,0,0.4)'; else if isHovered '0 20px 40px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.3)'; else '0 4px 20px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.15)'. transition 'box-shadow 0.25s ease'.

Inside the frame: a "photo" div flexShrink 0 height 93 with background \`linear-gradient(135deg, \${card.from}, \${card.to})\`. Then a label row flex:1 centered with a <p> using fontFamily "'Caveat', cursive", fontSize 16, fontWeight 600, color '#3f3f46', margin 0, lineHeight 1, text card.label.

Toggle hint: motion.p keyed on \`\${String(fanned)}-\${String(selectedId !== null)}\` initial {opacity:0, y:4} animate {opacity:1, y:0} transition {duration:0.3} className "absolute bottom-6 text-xs text-zinc-500" pointer-events-none fontFamily 'var(--font-sans, sans-serif)' letterSpacing 0.03em. Text: !fanned ? 'click to fan out' : selectedId !== null ? 'click card again to deselect' : 'click a card · click bg to stack'.

Note: this component uses a fixed dark background (#0a0a0a / bg-zinc-950) and does not support a separate light mode. This matches the reference.

## Typography
- Font: project default sans-serif
- Sizes: 12px, 16px
- Weights: 600`,

  'Lovable': `Create a React client component named PolaroidStack — a pile of five small polaroid cards that fans out into an arc on click, lets you hover/select individual cards, then restacks on another click. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Constants: CARD_W = 110, CARD_H = 140.

Cards data (5 entries, each { id, label, from, to }):
0: 'Sunset'  #FF6B6B → #FF8E53
1: 'Ocean'   #14B8A6 → #67E8F9
2: 'Dream'   #8B5CF6 → #C4B5FD
3: 'Golden'  #F59E0B → #FDE68A
4: 'Mist'    #64748B → #CBD5E1

STACKED positions (x,y,rotate):
[ (-6, 2, -12), (3, -4, -5), (1, 1, 2), (-4, 3, 8), (5, -2, 14) ]

FANNED positions:
[ (-160, 30, -22), (-80, 8, -11), (0, -4, 0), (80, 8, 11), (160, 30, 22) ]

State: fanned=false, hoveredId=null, selectedId=null. Click on background toggles fanned and clears hoveredId + selectedId.

Layout: root div className "relative flex h-full w-full cursor-pointer select-none items-center justify-center bg-zinc-950" onClick=toggle. Inside a fixed stage div style {width:460, height:220} className "relative".

Inject the Caveat google font once with an inline <style> block: @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap');

Each card is rendered as a nested motion.div pair inside an absolute-positioned outer at left-1/2 top-1/2.

Outer motion.div (fan/stack transform): animate {x: pos.x - CARD_W/2, y: pos.y - CARD_H/2, rotate: isSelected ? 0 : pos.rotate}, zIndex (isSelected ? 30 : isHovered ? 20 : i), transition {type:'spring', stiffness:280, damping:22, delay: fanned ? i*0.06 : (CARDS.length-1-i)*0.05}. (So fanning staggers left→right, restacking right→left.)

Inner motion.div (hover lift + selected pop): animate {y: isSelected ? -28 : isHovered ? -18 : 0, scale: isSelected ? 1.4 : isHovered ? 1.1 : 1}, transition {type:'spring', stiffness:420, damping:26}. cursor 'pointer' when fanned else 'inherit'. onHoverStart sets hoveredId if fanned. onHoverEnd clears. onClick (only when fanned): stopPropagation, toggle selectedId (if === card.id else set), clear hoveredId.

Card frame (div inside the inner motion.div): width CARD_W, height CARD_H, white background, borderRadius 2, flex column, padding '8px 8px 0 8px'. boxShadow: if isSelected '0 32px 64px rgba(0,0,0,0.7), 0 12px 24px rgba(0,0,0,0.4)'; else if isHovered '0 20px 40px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.3)'; else '0 4px 20px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.15)'. transition 'box-shadow 0.25s ease'.

Inside the frame: a "photo" div flexShrink 0 height 93 with background \`linear-gradient(135deg, \${card.from}, \${card.to})\`. Then a label row flex:1 centered with a <p> using fontFamily "'Caveat', cursive", fontSize 16, fontWeight 600, color '#3f3f46', margin 0, lineHeight 1, text card.label.

Toggle hint: motion.p keyed on \`\${String(fanned)}-\${String(selectedId !== null)}\` initial {opacity:0, y:4} animate {opacity:1, y:0} transition {duration:0.3} className "absolute bottom-6 text-xs text-zinc-500" pointer-events-none fontFamily 'var(--font-sans, sans-serif)' letterSpacing 0.03em. Text: !fanned ? 'click to fan out' : selectedId !== null ? 'click card again to deselect' : 'click a card · click bg to stack'.

Note: this component uses a fixed dark background (#0a0a0a / bg-zinc-950) and does not support a separate light mode — matches the reference.

## Typography
- Font: project default sans-serif
- Sizes: 12px, 16px
- Weights: 600`,

  'V0': `Create a React client component named PolaroidStack — a pile of five small polaroid cards that fans out into an arc on click, lets you hover/select individual cards, then restacks on another click. Write this as a single self-contained React client component. Inline everything. Do not extract helper hooks, utility functions, or separate files. 'use client' at the top. No 'any' types.

Constants: CARD_W = 110, CARD_H = 140.

Cards data (5 entries, each { id, label, from, to }):
0: 'Sunset'  #FF6B6B → #FF8E53
1: 'Ocean'   #14B8A6 → #67E8F9
2: 'Dream'   #8B5CF6 → #C4B5FD
3: 'Golden'  #F59E0B → #FDE68A
4: 'Mist'    #64748B → #CBD5E1

STACKED positions (x,y,rotate):
[ (-6, 2, -12), (3, -4, -5), (1, 1, 2), (-4, 3, 8), (5, -2, 14) ]

FANNED positions:
[ (-160, 30, -22), (-80, 8, -11), (0, -4, 0), (80, 8, 11), (160, 30, 22) ]

State: fanned=false, hoveredId=null, selectedId=null. Click on background toggles fanned and clears hoveredId + selectedId.

Layout: root div className "relative flex h-full w-full cursor-pointer select-none items-center justify-center bg-zinc-950" onClick=toggle. Inside a fixed stage div style {width:460, height:220} className "relative".

Inject the Caveat google font once with an inline <style> block: @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600&display=swap');

Each card is rendered as a nested motion.div pair inside an absolute-positioned outer at left-1/2 top-1/2.

Outer motion.div (fan/stack transform): animate {x: pos.x - CARD_W/2, y: pos.y - CARD_H/2, rotate: isSelected ? 0 : pos.rotate}, zIndex (isSelected ? 30 : isHovered ? 20 : i), transition {type:'spring', stiffness:280, damping:22, delay: fanned ? i*0.06 : (CARDS.length-1-i)*0.05}. (So fanning staggers left→right, restacking right→left.)

Inner motion.div (hover lift + selected pop): animate {y: isSelected ? -28 : isHovered ? -18 : 0, scale: isSelected ? 1.4 : isHovered ? 1.1 : 1}, transition {type:'spring', stiffness:420, damping:26}. cursor 'pointer' when fanned else 'inherit'. onHoverStart sets hoveredId if fanned. onHoverEnd clears. onClick (only when fanned): stopPropagation, toggle selectedId (if === card.id else set), clear hoveredId.

Card frame (div inside the inner motion.div): width CARD_W, height CARD_H, white background, borderRadius 2, flex column, padding '8px 8px 0 8px'. boxShadow: if isSelected '0 32px 64px rgba(0,0,0,0.7), 0 12px 24px rgba(0,0,0,0.4)'; else if isHovered '0 20px 40px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.3)'; else '0 4px 20px rgba(0,0,0,0.45), 0 1px 3px rgba(0,0,0,0.15)'. transition 'box-shadow 0.25s ease'.

Inside the frame: a "photo" div flexShrink 0 height 93 with background \`linear-gradient(135deg, \${card.from}, \${card.to})\`. Then a label row flex:1 centered with a <p> using fontFamily "'Caveat', cursive", fontSize 16, fontWeight 600, color '#3f3f46', margin 0, lineHeight 1, text card.label.

Toggle hint: motion.p keyed on \`\${String(fanned)}-\${String(selectedId !== null)}\` initial {opacity:0, y:4} animate {opacity:1, y:0} transition {duration:0.3} className "absolute bottom-6 text-xs text-zinc-500" pointer-events-none fontFamily 'var(--font-sans, sans-serif)' letterSpacing 0.03em. Text: !fanned ? 'click to fan out' : selectedId !== null ? 'click card again to deselect' : 'click a card · click bg to stack'.

Note: this component uses a fixed dark background (#0a0a0a / bg-zinc-950) and does not support a separate light mode — matches the reference.

## Typography
- Font: project default sans-serif
- Sizes: 12px, 16px
- Weights: 600`,
}
