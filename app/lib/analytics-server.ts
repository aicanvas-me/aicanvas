/**
 * Anonymous server-to-server PostHog capture, shared by proxy.ts and /api/e.
 *
 * Privacy contract, load-bearing for the privacy policy: events are anonymous
 * ($process_person_profile: false), the default distinct_id is the constant
 * 'site' with NO visitor identifier, and the client IP never reaches PostHog
 * because every call is server-to-server. Do not weaken these three.
 */

const POSTHOG_KEY = process.env.POSTHOG_KEY
const POSTHOG_HOST = process.env.POSTHOG_HOST ?? 'https://us.i.posthog.com'

export const posthogConfigured = Boolean(POSTHOG_KEY)

// Plain and URL-encoded (%40) email shapes. Server error messages are the one
// place a real address can reach an otherwise anonymous pipeline: a throw in the
// checkout or webhook path quotes the customer it was handling. The class
// excludes `/` and `:` so a stack frame like `fn@https://host/file.js:1:2` is not
// matched end to end and replaced wholesale. SiteBeacon carries its own copy for
// the browser: this module must never be pulled into a client bundle.
const EMAIL = /[^\s@\/:]+(?:@|%40)[^\s@\/:]+\.[^\s@\/:]+/gi
// Install tokens ride in the query string of every personal /r/ URL, and an error
// quoting one would otherwise store it forever.
const TOKEN = /([?&](?:token|api[_-]?key|secret)=)[^\s&"']+/gi

export const scrubSecrets = (s: string) => s.replace(EMAIL, '[email]').replace(TOKEN, '$1[redacted]')

export async function phCapture(
  event: string,
  properties: Record<string, unknown>,
  distinctId = 'site',
): Promise<void> {
  if (!POSTHOG_KEY) return
  // Local dev must never pollute the production project: .env.local carries the
  // prod key. Vercel previews still emit, separable via the env property below.
  if (process.env.NODE_ENV !== 'production') return
  try {
    await fetch(`${POSTHOG_HOST}/i/v0/e/`, {
      method: 'POST',
      // Hard timeout: phCapture runs in latency-sensitive paths (edge proxy,
      // Paddle webhook). A dropped count is an acceptable loss.
      signal: AbortSignal.timeout(3000),
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: POSTHOG_KEY,
        event,
        distinct_id: distinctId,
        properties: {
          ...properties,
          env: process.env.VERCEL_ENV ?? 'unknown',
          $process_person_profile: false,
        },
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (err) {
    console.error('[analytics] posthog ingest failed:', err)
  }
}
