/**
 * Server-side error reporting.
 *
 * The browser half of this pipeline (SiteBeacon → /api/e) has always reported
 * uncaught client errors. The server half reported nothing at all: an exception
 * thrown inside a route handler, a server action, or a Server Component render
 * ended as a 500 for the visitor and a line in a Vercel log nobody reads. That
 * covers the checkout callback, the Paddle webhook and the subscription
 * reconcile job, so the one surface where silence costs a paying subscriber was
 * the one surface with no alarm on it.
 *
 * `onRequestError` fires whenever the Next.js server captures an error. It runs
 * in both the Node and Edge runtimes with no per-runtime split needed here,
 * because the only thing it touches is `fetch`.
 *
 * Privacy: this reuses the same anonymous relay as everything else, and sends
 * strictly less than it is handed. `request.headers` (cookies, tokens, the
 * client IP) and `request.path` (query strings carry claim tokens and email
 * addresses) are both dropped on the floor. What ships is the route's file
 * pattern, which is a constant of the codebase rather than anything about the
 * person who hit it. Error messages are scrubbed for addresses on the way out.
 */

import type { Instrumentation } from 'next'
import { phCapture, scrubSecrets } from './app/lib/analytics-server'

// Next awaits this hook before it writes the 500, so a slow analytics store
// would add its own latency to every failing request — worst exactly when
// errors are already spiking. phCapture caps itself at three seconds, which is
// the right ceiling for a background counter and far too long for a visitor
// sitting on an error page.
const REPORT_BUDGET_MS = 800

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  // `next build` runs with NODE_ENV set to production, so a prerender that
  // throws during the build would otherwise report itself as a live incident,
  // quoting build-machine absolute paths.
  if (process.env.NEXT_PHASE === 'phase-production-build') return

  const e = err as { digest?: string; message?: unknown; name?: unknown }
  const report = phCapture('server_error', {
    // Deliberately not in BEACON_EVENTS: this event is captured server-side
    // only, so the public /api/e relay cannot be used to forge one.
    //
    // Truncated before scrubbing, not after. The scrub patterns backtrack
    // badly on a long run of non-whitespace, which an error message has no
    // shape rules to prevent.
    message: scrubSecrets(String(e.message ?? 'unknown error').slice(0, 2000)).slice(0, 300),
    name: String(e.name ?? 'Error').slice(0, 100),
    // Next's own id for the error, and the only reliable way to tie a visitor's
    // "Digest: 1234567890" screenshot back to a specific throw.
    digest: e.digest ?? '',
    method: request.method,
    routePath: context.routePath,
    routeType: context.routeType,
    routerKind: context.routerKind,
  })

  // Awaited rather than left floating, as the framework asks, so the event
  // survives a serverless instance freezing the moment the response is sent.
  // The race is what stops that promise from owning the visitor's wait.
  await Promise.race([report, new Promise((r) => setTimeout(r, REPORT_BUDGET_MS))])
}
