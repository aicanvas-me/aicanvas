'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { IdeationTopBar } from '../../_components/IdeationTopBar'
import { tokens } from '../../lib/andromeda-v2.generated'

// Template leaf routes own the full viewport (sidebar + topbar are suppressed).
// On DESKTOP (md+) the template pins itself to 100vh and manages its own
// internal scroll, so the column stays `overflow-y: hidden` (no scrollbar
// gutter — the template fills the column edge-to-edge and the bento seams
// align). On MOBILE (below md) the template stacks into one tall column that
// exceeds the viewport; its in-shell scroll can't engage (the shell grows to
// content height), so the COLUMN becomes the scroller (`overflow-y: auto` +
// `min-h-0` so the flex child can shrink below content and actually scroll).
const TEMPLATE_LEAF_RE = /^\/design-systems\/[^/]+\/templates\/[^/]+/
// The chrome pages — the system root, Foundation, Components and Brain — are AI
// Canvas chrome (sand/olive), so their scroll column takes the AI Canvas page
// surface, not the Andromeda void. Same ground as Andromeda Legacy's pages:
// bg-sand-50 in light, sand-950 in dark. The background must live on the scroll
// container (not a min-h-full child) so it always covers the full scrollable
// height — a child can two-tone when content overflows.
//
// It also keeps the palette toggle honest on those pages: the Andromeda ground
// is the one surface a sand page must NOT borrow, or flipping the palette moves
// the ground out from under chrome that still reads the site's own theme.
const CHROME_RE = /^\/design-systems\/andromeda-pro(\/(foundation|components|brain))?\/?$/
export function AndromedaContentColumn({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''
  const isTemplate = TEMPLATE_LEAF_RE.test(pathname)
  const isChrome = CHROME_RE.test(pathname)

  // No bottom padding on template leaves: the old `pb-28` was terminal-scroll
  // clearance for the retired floating TemplateChrome widget. Templates now
  // carry a TOP bar (TemplatePreviewShell), so the reserve would just read as
  // a dead 112px band at the end of the mobile scroll.
  // aic-page-scroll on every branch: this column IS the page scroller on
  // /design-systems/andromeda-pro/*, so it opts out of the thin `*` bar and keeps
  // the platform's native one (overlay on macOS). The thin bar stays where it
  // belongs — the panels, tables and menus INSIDE the page.
  const className = isTemplate
    ? 'aic-page-scroll flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto md:overflow-y-hidden'
    : isChrome
      ? 'aic-page-scroll flex flex-1 scroll-smooth flex-col overflow-y-auto bg-sand-50 dark:bg-sand-950'
      : 'aic-page-scroll flex flex-1 scroll-smooth flex-col overflow-y-auto'

  const style = isTemplate
    ? { backgroundColor: `var(--at-surface-base, ${tokens.color.surface.base})` }
    : isChrome
      ? { scrollbarGutter: 'stable' }
      : { backgroundColor: `var(--at-surface-base, ${tokens.color.surface.base})`, scrollbarGutter: 'stable' }

  return (
    <div className={className} style={style}>
      <IdeationTopBar />
      {/* isolate: page content forms its OWN stacking context, so a component
          z-index (menus mount at zIndex 1000) can never climb over the sticky
          top bar above — the bar wins on its z-30 against this single unit.
          The wrapper is flex-transparent (flex-1 min-h-0 column) so template
          leaves keep their full-height math and normal pages keep flowing. */}
      <div className="isolate flex min-h-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  )
}
