import MissionControl from '../../../../../design-systems/andromeda/examples/mission-control'
import { themeColor } from '../../../../../design-systems/andromeda/components/lib/utils'
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

export default async function MissionControlTemplate({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const frame = (await searchParams).frame === '1'
  return (
    <TemplatePreviewShell
      frame={frame}
      templateSlug="andromeda-mission-control"
      templateName="Mission Control"
      systemName="Andromeda"
      systemHref="/design-systems/andromeda"
    >
      <div
        className="relative h-full min-h-full w-full md:overflow-hidden"
        style={{ backgroundColor: themeColor.surface.base }}
      >
        <MissionControl />
      </div>
    </TemplatePreviewShell>
  )
}
