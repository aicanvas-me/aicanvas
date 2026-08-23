import 'server-only'

/**
 * Minimal Brevo (marketing email) client for the newsletter.
 * Supabase newsletter_subscribers is the source of truth; Brevo's contact
 * list is a mirror we sync INTO. Suppression is double-locked: our DB status
 * plus Brevo's emailBlacklisted flag (blacklisted contacts can never receive
 * campaigns, even by mistake).
 *
 * All helpers are best-effort by design: callers must never fail a user
 * request because Brevo is down. The DB write is the truth; a missed sync is
 * repaired by the next one (or a bulk re-import).
 */

const BREVO_API = 'https://api.brevo.com/v3'

function headers() {
  const key = process.env.BREVO_API_KEY
  if (!key) return null
  return { 'api-key': key, 'content-type': 'application/json' }
}

/**
 * Upsert one contact to match our DB state.
 * subscribed=true  -> in the list, not blacklisted (receives campaigns)
 * subscribed=false -> blacklisted (suppressed forever until they re-opt-in)
 */
export async function syncBrevoContact(
  email: string,
  subscribed: boolean,
  name?: string | null,
): Promise<boolean> {
  const h = headers()
  if (!h) return false
  const listId = Number(process.env.BREVO_LIST_ID)
  // A subscribe without a valid list id would un-blacklist the contact but
  // never make it campaign-reachable — a silent half-sync. Fail loud instead.
  if (subscribed && (!Number.isInteger(listId) || listId <= 0)) {
    console.error('[brevo sync] BREVO_LIST_ID missing/invalid')
    return false
  }
  try {
    const res = await fetch(`${BREVO_API}/contacts`, {
      method: 'POST',
      headers: h,
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        email,
        updateEnabled: true,
        emailBlacklisted: !subscribed,
        ...(subscribed && listId ? { listIds: [listId] } : {}),
        ...(name ? { attributes: { FIRSTNAME: name } } : {}),
      }),
    })
    // 201 created / 204 updated are both success.
    if (!res.ok && res.status !== 204) {
      console.error('[brevo sync]', email, res.status, await res.text().catch(() => ''))
      return false
    }
    return true
  } catch (err) {
    console.error('[brevo sync]', email, err)
    return false
  }
}
