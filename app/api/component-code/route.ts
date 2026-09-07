import { NextRequest, NextResponse } from 'next/server'
import { getEntitlement } from '@/app/lib/entitlement'
import { classifyContent } from '@/lib/registry/content-type'
import { loadContentLookup } from '@/lib/registry/lookup'
import { premiumEnabled } from '@/lib/flags'
import { getComponentCode } from '@/app/lib/component-source'
import { codeToHtml } from 'shiki'

export const runtime = 'nodejs'

const NO_STORE = { 'Cache-Control': 'private, no-store' }

/**
 * On-demand source for the web Code tab. Free standalone / design-system-
 * component source is PUBLIC and uncounted — reading the code never needs an
 * account (only the one-command install does). Premium content stays gated:
 * premium-standalone is mode-independent + fails CLOSED; premium design systems
 * / templates are enforce-gated + fail CLOSED. Enforce requires the premium UI
 * flag (no upgrade path without it).
 */
export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get('slug') ?? ''
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'bad slug' }, { status: 400, headers: NO_STORE })
  }

  const code = await getComponentCode(slug)
  if (code == null) {
    return NextResponse.json({ error: 'not found' }, { status: 404, headers: NO_STORE })
  }

  let mode = process.env.REGISTRY_ENFORCEMENT ?? 'permissive'
  if (mode === 'enforce' && !premiumEnabled()) {
    console.error('[component-code gate] enforce without premium UI — falling back to permissive')
    mode = 'permissive'
  }

  const lookup = loadContentLookup()
  const contentType = classifyContent(slug, lookup)

  // ── Mode-INDEPENDENT gating for closed content (mirrors /r) ───────────────
  // Premium gating must not hang off REGISTRY_ENFORCEMENT — closed source can
  // never be handed out free in permissive mode (the prod default). Inert until
  // a premium slug exists / the manifest goes missing.
  if (lookup.degraded && contentType !== 'meta') {
    console.error('[component-code gate] degraded lookup — failing closed on', slug)
    return NextResponse.json({ error: 'temporarily-unavailable' }, { status: 503, headers: NO_STORE })
  }
  if (contentType === 'premium-standalone') {
    let tier
    try {
      tier = (await getEntitlement(req)).tier
    } catch (err) {
      console.error('[component-code gate] entitlement error on premium standalone — failing closed:', err)
      return NextResponse.json({ error: 'temporarily-unavailable' }, { status: 503, headers: NO_STORE })
    }
    if (tier !== 'premium') {
      return NextResponse.json({ error: 'premium-only' }, { status: 402, headers: NO_STORE })
    }
  }

  if (mode === 'enforce') {
    // Premium DESIGN SYSTEMS / TEMPLATES: enforce-gated (unchanged). premium-
    // standalone is handled mode-independently above.
    if (contentType === 'design-system' || contentType === 'template') {
      // Premium-only: fail CLOSED — never hand out premium bytes on error.
      let tier
      try {
        tier = (await getEntitlement(req)).tier
      } catch (err) {
        console.error('[component-code gate] entitlement error — failing closed:', err)
        return NextResponse.json({ error: 'temporarily-unavailable' }, { status: 503, headers: NO_STORE })
      }
      if (tier !== 'premium') {
        return NextResponse.json({ error: 'premium-only' }, { status: 402, headers: NO_STORE })
      }
    }
    // Free standalone / design-system-component source is public + uncounted —
    // no gate here (reading the code never requires an account).
  }

  // Highlight server-side so the gated Code tab matches the build-time look
  // (same Shiki lang/theme as HighlightedCode). Fail open to raw code on any
  // Shiki hiccup — the client falls back to a plain <pre>.
  let highlighted: string | undefined
  try {
    highlighted = await codeToHtml(code, { lang: 'tsx', themes: { light: 'github-light', dark: 'github-dark' } })
  } catch (err) {
    console.error('[component-code] highlight failed, serving raw:', err)
  }

  return NextResponse.json({ code, highlighted }, { headers: NO_STORE })
}
