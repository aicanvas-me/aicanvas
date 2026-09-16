'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { IdeationTopBar } from '../../_components/IdeationTopBar'
import { tokens } from '../../lib/andromeda-pro.generated'

// Template leaf routes own the full viewport (sidebar + topbar are suppressed).
// On DESKTOP (md+) the template pins itself to 100vh and manages its own
// internal scroll, so the column stays `overflow-y: hidden` (no scrollbar
// gutter — the template fills the column edge-to-edge and the bento seams
// align). On MOBILE (below md) the template stacks into one tall column that
// exceeds the viewport; its in-shell scroll can't engage (the shell grows to
// content height), so the COLUMN becomes the scroller (`overflow-y: auto` +
// `min-h-0` so the flex child can shrink below content and actually scroll).
const TEMPLATE_LEAF_RE = /^\/design-systems\/[^/]+\/templates\/[^/]+/
export function AndromedaContentColumn({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? ''
  const isTemplate = TEMPLATE_LEAF_RE.test(pathname)

  // No bottom padding on template leaves: the old `pb-28` was terminal-scroll
  // clearance for the retired floating TemplateChrome widget. Templates now
  // carry a TOP bar (TemplatePreviewShell), so the reserve would just read as
  // a dead 112px band at the end of the mobile scroll.
  // aic-page-scroll on every branch: this column IS the page scroller on
  // /design-systems/andromeda-pro/*, so it opts out of the thin `*` bar and keeps
  // the platform's native one (overlay on macOS). The thin bar stays where it
  // belongs — the panels, tables and menus INSIDE the page.
  // EVERY page except a template leaf takes the AI Canvas page ground, the same
  // rule Andromeda Legacy and the standalone component pages follow: the site's
  // own light/dark, moved only by the global toggle in the top bar.
  //
  // Component pages used to paint the Andromeda void here instead. That put the
  // system's own surface on the PAGE, so the per-component light/dark toggle
  // inside the preview box repainted the whole page behind it — a preview
  // reaching outside its own box, which the site's theme-scope contract
  // forbids. The preview box paints --at-surface-base on itself (see
  // AndromedaComponentView), so the component still switches; only the ground
  // around it now stays put.
  //
  // Templates keep the void: a template leaf IS the system, full-bleed, with no
  // site chrome around it to disagree with.
  const className = isTemplate
    ? 'aic-page-scroll flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto md:overflow-y-hidden'
    : 'aic-page-scroll flex flex-1 scroll-smooth flex-col overflow-y-auto bg-sand-50 dark:bg-sand-950'

  const style = isTemplate
    ? { backgroundColor: `var(--at-surface-base, ${tokens.color.surface.base})` }
    : { scrollbarGutter: 'stable' as const }

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
