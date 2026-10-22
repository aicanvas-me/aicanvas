'use client'
// npm install @phosphor-icons/react framer-motion

import { useEffect, useRef, useState, type RefObject } from 'react'
import {
  cubicBezier,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { CaretDown } from '@phosphor-icons/react'

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





const TYPEFACE =
  "'Manrope', 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif"



const SECTION_HEIGHT = '1100vh'






// Keep % on every value: mixing 0 with 0% breaks the tween and the clip silently drops.
const HIDDEN_CLIP = {
  down: 'inset(0% 0% 100% 0%)',
  right: 'inset(0% 100% 0% 0%)',
  up: 'inset(100% 0% 0% 0%)',
  left: 'inset(0% 0% 0% 100%)',
} as const
const REVEALED_CLIP = 'inset(0% 0% 0% 0%)'

const DIRECTIONS = ['down', 'right', 'up', 'left'] as const

type Direction = (typeof DIRECTIONS)[number]




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
    settled: to + (to - from) * 0.45,
  }
})

const TOTAL_LABEL = String(PHOTOS.length).padStart(2, '0')






const ENTER_TRACKING = 0.16
const SETTLED_TRACKING = 0.02
const ENTER_OFFSET = 48
const ENTER_EASE = cubicBezier(0.16, 1, 0.3, 1)



const ENTER_FROM = {
  down: { axis: 'y', sign: -1 },
  right: { axis: 'x', sign: -1 },
  up: { axis: 'y', sign: 1 },
  left: { axis: 'x', sign: 1 },
} as const





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

      // overflow-x: hidden also computes overflowY auto, so require real overflow too.
      if (
        (overflowY === 'auto' || overflowY === 'scroll') &&
        ancestor.scrollHeight > ancestor.clientHeight
      ) {
        return { scroller: ancestor, clipper: clipper ?? ancestor }
      }
    }

    ancestor = ancestor.parentElement
  }

  return { scroller: null, clipper }
}





function useElementScrollProgress(targetRef: RefObject<HTMLElement | null>): {
  progress: MotionValue<number>
  viewportHeight: number | null
} {
  const progress = useMotionValue(0)
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
      const availableHeight = scrollContainer
        ? scrollContainer.clientHeight
        : window.innerHeight
      const nextViewportHeight =
        clipper && clipper !== scrollContainer
          ? Math.min(availableHeight, clipper.clientHeight)
          : availableHeight
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
    // Both listeners: scroll events on an inner scroller do not bubble to window.
    scrollContainer?.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)

    const observer = new ResizeObserver(requestUpdate)
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

function PhotoLayer({
  step,
  progress,
  reduceMotion,
}: {
  step: WipeStep
  progress: MotionValue<number>
  reduceMotion: boolean
}) {
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

  return (
    <motion.div
      data-layer="photo"
      className="absolute inset-0 isolate"
      style={{ clipPath, willChange: 'clip-path' }}
    >
      <img
        src={step.photo.src}
        alt={step.photo.alt}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      <FrameTitle
        title={step.photo.title}
        enter={reduceMotion ? undefined : enter}
        direction={step.direction}
      />
    </motion.div>
  )
}











function FrameTitle({
  title,
  enter,
  direction,
}: {
  title: string
  enter?: MotionValue<number>
  direction?: Direction
}) {
  const atRest = useMotionValue(1)
  const arrival = enter ?? atRest
  const from = direction ? ENTER_FROM[direction] : null

  const tracking = useTransform(
    arrival,
    [0, 1],
    [ENTER_TRACKING, SETTLED_TRACKING],
  )
  const letterSpacing = useTransform(tracking, (value) => `${value}em`)
  const trailing = useTransform(tracking, (value) => `${-value}em`)
  const offset = useTransform(
    arrival,
    [0, 1],
    [from ? ENTER_OFFSET * from.sign : 0, 0],
  )

  return (
    <motion.span
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center font-extrabold uppercase leading-none text-[#FFFFFF] dark:text-[#FFFFFF] md:p-8"
      style={{
        fontSize: 'clamp(32px, 14vw, 160px)',
        letterSpacing,
        mixBlendMode: 'difference',
        x: from?.axis === 'x' ? offset : 0,
        y: from?.axis === 'y' ? offset : 0,
      }}
    >
      {title.split(' ').map((word, index) => (
        <motion.span key={`${word}-${index}`} style={{ marginRight: trailing }}>
          {word}
        </motion.span>
      ))}
    </motion.span>
  )
}

export default function ScrollWipeGallery() {
  const wrapperRef = useRef<HTMLElement>(null)
  const shouldReduceMotion = useReducedMotion() ?? false
  const { progress: scrollYProgress, viewportHeight } =
    useElementScrollProgress(wrapperRef)

  // 100vh until measured, so the server and first client render match.
  const panelHeight = viewportHeight ? `${viewportHeight}px` : '100vh'

  const cueOpacity = useTransform(scrollYProgress, [0, 0.03], [1, 0])

  const frameLabel = useTransform(scrollYProgress, (value) => {
    const passed = WIPE_SEQUENCE.filter(
      (step) => value >= (step.from + step.to) / 2,
    ).length

    return String(passed + 1).padStart(2, '0')
  })

  return (
    <section
      ref={wrapperRef}
      aria-label="Editorial photo gallery"
      className="relative min-h-screen w-full bg-[#0A0A0A] dark:bg-[#0A0A0A]"
      style={{ height: SECTION_HEIGHT, fontFamily: TYPEFACE }}
    >
      <div
        className="sticky top-0 w-full overflow-hidden bg-[#0A0A0A] dark:bg-[#0A0A0A]"
        style={{ height: panelHeight }}
      >
        <h2 className="sr-only">
          {PHOTOS.map((photo) => photo.title).join('. ')}
        </h2>

        <div className="absolute inset-0 isolate">
          <img
            src={PHOTOS[0].src}
            alt={PHOTOS[0].alt}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />
          <FrameTitle title={PHOTOS[0].title} />
        </div>

        {WIPE_SEQUENCE.map((step) => (
          <PhotoLayer
            key={step.photo.src}
            step={step}
            progress={scrollYProgress}
            reduceMotion={shouldReduceMotion}
          />
        ))}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 text-[#FFFFFF] dark:text-[#FFFFFF]"
          style={{ mixBlendMode: 'difference' }}
        >
          <div className="absolute left-4 top-4 flex flex-col gap-2 md:left-8 md:top-8">
            <span className="text-[12px] font-semibold uppercase tracking-[0.18em]">
              Selected Works
            </span>
            <span className="text-[12px] uppercase tracking-[0.18em]">
              Concrete and Light
            </span>
          </div>

          <div className="absolute bottom-6 right-4 text-[12px] font-semibold uppercase tracking-[0.18em] md:bottom-8 md:right-8">
            <motion.span>{frameLabel}</motion.span>
            <span className="opacity-70"> / {TOTAL_LABEL}</span>
          </div>

          <motion.div
            className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-2 md:bottom-8"
            style={{ opacity: cueOpacity }}
          >
            <span className="text-[12px] font-semibold uppercase tracking-[0.18em]">
              Scroll
            </span>
            <motion.span
              className="flex"
              animate={shouldReduceMotion ? undefined : { y: [0, 6, 0] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <CaretDown size={16} weight="regular" />
            </motion.span>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
