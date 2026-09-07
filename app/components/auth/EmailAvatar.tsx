// ─── EmailAvatar ─────────────────────────────────────────────────────────────
// Identity glyph for the signed-in user. Used in the top pill, the sidebar
// menu and the account header. Three states, one at a time:
//   picture   a picked catalogue avatar or the provider (Google) photo, drawn
//             alone; the letter is never painted under it, because catalogue
//             art has transparent areas inside the circle and a letter behind
//             it showed through.
//   letter    no photo URL: a flat olive-500 tile with the first letter of the
//             address.
//   fallback  a photo URL that fails to load (dead provider URL, offline):
//             AvatarPicture swaps in the same olive tile with the letter.
//
// This module stays free of 'use client' so photoFromUser and EmailAvatar can
// be called from server components (the account layout is one). The only
// client state, "did the image fail", lives in AvatarPicture.

import { isUserAvatarId, userAvatarUrl } from '../../lib/user-avatars'
import { AvatarPicture } from './AvatarPicture'

type UserLike = { user_metadata?: Record<string, unknown> | null } | null | undefined

/**
 * The avatar the person picked in /account, if any. Stored on the
 * account (user_metadata.custom_avatar) as a catalogue id, so it beats the
 * provider photo: an explicit choice outranks whatever Google had on file.
 */
function pickedAvatarFromUser(user: UserLike): string | undefined {
  const id = user?.user_metadata?.custom_avatar
  return isUserAvatarId(id) ? userAvatarUrl(id) : undefined
}

// Google hands us a 96px photo (…=s96-c). The largest circle we draw is 64px,
// so ask for 128 — sharp on retina, and one URL for every size on the page
// means the browser downloads it once.
const PHOTO_PX = 128

/**
 * Profile photo URL an OAuth provider stored on the account, if any. Supabase
 * writes Google's picture claim into user_metadata at sign-in under both
 * `avatar_url` and `picture`; neither is present for email/password accounts.
 * Only a plain https URL is accepted: it is written straight into an <img>
 * src, and nothing else about the account has vetted it.
 */
export function photoFromUser(user: UserLike): string | undefined {
  const picked = pickedAvatarFromUser(user)
  if (picked) return picked
  const meta = user?.user_metadata
  if (!meta) return undefined
  const url = meta.avatar_url ?? meta.picture
  if (typeof url !== 'string') return undefined
  if (!/^https:\/\/[^\s'"()\\]+$/.test(url)) return undefined
  // googleusercontent takes the size as a path suffix, so replace whatever
  // suffix came with the URL. `-c` crops to a square, which the circle wants.
  if (!/^https:\/\/[a-z0-9-]+\.googleusercontent\.com\//.test(url)) return url
  return `${url.replace(/=[-\w]*$/, '')}=s${PHOTO_PX}-c`
}

type Props = {
  email: string
  photoUrl?: string
  className?: string
}

export function EmailAvatar({ email, photoUrl, className = '' }: Props) {
  const initial = (email.trim()[0] ?? '?').toUpperCase()
  return (
    <span
      aria-hidden="true"
      // The olive tile belongs to the LETTER state only. Painting it behind a
      // picture too put a rim of olive around avatar art drawn as a circle on
      // transparent corners, the halo that made every avatar look ragged.
      className={`relative flex items-center justify-center overflow-hidden border border-sand-200 font-semibold leading-none dark:border-sand-800 ${
        photoUrl ? '' : 'bg-olive-500 text-sand-950'
      } rounded-full ${className}`}
    >
      {photoUrl ? <AvatarPicture src={photoUrl} initial={initial} /> : initial}
    </span>
  )
}
