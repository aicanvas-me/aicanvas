'use client'

import { useId, useState, type ReactNode } from 'react'

/**
 * One panel at a time under a row of tabs: the MCP setup per agent, the way
 * shadcn's MCP page offers one tab per client. Every panel stays in the HTML
 * (hidden, not unmounted), so search engines and agents reading the page see
 * every setup, not only the first.
 */
export function Tabs({ tabs }: { tabs: { label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(0)
  const id = useId()
  return (
    <div className="my-6">
      <div role="tablist" className="flex flex-wrap gap-1 rounded-xl border border-sand-200 bg-sand-100 p-1 dark:border-sand-800 dark:bg-sand-900">
        {tabs.map((t, i) => (
          <button
            key={t.label}
            type="button"
            role="tab"
            id={`${id}-tab-${i}`}
            aria-selected={active === i}
            aria-controls={`${id}-panel-${i}`}
            onClick={() => setActive(i)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 ${
              active === i
                ? 'bg-sand-50 text-sand-900 shadow-sm dark:bg-sand-800 dark:text-sand-50'
                : 'text-sand-600 hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-50'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t, i) => (
        <div
          key={t.label}
          role="tabpanel"
          id={`${id}-panel-${i}`}
          aria-labelledby={`${id}-tab-${i}`}
          hidden={active !== i}
          className="pt-2"
        >
          {t.content}
        </div>
      ))}
    </div>
  )
}
