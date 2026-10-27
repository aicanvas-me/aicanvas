'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CaretDown } from '@phosphor-icons/react'
import { DOCS_NAV, DOC_PAGES } from '../_lib/nav'

const ROW =
  'block rounded-lg px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40'
const ROW_ON = 'bg-sand-200 font-semibold text-sand-900 dark:bg-sand-800 dark:text-sand-50'
const ROW_OFF =
  'text-sand-600 hover:bg-sand-100 hover:text-sand-900 dark:text-sand-400 dark:hover:bg-sand-900 dark:hover:text-sand-50'

function Sections({ pathname }: { pathname: string }) {
  return (
    <div className="space-y-6">
      {DOCS_NAV.map((section) => (
        <div key={section.title}>
          <p className="mb-1.5 px-3 text-xs font-semibold uppercase tracking-wider text-sand-600 dark:text-sand-400">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.pages.map((p) => {
              const on = pathname === p.href
              return (
                <li key={p.href}>
                  <Link
                    href={p.href}
                    aria-current={on ? 'page' : undefined}
                    className={`${ROW} ${on ? ROW_ON : ROW_OFF}`}
                  >
                    {p.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

// The docs list on the left from lg up, sticky while the page scrolls.
export function DocsSidebar() {
  const pathname = usePathname() ?? '/docs'
  return (
    <nav aria-label="Docs" className="sticky top-6 max-h-[calc(100vh-7rem)] overflow-y-auto pb-6">
      <Sections pathname={pathname} />
    </nav>
  )
}

// Below lg the list folds into one row above the page: the current page's
// name, opening to the whole list. A native <details>, so it works before any
// script runs; the key on the current path closes it after a navigation.
export function DocsMobileNav() {
  const pathname = usePathname() ?? '/docs'
  const current = DOC_PAGES.find((p) => p.href === pathname)
  return (
    <details
      key={pathname}
      className="group mb-8 rounded-2xl border border-sand-200 bg-sand-100 lg:hidden dark:border-sand-800 dark:bg-sand-900"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-sand-900 dark:text-sand-50 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="text-sand-600 dark:text-sand-400">Docs</span>
          {current && <span> / {current.title}</span>}
        </span>
        <CaretDown
          weight="regular"
          size={14}
          className="shrink-0 text-sand-600 transition-transform group-open:rotate-180 dark:text-sand-400"
        />
      </summary>
      <nav aria-label="Docs" className="border-t border-sand-200 px-1 py-4 dark:border-sand-800">
        <Sections pathname={pathname} />
      </nav>
    </details>
  )
}
