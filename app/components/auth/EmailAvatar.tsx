// Identity glyph for the signed-in user. Three states: a picked catalogue avatar
// or the provider photo drawn alone (never a letter under it, catalogue art has
// transparent areas the letter showed through); a flat olive-500 tile with the
// first letter when there is no photo URL; and that same tile when a photo URL
// fails to load.
//
// No 'use client' here, so photoFromUser and EmailAvatar can be called from
// server components. The only client state, "did the image fail", lives in
// AvatarPicture.

import { isUserAvatarId, userAvatarUrl } from '../../lib/user-avatars'
import { AvatarPicture } from './AvatarPicture'

type UserLike = { user_metadata?: Record<string, unknown> | null } | null | undefined

/**
 * The avatar the person picked in /account, stored on the account as a catalogue
 * id. It beats the provider photo: an explicit choice outranks Google's.
 */
function pickedAvatarFromUser(user: UserLike): string | undefined {
  const id = user?.user_metadata?.custom_avatar
  return isUserAvatarId(id) ? userAvatarUrl(id) : undefined
}

// Google hands us a 96px photo and the largest circle we draw is 64px, so ask
// for 128: sharp on retina, and one URL for every size means one download.
const PHOTO_PX = 128

/**
 * Profile photo URL an OAuth provider stored on the account, if any. Supabase
 * writes Google's picture claim under both `avatar_url` and `picture`. Only a
 * plain https URL is accepted: it goes straight into an <img> src unvetted.
 */
export function photoFromUser(user: UserLike): string | undefined {
  const picked = pickedAvatarFromUser(user)
  if (picked) return picked
  const meta = user?.user_metadata
  if (!meta) return undefined
  const url = meta.avatar_url ?? meta.picture
  if (typeof url !== 'string') return undefined
  if (!/^https:\/\/[^\s'"()\\]+$/.test(url)) return undefined
  // googleusercontent takes the size as a path suffix, so replace whatever came
  // with the URL. `-c` crops to a square, which the circle wants.
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
      // The olive tile belongs to the LETTER state only: behind a picture it put
      // an olive rim around art drawn as a circle on transparent corners.
      className={`relative flex items-center justify-center overflow-hidden border border-sand-200 font-semibold leading-none dark:border-sand-800 ${
        photoUrl ? '' : 'bg-olive-500 text-sand-950'
      } rounded-full ${className}`}
    >
      {photoUrl ? <AvatarPicture src={photoUrl} initial={initial} /> : initial}
    </span>
  )
}
