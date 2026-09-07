import { Suspense, type ReactNode } from 'react'
import { JetBrains_Mono } from 'next/font/google'
import { Sidebar } from '../components/Sidebar'
import { IdeationTopBar } from '../_components/IdeationTopBar'
// Registry-free nav counts (generated) so the client Sidebar never pulls the
// heavy registry (keeps three.js etc. out of the bundle).
import { CATEGORY_COUNTS, TOTAL_COMPONENTS } from '../lib/component-nav.generated'

// Make JetBrains Mono available throughout the ideation subtree so any
// Andromeda preview that references the --font-jetbrains-mono variable
// resolves correctly without each page re-declaring the font loader.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

// The /ideation subtree is the internal dev playground — keep every route
// under it out of search indexes (it mirrors shipped pages). Pairs with the
// Disallow: /ideation/ in app/robots.ts.
export const metadata = {
  robots: { index: false, follow: false },
}

export default function IdeationLayout({ children }: { children: ReactNode }) {
  return (
    <div
      // Same as the Andromeda layout: this clips itself to the root chrome
      // column, so the column's reserved gutter would be dead space. The
      // inner overflow-y-auto column below owns the scrolling.
      // Pinned dark, on purpose. This subtree is not site chrome: it paints
      // with its own palette and has no light rendering, so it opts out of the
      // site theme the same way a preview box does, with a scoped `dark` class
      // rather than by touching <html>.
      data-owns-scroll
      className={`dark flex h-full w-full flex-1 flex-col overflow-hidden bg-sand-950 md:flex-row ${jetbrainsMono.variable}`}
    >
      {/* Desktop-only rail. Below md the embedded Sidebar (a full-height 240px
          aside) would fill the viewport and bury the page, so it's hidden and
          the global MobileNav drawer takes over on mobile. */}
      <Suspense fallback={null}>
        <div className="hidden md:flex">
          <Sidebar embedded promoteDS counts={CATEGORY_COUNTS} total={TOTAL_COMPONENTS} />
        </div>
      </Suspense>
      <div className="aic-page-scroll flex flex-1 scroll-smooth flex-col overflow-y-auto bg-sand-200 dark:bg-sand-950">
        <IdeationTopBar />
        {children}
      </div>
    </div>
  )
}
