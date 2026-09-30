// Live registry-pull count for the homepage stats strip, from PostHog's
// `registry_hit` event (one per /r/*.json request).
//
// The homepage advertises PULLS SERVED, never "installs": roughly two thirds of
// the volume is crawlers indexing the registry, so calling them installs would
// overstate adoption by ~7x. The honest install number is the PostHog insight
// filtering user_agent = 'shadcn'.
//
// Requires POSTHOG_PERSONAL_API_KEY, server-only, NEVER prefixed NEXT_PUBLIC_.
// Every failure path renders FALLBACK_PULLS: the homepage must never break, hang
// or show a wrong number because an analytics API had a bad day.
//
// CACHING: unstable_cache, deliberately NOT route-level `revalidate`. The root
// layout reads cookies, which opts every page out of static rendering, so
// `export const revalidate` would be a no-op here. FAILURES ARE NEVER CACHED:
// the cached function throws and the fallback is substituted outside the cache.

import { unstable_cache } from 'next/cache'

// NOT the same host as proxy.ts: POSTHOG_HOST is the *ingest* endpoint
// (us.i.posthog.com), the query API lives on the app host (us.posthog.com).
// Reusing it here would POST the query at the ingest host and always fall back.
const POSTHOG_API_HOST = process.env.POSTHOG_API_HOST ?? 'https://us.posthog.com'
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID ?? '405886'

/** Conservative floor, shown whenever the live query is unavailable. The real
 *  count only ever increases, so this stays true even if it goes unmaintained. */
const FALLBACK_PULLS = 25_000

/** One PostHog query per day, not one per visitor. */
const REVALIDATE_SECONDS = 86_400

/** Never let a slow analytics API block a page render for long. */
const TIMEOUT_MS = 5_000

/**
 * THROWS on every failure. It must never return FALLBACK_PULLS: this is the
 * function wrapped in unstable_cache below, and a returned number is a legitimate
 * answer as far as the cache is concerned, so one transient failure would be
 * cached as a real value and served for a full day with no retry and no error
 * log. A rejected promise is not cached, so a failure costs one request and the
 * next one retries.
 */
async function fetchRegistryPulls(): Promise<number> {
  const key = process.env.POSTHOG_PERSONAL_API_KEY
  if (!key) throw new Error('POSTHOG_PERSONAL_API_KEY is not set')

  const res = await fetch(`${POSTHOG_API_HOST}/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query: "select count() from events where event = 'registry_hit'",
      },
    }),
    // No fetch-level cache options: unstable_cache below is the single caching
    // layer, so there is only one revalidate window to reason about.
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`PostHog responded ${res.status}`)

  const json = await res.json()
  const value = Number(json?.results?.[0]?.[0])

  // A malformed or partial response must never make the public number shrink.
  // Throwing keeps a bad response out of the cache, so the next request retries.
  if (!Number.isFinite(value)) throw new Error(`unexpected PostHog shape: ${JSON.stringify(json?.results)?.slice(0, 120)}`)
  if (value < FALLBACK_PULLS) throw new Error(`PostHog returned ${value}, below the ${FALLBACK_PULLS} floor`)

  return Math.floor(value)
}

/** Only ever holds a real, successful value — see the throw contract above. */
const cachedRegistryPulls = unstable_cache(
  fetchRegistryPulls,
  ['registry-pulls'],
  { revalidate: REVALIDATE_SECONDS, tags: ['registry-pulls'] },
)

/**
 * The homepage entry point. The fallback is substituted HERE, outside the cache,
 * so a bad result is never what gets stored. Tagged so a future
 * `revalidateTag('registry-pulls')` can force a refresh early.
 */
export async function getRegistryPulls(): Promise<number> {
  try {
    return await cachedRegistryPulls()
  } catch (err) {
    console.error('[registry-stats] PostHog query failed, using fallback:', err)
    return FALLBACK_PULLS
  }
}
