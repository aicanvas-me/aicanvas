import type { Platform } from '../../app/components/ComponentCard'

export const prompts: Partial<Record<Platform, string>> = {
  'Claude Code': `# ScrollWipeGallery
A scroll-driven editorial gallery: five full-bleed photos, each wiped in from a different edge under one settling headline.

## 1. Setup
// npm install framer-motion
File: components-workspace/scroll-wipe-gallery/index.tsx  ·  'use client'  ·  export default function ScrollWipeGallery()

import { useEffect, useRef, useState, type RefObject } from 'react'
import {
  cubicBezier,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { ChevronDown } from '@/components/icons/chevron-down'

ChevronDown is an AI Canvas icon (Line style, 1.5px stroke). Install it with \`npx shadcn@latest add https://aicanvas.me/r/icon-chevron-down.json\`.

## 2. Constants

const PHOTOS = [
  {
    src: 'https://images.unsplash.com/photo-1634573826817-27d9e8da08df?w=1920&h=1080&fit=crop&crop=center&auto=format',
    alt: 'Modern structure mirrored in still water',
    title: 'Break Patterns',
  },
  {
    src: 'https://images.unsplash.com/photo-1527576539890-dfa815648363?w=1920&h=1080&fit=crop&crop=center&auto=format',
    alt: 'Concrete facade seen from below in hard grayscale light',
    title: 'Push Forward',
  },
  {
    src: 'https://images.unsplash.com/photo-1532456745301-b2c645d8b80d?w=1920&h=1080&fit=crop&crop=center&auto=format',
    alt: 'Repeating white concrete balconies forming a dense pattern',
    title: 'Cut Through',
  },
  {
    src: 'https://images.unsplash.com/photo-1522743791393-522312deeebf?w=1920&h=1080&fit=crop&crop=center&auto=format',
    alt: 'Monolithic gray concrete mass against an open sky',
    title: 'Hold Steady',
  },
  {
    src: 'https://images.unsplash.com/photo-1483366774565-c783b9f70e2c?w=1920&h=1080&fit=crop&crop=center&auto=format',
    alt: 'Sharp geometric underside of a concrete building',
    title: 'Leave Marks',
  },
] as const

// Pinned on the section root so the type looks the same wherever this is
// pasted instead of inheriting whatever the host page happens to use. Manrope
// first because that is what it was designed against; the rest is a grotesque
// fallback chain that keeps the same wide, flat-sided feel.
const TYPEFACE =
  "'Manrope', 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif"

// Pacing knob. Every wipe and hold is a fraction of this height, so raising it
// slows the whole sequence without changing the rhythm between wipes.
const SECTION_HEIGHT = '1100vh'

// Each transition reveals from a different edge. The key names the direction
// the reveal travels, and the value is the fully hidden starting clip.
// Every inset slot carries an explicit percentage: Framer Motion cannot
// interpolate an inset() that mixes unitless 0 with 0%, and silently emits an
// invalid value the browser drops to clip-path: none (fully unclipped).
const HIDDEN_CLIP = {
  down: 'inset(0% 0% 100% 0%)',
  right: 'inset(0% 100% 0% 0%)',
  up: 'inset(100% 0% 0% 0%)',
  left: 'inset(0% 0% 0% 100%)',
} as const
const REVEALED_CLIP = 'inset(0% 0% 0% 0%)'

const DIRECTIONS = ['down', 'right', 'up', 'left'] as const

type Direction = (typeof DIRECTIONS)[number]

// Photo 0 is the base layer and is always visible. Every later photo gets an
// equal slice of the scroll, wiping in over the middle of its slice so the
// composition holds still before and after the cut.
const WIPE_SEQUENCE = PHOTOS.slice(1).map((photo, index) => {
  const segment = 1 / (PHOTOS.length - 1)
  const segmentStart = index * segment
  const from = segmentStart + segment * 0.18
  const to = segmentStart + segment * 0.72

  return {
    photo,
    direction: DIRECTIONS[index % DIRECTIONS.length],
    from,
    to,
    // The type keeps moving a beat past its own wipe, so the frame lands first
    // and the headline resolves into it instead of arriving pre-set.
    settled: to + (to - from) * 0.45,
  }
})

const TOTAL_LABEL = String(PHOTOS.length).padStart(2, '0')

// Type arrival, driven by each frame's own wipe. The headline enters loose and
// pushed along the direction the wipe travels, then tightens and locks. Tracking
// is in em so the arrival reads the same at any size. The old version ticked one
// shared spacing value on every cut, which twitched every title at once,
// including the ones nothing was happening to.
const ENTER_TRACKING = 0.16
const SETTLED_TRACKING = 0.02
const ENTER_OFFSET = 48
const ENTER_EASE = cubicBezier(0.16, 1, 0.3, 1)

// Which way the headline is pushed before it settles: with the wipe, never
// against it, so the type and the reveal read as one gesture.
const ENTER_FROM = {
  down: { axis: 'y', sign: -1 },
  right: { axis: 'x', sign: -1 },
  up: { axis: 'y', sign: 1 },
  left: { axis: 'x', sign: 1 },
} as const

// Two answers from one walk: what actually scrolls, and what merely crops.
// The scroller drives progress. The cropper matters when nothing scrolls, for
// example inside a fixed-height preview box or a card: sizing the panel to the
// window there hangs half the composition below the crop.
function findScrollContext(element: HTMLElement): {
  scroller: HTMLElement | null
  clipper: HTMLElement | null
} {
  let ancestor = element.parentElement
  let clipper: HTMLElement | null = null

  while (ancestor) {
    const { overflowY } = window.getComputedStyle(ancestor)

    if (overflowY !== 'visible') {
      if (!clipper) clipper = ancestor

      // The overflow check alone is not enough: an element with
      // \`overflow-x: hidden\` computes overflowY to \`auto\` even though it never
      // scrolls, and \`body { overflow-x: hidden }\` is on half the pages this
      // could be pasted into. Requiring real overflow keeps the walk going.
      if (
        (overflowY === 'auto' || overflowY === 'scroll') &&
        ancestor.scrollHeight > ancestor.clientHeight
      ) {
        // Keep the nearer clipper if the walk already passed one: a
        // fixed-height box inside a scrolling shell bounds us, the shell does
        // not.
        return { scroller: ancestor, clipper: clipper ?? ancestor }
      }
    }

    ancestor = ancestor.parentElement
  }

  return { scroller: null, clipper }
}

// Progress is measured from the wrapper's own viewport rect rather than through
// Framer Motion's container option, which requires the scrolling ancestor to be
// non-static. Reading getBoundingClientRect keeps this correct inside an app
// shell that scrolls an inner div and on a page that scrolls the window.
function useElementScrollProgress(targetRef: RefObject<HTMLElement | null>): {
  progress: MotionValue<number>
  viewportHeight: number | null
} {
  const progress = useMotionValue(0)
  // The height of whatever actually scrolls. The sticky panel sizes off this
  // instead of 100vh, which is only correct when the scroller IS the viewport:
  // inside an app shell with a fixed header, in a fullscreen overlay panel, or
  // on iOS where 100vh is the large viewport, a 100vh panel hangs below the
  // visible area and clips its own bottom chrome. State, not a MotionValue:
  // this changes on mount and on resize, not per frame, and it has to survive
  // a re-render. null means not measured yet, and falls back to 100vh.
  const [viewportHeight, setViewportHeight] = useState<number | null>(null)

  useEffect(() => {
    const target = targetRef.current
    if (!target) return

    const { scroller: scrollContainer, clipper } = findScrollContext(target)
    let animationFrame: number | null = null

    const updateProgress = () => {
      animationFrame = null

      const rect = target.getBoundingClientRect()
      const containerTop = scrollContainer
        ? scrollContainer.getBoundingClientRect().top
        : 0
      // Never taller than what is actually visible. Start from the scroller,
      // or the window when nothing scrolls, then cap by anything nearer that
      // crops us: a fixed-height preview box inside a scrolling page bounds
      // this block even though the page is what scrolls. A page-level clipper
      // (body with overflow-x hidden) is taller than the window, so the cap is
      // a no-op there and only real crops shrink the panel.
      const availableHeight = scrollContainer
        ? scrollContainer.clientHeight
        : window.innerHeight
      const nextViewportHeight =
        clipper && clipper !== scrollContainer
          ? Math.min(availableHeight, clipper.clientHeight)
          : availableHeight
      // Cropped and unscrollable: something shorter than the section clips us,
      // and it is not the thing that scrolls, so that crop moves as one piece
      // and the viewer can never travel through the sequence inside it. Hold
      // the first frame rather than let an outer scroll drive a counter and a
      // set of wipes nobody can control. This is the preview-box case.
      const cropped =
        !!clipper &&
        clipper !== scrollContainer &&
        clipper.clientHeight < rect.height
      const scrollDistance = Math.max(rect.height - nextViewportHeight, 1)
      const nextProgress = cropped
        ? 0
        : Math.min(Math.max((containerTop - rect.top) / scrollDistance, 0), 1)

      setViewportHeight(nextViewportHeight)
      progress.set(nextProgress)
    }

    const requestUpdate = () => {
      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(updateProgress)
      }
    }

    updateProgress()
    // Both, always: the container listener covers an app shell that scrolls an
    // inner div, and window covers a plain page. Scroll events do not bubble
    // from an inner scroller to window, so neither one alone is enough.
    scrollContainer?.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    // The scroll container can change size without the window resizing: an
    // overlay opening, a panel animating, a phone toolbar collapsing.
    const observer = new ResizeObserver(requestUpdate)
    // Both when they differ: the scroller drives progress, the clipper caps the
    // panel height, and either can resize without the other.
    observer.observe(scrollContainer ?? clipper ?? document.documentElement)
    if (clipper && clipper !== scrollContainer) observer.observe(clipper)

    return () => {
      scrollContainer?.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      observer.disconnect()

      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame)
      }
    }
  }, [progress, targetRef])

  return { progress, viewportHeight }
}

function useWipeClip(
  progress: MotionValue<number>,
  from: number,
  to: number,
  hidden: string,
  reduceMotion: boolean,
): MotionValue<string> {
  const wipe = useTransform(progress, [from, to], [hidden, REVEALED_CLIP])
  const snap = useTransform(progress, (value) =>
    value < (from + to) / 2 ? hidden : REVEALED_CLIP,
  )

  return reduceMotion ? snap : wipe
}

type WipeStep = (typeof WIPE_SEQUENCE)[number]

## 3. State

  const wrapperRef = useRef<HTMLElement>(null)
  const shouldReduceMotion = useReducedMotion() ?? false
  const { progress: scrollYProgress, viewportHeight } =
    useElementScrollProgress(wrapperRef)

  // 100vh until the real scroller has been measured, so the server render and
  // the first client render agree.
  const panelHeight = viewportHeight ? \`\${viewportHeight}px\` : '100vh'

  // The scroll cue has done its job the moment the first cut starts moving.
  const cueOpacity = useTransform(scrollYProgress, [0, 0.03], [1, 0])

  // Counts the cuts that have passed their midpoint, so the label flips with
  // the frame the viewer is actually looking at.
  const frameLabel = useTransform(scrollYProgress, (value) => {
    const passed = WIPE_SEQUENCE.filter(
      (step) => value >= (step.from + step.to) / 2,
    ).length

    return String(passed + 1).padStart(2, '0')
  })

## 4. Tree

section  ref={wrapperRef}  aria-label="Editorial photo gallery"  className="relative min-h-screen w-full bg-[#0A0A0A] dark:bg-[#0A0A0A]"  style={{ height: SECTION_HEIGHT, fontFamily: TYPEFACE }}
  div  className="sticky top-0 w-full overflow-hidden bg-[#0A0A0A] dark:bg-[#0A0A0A]"  style={{ height: panelHeight }}
    h2  className="sr-only"  > {PHOTOS.map((photo) => photo.title).join('. ')}
    div  className="absolute inset-0 isolate"
      img  src={PHOTOS[0].src}  alt={PHOTOS[0].alt}  className="absolute inset-0 h-full w-full object-cover"  draggable={false}
      FrameTitle  title={PHOTOS[0].title}
    PhotoLayer  key={step.photo.src}  step={step}  progress={scrollYProgress}  reduceMotion={shouldReduceMotion}  [map WIPE_SEQUENCE.map((step) => ...)]
    div  aria-hidden="true"  className="pointer-events-none absolute inset-0 z-20 text-[#FFFFFF] dark:text-[#FFFFFF]"  style={{ mixBlendMode: 'difference' }}
      div  className="absolute left-4 top-4 flex flex-col gap-2 md:left-8 md:top-8"
        span  className="text-[12px] font-semibold uppercase tracking-[0.18em]"  > Selected Works
        span  className="text-[12px] uppercase tracking-[0.18em]"  > Concrete and Light
      div  className="absolute bottom-6 right-4 text-[12px] font-semibold uppercase tracking-[0.18em] md:bottom-8 md:right-8"
        motion.span  > {frameLabel}
        span  className="opacity-70"  >  / {TOTAL_LABEL}
      motion.div  className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 md:bottom-8"  style={{ opacity: cueOpacity }}
        span  className="text-[12px] font-semibold uppercase tracking-[0.18em]"  > Scroll
        motion.span  className="flex"  animate={shouldReduceMotion ? undefined : { y: [0, 6, 0] }}  transition={{ duration: 1.8, repeat: Infinity, ease: [0.4, 0, 0.2, 1] }}
          ChevronDown  size={16}

The sticky panel is a PLAIN div, not motion.div: its height is a string from React state, so a
re-render is what writes it to the DOM. The separator span's children are literally a leading
space, a slash, a space, then {TOTAL_LABEL}, so the readout renders as "01 / 05". The counter sits
bottom right, not top right, because host pages park their own chrome (a close button, a toolbar)
in the top right corner often enough that a counter there gets covered. The h2 is the only real
heading: the visible titles are aria-hidden duplicates, and h2 not h1 because this is a section
pasted into someone else's page.

The root already ships min-h-screen and it must stay: a standalone paste needs it, or an ancestor
with a real height, or the root collapses and takes its absolute layers with it. The scroll length
is the inline height: SECTION_HEIGHT, and the sticky panel's height is panelHeight, a px string
once the scroller has been measured and '100vh' before that.

### PhotoLayer({ step, progress, reduceMotion }: { step: WipeStep; progress: MotionValue<number>; reduceMotion: boolean })

  const clipPath = useWipeClip(
    progress,
    step.from,
    step.to,
    HIDDEN_CLIP[step.direction],
    reduceMotion,
  )
  const enter = useTransform(progress, [step.from, step.settled], [0, 1], {
    ease: ENTER_EASE,
  })

motion.div  data-layer="photo"  className="absolute inset-0 isolate"  style={{ clipPath, willChange: 'clip-path' }}
  img  src={step.photo.src}  alt={step.photo.alt}  className="absolute inset-0 h-full w-full object-cover"  draggable={false}
  FrameTitle  title={step.photo.title}  enter={reduceMotion ? undefined : enter}  direction={step.direction}

### FrameTitle({ title, enter, direction }: { title: string; enter?: MotionValue<number>; direction?: Direction })

  // \`enter\` is absent for the frame that is already on screen at rest, and
  // whenever the viewer asked for reduced motion: the title just sits settled.
  const atRest = useMotionValue(1)
  const arrival = enter ?? atRest
  const from = direction ? ENTER_FROM[direction] : null

  const tracking = useTransform(
    arrival,
    [0, 1],
    [ENTER_TRACKING, SETTLED_TRACKING],
  )
  const letterSpacing = useTransform(tracking, (value) => \`\${value}em\`)
  // Letter spacing also lands after the last letter, so wide tracking drags the
  // word off centre. Cancelling it on the trailing edge keeps every line
  // optically centred while it tightens.
  const trailing = useTransform(tracking, (value) => \`\${-value}em\`)
  const offset = useTransform(
    arrival,
    [0, 1],
    [from ? ENTER_OFFSET * from.sign : 0, 0],
  )

motion.span  aria-hidden="true"  className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center font-extrabold uppercase leading-none text-[#FFFFFF] dark:text-[#FFFFFF] md:p-8"  style={{ fontSize: 'clamp(32px, 14vw, 160px)', letterSpacing, mixBlendMode: 'difference', x: from?.axis === 'x' ? offset : 0, y: from?.axis === 'y' ? offset : 0 }}
  motion.span  key={\`\${word}-\${index}\`}  style={{ marginRight: trailing }}  > {word}  [map title.split(' ').map((word, index) => ...)]

## 5. Why

- Every inset() slot carries an explicit percentage, including the zeros. Framer Motion cannot interpolate an inset() that mixes unitless 0 with 0%: it emits an invalid value, the browser falls back to clip-path: none, and the layer sits fully revealed from the first frame instead of wiping.
- The title is nested INSIDE its own photo layer, never in a shared layer above the stack. Text has a transparent background, so a shared layer lets every title pile up on screen at once; nested, the next opaque photo covers the previous title for free and exactly one title is ever visible. isolate on each layer scopes the difference blend to its own photo.
- One word per line, stacked, instead of letting the title wrap naturally. The animated letter spacing changes the measured text width, so a naturally wrapped short title reflowed from two lines to one halfway through its own cut, mid-animation. Stacking makes the line count a property of the copy, not of the current tracking or viewport width.
- findScrollContext is ONE ancestor walk that answers two questions: scroller (what really scrolls, driving progress) and clipper (the nearest ancestor that crops, capping the panel). A scroller must have overflowY auto or scroll AND scrollHeight > clientHeight, because body { overflow-x: hidden } computes overflowY to auto without ever scrolling and is on half the pages this gets pasted into; without the overflow test the walk stops at a fake scroller and progress never moves. When the scroller turns up later in the walk, the NEARER clipper already found is kept, since a fixed-height box inside a scrolling shell is what bounds this block, not the shell.
- viewportHeight is React state, not a MotionValue. A MotionValue driving style.height did not update the DOM after the first render, so the panel stayed stuck at its 100vh fallback forever. This value changes on mount and on resize, not per frame, so a re-render is the correct mechanism. It starts null so the server render and the first client render both produce '100vh' and hydration matches.
- The panel height is scroller.clientHeight, or window.innerHeight when nothing scrolls, then capped by the nearest clipper when the two differ. Sizing to 100vh inside a shorter container (a fixed-height preview box, a card, an app shell with a fixed header, iOS where 100vh is the large viewport) hangs the bottom of the composition and its chrome below the crop. A page-level clipper is taller than the window, so the cap is a no-op there and only real crops shrink the panel. The same pair also decides cropped: a clipper that is not the scroller and is shorter than the section pins progress to 0 and holds frame 1, because that crop moves as one piece and the viewer can never travel through the sequence inside it; letting an outer scroll drive it instead produced a visible contradiction, the counter reading 03 while frame 1 was on screen in a fixed-height preview box. When the clipper IS the scroller (a fullscreen overlay panel) or is page level and taller than the section, cropped is false and progress runs normally.
- Scroll listeners go on BOTH the found scroller and window, always, because scroll events do not bubble from an inner scroller to window. A ResizeObserver watches the scroller and, when it differs, the clipper as well: a container can resize without the window resizing at all (an overlay opening, a panel animating, a phone toolbar collapsing). All reads coalesce into one requestAnimationFrame.
- Reduced motion swaps the interpolated clip for a hard snap at (from + to) / 2, drops the enter MotionValue so no title slides or tracks in, and drops the caret's y keyframes. Nothing is hidden, only the movement is removed.

## 6. Remix

- Pace: SECTION_HEIGHT ('1100vh') is the whole timeline, so raising it slows everything without changing the rhythm. Inside each equal slice, the 0.18 and 0.72 fractions in WIPE_SEQUENCE set how long the frame holds still before and after its cut, and the 0.45 multiplier on settled sets how far past the wipe the type keeps moving.
- Type arrival: ENTER_TRACKING (0.16em) to SETTLED_TRACKING (0.02em) is the tightening, ENTER_OFFSET (48px) is the slide distance, ENTER_EASE (cubicBezier(0.16, 1, 0.3, 1)) is its curve, and ENTER_FROM decides which axis and sign each direction pushes along. Keep the sign WITH the wipe or the type and the reveal stop reading as one gesture.
- Content and palette: swap PHOTOS for your own five landscape images with alt text and a short two-word title each, then retune DIRECTIONS if you want a different cut order (it cycles down, right, up, left across HIDDEN_CLIP). The surface is #0A0A0A and every piece of type is #FFFFFF on mixBlendMode difference, so a lighter background needs both changed together.

## 7. Check

A line that fails is a bug in your build; fix it and re-check.
- A naked paste fills the viewport: the root keeps min-h-screen next to its inline height: SECTION_HEIGHT, the sticky panel gets a px height from panelHeight once mounted, and nothing collapses to zero.
- Every hex value and every key expression appears unchanged from block 2: #0A0A0A and #FFFFFF, key={step.photo.src} and key={\`\${word}-\${index}\`}, along with 0.18, 0.72, 0.45, 0.16, 0.02, 48, 0.03 and cubicBezier(0.16, 1, 0.3, 1).
- Every element carrying initial/animate/exit or a MotionValue style is a motion.* tag, not a plain tag or a bare icon: motion.div for each photo layer and the scroll cue, motion.span for the frame label, the caret carrier and every title word. The sticky panel is the one deliberate plain div, because its height is a state string. ChevronDown sits inside motion.span className="flex" and is never animated itself.
- Scroll from top to bottom: exactly one title is readable at any moment, never two overlapping, and the counter climbs 01 through 05, flipping at each cut's midpoint rather than at its start or its end. The counter reads in the bottom right corner, clear of anything the host page puts top right.
- Watch the computed clip-path through a full wipe in devtools. It is always an inset() with four explicit percentages; if it ever reads none, a slot lost its % and that layer is unclipped.
- The four cuts arrive from different edges in order down, right, up, left, and each headline is pushed WITH its own wipe: down enters from above, right enters from the left, up from below, left from the right. The frame lands first and the type finishes a beat later. No title reflows to a different number of lines while it is tightening.
- Mount it three ways: a page whose body has overflow-x: hidden, an app shell that scrolls an inner div, and a fixed-height box (say 420px) that does not scroll at all. The sequence runs on the first two. In the box the panel measures 420px rather than the window, so the counter and the scroll cue stay inside the crop, and the render holds frame 1 with the counter reading 01: the crop is shorter than the section and is not what scrolls, so cropped pins progress to 0. A counter that climbs to 03 there while frame 1 is on screen means the cropped guard is missing. Resize that box while mounted: the panel follows without a window resize.
- With prefers-reduced-motion set: every wipe snaps at its midpoint with no intermediate state, no title slides or changes tracking, the caret does not bounce, and the scroll cue still fades out by 0.03 progress.`,
}
