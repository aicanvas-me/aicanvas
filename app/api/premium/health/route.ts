import { NextResponse } from 'next/server'
import { loadContentLookup } from '@/lib/registry/lookup'
import { premiumEnabled } from '@/lib/flags'

export const runtime = 'nodejs'

// Guarded require — NOT a static import — so a fork/typecheck with no injected
// build-info still compiles. inject-premium always writes at least a null stub.
type BuildInfo = {
  sha: string | null
  pinnedSha: string | null
  appSha: string | null
  brainFileCounts?: Record<string, number>
}
let PREMIUM_BUILD: BuildInfo = { sha: null, pinnedSha: null, appSha: null }
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  PREMIUM_BUILD = (require('@/app/lib/premium-build-info.generated') as {
    PREMIUM_BUILD: BuildInfo
  }).PREMIUM_BUILD
} catch {
  /* no premium injected — free-only build */
}

// Same guard for the /icons data that scripts/icons-data.mjs writes from the vault.
let iconCount = 0
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  iconCount = (require('@/app/icons/_data/icons.generated.json') as unknown[]).length
} catch {
  /* no icon data generated */
}

/**
 * Public premium health surface: counts and mode ONLY, never source. After every
 * deploy premiumStandaloneCount should equal the manifest, `degraded` must be
 * false, and `premiumSha` must equal `pinnedSha`, proving prod serves the exact
 * premium commit recorded in premium.lock.json.
 *
 * `deployedSha` is the PUBLIC app commit this build came from, a different axis
 * from the vault pin. Without it a caller cannot tell whether the response came
 * from the deploy it just pushed: every other value stays healthy while a build
 * is still running or after one failed. It is stamped in at BUILD time by
 * inject-premium.mjs, because a runtime env read would depend on Vercel's
 * "expose System Environment Variables" setting and would go silently null.
 * Safe to expose: this repo is public, so the sha is public already.
 *
 * `brainFileCounts` is how many files each design-system brain bundled at build
 * time. The build already fails when a count differs from the manifest; this
 * shows the count prod actually carries. Numbers only, never file names.
 *
 * `iconCount` is how many icons the /icons pages list. 0 on production means the
 * icon set never reached the build and /icons is blank.
 *
 * `lifetimePriceConfigured` says the Lifetime price id is set. It is separate
 * from `degraded` on purpose: `degraded` drives the rollback, and a missing
 * price is fixed by setting the variable, not by rolling back. The webhook
 * answers 500 to a Lifetime purchase while it is missing, so Paddle keeps
 * re-delivering until it is set.
 */
export async function GET() {
  const lookup = loadContentLookup()
  const premiumStandalones = [...lookup.premiumSlugs].sort()
  const enforceActive =
    (process.env.REGISTRY_ENFORCEMENT ?? 'permissive') === 'enforce' && premiumEnabled()
  return NextResponse.json(
    {
      enforceActive,
      premiumStandaloneCount: premiumStandalones.length,
      premiumStandalones,
      degraded: lookup.degraded === true,
      premiumSha: PREMIUM_BUILD.sha,
      pinnedSha: PREMIUM_BUILD.pinnedSha,
      deployedSha: PREMIUM_BUILD.appSha,
      brainFileCounts: PREMIUM_BUILD.brainFileCounts ?? {},
      iconCount,
      lifetimePriceConfigured: Boolean(process.env.NEXT_PUBLIC_PADDLE_PRICE_LIFETIME),
    },
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
