import { Suspense, type ReactNode } from 'react'
import { JetBrains_Mono } from 'next/font/google'
import { Sidebar } from '../../components/Sidebar'
import { AndromedaContentColumn } from './AndromedaContentColumn'
// Registry-free nav counts (generated) so the client Sidebar never pulls the
// heavy registry (keeps three.js etc. out of the bundle).
import { CATEGORY_COUNTS, TOTAL_COMPONENTS } from '../../lib/component-nav.generated'

// JetBrains Mono is the only font in the Andromeda design system.
// Loading it at the layout level makes --font-jetbrains-mono available
// to every Andromeda route (overview, showcase, per-component pages),
// which the tokens reference via fontMono / fontSans.
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

// Mirrors `app/ideation/layout.tsx` so every Andromeda route gets the
// same sidebar + topbar chrome as the ideation playground. The content
// column is forced to the Andromeda void background so it doesn't
// bleed sand-950 when content is shorter than the viewport.
export default function AndromedaLayout({ children }: { children: ReactNode }) {
  return (
    <div
      // h-full + overflow-hidden means this fills the root chrome column
      // exactly and can never overflow it, so that column must not reserve a
      // scrollbar gutter it can never use. AndromedaContentColumn owns the
      // scrolling here. See .app-scroll-column in globals.css.
      data-owns-scroll
      className={`flex h-full w-full flex-1 flex-col overflow-hidden md:flex-row ${jetbrainsMono.variable}`}
    >
      {/* Desktop-only rail. Below md the embedded Sidebar (a full-height 240px
          aside) would fill the viewport and bury the page, so it's hidden and
          the global MobileNav drawer takes over on mobile. */}
      <Suspense fallback={null}>
        <div className="hidden md:flex">
          <Sidebar embedded promoteDS counts={CATEGORY_COUNTS} total={TOTAL_COMPONENTS} />
        </div>
      </Suspense>
      <AndromedaContentColumn>{children}</AndromedaContentColumn>
    </div>
  )
}
