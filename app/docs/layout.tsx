import type { ReactNode } from 'react'
import { SiteFooter } from '../components/SiteFooter'
import { DocsMobileNav, DocsSidebar } from './_components/DocsNav'

// The docs frame: the docs list on the left, the page in the middle, the
// "On this page" list on the right (DocsKit). /docs is a railless route
// (app/lib/railless.ts), so the catalog rail steps aside and the top bar
// carries the site navigation, and this list is the only one on screen.
export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-full flex-col bg-sand-50 dark:bg-sand-950">
      <main className="relative mx-auto w-full min-w-0 max-w-7xl flex-1 px-4 pt-8 pb-8 sm:px-6 sm:pt-12">
        <div className="flex gap-10">
          <div className="hidden w-56 shrink-0 lg:block">
            <DocsSidebar />
          </div>
          <div className="min-w-0 flex-1">
            <DocsMobileNav />
            {children}
          </div>
        </div>
        <SiteFooter />
      </main>
    </div>
  )
}
