'use client'

// The homepage v3 FAQ rows, shared by every page that lists questions: one
// rounded tray of rows, a plus that turns into a cross when a row opens.
// Answers stay in the DOM while closed (SEO); the grid-rows
// trick animates the height, and reduced motion opens them without it.
//
// `multiple` keeps several rows open at once, for a reference page where a
// reader compares two answers. An answer may carry one link: the first
// occurrence of link.label inside `a` becomes an anchor, so `a` itself stays
// plain text for the FAQPage JSON-LD.

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Plus } from '@phosphor-icons/react'

export type FaqRow = { q: string; a: string; link?: { label: string; href: string } }

const LINK =
  'font-medium text-olive-600 underline decoration-olive-500/40 underline-offset-2 transition-colors hover:text-olive-800 dark:text-olive-400 dark:hover:text-olive-300'

function Answer({ a, link }: FaqRow) {
  if (!link || !a.includes(link.label)) return <>{a}</>
  const idx = a.indexOf(link.label)
  const external = /^https?:/.test(link.href)
  return (
    <>
      {a.slice(0, idx)}
      {external ? (
        <a href={link.href} target="_blank" rel="noopener noreferrer" className={LINK}>
          {link.label}
        </a>
      ) : (
        <Link href={link.href} className={LINK}>
          {link.label}
        </Link>
      )}
      {a.slice(idx + link.label.length)}
    </>
  )
}

export function FaqRows({
  items,
  idPrefix,
  multiple = false,
  firstOpen = true,
}: {
  items: FaqRow[]
  idPrefix: string
  multiple?: boolean
  firstOpen?: boolean
}) {
  const [open, setOpen] = useState<Set<number>>(() => new Set(firstOpen && items.length ? [0] : []))
  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(multiple ? prev : prev.has(i) ? [i] : [])
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  return (
    <div className="space-y-1.5 rounded-[28px] border border-sand-200 p-1.5 dark:border-sand-800">
      {items.map((item, i) => {
        const on = open.has(i)
        const id = `${idPrefix}-${i}`
        return (
          <div
            key={item.q}
            className={`rounded-[22px] border transition-colors ${
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
                onClick={() => toggle(i)}
                className="flex w-full items-center gap-4 rounded-[22px] px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 sm:px-7 sm:py-5"
              >
                <span className="flex-1 text-base font-semibold text-sand-900 dark:text-sand-50">{item.q}</span>
                <Plus
                  weight="regular"
                  size={18}
                  aria-hidden
                  className={`shrink-0 transition-transform duration-200 motion-reduce:transition-none ${
                    on ? 'rotate-45 text-sand-900 dark:text-sand-50' : 'text-sand-600 dark:text-sand-400'
                  }`}
                />
              </button>
            </h3>
            <div
              id={id}
              className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                on ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className={`overflow-hidden transition-[visibility] duration-300 ${on ? 'visible' : 'invisible'}`}>
                <p className="px-5 pb-5 pr-12 text-base leading-relaxed text-sand-700 sm:px-7 sm:pr-16 dark:text-sand-300">
                  <Answer {...item} />
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// The card under a list of questions: the homepage's "Still have a question?"
// row, a thin olive light on its top edge. `allQuestions` drops the link to
// /faq on the FAQ page itself.
export function FaqHelpCard({ allQuestions = true }: { allQuestions?: boolean }) {
  return (
    <div className="relative mt-6 overflow-hidden rounded-[28px] border border-sand-200 px-5 py-5 sm:px-7 dark:border-sand-800">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 mx-auto h-px w-40 bg-gradient-to-r from-transparent via-olive-600 to-transparent dark:via-olive-400"
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold text-sand-900 dark:text-sand-50">Still have a question?</p>
          <p className="mt-1 text-sm text-sand-600 dark:text-sand-400">Send it straight to the person building AI Canvas.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {allQuestions && (
            <Link
              href="/faq"
              className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold text-sand-700 transition-colors hover:text-sand-900 dark:text-sand-300 dark:hover:text-sand-100"
            >
              All questions
            </Link>
          )}
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
  )
}
