// The illustrated avatars a signed-in person can pick on /account. The art lives
// on ImageKit under /user-avatars (upload with scripts/upload-user-avatars.mjs),
// so adding to the set means dropping files there and raising COUNT.
//
// The choice is stored on the account in Supabase user_metadata under
// `custom_avatar`, not in a table, so it rides along in every session and
// EmailAvatar reads it server-side and client-side without a query. Google's own
// picture claim stays put, so clearing the pick falls back to the provider photo.

const BASE = 'https://ik.imagekit.io/aitoolkit/user-avatars'
const COUNT = 22

// Withdrawn from the picker. Ids are never renumbered or reused: an account
// stores the id it picked, and shifting them would hand people another face.
const RETIRED = new Set(['avatar-02'])

export const USER_AVATAR_IDS = Array.from(
  { length: COUNT },
  (_, i) => `avatar-${String(i + 1).padStart(2, '0')}`,
).filter((id) => !RETIRED.has(id))

export function isUserAvatarId(value: unknown): value is string {
  return typeof value === 'string' && USER_AVATAR_IDS.includes(value)
}

/** Art is square and 1500px; ImageKit resizes on the fly. 128 is twice the
 *  largest draw on the site, so it stays sharp on retina, and one size for every
 *  call site means the CDN caches one variant and the art downloads once. */
export function userAvatarUrl(id: string, px = 128) {
  return `${BASE}/${id}.png?tr=w-${px},h-${px}`
}
