'use client'

import { useEffect, useState } from 'react'

export type TocItem = { id: string; title: string }

/**
 * The "On this page" list. The section being read is marked, so the reader
 * always knows where they are on a long page, the way shadcn's docs do it.
 */
export function Toc({ items }: { items: TocItem[] }) {
  const [current, setCurrent] = useState(items[0]?.id)

  useEffect(() => {
    const headings = items
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null)
    // A heading counts as current once it passes the top fifth of the screen.
    const observer = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting)
        if (seen.length > 0) setCurrent(seen[0].target.id)
      },
      { rootMargin: '0px 0px -80% 0px' },
    )
    headings.forEach((h) => observer.observe(h))
    return () => observer.disconnect()
  }, [items])

  return (
    <ul className="mt-3 space-y-2 border-l border-sand-200 dark:border-sand-800">
      {items.map((t) => {
        const on = current === t.id
        return (
          <li key={t.id}>
            <a
              href={`#${t.id}`}
              aria-current={on ? 'location' : undefined}
              onClick={() => setCurrent(t.id)}
              className={`-ml-px block border-l pl-3 text-sm transition-colors ${
                on
                  ? 'border-sand-900 font-semibold text-sand-900 dark:border-sand-50 dark:text-sand-50'
                  : 'border-transparent text-sand-600 hover:border-sand-400 hover:text-sand-900 dark:text-sand-400 dark:hover:border-sand-600 dark:hover:text-sand-50'
              }`}
            >
              {t.title}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
