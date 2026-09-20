import 'server-only'
import { after } from 'next/server'
import { createAdminClient } from '@/app/lib/supabase/admin'

// Accounts that objected to pull history (privacy policy, Art. 21 GDPR):
// comma-separated user ids in PULL_HISTORY_OPT_OUT. Their existing rows are
// deleted by hand when the objection arrives.
// An env list read per call suits a handful of objections; past that it
// belongs in a column on the account.
function optedOut(): Set<string> {
  return new Set(
    (process.env.PULL_HISTORY_OPT_OUT ?? '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean),
  )
}

/**
 * Notes which file a known account was served, after the response has gone
 * out. Nothing waits on it and nothing here may throw: a lost note must never
 * cost anyone their install. Callers pass the userId the gate already
 * resolved; an anonymous request leaves no note.
 */
export function trackPull(userId: string | null, slug: string, kind: string) {
  if (!userId || optedOut().has(userId.toLowerCase())) return
  try {
    after(async () => {
      try {
        const { error } = await createAdminClient()
          .from('pull_history')
          .insert({ user_id: userId, slug, kind })
        if (error) console.error('[pull history] insert failed:', error.message)
      } catch (err) {
        console.error('[pull history] insert failed:', err)
      }
    })
  } catch (err) {
    console.error('[pull history] could not schedule:', err)
  }
}
