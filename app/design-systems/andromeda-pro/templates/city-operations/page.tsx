// @ts-nocheck — consumes Andromeda tokens which are not type-checked yet.
import { CityOperations } from '../../../../lib/andromeda-pro-examples.generated'
import { tokens } from '../../../../lib/andromeda-pro.generated'
import { AndromedaThemeWrap } from '../../AndromedaThemeWrap'
import { TemplatePreviewShell } from '../../../../_components/TemplatePreviewShell'

// Distraction-free template. The Andromeda sidebar/topbar are suppressed for
// routes matching TEMPLATE_LEAF_RE (see Sidebar + IdeationTopBar) so the shell
// owns the full column. TemplatePreviewShell supplies the top bar (logo,
// System / Template breadcrumb, desktop/mobile responsive toggles, and the
// Install / Unlock-with-Premium CTA + auth), and renders the dashboard either
// full-bleed (desktop) or inside a real device-viewport iframe.
//
// Server component: `?frame=1` is resolved from searchParams HERE (request time)
// and handed to the shell as a `frame` flag, so the mobile-preview iframe's HTML
// is the bare payload from its first paint — no client useSearchParams, no
// Suspense-fallback flash of the top bar. The composition is a client component
// and renders fine as a server-passed child.

export default async function CityOperationsTemplate({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const frame = (await searchParams).frame === '1'
  return (
    <AndromedaThemeWrap className="contents" followSite>
    <TemplatePreviewShell
      frame={frame}
      templateSlug="andromeda-pro-city-operations"
      templateName="City Operations"
      systemName="Andromeda Pro"
      systemHref="/design-systems/andromeda-pro"
    >
      <div
        className="relative min-h-full w-full md:h-full md:overflow-hidden"
        style={{ backgroundColor: `var(--at-surface-base, ${tokens.color.surface.base})` }}
      >
        <CityOperations />
      </div>
    </TemplatePreviewShell>
    </AndromedaThemeWrap>
  )
}
