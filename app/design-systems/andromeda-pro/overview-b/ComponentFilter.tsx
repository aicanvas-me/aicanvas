'use client'

// Family filter for the Components section. The card data arrives as plain
// props from page.tsx; only the selected family lives here. "All" shows a
// curated set; a family shows every one of its cards.

import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { AndromedaComponentCard } from '../system/AndromedaComponentCard'
import type { Family, OverviewComponent } from './overview-data'

const ALL = 'All'

export function ComponentFilter({
  components,
  families,
  curated,
}: {
  components: OverviewComponent[]
  families: Family[]
  curated: string[]
}) {
  const reduce = useReducedMotion()
  const baseId = useId()
  const [selected, setSelected] = useState(ALL)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  const tabs = [ALL, ...families.map((f) => f.name)]
  const counts = new Map(families.map((f) => [f.name, f.count]))
  const tabId = (i: number) => `${baseId}-tab-${i}`
  const panelId = `${baseId}-panel`

  const shown =
    selected === ALL
      ? curated
          .map((slug) => components.find((c) => c.slug === slug))
          .filter((c): c is OverviewComponent => Boolean(c))
      : components.filter((c) => c.category === selected)

  // Roving focus: arrows move along the row and select, Home/End jump.
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const n = tabs.length
    let next: number | null = null
    if (e.key === 'ArrowRight') next = (i + 1) % n
    else if (e.key === 'ArrowLeft') next = (i - 1 + n) % n
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = n - 1
    if (next === null) return
    e.preventDefault()
    setSelected(tabs[next])
    tabRefs.current[next]?.focus()
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Component families"
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 pt-1 sm:-mx-6 sm:px-6"
      >
        {tabs.map((t, i) => {
          const on = t === selected
          return (
            <button
              key={t}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              id={tabId(i)}
              type="button"
              role="tab"
              aria-selected={on}
              aria-label={counts.has(t) ? `${t}, ${counts.get(t)} components` : undefined}
              aria-controls={panelId}
              tabIndex={on ? 0 : -1}
              onClick={() => setSelected(t)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full border px-4 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 ${
                on
                  ? 'border-sand-900 bg-sand-900 text-sand-50 dark:border-sand-50 dark:bg-sand-50 dark:text-sand-950'
                  : 'border-sand-300 text-sand-700 hover:border-sand-400 hover:text-sand-900 dark:border-sand-700 dark:text-sand-300 dark:hover:border-sand-600 dark:hover:text-sand-100'
              }`}
            >
              {t}
              {counts.has(t) ? <span className="ml-1.5 opacity-70">{counts.get(t)}</span> : null}
            </button>
          )
        })}
      </div>

      <div id={panelId} role="tabpanel" aria-labelledby={tabId(tabs.indexOf(selected))} className="mt-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selected}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.15, ease: 'easeOut' }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {shown.map((c) => (
              <AndromedaComponentCard
                key={c.slug}
                slug={c.slug}
                name={c.name}
                description={c.description}
                variants={c.variants}
                states={c.states}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
