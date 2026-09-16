/**
 * Edge proxy — three responsibilities:
 *
 * 1. /r/* registry hits → log to PostHog (anonymous, fire-and-forget)
 * 2. Page requests → log an anonymous server-side $pageview (see below)
 * 3. Everything else → refresh the Supabase auth-session cookie
 *
 * /r/* is fetched by the shadcn CLI and the AI Canvas MCP, both anonymous.
 * Running Supabase there would just waste cycles. Everything else may carry
 * a logged-in user's cookie — the Supabase session needs a refresh hop here
 * because Server Components can't write cookies themselves.
 *
 * Pageviews are logged HERE, server-side, instead of via a client SDK, on
 * purpose: no cookie, no localStorage, no visitor identifier of any kind
 * (constant distinct_id), and the client IP never reaches the analytics
 * store. We count events; we never fingerprint a visitor. This invariant
 * is load-bearing for the privacy policy — do not add a client analytics
 * SDK or a per-visitor id here.
 */

import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { updateSession } from './app/lib/supabase/proxy'
import { phCapture, posthogConfigured } from './app/lib/analytics-server'
import { FRAME_HEADER, isFramePayload } from './app/lib/frame'

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl

  // Case-sensitive redirect: /MCP → /mcp. Next's redirects() matcher is
  // case-insensitive, so it would loop on lowercase /mcp.
  if (pathname === '/MCP') {
    return NextResponse.redirect(new URL('/mcp', request.url), 308)
  }

  if (pathname.startsWith('/r/')) {
    try {
      if (posthogConfigured) {
        event.waitUntil(logRegistryHit(request))
      }
    } catch (err) {
      console.error('[proxy] logging failed:', err)
    }
    return NextResponse.next()
  }

  // Analytics beacons read no cookies and carry no session — skip the
  // Supabase refresh hop (same reasoning as /r/ above): a signed-in user
  // would otherwise cost one auth request per tracked click.
  if (pathname === '/api/e' || pathname.startsWith('/api/e/')) {
    return NextResponse.next()
  }

  try {
    if (posthogConfigured && isPageview(request)) {
      event.waitUntil(logPageview(request))
    }
  } catch (err) {
    console.error('[proxy] pageview logging failed:', err)
  }

  // Hand the preview-payload flag to the root layout (see app/lib/frame.ts).
  request.headers.delete(FRAME_HEADER)
  if (isFramePayload(request.nextUrl)) {
    request.headers.set(FRAME_HEADER, '1')
  }

  return await updateSession(request)
}

// Obvious crawlers only — a cheap substring pass, not a bot-detection
// product. Known ceiling: a scanner faking a stock browser UA slips
// through; revisit with published bot IP lists if crawler noise ever
// dominates the pageview numbers the way it did registry_hit.
const BOT_UA = /bot|crawl|spider|slurp|headless|preview|scrape|python|curl|wget/i

/**
 * A request counts as a pageview when it is a full document load: GET,
 * accept: text/html, a route-shaped path (no dot — excludes .php scanner
 * probes, .txt/.xml well-known files), not a prefetch. Client-side (SPA)
 * navigations mostly never reach the server — prefetched static routes are
 * served from the router cache — so those are counted by the SiteBeacon
 * component instead. Counting RSC fetches here would both miss cached navs
 * and double-count router.refresh() calls (every auth action fires one).
 */
function isPageview(request: NextRequest): boolean {
  if (request.method !== 'GET') return false
  const { pathname } = request.nextUrl
  if (pathname.startsWith('/api/') || pathname.includes('.')) return false
  // A framed preview is a piece of the page that embeds it, not a visit of its
  // own. Its document request is otherwise indistinguishable from a real one —
  // same method, same accept, the visitor's own user agent — so without this
  // every block detail page would count twice.
  if (isFramePayload(request.nextUrl)) return false
  const ua = request.headers.get('user-agent') ?? ''
  if (!ua || BOT_UA.test(ua)) return false
  if (
    request.headers.get('next-router-prefetch') !== null ||
    request.headers.get('purpose') === 'prefetch' ||
    (request.headers.get('sec-purpose') ?? '').includes('prefetch')
  ) {
    return false
  }
  if (request.headers.get('rsc') !== null) return false
  return (request.headers.get('accept') ?? '').includes('text/html')
}

async function logPageview(request: NextRequest): Promise<void> {
  const { pathname, origin } = request.nextUrl
  const referrer = request.headers.get('referer') ?? '$direct'
  let referringDomain = '$direct'
  try {
    if (referrer !== '$direct') referringDomain = new URL(referrer).hostname
  } catch {
    /* malformed referer header — keep $direct */
  }
  await phCapture('$pageview', {
    $current_url: origin + pathname,
    $pathname: pathname,
    // Query strings are dropped everywhere (they can carry promo codes),
    // and no user-agent is stored: the bot check above already ran, and a
    // UA string per event would contradict the pure-counting posture.
    $referrer: referrer.split('?')[0],
    $referring_domain: referringDomain,
    nav: 'load',
    country: request.headers.get('x-vercel-ip-country') ?? undefined,
    region: request.headers.get('x-vercel-ip-country-region') ?? undefined,
  })
}

async function logRegistryHit(request: NextRequest): Promise<void> {
  try {
    const { pathname } = request.nextUrl
    // /r/foo.json → "foo"; /r/aicanvas-mcp.json → "aicanvas-mcp" (the index)
    const match = pathname.match(/^\/r\/(.+?)\.json$/)
    if (!match) return

    const slug = match[1]
    const ua = request.headers.get('user-agent') ?? ''
    const client = ua.startsWith('aicanvas-mcp/')
      ? 'mcp'
      : ua.toLowerCase().includes('mozilla')
        ? 'browser'
        : 'cli'

    // distinct_id derived from UA so repeat hits from the same client
    // coalesce without identifying users.
    await phCapture(
      'registry_hit',
      {
        slug,
        client,
        user_agent: ua,
        country: request.headers.get('x-vercel-ip-country') ?? undefined,
        region: request.headers.get('x-vercel-ip-country-region') ?? undefined,
        path: pathname,
      },
      `${client}:${hashUa(ua)}`,
    )
  } catch (err) {
    console.error('[proxy] posthog ingest failed:', err)
  }
}

function hashUa(ua: string): string {
  let h = 0
  for (let i = 0; i < ua.length; i++) {
    h = (h * 31 + ua.charCodeAt(i)) | 0
  }
  return Math.abs(h).toString(36)
}

export const config = {
  // Skip Next internals + common static assets. Everything else is either
  // /r/* (PostHog branch) or runs through Supabase session refresh.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
