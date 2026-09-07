'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { beacon } from '../lib/analytics'

/**
 * Renders nothing. Two anonymous signals to /api/e:
 *
 * 1. SPA pageviews — prefetched static routes are served from the router
 *    cache, so client-side navigations mostly never reach the server and
 *    proxy.ts cannot count them. This effect fires on every pathname
 *    change after the first (the initial document load is counted
 *    server-side).
 * 2. Uncaught JS errors and unhandled rejections — deduped per message
 *    and capped per pageload so an error inside a render loop cannot burn
 *    the event budget. Email-shaped substrings are scrubbed before send:
 *    error messages are the one place personal data could sneak into an
 *    otherwise anonymous pipeline.
 *
 * The error listeners are registered at module scope rather than in an effect,
 * and the dedupe set is cleared on navigation rather than living for the whole
 * session. Both are load-bearing; see the comments on each below.
 */
const MAX_ERRORS_PER_LOAD = 10
// Plain and URL-encoded (%40) email shapes — applied to message AND source,
// since a filename/URL in `source` can carry an address too.
//
// The class excludes `/` and `:` so that a URL cannot be mistaken for an
// address. Firefox and Safari write stack frames as `fn@https://host/file.js:1:2`,
// which a looser pattern reads as one enormous email and replaces wholesale,
// leaving a stack trace that says nothing at all. Chrome's `at fn (url)` form
// has no `@` and was never affected, which is exactly how that would have gone
// unnoticed.
const EMAIL = /[^\s@\/:]+(?:@|%40)[^\s@\/:]+\.[^\s@\/:]+/gi
// Install tokens ride in the query string of every personal /r/ URL, so they
// reach here inside both stack frames and error messages.
const TOKEN = /([?&](?:token|api[_-]?key|secret)=)[^\s&"']+/gi
const scrub = (s: string) => s.replace(EMAIL, '[email]').replace(TOKEN, '$1[redacted]')

// The block previews on a component page embed a route of this same site in an
// iframe, so this component mounts a second time inside it. That copy is part
// of the page around it, not a visit or a session of its own: its pageviews
// would double the count and its errors would be reported twice. The proxy
// drops the framed document request for the same reason.
const isFramed = () => typeof window !== 'undefined' && window.self !== window.top

// One pageload's budget, cleared on every client-side navigation by the
// pathname effect below. It used to be created inside a mount-once effect,
// which — because this component lives in the root layout and the layout never
// remounts — made one budget span the entire SPA session: after ten distinct
// messages every later error on every later page was dropped in silence, and a
// message seen on the first page was never reported again.
const seen = new Set<string>()

function report(message: string, source: string, thrown: unknown) {
  if (seen.size >= MAX_ERRORS_PER_LOAD || seen.has(message)) return
  seen.add(message)
  beacon('js_error', {
    message: scrub(message).slice(0, 300),
    source: scrub(source).slice(0, 200),
    // What was actually thrown, which the message alone does not say. A throw
    // of anything that is not an Error reaches window.onerror as the string
    // "Uncaught " followed by the value, so a value that stringifies to nothing
    // arrives as a bare "Uncaught " with no clue to its origin. `kind` names the
    // type ('[object Undefined]', '[object String]', '[object Object]') and
    // `stack` carries the call site whenever a real Error was thrown.
    kind: Object.prototype.toString.call(thrown),
    stack: thrown instanceof Error && thrown.stack ? scrub(thrown.stack).slice(0, 300) : '',
  })
}

function onError(e: ErrorEvent) {
  // The column matters as much as the line: production bundles are one line, so
  // file:line alone points at every error equally and resolves against a source
  // map only with the column.
  report(
    e.message || 'unknown error',
    `${e.filename ?? ''}:${e.lineno ?? 0}:${e.colno ?? 0}`,
    e.error,
  )
}

function onRejection(e: PromiseRejectionEvent) {
  const r: unknown = e.reason
  report(r instanceof Error ? r.message : String(r), 'unhandledrejection', r)
}

// Registered here, at module evaluation, rather than inside an effect. An effect
// in the root layout runs only after the whole tree beneath it has mounted, so
// anything that threw while the page was hydrating happened before any listener
// existed and was never reported: a deploy broken badly enough to die during
// hydration produced no js_error at all and read as a quiet day. Module scope
// runs as soon as the client bundle is evaluated, ahead of hydration. The
// listeners then live for the document's lifetime, which is why nothing removes
// them.
if (typeof window !== 'undefined' && !isFramed()) {
  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onRejection)
}

export function SiteBeacon() {
  const pathname = usePathname()
  const prevPath = useRef<string | null>(null)

  useEffect(() => {
    if (isFramed()) return
    if (prevPath.current !== null && prevPath.current !== pathname) {
      beacon('$pageview', {
        $current_url: location.origin + pathname,
        $pathname: pathname,
        $referrer: prevPath.current,
        nav: 'spa',
      })
      // A client-side navigation is a fresh page as far as the visitor is
      // concerned, so it gets a fresh error budget.
      seen.clear()
    }
    prevPath.current = pathname
  }, [pathname])

  return null
}
