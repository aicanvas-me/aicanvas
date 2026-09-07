import { track as vercelTrack } from '@vercel/analytics'

export type CardSource = 'index' | 'homepage-hero' | 'related'

type EventMap = {
  'Component Card Click': { component: string; position: number; source: CardSource }
  'Remix Open': { component: string }
  // Replaced 'Remix Platform Click' — the per-platform dropdown is gone;
  // one general prompt is copied from the Remix panel instead.
  //
  // `ok` is whether the clipboard write actually succeeded. Both of these used
  // to fire before the write was attempted, so the counts measured intent to
  // copy and were then read as proof the copy worked. The browser refuses the
  // write often enough that the difference matters, and the two are worth
  // telling apart: a copy button that silently does nothing looks, from here,
  // exactly like a copy button working perfectly.
  'Remix Prompt Copy': { component: string; ok: boolean }
  'CLI Copy': { component: string; ok: boolean }
  'Install Tab Switch': { component: string; tab: 'cli' | 'manual' }
  'Fullscreen Open': { component: string }
  'System Install Tier Click': { component: string; system: string }
  'Subscribe Click': { cycle: string }
  'Paywall Shown': { reason: string }
  'Install Gate Shown': Record<string, never>
  'Sign Up': Record<string, never>
  'Search': { query: string; results: number }
  'MCP Token Copy': { ok: boolean }
  'Manage Subscription Open': Record<string, never>
  'Checkout Step': { step: string }
}

// Runtime mirror of EventMap's keys plus the two events sent via beacon()
// directly. /api/e builds its allowlist from this, so a new EventMap entry
// only ships if it is added here too — the check below fails the build
// when the two drift apart.
export const BEACON_EVENTS = [
  'Component Card Click',
  'Remix Open',
  'Remix Prompt Copy',
  'CLI Copy',
  'Install Tab Switch',
  'Fullscreen Open',
  'System Install Tier Click',
  'Subscribe Click',
  'Paywall Shown',
  'Install Gate Shown',
  'Sign Up',
  'Search',
  'MCP Token Copy',
  'Manage Subscription Open',
  'Checkout Step',
  'js_error',
  '$pageview',
] as const
// Server-only events (Subscription Activated / Canceled, registry_hit) are
// deliberately NOT listed: they are captured server-side and must not be
// forgeable through the public /api/e relay.

type MissingFromBeaconEvents = Exclude<keyof EventMap, (typeof BEACON_EVENTS)[number]>
// Compile error here = an EventMap event is missing from BEACON_EVENTS.
const _beaconEventsComplete: MissingFromBeaconEvents extends never ? true : MissingFromBeaconEvents = true
void _beaconEventsComplete

// Dual-emit: Vercel's Events tab keeps working, PostHog gets the same event
// through the identifier-free relay.
export function track<K extends keyof EventMap>(name: K, props: EventMap[K]): void {
  vercelTrack(name, props)
  beacon(name, props)
}

/**
 * Fire-and-forget POST to our own /api/e relay, which forwards the event
 * to PostHog server-to-server (no cookie, no visitor id, client IP never
 * leaves Vercel — see app/api/e/route.ts). sendBeacon survives navigation,
 * which matters for click-then-leave events like CLI Copy.
 */
export function beacon(name: string, props: Record<string, unknown>): void {
  try {
    const payload = JSON.stringify({ event: name, props: { path: location.pathname, ...props } })
    navigator.sendBeacon('/api/e', new Blob([payload], { type: 'application/json' }))
  } catch {
    /* analytics never breaks the page */
  }
}
