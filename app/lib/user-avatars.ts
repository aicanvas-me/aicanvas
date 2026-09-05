// ─── User avatars ─────────────────────────────────────────────────────────────
// The illustrated avatars a signed-in person can pick in /account/settings.
// The art lives on ImageKit under /user-avatars (upload it with
// scripts/upload-user-avatars.mjs), so adding to the set is a matter of
// dropping new files in that folder and raising COUNT.
//
// The CHOICE is stored on the account itself, in Supabase user_metadata under
// `custom_avatar`, rather than in a table: no migration, the value rides along
// in every session the client already has, and EmailAvatar can read it
// server-side and client-side without a query. Google's own picture claim
// stays where it is, so clearing the pick falls back to the provider photo.

const BASE = 'https://ik.imagekit.io/aitoolkit/user-avatars'
const COUNT = 22

export const USER_AVATAR_IDS = Array.from(
  { length: COUNT },
  (_, i) => `avatar-${String(i + 1).padStart(2, '0')}`,
)

export function isUserAvatarId(value: unknown): value is string {
  return typeof value === 'string' && USER_AVATAR_IDS.includes(value)
}

/**
 * Art is square and 1500px; ImageKit resizes on the fly. Ask for twice the
 * drawn size so it stays sharp on retina, and keep the size list short so the
 * CDN caches a handful of variants instead of one per call site.
 */
export function userAvatarUrl(id: string, px: 64 | 128 | 256 = 128) {
  return `${BASE}/${id}.png?tr=w-${px},h-${px}`
}
