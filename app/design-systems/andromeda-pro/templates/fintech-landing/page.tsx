// @ts-nocheck — consumes Andromeda tokens which are not type-checked yet.
import { FintechLanding } from '../../../../lib/andromeda-pro-examples.generated'
import { tokens } from '../../../../lib/andromeda-pro.generated'
import { AndromedaThemeWrap } from '../../AndromedaThemeWrap'
import { TemplatePreviewShell } from '../../../../_components/TemplatePreviewShell'

// Distraction-free template, same shell as every Pro template (see the AI Chat
// route for the full notes). The page scrolls inside its own root, so
// the wrapper only has to give it the full preview height.

export default async function FintechLandingTemplate({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const frame = (await searchParams).frame === '1'
  return (
    <AndromedaThemeWrap className="contents" followSite>
    <TemplatePreviewShell
      frame={frame}
      templateSlug="andromeda-pro-fintech-landing"
      templateName="Fintech Landing"
      systemName="Andromeda Pro"
      systemHref="/design-systems/andromeda-pro"
    >
      <div
        className="relative h-full w-full overflow-hidden"
        style={{ backgroundColor: `var(--at-surface-base, ${tokens.color.surface.base})` }}
      >
        <FintechLanding />
      </div>
    </TemplatePreviewShell>
    </AndromedaThemeWrap>
  )
}
