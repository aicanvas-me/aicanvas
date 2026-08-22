// @ts-nocheck — consumes Andromeda tokens which are not type-checked yet.
import { ServiceOrder } from '../../../../lib/andromeda-v2-examples.generated'
import { tokens } from '../../../../lib/andromeda-v2.generated'
import { AndromedaThemeWrap } from '../../AndromedaThemeWrap'
import { TemplatePreviewShell } from '../../../../_components/TemplatePreviewShell'

// Distraction-free template. The Andromeda sidebar/topbar are suppressed for
// routes matching TEMPLATE_LEAF_RE (see Sidebar) so the shell owns the full
// column. TemplatePreviewShell supplies the shared top bar (logo, System /
// Template breadcrumb, desktop/mobile responsive toggles + replay, and the
// Install / Unlock-with-Premium CTA + auth), and renders the dashboard either
// full-bleed (desktop) or inside a real device-viewport iframe (mobile).
//
// Server component: `?frame=1` is resolved from searchParams HERE (request time)
// and handed to the shell as a `frame` flag, so the mobile-preview iframe's HTML
// is the bare payload from its first paint — no client useSearchParams, no
// Suspense-fallback flash of the top bar. The composition is a client component
// and renders fine as a server-passed child.

export default async function ServiceOrderTemplate({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const frame = (await searchParams).frame === '1'
  return (
    <AndromedaThemeWrap>
    <TemplatePreviewShell
      frame={frame}
      templateSlug="andromeda-service-order"
      templateName="Service Order"
      systemName="Andromeda"
      systemHref="/design-systems/andromeda"
    >
      {/* Pinned pattern, same as the other templates: the composition fills
          the preview region and scrolls INTERNALLY (its <main> is the desktop
          scroller). The Andromeda content column is md:overflow-y-hidden on
          template leaves, so page-level scrolling never engages on desktop —
          a growing wrapper here would just clip below the fold. */}
      <div
        className="relative min-h-full w-full md:h-full md:overflow-hidden"
        style={{ backgroundColor: `var(--at-surface-base, ${tokens.color.surface.base})` }}
      >
        <ServiceOrder />
      </div>
    </TemplatePreviewShell>
    </AndromedaThemeWrap>
  )
}
