/**
 * gsc-net.ts — shared network guards for the GSC tooling scripts.
 *
 * Every googleapis call the weekly cron makes (audit `inspect`, submit
 * `publish`, keywords `query`) runs through these so a stalled request can
 * never hang an unattended run. The googleapis client accepts a per-request
 * gaxios `timeout` (which aborts the socket), but the FIRST call also lazily
 * fetches an auth token that the per-request timeout does not cover —
 * `withTimeout` wraps the whole thing as an absolute ceiling.
 */

export const REQUEST_TIMEOUT_MS = 30_000 // gaxios aborts the request itself after this
export const HARD_TIMEOUT_MS = 45_000 // absolute ceiling incl. the lazy auth-token fetch
export const MAX_ATTEMPTS = 2 // one retry — recovers a flaky transient failure

// Pass as the gaxios options arg on every googleapis call: `.method(params, GAXIOS_OPTS)`.
export const GAXIOS_OPTS = { timeout: REQUEST_TIMEOUT_MS }

// Reject if `promise` doesn't settle within `ms`. Backstop ceiling: guarantees
// the caller unblocks even if the underlying client's own timer never fires.
/** The message of anything a catch block receives, Error or not. */
export function errMessage(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms: ${label}`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

// Run `fn`, retrying up to `attempts` times on throw (a timeout counts as a throw).
export async function withRetry<T>(fn: () => Promise<T>, attempts: number, backoffMs = 500): Promise<T> {
  let lastErr: unknown
  for (let a = 1; a <= attempts; a++) {
    try {
      return await fn()
    } catch (err) {
      lastErr = err
      if (a < attempts) await new Promise((r) => setTimeout(r, backoffMs))
    }
  }
  throw lastErr
}

// Convenience: one googleapis call, wrapped in both the hard-ceiling timeout and
// the retry. `call` should invoke the API and pass GAXIOS_OPTS as its options arg.
export function guardedCall<T>(call: () => Promise<T>, label: string): Promise<T> {
  return withRetry(() => withTimeout(call(), HARD_TIMEOUT_MS, label), MAX_ATTEMPTS)
}
