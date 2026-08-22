// @ts-nocheck — consumes Andromeda tokens which are not type-checked yet.
import { SignIn } from '../../../../lib/andromeda-v2-examples.generated'
import { tokens } from '../../../../lib/andromeda-v2.generated'
import { AndromedaThemeWrap } from '../../AndromedaThemeWrap'
import { TemplatePreviewShell } from '../../../../_components/TemplatePreviewShell'

// Same shape as the other Andromeda templates: distraction-free route, shell
// owns the top bar and the device-viewport iframe, `?frame=1` resolved here at
// request time so the mobile preview's first paint is the bare payload.
//
// Unlike the committed v1 templates, this composition is VAULT-authored and
// arrives through inject-premium's `systemExamples` manifest key, so the import
// below resolves only after an inject run.

export default async function SignInTemplate({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const frame = (await searchParams).frame === '1'
  return (
    <AndromedaThemeWrap>
    <TemplatePreviewShell
      frame={frame}
      templateSlug="andromeda-sign-in"
      templateName="Sign In"
      systemName="Andromeda"
      systemHref="/design-systems/andromeda"
    >
      <div
        className="relative min-h-full w-full md:h-full md:overflow-hidden"
        style={{ backgroundColor: `var(--at-surface-base, ${tokens.color.surface.base})` }}
      >
        <SignIn />
      </div>
    </TemplatePreviewShell>
    </AndromedaThemeWrap>
  )
}
