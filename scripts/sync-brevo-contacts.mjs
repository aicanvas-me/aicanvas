/**
 * One-way sync: Supabase newsletter_subscribers -> Brevo contacts.
 * The DB is the source of truth; run this any time to make Brevo match it.
 *
 *   subscribed / soft -> in the "AI Canvas updates" list, mailable unless
 *                        Brevo already has them blacklisted
 *   unsubscribed      -> imported BLACKLISTED so Brevo can never mail them,
 *                        even if someone adds them to a list by hand
 *
 * Suppression only ever grows here: the sync never clears a blacklist. An
 * opt-out that reached Brevo before the DB (a campaign unsubscribe the
 * webhook missed) would otherwise be undone by the next run. The settings
 * toggle (app/lib/brevo.ts) is the only path that un-blacklists, because it
 * runs on the person's own click.
 *
 * Reads .env.local (BREVO_API_KEY, BREVO_LIST_ID, NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SECRET_KEY). Prints counts only, never addresses.
 *
 * Usage: node scripts/sync-brevo-contacts.mjs
 */
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2]
}

const { NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, BREVO_API_KEY, BREVO_LIST_ID } = process.env
if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SECRET_KEY || !BREVO_API_KEY || !BREVO_LIST_ID) {
  console.error('missing env vars'); process.exit(1)
}

const db = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false } })

// PostgREST caps a single select at 1000 rows (db.max_rows) and truncates
// SILENTLY — page explicitly and assert against an exact count so a growing
// table can never quietly leave the tail (including unsubscribes) unsynced.
const { count, error: countError } = await db
  .from('newsletter_subscribers')
  .select('*', { count: 'exact', head: true })
if (countError) { console.error('supabase count:', countError.message); process.exit(1) }

const data = []
const PAGE = 1000
for (let from = 0; ; from += PAGE) {
  const { data: page, error } = await db
    .from('newsletter_subscribers')
    .select('email, name, status')
    .order('email')
    .range(from, from + PAGE - 1)
  if (error) { console.error('supabase:', error.message); process.exit(1) }
  data.push(...page)
  if (page.length < PAGE) break
}
if (data.length !== count) {
  console.error(`row mismatch: fetched ${data.length}, table has ${count} — aborting`)
  process.exit(1)
}

const mailable = data.filter(r => r.status !== 'unsubscribed')
const suppressed = data.filter(r => r.status === 'unsubscribed')

// Mailable contacts: Brevo's bulk import endpoint (async server-side job).
async function importMailable(rows) {
  if (!rows.length) return
  const res = await fetch('https://api.brevo.com/v3/contacts/import', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonBody: rows.map(r => ({
        email: r.email,
        ...(r.name ? { attributes: { FIRSTNAME: r.name } } : {}),
      })),
      listIds: [Number(BREVO_LIST_ID)],
      updateExistingContacts: true,
    }),
  })
  if (!res.ok) { console.error('brevo import:', res.status, await res.text()); process.exit(1) }
  const { processId } = await res.json()
  console.log(`mailable: ${rows.length} queued (process ${processId})`)
}

// Suppressed: per-contact upsert with emailBlacklisted, kept OUT of the list.
// (Bulk import requires listIds; blacklist is global so no list is needed.)
async function suppressContact(r) {
  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json' },
    body: JSON.stringify({ email: r.email, updateEnabled: true, emailBlacklisted: true }),
  })
  if (!res.ok && res.status !== 204) {
    console.error('brevo suppress:', res.status, await res.text()); process.exit(1)
  }
}

// Deleted accounts: delete_my_account() removes the DB row (migration 0017),
// but nothing removes the contact from Brevo list 3 — the import above only
// adds/updates. Reconcile: any list member whose email no longer exists in
// the DB is pulled off the list, so a deleted account can never be mailed.
// This script runs before every send, so it also heals past deletions.
async function removeStrayListMembers() {
  const dbEmails = new Set(data.map(r => r.email.toLowerCase()))
  const stray = []
  for (let offset = 0; ; offset += 500) {
    const res = await fetch(
      `https://api.brevo.com/v3/contacts/lists/${BREVO_LIST_ID}/contacts?limit=500&offset=${offset}`,
      { headers: { 'api-key': BREVO_API_KEY } },
    )
    if (!res.ok) { console.error('brevo list read:', res.status, await res.text()); process.exit(1) }
    const { contacts } = await res.json()
    stray.push(...contacts.map(c => c.email).filter(e => !dbEmails.has(e.toLowerCase())))
    if (contacts.length < 500) break
  }
  for (let i = 0; i < stray.length; i += 100) {
    const res = await fetch(
      `https://api.brevo.com/v3/contacts/lists/${BREVO_LIST_ID}/contacts/remove`,
      {
        method: 'POST',
        headers: { 'api-key': BREVO_API_KEY, 'content-type': 'application/json' },
        body: JSON.stringify({ emails: stray.slice(i, i + 100) }),
      },
    )
    if (!res.ok) { console.error('brevo list remove:', res.status, await res.text()); process.exit(1) }
  }
  if (stray.length) console.log(`removed ${stray.length} deleted-account contact(s) from list ${BREVO_LIST_ID}`)
}

await importMailable(mailable)
await removeStrayListMembers()
for (const r of suppressed) await suppressContact(r)
console.log(`done: ${mailable.length} mailable, ${suppressed.length} suppressed, ${data.length} total`)
