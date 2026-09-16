// The Andromeda Pro component card — name, arrow glyph, one-line description,
// and its variant/state chips, on the site's own sand surface (never the
// Andromeda --at- channel: this chrome lives on the page ground, which follows
// the SITE toggle, not the per-preview theme).
//
// Extracted from AndromedaGallery's inline card JSX so the
// component index page and the "More Andromeda Pro components" carousel on
// each component page render the exact same card and can never drift apart.
import Link from 'next/link'
import { ArrowUpRight } from '@phosphor-icons/react'

export type AndromedaComponentCardData = {
  slug: string
  name: string
  description: string
  variants: number
  states: number
}

export function AndromedaComponentCard({
  slug,
  name,
  description,
  variants,
  states,
}: AndromedaComponentCardData) {
  return (
    <Link
      href={`/design-systems/andromeda-pro/${slug}`}
      className="group flex h-full flex-col rounded-2xl border border-sand-300 bg-sand-100 p-4 transition-colors hover:border-sand-400 dark:border-sand-800 dark:bg-sand-900 dark:hover:border-sand-600"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-bold text-sand-900 dark:text-sand-50">{name}</h3>
        <ArrowUpRight
          weight="regular"
          size={16}
          className="mt-0.5 shrink-0 text-sand-400 transition-colors group-hover:text-sand-700 dark:text-sand-500 dark:group-hover:text-sand-300"
        />
      </div>
      <p className="mt-1.5 flex-1 text-xs leading-relaxed text-sand-600 dark:text-sand-400">
        {description}
      </p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {/* One canonical look is not a count: "1 variants" reads as a
            component that lost the other two. */}
        {variants > 1 && (
          <span className="rounded-md bg-sand-200 px-2 py-1 text-xxs font-semibold text-sand-600 dark:bg-sand-800 dark:text-sand-400">
            {variants} variants
          </span>
        )}
        {states > 0 && (
          <span className="rounded-md bg-sand-200 px-2 py-1 text-xxs font-semibold text-sand-600 dark:bg-sand-800 dark:text-sand-400">
            {states} states
          </span>
        )}
      </div>
    </Link>
  )
}
