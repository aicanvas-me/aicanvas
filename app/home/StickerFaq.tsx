'use client'

// The FAQ: one centred column of rounded-tag rows, a plus that turns into a
// cross when a row opens; under reduced motion the accordion opens without
// animating.
//
// Answers stay in the DOM when closed (SEO); the grid-rows trick animates the
// height, the same as the FAQ page.

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Plus } from '@phosphor-icons/react'

export type FaqItem = { q: string; a: string }

export function StickerFaq({ items, eyebrow, title, sub }: { items: FaqItem[]; eyebrow: string; title: string; sub: string }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div>
      <div className="mx-auto max-w-3xl">
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
