'use client'

import { useEffect, useRef, useState } from 'react'
import { FaqHelpCard, FaqRows, type FaqRow } from '../components/FaqRows'
import { EYEBROW, SUB } from '../components/PageKit'
import { Reveal } from '../home/Reveal'

export type FaqItem = FaqRow
export type FaqCategory = {
  category: string
  slug: string
  blurb: string
  items: FaqItem[]
}

// The point under the scroller's top where a category counts as the one being
// read: below the bar plus the section's landing gap, so a category opened from
// the list is marked as soon as it lands.
const LINE = 140

const CHIP =
  'rounded-full border border-sand-200 bg-sand-100 px-3.5 py-1.5 text-sm font-medium text-sand-700 transition-colors hover:border-sand-300 hover:text-sand-900 dark:border-sand-800 dark:bg-sand-900 dark:text-sand-300 dark:hover:border-sand-700 dark:hover:text-sand-50'

// The body of /faq: from lg up, the category list follows the reader in a
// column beside the questions (the policy pages' "On this page" pattern);
// below lg it is one wrapping row of jump links under the hero. Every
// category keeps its id, so /faq#billing and friends still land.
export function FaqView({ categories }: { categories: FaqCategory[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<string | null>(categories[0]?.slug ?? null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const sections = Array.from(root.querySelectorAll<HTMLElement>('section[data-faq-category]'))
    // The root column scrolls, not the window (PageShell): listen where the
    // scroll actually happens.
    const scroller = root.closest('.app-scroll-column') ?? window
    let frame = 0
    const update = () => {
      frame = 0
      let current = sections[0]?.id ?? null
      for (const s of sections) {
        if (s.getBoundingClientRect().top - LINE <= 0) current = s.id
        else break
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={ref}>
      {/* Below lg: the categories as one row of jump links. */}
      <nav aria-label="FAQ categories" className="mx-auto mt-10 flex max-w-2xl flex-wrap justify-center gap-2 lg:hidden">
        {categories.map((c) => (
          <a key={c.slug} href={`#${c.slug}`} className={CHIP}>
            {c.category}
          </a>
        ))}
      </nav>

      <div className="mx-auto mt-14 grid max-w-5xl gap-16 sm:mt-16 lg:mt-24 lg:grid-cols-[13rem_minmax(0,1fr)]">
        {/* From lg: the same list, sticky, marking the category in view. */}
        <nav aria-label="FAQ categories" className="hidden lg:block">
          <div className="sticky top-10">
            <p className={`mb-3 ${EYEBROW}`}>On this page</p>
            <ul className="space-y-0.5 border-l border-sand-200 dark:border-sand-800">
              {categories.map((c) => {
                const on = c.slug === active
                return (
                  <li key={c.slug}>
                    <a
                      href={`#${c.slug}`}
                      aria-current={on ? 'location' : undefined}
                      className={`-ml-px block border-l py-1.5 pl-4 text-sm leading-snug transition-colors ${
                        on
                          ? 'border-accent font-medium text-sand-900 dark:text-sand-50'
                          : 'border-transparent text-sand-600 hover:border-sand-400 hover:text-sand-900 dark:text-sand-400 dark:hover:border-sand-600 dark:hover:text-sand-100'
                      }`}
                    >
                      {c.category}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        <div className="min-w-0">
          {categories.map((c, i) => (
            // scroll-mt-10 lands the heading level with the sticky list
            // (top-10, under the bar, which sits above the scroll column).
            <section key={c.slug} id={c.slug} data-faq-category="" className="mt-16 scroll-mt-10 first:mt-0 sm:mt-20">
              <Reveal>
                <div className="flex items-center justify-between gap-8">
                  <div className="min-w-0">
                    <h2
                      className="text-balance text-2xl font-bold tracking-tight text-sand-900 sm:text-3xl dark:text-sand-50"
                    >
                      {c.category}
                    </h2>
                    <p className={`mt-3 max-w-2xl ${SUB}`}>{c.blurb}</p>
                  </div>
                </div>
                <div className="mt-6 sm:mt-8">
                  {/* Several rows may stay open: a reader comparing two
                      answers should not have the first snap shut. Only the
                      page's first question opens on load, to show the rows
                      open at all. */}
                  <FaqRows items={c.items} idPrefix={`faq-${c.slug}`} multiple firstOpen={i === 0} />
                </div>
              </Reveal>
            </section>
          ))}
          <FaqHelpCard allQuestions={false} />
        </div>
      </div>
    </div>
  )
}
