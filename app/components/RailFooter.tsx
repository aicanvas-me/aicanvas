import { PageFrame } from '../_components/DesignSystemPage'
import { SiteFooter } from './SiteFooter'
import { Wordmark } from './Wordmark'

// The footer of every page drawn beside the rail: the same footer and AI CANVAS
// wordmark the homepage and the pages without the rail sign off with
// (PageShell), in the catalog's own column width. It must sit inside whatever
// element scrolls the page, so a page reaches it by scrolling to its end: the
// standalone pages render it at the end of their own root, the two Andromeda
// layouts at the end of their scroller (AndromedaContentColumn).
//
// Outside any <main>, so the footer is the page's contentinfo landmark.
// Server-safe: no hooks, so a server page renders it as static HTML.
export function RailFooter() {
  return (
    <div data-rail-footer className="w-full shrink-0">
      <PageFrame className="pb-10">
        <SiteFooter />
      </PageFrame>
      <Wordmark fit="column" />
    </div>
  )
}
