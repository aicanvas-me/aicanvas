'use client'

// The FAQ: one centred column of rounded-tag rows, a plus that turns into a cross
// when a row opens, and a few die-cut stickers of the tools AI Canvas lives
// with, scattered in the margins. The stickers can be picked up and moved
// anywhere in the section; they bob gently while left alone. They only show
// where the margins are wide enough (xl); under reduced motion they neither
// bob nor scale, and the accordion opens without animating.
//
// Answers stay in the DOM when closed (SEO); the grid-rows trick animates the
// height, the same as the FAQ page.

import { useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Plus } from '@phosphor-icons/react'
import { ClaudeMark, CursorMark } from '../mcp/InstallCards'

export type FaqItem = { q: string; a: string }

// White die-cut edge: four hard white drop shadows trace the art's own shape,
// then one soft shadow lifts it off the page.
const DIE_CUT =
  'drop-shadow(4px 0 0 #fff) drop-shadow(-4px 0 0 #fff) drop-shadow(0 4px 0 #fff) drop-shadow(0 -4px 0 #fff) drop-shadow(0 12px 14px rgb(0 0 0 / 0.28))'

function ReactArt() {
  return (
    <svg viewBox="-11.5 -10.23 23 20.46" className="size-[104px]" aria-hidden>
      <circle r="2.05" fill="#58C4DC" />
      <g fill="none" stroke="#58C4DC" strokeWidth="1.15">
        <ellipse rx="11" ry="4.2" />
        <ellipse rx="11" ry="4.2" transform="rotate(60)" />
        <ellipse rx="11" ry="4.2" transform="rotate(120)" />
      </g>
    </svg>
  )
}

function TailwindArt() {
  return (
    <svg viewBox="0 0 24 24" className="size-[112px]" aria-hidden>
      <path
        fill="#38BDF8"
        d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z"
      />
    </svg>
  )
}

function CanvasArt() {
  return (
    <svg viewBox="0 0 28 24" className="size-[96px]" aria-hidden>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="#B2B2B6"
        d="M19.8513 0C20.5626 0 21.2204 0.377823 21.5788 0.992258L22.75 3L26.8243 9.98452C27.5508 11.23 27.5508 12.77 26.8243 14.0155L22.75 21L21.5788 23.0077C21.2204 23.6222 20.5626 24 19.8513 24H8.14874C7.43741 24 6.7796 23.6222 6.42118 23.0077L0.587849 13.0077C0.224593 12.385 0.224593 11.615 0.58785 10.9923L6.42118 0.992257C6.7796 0.377822 7.43741 0 8.14874 0H19.8513ZM4 12L9 21H18.25L13 12L18.25 3H9L4 12Z"
      />
      <path fillRule="evenodd" clipRule="evenodd" fill="#1E1E1E" d="M9 21L4 12H13L18.25 21H9Z" />
      <path fillRule="evenodd" clipRule="evenodd" fill="#4F4F4C" d="M13 12H4L9 3H18.25L13 12Z" />
    </svg>
  )
}

function MarkArt({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span className="block size-[92px] [&>svg]:size-full" style={{ color }} aria-hidden>
      {children}
    </span>
  )
}

const STICKERS: { id: string; art: ReactNode; pos: { left?: string; right?: string; top: string }; tilt: number; bob: number }[] = [
  { id: 'tailwind', art: <TailwindArt />, pos: { left: '3%', top: '16%' }, tilt: -10, bob: 0 },
  { id: 'canvas', art: <CanvasArt />, pos: { left: '7%', top: '52%' }, tilt: 7, bob: 1.4 },
  { id: 'cursor', art: <MarkArt color="#17171A"><CursorMark /></MarkArt>, pos: { left: '4%', top: '80%' }, tilt: -5, bob: 2.6 },
  { id: 'react', art: <ReactArt />, pos: { right: '4%', top: '6%' }, tilt: 9, bob: 0.7 },
  { id: 'claude', art: <MarkArt color="#D97757"><ClaudeMark /></MarkArt>, pos: { right: '7%', top: '46%' }, tilt: -8, bob: 2 },
]

export function StickerFaq({ items, eyebrow, title, sub }: { items: FaqItem[]; eyebrow: string; title: string; sub: string }) {
  const [open, setOpen] = useState<number | null>(0)
  const area = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  return (
    <div ref={area} className="relative">
      <style>{`
        @keyframes v3-bob { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-7px) } }
        .v3-bob { animation: v3-bob 5.5s ease-in-out infinite }
        @media (prefers-reduced-motion: reduce) { .v3-bob { animation: none } }
      `}</style>

      {/* Stickers: decorative, pointer only. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 hidden xl:block">
        {STICKERS.map((s) => (
          <motion.div
            key={s.id}
            drag
            dragConstraints={area}
            dragElastic={0.12}
            dragTransition={{ bounceStiffness: 320, bounceDamping: 22 }}
            whileHover={reduce ? undefined : { scale: 1.05 }}
            whileDrag={reduce ? { cursor: 'grabbing' } : { scale: 1.1, rotate: 0, cursor: 'grabbing' }}
            initial={false}
            animate={{ rotate: s.tilt }}
            className="pointer-events-auto absolute cursor-grab touch-none"
            style={s.pos}
          >
            <div className="v3-bob" style={{ animationDelay: `-${s.bob}s`, filter: DIE_CUT }}>
              {s.art}
            </div>
          </motion.div>
        ))}
      </div>

      {/* z-10: the column sits above the stickers, so one dropped on it slides
          underneath and never covers a question. */}
      <div className="relative z-10 mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">{eyebrow}</p>
          <h2 className="mt-2 text-balance text-3xl font-bold tracking-tight text-sand-900 sm:text-5xl dark:text-sand-50">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-sand-600 dark:text-sand-400">{sub}</p>
        </div>

        <div className="mt-10 space-y-1.5 rounded-shell border border-sand-200 p-1.5 dark:border-sand-800">
          {items.map(({ q, a }, i) => {
            const on = open === i
            const id = `v3-faq-${i}`
            return (
              <div
                key={q}
                className={`rounded-shell-inner border transition-colors ${
                  on
                    ? 'border-sand-300 bg-sand-100 dark:border-sand-700 dark:bg-sand-900'
                    : 'border-transparent bg-sand-100/70 hover:bg-sand-100 dark:bg-sand-900/60 dark:hover:bg-sand-900'
                }`}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={on}
                    aria-controls={id}
                    onClick={() => setOpen(on ? null : i)}
                    className="flex w-full items-center gap-4 rounded-shell-inner px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:px-7 sm:py-5"
                  >
                    <span className="flex-1 text-base font-semibold text-sand-900 dark:text-sand-50">{q}</span>
                    <Plus
                      weight="regular"
                      size={18}
                      aria-hidden
                      className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${on ? 'rotate-45 text-sand-900 dark:text-sand-50' : 'text-sand-600 dark:text-sand-400'}`}
                    />
                  </button>
                </h3>
                <div
                  id={id}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                >
                  <div className={`overflow-hidden transition-[visibility] duration-300 ${on ? 'visible' : 'invisible'}`}>
                    <p className="px-5 pb-5 pr-12 text-base leading-relaxed text-sand-700 sm:px-7 sm:pr-16 dark:text-sand-300">{a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Still have a question? */}
        <div className="relative mt-6 overflow-hidden rounded-shell border border-sand-200 px-5 py-5 sm:px-7 dark:border-sand-800">
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 mx-auto h-px w-40 bg-gradient-to-r from-transparent via-accent to-transparent"
          />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-base font-semibold text-sand-900 dark:text-sand-50">Still have a question?</p>
              <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">Send it straight to the person building AI Canvas.</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/faq"
                className="inline-flex items-center rounded-control px-3 py-2 text-sm font-semibold text-sand-700 transition-colors hover:text-sand-900 dark:text-sand-300 dark:hover:text-sand-100"
              >
                All questions
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-sand-300 bg-sand-50 px-4 py-2 text-sm font-semibold text-sand-900 transition-colors hover:border-sand-400 dark:border-sand-700 dark:bg-sand-900 dark:text-sand-50 dark:hover:border-sand-600"
              >
                Get in touch
                <ArrowRight weight="regular" size={14} aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
