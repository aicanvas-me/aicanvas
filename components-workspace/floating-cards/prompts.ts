import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `// npm install framer-motion @phosphor-icons/react

Root element: className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
The source ships h-full because AI Canvas renders it inside a sized preview frame. A standalone paste needs min-h-screen, or an ancestor with a real height, or the root collapses and takes its absolute layers with it.

Before building, verify your project has the following setup:
- React / Next.js
- TypeScript
- Tailwind CSS v4

If any are missing, set up via the shadcn CLI:
  npx shadcn@latest init

---

Create a React client component named FloatingCards, a swipeable deck of 3 travel destination cards. The front card is draggable downward; releasing it past a threshold flings it off-screen and the next card slides to the front. Each card shows a hotels count that animates up from 0 when it becomes the front card. Theme-aware (light + dark). Write as a single self-contained React client component. Inline everything (you may keep one small inline useCountUp hook and a HotelsCounter sub-component in the same file). 'use client' at the top. No 'any' types.

Imports: useRef, useState, useEffect from 'react'; motion from 'framer-motion'; { Buildings, ArrowUpRight } from '@phosphor-icons/react'.

Constants: CARD_W = 280, CARD_H = 200.

CARDS (as const tuple of 3):
- { title: 'Maafushi',   sub: 'Crystal waters',    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=520&q=80&fit=crop&crop=center', country: 'Maldives',    hotels: 120 }
- { title: 'Swiss Alps', sub: 'Powder & peaks',    img: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=520&q=80&fit=crop&crop=center', country: 'Switzerland', hotels: 87 }
- { title: 'Bali',       sub: 'Sun-soaked shores', img: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=520&q=80&fit=crop&crop=center', country: 'Indonesia',   hotels: 250 }

POSITIONS (slot 0 = back, 1 = middle, 2 = front):
- { x: 12, y: -32, rotate: 6, zIndex: 1, opacity: 1 }
- { x:  6, y: -18, rotate: 4, zIndex: 2, opacity: 1 }
- { x:  0, y:   0, rotate: 0, zIndex: 3, opacity: 1 }

useCountUp(target, active): const [value, setValue] = useState(0). useEffect([active, target]): if !active -> setValue(0); return. duration=900, steps=40, interval=duration/steps, step=0. setInterval: step++; setValue(Math.round((step/steps)*target)); if step>=steps clearInterval. Cleanup: clearInterval(id). Return value.

HotelsCounter({target, active}): const value = useCountUp(target, active). Render a flex row gap 5 with a Buildings icon (weight='regular', size=16, color #E8E8DF opacity 0.55) and a span (fontSize 10, fontWeight 500, color 'rgba(255,255,255,0.55)', letterSpacing '0.04em', fontVariantNumeric 'tabular-nums') that reads 'hotels <value>'. The number is wrapped in its own span with color 'rgba(255,255,255,0.85)' and marginLeft 2.

Component state: containerRef: HTMLDivElement. isDark=true. order: [number, number, number] init [0,1,2] (order[positionIndex] = cardIndex). isShuffling=false. exitingCard: number|null = null.

Theme detection: useEffect on mount. Find containerRef.current.closest('[data-card-theme]'); setIsDark based on that card's 'dark' class else documentElement.classList.contains('dark'). MutationObserver on documentElement AND on the card wrapper if present, attributeFilter ['class']. Disconnect on cleanup.

Layout root: div ref={containerRef} className="relative flex h-full w-full items-center justify-center overflow-hidden" style={{background: isDark ? '#110F0C' : '#F5F1EA'}}.

Dot grid background: absolute inset-0 with backgroundImage 'radial-gradient(circle, ' + (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)') + ' 1px, transparent 1px)' and backgroundSize '24px 24px'.

Deck wrapper: div style {position:'relative', width: CARD_W, height: CARD_H}.

Inside the deck, CARDS.map((card, i)): const posIndex = order.indexOf(i); pos = POSITIONS[posIndex]; isFront = posIndex === 2; isExiting = exitingCard === i. Render a motion.div key={i} with:
- style: position 'absolute', top 0, left 0, width CARD_W, height CARD_H, cursor isFront?'grab':'default', borderRadius 16, background '#2A2825', border '1px solid rgba(255,255,255,0.10)', boxShadow isDark ? '8px -8px 24px rgba(0,0,0,0.35)' : '8px -8px 24px rgba(0,0,0,0.15)', display flex, flexDirection column, justifyContent flex-start, overflow hidden, padding 0.
- drag: isFront && !isShuffling ? 'y' : false. dragConstraints {top:0, bottom:0}. dragElastic {top:0, bottom:0.6}. dragMomentum false.
- onDragEnd(_e, info): if !isFront || isShuffling return; if info.offset.y > 80 || info.velocity.y > 400 -> setIsShuffling(true); setExitingCard(i).
- animate: isExiting ? {y:600, rotate:8, opacity:0} : {x:pos.x, y:pos.y, rotate:pos.rotate, zIndex:pos.zIndex, opacity:pos.opacity}.
- transition: isExiting ? {duration:0.45, ease:'easeIn'} : {type:'spring', stiffness:80, damping:16}.
- onAnimationComplete: if isExiting -> setExitingCard(null); setOrder(prev => [prev[2], prev[0], prev[1]]); setTimeout(()=>setIsShuffling(false), 400).

Card contents:

Top section: div style padding '10px 10px 0', flex column gap 8, flex '0 0 auto'.
  Header row: flex row justify-between items-center.
    Left: <HotelsCounter target={card.hotels} active={isFront && !isExiting} />.
    Right: circular 26×26 button style borderRadius '50%' background '#BECF5D' (olive accent) flex center, containing <ArrowUpRight weight="bold" size={13} style={{color:'#1A1A19'}}/>.
  Title row: flex row items-baseline justify-between.
    Left: p fontSize 17, fontWeight 800, lineHeight 1.15, color '#FFFFFF', letterSpacing '-0.02em', margin 0 → {card.title}.
    Right: span fontSize 10, fontWeight 500, color 'rgba(255,255,255,0.45)', letterSpacing '0.04em' → {card.country}.

Visual block: div style margin '8px 6px 6px', borderRadius 12, flex 1, position relative, overflow hidden, backgroundImage 'url(\${card.img})', backgroundSize cover, backgroundPosition center.

Hint text: p absolute bottom 24, fontSize 11, color isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)', letterSpacing '0.05em' → 'swipe down to shuffle'.

Key details:
- Shadow opacity differs by theme: dark 0.35, light 0.15.
- Only the front card is draggable and only when not shuffling.
- HotelsCounter resets to 0 and counts back up whenever its active prop becomes true (not just on mount).
- The exit threshold is offset.y > 80 OR velocity.y > 400.
- After the exit animation finishes, cycle order: new order = [prev[2], prev[0], prev[1]]. The front card moves to the back.
- The icon header row uses a 16px Buildings icon (not 18), paired with the word "hotels" and the animated number.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 11px, 17px
- Weights: 500, 800`,

  'Lovable': `Create a React client component named FloatingCards — a swipeable deck of 3 travel destination cards. The front card is draggable downward; releasing it past a threshold flings it off-screen and the next card slides to the front. Each card shows a hotels count that animates up from 0 when it becomes the front card. Theme-aware (light + dark). Write as a single self-contained React client component. Inline everything (you may keep one small inline useCountUp hook and a HotelsCounter sub-component in the same file). 'use client' at the top. No 'any' types.

Imports: useRef, useState, useEffect from 'react'; motion from 'framer-motion'; { Buildings, ArrowUpRight } from '@phosphor-icons/react'.

Constants: CARD_W = 280, CARD_H = 200.

CARDS (as const tuple of 3):
- { title: 'Maafushi',   sub: 'Crystal waters',    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=520&q=80&fit=crop&crop=center', country: 'Maldives',    hotels: 120 }
- { title: 'Swiss Alps', sub: 'Powder & peaks',    img: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=520&q=80&fit=crop&crop=center', country: 'Switzerland', hotels: 87 }
- { title: 'Bali',       sub: 'Sun-soaked shores', img: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=520&q=80&fit=crop&crop=center', country: 'Indonesia',   hotels: 250 }

POSITIONS (slot 0 = back, 1 = middle, 2 = front):
- { x: 12, y: -32, rotate: 6, zIndex: 1, opacity: 1 }
- { x:  6, y: -18, rotate: 4, zIndex: 2, opacity: 1 }
- { x:  0, y:   0, rotate: 0, zIndex: 3, opacity: 1 }

useCountUp(target, active): const [value, setValue] = useState(0). useEffect([active, target]): if !active -> setValue(0); return. duration=900, steps=40, interval=duration/steps, step=0. setInterval: step++; setValue(Math.round((step/steps)*target)); if step>=steps clearInterval. Cleanup: clearInterval(id). Return value.

HotelsCounter({target, active}): const value = useCountUp(target, active). Render a flex row gap 5 with a Buildings icon (weight='regular', size=16, color #E8E8DF opacity 0.55) and a span (fontSize 10, fontWeight 500, color 'rgba(255,255,255,0.55)', letterSpacing '0.04em', fontVariantNumeric 'tabular-nums') that reads 'hotels <value>' — the number is wrapped in its own span with color 'rgba(255,255,255,0.85)' and marginLeft 2.

Component state: containerRef: HTMLDivElement. isDark=true. order: [number, number, number] init [0,1,2] — order[positionIndex] = cardIndex. isShuffling=false. exitingCard: number|null = null.

Theme detection: useEffect on mount — find containerRef.current.closest('[data-card-theme]'); setIsDark based on that card's 'dark' class else documentElement.classList.contains('dark'). MutationObserver on documentElement AND on the card wrapper if present, attributeFilter ['class']. Disconnect on cleanup.

Layout root: div ref={containerRef} className="relative flex h-full w-full items-center justify-center overflow-hidden" style={{background: isDark ? '#110F0C' : '#F5F1EA'}}.

Dot grid background: absolute inset-0 with backgroundImage 'radial-gradient(circle, ' + (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)') + ' 1px, transparent 1px)' and backgroundSize '24px 24px'.

Deck wrapper: div style {position:'relative', width: CARD_W, height: CARD_H}.

Inside the deck, CARDS.map((card, i)): const posIndex = order.indexOf(i); pos = POSITIONS[posIndex]; isFront = posIndex === 2; isExiting = exitingCard === i. Render a motion.div key={i} with:
- style: position 'absolute', top 0, left 0, width CARD_W, height CARD_H, cursor isFront?'grab':'default', borderRadius 16, background '#2A2825', border '1px solid rgba(255,255,255,0.10)', boxShadow isDark ? '8px -8px 24px rgba(0,0,0,0.35)' : '8px -8px 24px rgba(0,0,0,0.15)', display flex, flexDirection column, justifyContent flex-start, overflow hidden, padding 0.
- drag: isFront && !isShuffling ? 'y' : false. dragConstraints {top:0, bottom:0}. dragElastic {top:0, bottom:0.6}. dragMomentum false.
- onDragEnd(_e, info): if !isFront || isShuffling return; if info.offset.y > 80 || info.velocity.y > 400 -> setIsShuffling(true); setExitingCard(i).
- animate: isExiting ? {y:600, rotate:8, opacity:0} : {x:pos.x, y:pos.y, rotate:pos.rotate, zIndex:pos.zIndex, opacity:pos.opacity}.
- transition: isExiting ? {duration:0.45, ease:'easeIn'} : {type:'spring', stiffness:80, damping:16}.
- onAnimationComplete: if isExiting -> setExitingCard(null); setOrder(prev => [prev[2], prev[0], prev[1]]); setTimeout(()=>setIsShuffling(false), 400).

Card contents:

Top section: div style padding '10px 10px 0', flex column gap 8, flex '0 0 auto'.
  Header row: flex row justify-between items-center.
    Left: <HotelsCounter target={card.hotels} active={isFront && !isExiting} />.
    Right: circular 26×26 button style borderRadius '50%' background '#BECF5D' (olive accent) flex center, containing <ArrowUpRight weight="bold" size={13} style={{color:'#1A1A19'}}/>.
  Title row: flex row items-baseline justify-between.
    Left: p fontSize 17, fontWeight 800, lineHeight 1.15, color '#FFFFFF', letterSpacing '-0.02em', margin 0 → {card.title}.
    Right: span fontSize 10, fontWeight 500, color 'rgba(255,255,255,0.45)', letterSpacing '0.04em' → {card.country}.

Visual block: div style margin '8px 6px 6px', borderRadius 12, flex 1, position relative, overflow hidden, backgroundImage 'url(\${card.img})', backgroundSize cover, backgroundPosition center.

Hint text: p absolute bottom 24, fontSize 11, color isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)', letterSpacing '0.05em' → 'swipe down to shuffle'.

Key details:
- Shadow opacity differs by theme: dark 0.35, light 0.15.
- Only the front card is draggable and only when not shuffling.
- HotelsCounter resets to 0 and counts back up whenever its active prop becomes true (not just on mount).
- The exit threshold is offset.y > 80 OR velocity.y > 400.
- After the exit animation finishes, cycle order: new order = [prev[2], prev[0], prev[1]] — the front card moves to the back.
- The icon header row uses a 16px Buildings icon (not 18), paired with the word "hotels" and the animated number.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 11px, 17px
- Weights: 500, 800`,

  'V0': `Create a React client component named FloatingCards — a swipeable deck of 3 travel destination cards. The front card is draggable downward; releasing it past a threshold flings it off-screen and the next card slides to the front. Each card shows a hotels count that animates up from 0 when it becomes the front card. Theme-aware (light + dark). Write as a single self-contained React client component. Inline everything (you may keep one small inline useCountUp hook and a HotelsCounter sub-component in the same file). 'use client' at the top. No 'any' types.

Imports: useRef, useState, useEffect from 'react'; motion from 'framer-motion'; { Buildings, ArrowUpRight } from '@phosphor-icons/react'.

Constants: CARD_W = 280, CARD_H = 200.

CARDS (as const tuple of 3):
- { title: 'Maafushi',   sub: 'Crystal waters',    img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=520&q=80&fit=crop&crop=center', country: 'Maldives',    hotels: 120 }
- { title: 'Swiss Alps', sub: 'Powder & peaks',    img: 'https://images.unsplash.com/photo-1491555103944-7c647fd857e6?w=520&q=80&fit=crop&crop=center', country: 'Switzerland', hotels: 87 }
- { title: 'Bali',       sub: 'Sun-soaked shores', img: 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=520&q=80&fit=crop&crop=center', country: 'Indonesia',   hotels: 250 }

POSITIONS (slot 0 = back, 1 = middle, 2 = front):
- { x: 12, y: -32, rotate: 6, zIndex: 1, opacity: 1 }
- { x:  6, y: -18, rotate: 4, zIndex: 2, opacity: 1 }
- { x:  0, y:   0, rotate: 0, zIndex: 3, opacity: 1 }

useCountUp(target, active): const [value, setValue] = useState(0). useEffect([active, target]): if !active -> setValue(0); return. duration=900, steps=40, interval=duration/steps, step=0. setInterval: step++; setValue(Math.round((step/steps)*target)); if step>=steps clearInterval. Cleanup: clearInterval(id). Return value.

HotelsCounter({target, active}): const value = useCountUp(target, active). Render a flex row gap 5 with a Buildings icon (weight='regular', size=16, color #E8E8DF opacity 0.55) and a span (fontSize 10, fontWeight 500, color 'rgba(255,255,255,0.55)', letterSpacing '0.04em', fontVariantNumeric 'tabular-nums') that reads 'hotels <value>' — the number is wrapped in its own span with color 'rgba(255,255,255,0.85)' and marginLeft 2.

Component state: containerRef: HTMLDivElement. isDark=true. order: [number, number, number] init [0,1,2] — order[positionIndex] = cardIndex. isShuffling=false. exitingCard: number|null = null.

Theme detection: useEffect on mount — find containerRef.current.closest('[data-card-theme]'); setIsDark based on that card's 'dark' class else documentElement.classList.contains('dark'). MutationObserver on documentElement AND on the card wrapper if present, attributeFilter ['class']. Disconnect on cleanup.

Layout root: div ref={containerRef} className="relative flex h-full w-full items-center justify-center overflow-hidden" style={{background: isDark ? '#110F0C' : '#F5F1EA'}}.

Dot grid background: absolute inset-0 with backgroundImage 'radial-gradient(circle, ' + (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)') + ' 1px, transparent 1px)' and backgroundSize '24px 24px'.

Deck wrapper: div style {position:'relative', width: CARD_W, height: CARD_H}.

Inside the deck, CARDS.map((card, i)): const posIndex = order.indexOf(i); pos = POSITIONS[posIndex]; isFront = posIndex === 2; isExiting = exitingCard === i. Render a motion.div key={i} with:
- style: position 'absolute', top 0, left 0, width CARD_W, height CARD_H, cursor isFront?'grab':'default', borderRadius 16, background '#2A2825', border '1px solid rgba(255,255,255,0.10)', boxShadow isDark ? '8px -8px 24px rgba(0,0,0,0.35)' : '8px -8px 24px rgba(0,0,0,0.15)', display flex, flexDirection column, justifyContent flex-start, overflow hidden, padding 0.
- drag: isFront && !isShuffling ? 'y' : false. dragConstraints {top:0, bottom:0}. dragElastic {top:0, bottom:0.6}. dragMomentum false.
- onDragEnd(_e, info): if !isFront || isShuffling return; if info.offset.y > 80 || info.velocity.y > 400 -> setIsShuffling(true); setExitingCard(i).
- animate: isExiting ? {y:600, rotate:8, opacity:0} : {x:pos.x, y:pos.y, rotate:pos.rotate, zIndex:pos.zIndex, opacity:pos.opacity}.
- transition: isExiting ? {duration:0.45, ease:'easeIn'} : {type:'spring', stiffness:80, damping:16}.
- onAnimationComplete: if isExiting -> setExitingCard(null); setOrder(prev => [prev[2], prev[0], prev[1]]); setTimeout(()=>setIsShuffling(false), 400).

Card contents:

Top section: div style padding '10px 10px 0', flex column gap 8, flex '0 0 auto'.
  Header row: flex row justify-between items-center.
    Left: <HotelsCounter target={card.hotels} active={isFront && !isExiting} />.
    Right: circular 26×26 button style borderRadius '50%' background '#BECF5D' (olive accent) flex center, containing <ArrowUpRight weight="bold" size={13} style={{color:'#1A1A19'}}/>.
  Title row: flex row items-baseline justify-between.
    Left: p fontSize 17, fontWeight 800, lineHeight 1.15, color '#FFFFFF', letterSpacing '-0.02em', margin 0 → {card.title}.
    Right: span fontSize 10, fontWeight 500, color 'rgba(255,255,255,0.45)', letterSpacing '0.04em' → {card.country}.

Visual block: div style margin '8px 6px 6px', borderRadius 12, flex 1, position relative, overflow hidden, backgroundImage 'url(\${card.img})', backgroundSize cover, backgroundPosition center.

Hint text: p absolute bottom 24, fontSize 11, color isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)', letterSpacing '0.05em' → 'swipe down to shuffle'.

Key details:
- Shadow opacity differs by theme: dark 0.35, light 0.15.
- Only the front card is draggable and only when not shuffling.
- HotelsCounter resets to 0 and counts back up whenever its active prop becomes true (not just on mount).
- The exit threshold is offset.y > 80 OR velocity.y > 400.
- After the exit animation finishes, cycle order: new order = [prev[2], prev[0], prev[1]] — the front card moves to the back.
- The icon header row uses a 16px Buildings icon (not 18), paired with the word "hotels" and the animated number.

## Typography
- Font: project default sans-serif
- Sizes: 10px, 11px, 17px
- Weights: 500, 800`,
}
