/**
 * Edge proxy — four responsibilities:
 *
 * 1. /r/* registry hits → log to PostHog (anonymous, fire-and-forget)
 * 2. Agent reads of llms.txt and the markdown twins → log `agent_doc_hit`
 *    (anonymous), and skip the session refresh like /r/*
 * 3. Page requests → log an anonymous server-side $pageview (see below)
 * 4. Everything else → refresh the Supabase auth-session cookie
 *
 * /r/* is fetched by the shadcn CLI and the AI Canvas MCP, both anonymous.
 * Running Supabase there would just waste cycles. Everything else may carry
 * a logged-in user's cookie — the Supabase session needs a refresh hop here
 * because Server Components can't write cookies themselves.
 *
 * Pageviews are logged HERE, server-side, instead of via a client SDK, on
 * purpose: no cookie, no localStorage, no visitor identifier of any kind
 * (constant distinct_id for page views; agent reads share one id per tool
 * family, never per visitor), and the client IP never reaches the analytics
 * store. We count events; we never fingerprint a visitor. This invariant
 * is load-bearing for the privacy policy — do not add a client analytics
 * SDK or a per-visitor id here.
 */

import { NextResponse } from 'next/server'
import type { NextFetchEvent, NextRequest } from 'next/server'
import { updateSession } from './app/lib/supabase/proxy'
import { phCapture, posthogConfigured } from './app/lib/analytics-server'
import { FRAME_HEADER, isFramePayload } from './app/lib/frame'
import { ACCOUNT_PATH_HEADER } from './app/lib/account-path'
import { agentFamilyOf, aiSourceOf, isAgentDocRequest } from './app/lib/ai-traffic'

const MCP_OAUTH_PATHS = new Set(['/authorize', '/token', '/register', '/revoke'])

export async function proxy(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl

  // mcp.aicanvas.me is the hosted MCP, its sign-in endpoints and their discovery
  // documents, nothing else. A page someone opens there goes to the site; anything else
  // (a POST that missed) is a 404, never replayed across hosts.
  if (request.nextUrl.hostname === 'mcp.aicanvas.me') {
    if (pathname === '/') return NextResponse.rewrite(new URL('/api/mcp', request.url))
    if (MCP_OAUTH_PATHS.has(pathname)) return NextResponse.rewrite(new URL(`/api/mcp/oauth${pathname}${request.nextUrl.search}`, request.url))
    if (pathname.startsWith('/api/mcp') || pathname.startsWith('/.well-known/')) return NextResponse.next()
    if (request.method !== 'GET' && request.method !== 'HEAD') return new NextResponse(null, { status: 404 })
    return NextResponse.redirect(new URL(`${pathname}${request.nextUrl.search}`, 'https://aicanvas.me'), 307)
  }

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

  // The hosted MCP authenticates every request by its own header and never
  // reads a cookie, so it skips the Supabase refresh hop too.
  if (pathname.startsWith('/api/mcp') || pathname.startsWith('/.well-known/')) {
    return NextResponse.next()
  }

  // An agent reading llms.txt or a markdown twin is its own event, never a
  // page view: Claude Code asks for text/markdown AND text/html, so it would
  // otherwise pass as a person loading the page.
  const agentDoc = isAgentDocRequest(pathname, request.headers.get('accept') ?? '')

  try {
    if (posthogConfigured) {
      if (agentDoc) {
        if (request.method === 'GET') event.waitUntil(logAgentDocHit(request))
      } else if (isPageview(request)) {
        event.waitUntil(logPageview(request))
      }
    }
  } catch (err) {
    console.error('[proxy] pageview logging failed:', err)
  }

  // The machine-readable pages are public and shared-cached, and they read no
  // session: skip the Supabase refresh (same as /r/ above), so a signed-in
  // browser opening one never gets a Set-Cookie on a publicly cached response.
  // The frame flag is still stripped: it may only ever be set by this proxy.
  if (agentDoc) {
    const headers = new Headers(request.headers)
    headers.delete(FRAME_HEADER)
    return NextResponse.next({ request: { headers } })
  }

  // Hand the preview-payload flag to the root layout (see app/lib/frame.ts).
  request.headers.delete(FRAME_HEADER)
  if (isFramePayload(request.nextUrl)) {
    request.headers.set(FRAME_HEADER, '1')
  }
  request.headers.delete(ACCOUNT_PATH_HEADER)
  if (pathname.startsWith('/account/')) request.headers.set(ACCOUNT_PATH_HEADER, pathname)

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
    // One allowlisted tag survives: links the MCP hands an agent carry ?ref=mcp, so the
    // pricing visits it drives can be counted. A fixed value, never the query itself.
    ...(request.nextUrl.searchParams.get('ref') === 'mcp' ? { source: 'mcp' } : {}),
    // The AI assistant that sent the visit, as a fixed name (app/lib/ai-traffic.ts).
    // utm_source is read only to match that list; the query is never stored.
    ...withAiSource(aiSourceOf(referringDomain, request.nextUrl.searchParams.get('utm_source'))),
    country: request.headers.get('x-vercel-ip-country') ?? undefined,
    region: request.headers.get('x-vercel-ip-country-region') ?? undefined,
  })
}

function withAiSource(source: string | undefined): { ai_source?: string } {
  return source ? { ai_source: source } : {}
}

// One shared bucket per tool family: no per-client id, no user-agent string.
async function logAgentDocHit(request: NextRequest): Promise<void> {
  const { pathname } = request.nextUrl
  const agent = agentFamilyOf(request.headers.get('user-agent') ?? '')
  await phCapture(
    'agent_doc_hit',
    {
      path: pathname,
      // 'file' = an llms file, a .md URL or the internal /md/ route; 'accept' = a page URL asked for in markdown.
      via: pathname.endsWith('.md') || pathname.endsWith('.txt') || pathname.startsWith('/md/') ? 'file' : 'accept',
      agent,
      country: request.headers.get('x-vercel-ip-country') ?? undefined,
      region: request.headers.get('x-vercel-ip-country-region') ?? undefined,
    },
    `agent:${agent}`,
  )
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
