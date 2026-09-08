'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { IdeationTopBar } from '../../_components/IdeationTopBar'
import { themeColor } from '../../../design-systems/andromeda/components/lib/utils'

// Template leaf routes own the full viewport. On DESKTOP the template pins itself
// to 100vh and manages its own scroll, so the column stays `overflow-y: hidden`
// and the bento seams align. On MOBILE the template stacks past the viewport and
// its in-shell scroll cannot engage, so the COLUMN becomes the scroller
// (`min-h-0` lets the flex child shrink below content and actually scroll).
const TEMPLATE_LEAF_RE = /^\/design-systems\/[^/]+\/templates\/[^/]+/
// Every non-template route is AI Canvas chrome, so its scroll column takes the
// AI Canvas page surface, not the Andromeda void. The background must live on the
// scroll container, not a min-h-full child, or it two-tones when content
// overflows.
export function AndromedaContentColumn({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''
  const isTemplate = TEMPLATE_LEAF_RE.test(pathname)

  // aic-page-scroll on every branch: this column IS the page scroller on
  // /design-systems/andromeda/*, so it opts out of the thin `*` bar and keeps the
  // platform's native one. The thin bar stays where it belongs, on the panels,
  // tables and menus INSIDE the page.
  const className = isTemplate
    ? 'aic-page-scroll flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto md:overflow-y-hidden'
    : 'aic-page-scroll flex flex-1 scroll-smooth flex-col overflow-y-auto bg-sand-50 dark:bg-sand-950'

  // Templates paint the Andromeda void through the theme channel; every other
  // route takes the global page ground, matching the sidebar in both themes.
  const style = isTemplate
    ? { backgroundColor: themeColor.surface.base }
    : { scrollbarGutter: 'stable' }

  return (
    <div className={className} style={style}>
      <IdeationTopBar />
      {children}
    </div>
  )
}
