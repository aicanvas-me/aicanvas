'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { beacon } from '../lib/analytics'

/**
 * Renders nothing. Two anonymous signals to /api/e:
 *
 * 1. SPA pageviews. Prefetched static routes are served from the router cache,
 *    so client-side navigations mostly never reach the server and proxy.ts
 *    cannot count them. The initial document load is counted server-side.
 * 2. Uncaught JS errors and unhandled rejections, deduped per message and capped
 *    per pageload so an error inside a render loop cannot burn the event budget.
 *    Email-shaped substrings are scrubbed before send: error messages are the
 *    one place personal data could reach an otherwise anonymous pipeline.
 */
const MAX_ERRORS_PER_LOAD = 10
// Plain and URL-encoded (%40) email shapes, applied to message AND source: a
// filename or URL in `source` can carry an address too. The class excludes `/`
// and `:` so a Firefox or Safari stack frame (`fn@https://host/file.js:1:2`) is
// not read as one enormous address and replaced wholesale.
const EMAIL = /[^\s@\/:]+(?:@|%40)[^\s@\/:]+\.[^\s@\/:]+/gi
// Install tokens ride in the query string of every personal /r/ URL, so they
// reach here inside stack frames and error messages alike.
const TOKEN = /([?&](?:token|api[_-]?key|secret)=)[^\s&"']+/gi
const scrub = (s: string) => s.replace(EMAIL, '[email]').replace(TOKEN, '$1[redacted]')

// Block previews embed a route of this same site in an iframe, so this component
// mounts a second time inside it. That copy is part of the page around it, not a
// visit: counting it would double pageviews and report every error twice.
const isFramed = () => typeof window !== 'undefined' && window.self !== window.top

// One pageload's budget, cleared on every client-side navigation by the pathname
// effect below. This component lives in the root layout, which never remounts, so
// a budget created in a mount-once effect would span the whole SPA session.
const seen = new Set<string>()

function report(message: string, source: string, thrown: unknown) {
  if (seen.size >= MAX_ERRORS_PER_LOAD || seen.has(message)) return
  seen.add(message)
  beacon('js_error', {
    message: scrub(message).slice(0, 300),
    source: scrub(source).slice(0, 200),
    // What was actually thrown, which the message alone does not say: a non-Error
    // throw reaches window.onerror as "Uncaught " plus the value, and one that
    // stringifies to nothing arrives with no clue to its origin. `kind` names the
    // type and `stack` carries the call site when a real Error was thrown.
    kind: Object.prototype.toString.call(thrown),
    stack: thrown instanceof Error && thrown.stack ? scrub(thrown.stack).slice(0, 300) : '',
  })
}

function onError(e: ErrorEvent) {
  // The column matters as much as the line: production bundles are one line, so
  // file:line alone resolves against a source map only with the column.
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

// Registered at module evaluation, not inside an effect: an effect in the root
// layout runs only after the whole tree beneath it has mounted, so a deploy that
// dies during hydration would report no js_error at all. Module scope runs ahead
// of hydration, and the listeners live for the document's lifetime, which is why
// nothing removes them.
if (typeof window !== 'undefined' && !isFramed()) {
  window.addEventListener('error', onError)
  window.addEventListener('unhandledrejection', onRejection)
}

// Browser page translation (Chrome's "Translate this page") swaps React's text
// nodes for its own. React later removes or inserts against the node it still
// holds, the DOM throws NotFoundError, and the page dies: 12 js_errors in one day
// from KR, HK, CN, JP and MY (pulse 2026-10-08), all in React's own chunk. Only
// the call that would throw is changed; every valid insert or remove runs as
// before. A skip is still reported, with the page in `source`, so the pulse keeps
// counting it and a real bug of the same shape in our code stays visible.
if (typeof window !== 'undefined' && typeof Node === 'function') {
  const skipped = (op: string) => {
    if (!isFramed()) report(`translate-guard: ${op} skipped`, location.origin + location.pathname, null)
  }
  const removeChild = Node.prototype.removeChild
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      skipped('removeChild')
      return child
    }
    return removeChild.call(this, child) as T
  }
  const insertBefore = Node.prototype.insertBefore
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) {
      skipped('insertBefore')
      return node
    }
    return insertBefore.call(this, node, ref) as T
  }
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
      // A client-side navigation is a fresh page to the visitor, so it gets a
      // fresh error budget.
      seen.clear()
    }
    prevPath.current = pathname
  }, [pathname])

  return null
}
