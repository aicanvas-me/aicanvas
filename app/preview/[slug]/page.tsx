import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { COMPONENTS } from '../../lib/component-registry'
import { BackButton } from './BackButton'

// Chrome-free full-screen previews, not destinations: no copy of their own,
// and they inherited the root canonical, which pointed every one of them at
// the homepage. They are absent from the sitemap and nothing links to them,
// so noindex is the whole fix. A self-canonical would instead invite indexing
// of a page that has no content to rank.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
}

// SERVER component (deliberately no 'use client'). COMPONENTS carries every
// entry's raw `code` string — including the closed-source premium ones — so it
// must stay on the server. As a client component this route bundled the entire
// registry (source and all) into a browser-downloadable JS chunk. The live
// <PreviewComponent /> is itself a client component and still hydrates fine;
// only the source strings now stay server-side. The back button lives in its
// own client child (BackButton) so its Phosphor icon — which calls
// React.createContext at module load — never evaluates in this server module.
export default async function FullScreenPreview({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ frame?: string; theme?: string }>
}) {
  const { slug } = await params
  // Both flags are resolved HERE, on the server, not in a client child: the
  // detail page loads this route inside an iframe, and a client-side decision
  // would let the framed view paint its back button (and the wrong theme) for
  // one frame before hydration corrected it. Same reason TemplatePreviewShell
  // resolves its own `frame` server-side.
  const { frame, theme } = await searchParams
  const entry = COMPONENTS.find((c) => c.slug === slug)
  if (!entry) notFound()

  const { PreviewComponent } = entry
  const framed = frame === '1'
  const light = theme === 'light'

  return (
    <div
      data-card-theme={light ? 'light' : 'dark'}
      className={`fixed inset-0 z-50 ${light ? 'bg-sand-100' : 'dark bg-sand-950'}`}
      // A buyer's install draws icons at the set's 1.5 default, not the site's 1.25.
      style={{ contain: 'strict', '--aic-icon-stroke': 1.5 } as CSSProperties}
    >
      <PreviewComponent />
      {/* Framed = this render IS the detail page's preview box. The box has its
          own chrome around it, so a second back button in there is dead weight
          pointing at a page the visitor is already on. */}
      {!framed && <BackButton slug={slug} />}
    </div>
  )
}
