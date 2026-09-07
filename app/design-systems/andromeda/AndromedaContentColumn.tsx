'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { IdeationTopBar } from '../../_components/IdeationTopBar'
import { themeColor } from '../../../design-systems/andromeda/components/lib/utils'

// Template leaf routes own the full viewport (sidebar + topbar are suppressed).
// On DESKTOP (md+) the template pins itself to 100vh and manages its own
// internal scroll, so the column stays `overflow-y: hidden` (no scrollbar
// gutter — the template fills the column edge-to-edge and the bento seams
// align). On MOBILE (below md) the template stacks into one tall column that
// exceeds the viewport; its in-shell scroll can't engage (the shell grows to
// content height), so the COLUMN becomes the scroller (`overflow-y: auto` +
// `min-h-0` so the flex child can shrink below content and actually scroll).
const TEMPLATE_LEAF_RE = /^\/design-systems\/[^/]+\/templates\/[^/]+/
// Every non-template route is AI Canvas chrome (sand/olive), so its scroll
// column takes the AI Canvas page surface, not the Andromeda void. The
// background must live on the scroll container (not a min-h-full child) so it
// always covers the full scrollable height; a child can two-tone when content
// overflows.
export function AndromedaContentColumn({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''
  const isTemplate = TEMPLATE_LEAF_RE.test(pathname)

  // No bottom padding on template leaves: the old `pb-28` was terminal-scroll
  // clearance for the retired floating TemplateChrome widget. Templates now
  // carry a TOP bar (TemplatePreviewShell), so the reserve would just read as
  // a dead 112px band at the end of the mobile scroll.
  // aic-page-scroll on every branch: this column IS the page scroller on
  // /design-systems/andromeda/*, so it opts out of the thin `*` bar and keeps
  // the platform's native one (overlay on macOS). The thin bar stays where it
  // belongs — the panels, tables and menus INSIDE the page.
  const className = isTemplate
    ? 'aic-page-scroll flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto md:overflow-y-hidden'
    : 'aic-page-scroll flex flex-1 scroll-smooth flex-col overflow-y-auto bg-sand-50 dark:bg-sand-950'

  // Templates own the viewport and paint the Andromeda void through the theme
  // channel. Every other route is site chrome: the column takes the global
  // page ground so it matches the sidebar and the top bar in both themes.
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
