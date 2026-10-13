'use client'

// A policy or reference page's body: the text in one readable column and,
// from lg up, an "On this page" list beside it that follows the reader. Below
// lg the same list folds into one row above the text.
//
// The list is read off the article's own h2s after mount, so the policy text
// is never edited to feed it. A heading without an id gets one from its words,
// which also makes every section linkable (/terms#5-acceptable-use). A jump
// lands the heading 96px down, level with the sticky list (the column's 56px
// scroll padding for the bar plus scroll-mt-10), and the list marks the last
// heading above LINE, so the section you jumped to is the one marked.

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CaretDown } from '@phosphor-icons/react'

type Entry = { id: string; label: string }

const slug = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

// The point under the bar where a heading counts as the one being read.
const LINE = 120

export function LegalArticle({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null)
  const [toc, setToc] = useState<Entry[]>([])
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const article = ref.current
    if (!article) return
    const heads = Array.from(article.querySelectorAll('h2'))
    const seen = new Set<string>()
    const entries = heads.map((h) => {
      const label = (h.textContent ?? '').trim()
      if (!h.id) {
        let id = slug(label) || 'section'
        while (seen.has(id)) id += '-x'
        h.id = id
      }
      seen.add(h.id)
      return { id: h.id, label }
    })
    // The list exists only once the article has rendered: the DOM is the
    // source, read once here.
    setToc(entries)

    const scroller = article.closest('.app-scroll-column') ?? window
    let frame = 0
    const update = () => {
      frame = 0
      let current: string | null = entries[0]?.id ?? null
      for (const h of heads) {
        if (h.getBoundingClientRect().top - LINE <= 0) current = h.id
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

  const list = (
    <ul className="space-y-0.5 border-l border-sand-200 dark:border-sand-800">
      {toc.map((e) => {
        const on = e.id === active
        return (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              aria-current={on ? 'location' : undefined}
              className={`-ml-px block border-l py-1.5 pl-4 text-sm leading-snug transition-colors ${
                on
                  ? 'border-olive-600 font-medium text-sand-900 dark:border-olive-400 dark:text-sand-50'
                  : 'border-transparent text-sand-600 hover:border-sand-400 hover:text-sand-900 dark:text-sand-400 dark:hover:border-sand-600 dark:hover:text-sand-100'
              }`}
            >
              {e.label}
            </a>
          </li>
        )
      })}
    </ul>
  )

  return (
    <div className="mx-auto mt-14 mb-10 grid max-w-6xl gap-8 sm:mt-20 sm:mb-16 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
      <nav aria-label="On this page" className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pb-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">
            On this page
          </p>
          {list}
        </div>
      </nav>

      <div className="min-w-0">
        {toc.length > 0 && (
          <details className="group mb-10 rounded-2xl border border-sand-200 bg-sand-100 lg:hidden dark:border-sand-800 dark:bg-sand-900">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-sm font-semibold text-sand-900 dark:text-sand-50 [&::-webkit-details-marker]:hidden">
              On this page
              <CaretDown
                weight="regular"
                size={14}
                aria-hidden
                className="text-sand-600 transition-transform group-open:rotate-180 dark:text-sand-400"
              />
            </summary>
            <div className="px-5 pb-4">{list}</div>
          </details>
        )}
        {/* No common ligatures: Manrope draws "(c)" as a copyright sign, which
            turns a clause reference like "Art. 6 (1)(c) GDPR" into "(1)©". */}
        <article ref={ref} className="max-w-3xl [font-variant-ligatures:no-common-ligatures] [&_h2]:scroll-mt-10">
          {children}
        </article>
      </div>
    </div>
  )
}
