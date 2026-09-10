'use client'

import Link from 'next/link'

export type Crumb = {
  label: string
  // Present → clickable link. Absent → plain context (e.g. "Design Systems",
  // which has no dedicated page). The LAST crumb is always the current page and
  // renders as active (olive, non-clickable) regardless of href.
  href?: string
}

// ─── Breadcrumbs ────────────────────────────────────────────────────────────
// The site-wide top-bar breadcrumb. Left-aligned, `/`-separated, so a visitor
// can always see where they are and click straight up the tree. Used by the
// components list/category header, the component detail page, and the design-
// system headers — one consistent trail everywhere (Lab / MCP / Pricing / etc.
// keep their own chrome).
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center text-sm font-semibold">
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={`${c.label}-${i}`} className="flex min-w-0 items-center">
            {i > 0 && (
              <span aria-hidden className="mx-1 shrink-0 text-sand-600 dark:text-sand-600">
                /
              </span>
            )}
            {isLast ? (
              <span aria-current="page" className="truncate text-olive-600 dark:text-olive-500">
                {c.label}
              </span>
            ) : c.href ? (
              <Link
                href={c.href}
                className="shrink-0 text-sand-600 transition-colors hover:text-sand-900 dark:text-sand-400 dark:hover:text-sand-100"
              >
                {c.label}
              </Link>
            ) : (
              <span className="shrink-0 text-sand-600 dark:text-sand-400">{c.label}</span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
