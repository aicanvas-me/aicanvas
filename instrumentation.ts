/**
 * Server-side error reporting: `onRequestError` fires whenever the Next.js
 * server captures an error, in both the Node and Edge runtimes, and relays it
 * through the same anonymous pipeline as the browser half (SiteBeacon).
 *
 * Privacy: this sends strictly less than it is handed. `request.headers`
 * (cookies, tokens, the client IP) and `request.path` (query strings carry claim
 * tokens and email addresses) are both dropped. What ships is the route's file
 * pattern, a constant of the codebase rather than anything about the person who
 * hit it. Error messages are scrubbed for addresses on the way out.
 */

import type { Instrumentation } from 'next'
import { phCapture, scrubSecrets } from './app/lib/analytics-server'

// Next awaits this hook before it writes the 500, so a slow analytics store adds
// its own latency to every failing request. phCapture's own three-second cap is
// far too long for a visitor sitting on an error page.
const REPORT_BUDGET_MS = 800

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  // `next build` runs with NODE_ENV set to production, so a prerender that throws
  // during the build would otherwise report itself as a live incident.
  if (process.env.NEXT_PHASE === 'phase-production-build') return

  const e = err as { digest?: string; message?: unknown; name?: unknown }
  const report = phCapture('server_error', {
    // Deliberately not in BEACON_EVENTS: captured server-side only, so the
    // public /api/e relay cannot forge one. Truncated before scrubbing, not
    // after: the scrub patterns backtrack badly on a long run of non-whitespace.
    message: scrubSecrets(String(e.message ?? 'unknown error').slice(0, 2000)).slice(0, 300),
    name: String(e.name ?? 'Error').slice(0, 100),
    // Next's own id for the error, the only reliable way to tie a visitor's
    // "Digest: 1234567890" screenshot back to a specific throw.
    digest: e.digest ?? '',
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    routerKind: context.routerKind,
  })

  // Awaited so the event survives a serverless instance freezing the moment the
  // response is sent; the race stops it from owning the visitor's wait.
  await Promise.race([report, new Promise((r) => setTimeout(r, REPORT_BUDGET_MS))])
}
