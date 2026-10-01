import { NextRequest, NextResponse } from 'next/server'
import { getEntitlement } from '@/app/lib/entitlement'
import { classifyContent } from '@/lib/registry/content-type'
import { loadContentLookup } from '@/lib/registry/lookup'
import { premiumEnabled } from '@/lib/flags'

export const runtime = 'nodejs'

const NO_STORE = { 'Cache-Control': 'private, no-store' }

/**
 * Proactive PAYWALL check for the website's "Copy Command" action: would pulling
 * <slug> right now be refused because it is PREMIUM? Lets the UI show the paywall
 * instead of handing over a command that then 402s. Installs are no longer
 * metered, so free content is never blocked here — the signed-out "create a free
 * account" CTA is driven by the session in the UI. Read-only. Fails OPEN
 * (blocked:false) so a hiccup never blocks a copy.
 */
export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get('slug') ?? ''
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'bad slug' }, { status: 400, headers: NO_STORE })
  }

  // Premium standalones are closed-source and gate regardless of
  // REGISTRY_ENFORCEMENT (mirrors the /r registry route), so the UI must show
  // the paywall instead of handing over a CLI command that then 402s. Checked
  // BEFORE the permissive early-return. Fails OPEN on error — this is only a UX
  // hint; the registry route is the real gate. Inert until a premium slug exists.
  try {
    if (classifyContent(slug, loadContentLookup()) === 'premium-standalone') {
      const { tier } = await getEntitlement(req)
      return NextResponse.json(
        tier === 'premium'
          ? { blocked: false, tier, remaining: null }
          : { blocked: true, reason: 'premium-only', tier },
        { headers: NO_STORE },
      )
    }
  } catch (err) {
    console.error('[install-check] premium-standalone check failing open:', err)
  }

  // Premium design systems / templates stay enforce-gated. Free content
  // (standalones + DS components) is unmetered, so it is never blocked here.
  const enforcing =
    (process.env.REGISTRY_ENFORCEMENT ?? 'permissive') === 'enforce' && premiumEnabled()
  if (!enforcing) {
    return NextResponse.json({ blocked: false, enforcing: false }, { headers: NO_STORE })
  }

  try {
    const { tier } = await getEntitlement(req)
    if (tier === 'premium') {
      return NextResponse.json({ blocked: false, tier, remaining: null }, { headers: NO_STORE })
    }
    const contentType = classifyContent(slug, loadContentLookup())
    if (contentType === 'design-system' || contentType === 'template') {
      return NextResponse.json({ blocked: true, reason: 'premium-only', tier }, { headers: NO_STORE })
    }
    return NextResponse.json({ blocked: false, tier }, { headers: NO_STORE })
  } catch (err) {
    console.error('[install-check] failing open:', err)
    return NextResponse.json({ blocked: false }, { headers: NO_STORE })
  }
}
