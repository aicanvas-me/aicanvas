'use client'

// A wall of standalone components: columns of cards, each a name in mono over
// its screenshot, drifting slowly up and down in turn, with the edges fading
// into the page. The whole wall holds still while hovered, focused, paused by
// its toggle or off screen. Keyboard focus also resets the focused column to its
// start, where the focusable originals sit (the loop's second copy is
// untabbable). Reduced motion shows it still. Every card opens its component page.

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Pause } from '@/app/_icons/icons/pause'
import { Play } from '@/app/_icons/icons/play'
import { buttonClasses } from '../components/buttonClasses'

export type WallItem = { slug: string; name: string; image: string; imageLight?: string; premium: boolean }

// Seconds for one full loop of a column; each column gets its own pace so the
// wall never moves in lockstep.
const PACE = [70, 86, 64, 92]

// The top and bottom fade into the page, by --wall-y and --wall-b; the sides
// end clean.
const WALL_MASK =
  'linear-gradient(to bottom, transparent, black var(--wall-y), black calc(100% - var(--wall-b)), transparent)'

const IMG = 'absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out motion-safe:group-hover:scale-[1.03]'

function Card({ item, hidden }: { item: WallItem; hidden?: boolean }) {
  return (
    <Link
      href={`/components/${item.slug}`}
      tabIndex={hidden ? -1 : undefined}
      aria-hidden={hidden || undefined}
      className="group block rounded-card border border-sand-200 bg-sand-100 p-2 transition-colors hover:border-sand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 dark:border-sand-800 dark:bg-sand-900 dark:hover:border-sand-700"
    >
      <span className="flex items-center justify-between gap-2 px-1.5 pb-2 pt-1">
        <span className="truncate font-mono text-[11px] tracking-wide text-sand-600 dark:text-sand-400">{item.name}</span>
        {item.premium ? (
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-premium">Premium</span>
        ) : null}
      </span>
      <span className="relative block aspect-[4/3] overflow-hidden rounded-inset bg-sand-950">
        <img
          src={item.image}
          alt={hidden ? '' : `${item.name} component preview`}
          loading="lazy"
          decoding="async"
          className={`${IMG} ${item.imageLight ? 'hidden dark:block' : ''}`}
        />
        {/* The light shot on a light site; display:none keeps the other one
            from loading. */}
        {item.imageLight && (
          <img
            src={item.imageLight}
            alt={hidden ? '' : `${item.name} component preview`}
            loading="lazy"
            decoding="async"
            className={`${IMG} dark:hidden`}
          />
        )}
      </span>
    </Link>
  )
}

export function ComponentWall({ items }: { items: WallItem[] }) {
  const wallRef = useRef<HTMLDivElement>(null)
  const [paused, setPaused] = useState(false)

  // Off screen = paused. Written straight to a data attribute the CSS reads,
  // so scrolling past never re-renders the wall.
  useEffect(() => {
    const el = wallRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) el.removeAttribute('data-off')
      else el.setAttribute('data-off', '')
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Deal the cards into four columns, round robin, so each column mixes kinds.
  const columns = [0, 1, 2, 3].map((c) => items.filter((_, i) => i % 4 === c))

  return (
    <>
      <div
        ref={wallRef}
        data-paused={paused || undefined}
        // The fade runs about a third as far on the light page: the screenshots are
        // dark on both themes, and a dark picture fading into a light page goes
        // grey on the way, so the band stays thin there. Dark keeps its long fade.
        className="v3-wall relative h-[560px] overflow-hidden [--wall-b:5%] [--wall-y:4%] sm:h-[640px] lg:h-[720px] dark:[--wall-b:14%] dark:[--wall-y:10%]"
        style={{ maskImage: WALL_MASK, WebkitMaskImage: WALL_MASK }}
      >
        <style>{`
          @keyframes v3-wall-up { from { transform: translateY(0) } to { transform: translateY(-50%) } }
          @keyframes v3-wall-down { from { transform: translateY(-50%) } to { transform: translateY(0) } }
          .v3-wall:hover .v3-wall-col, .v3-wall:focus-within .v3-wall-col,
          .v3-wall[data-paused] .v3-wall-col, .v3-wall[data-off] .v3-wall-col { animation-play-state: paused !important }
          .v3-wall-col:focus-within { animation: none !important }
          @media (prefers-reduced-motion: reduce) { .v3-wall-col { animation: none !important } }
        `}</style>
        <div className="grid h-full grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {columns.map((col, c) => (
            <div key={c} className={`min-w-0 ${c >= 2 ? 'hidden lg:block' : ''}`}>
              <div
                className="v3-wall-col flex flex-col"
                style={{ animation: `${c % 2 === 0 ? 'v3-wall-up' : 'v3-wall-down'} ${PACE[c]}s linear infinite` }}
              >
                {/* The column twice over, so the loop has no seam: spacing is
                    padding, not gap, so both halves are exactly the same height
                    and -50% lands on the copy's first card. The copy is hidden
                    from assistive tech and the tab order. */}
                {col.map((item) => (
                  <div key={item.slug} className="pb-3 sm:pb-4">
                    <Card item={item} />
                  </div>
                ))}
                {col.map((item) => (
                  <div key={`${item.slug}-again`} className="pb-3 motion-reduce:hidden sm:pb-4">
                    <Card item={item} hidden />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Touch has no hover, so the wall needs its own way to stop. */}
      <div className="mt-3 flex justify-end motion-reduce:hidden">
        <button
          type="button"
          aria-label="Pause the component wall"
          aria-pressed={paused}
          onClick={() => setPaused((p) => !p)}
          className={buttonClasses({ variant: 'outline', size: 'sm', iconOnly: true })}
        >
          {paused ? <Play size={14} aria-hidden /> : <Pause size={14} aria-hidden />}
        </button>
      </div>
    </>
  )
}
