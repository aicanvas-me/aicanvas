// ─── EmailAvatar ─────────────────────────────────────────────────────────────
// Identity glyph for the signed-in user. When the account has a profile photo
// (Google fills one in at sign-in) it is painted on top; otherwise the badge is
// a flat cyan-500 tile carrying the first letter of the address. Used in the
// top pill, the sidebar menu and the account header.
//
// The photo is a CSS background layer stacked OVER that tile rather than an
// <img>, so a missing, slow or dead photo URL degrades to the letter with no
// client JS and no error handler — this component stays server-renderable.

import { isUserAvatarId, userAvatarUrl } from '../../lib/user-avatars'

type UserLike = { user_metadata?: Record<string, unknown> | null } | null | undefined

/**
 * The avatar the person picked in /account/settings, if any. Stored on the
 * account (user_metadata.custom_avatar) as a catalogue id, so it beats the
 * provider photo: an explicit choice outranks whatever Google had on file.
 */
export function pickedAvatarFromUser(user: UserLike): string | undefined {
  const id = user?.user_metadata?.custom_avatar
  return isUserAvatarId(id) ? userAvatarUrl(id, 256) : undefined
}

// Google hands us a 96px photo (…=s96-c). The largest circle we draw is 64px,
// so ask for 128 — sharp on retina, and one URL for every size on the page
// means the browser downloads it once.
const PHOTO_PX = 128

/**
 * Profile photo URL an OAuth provider stored on the account, if any. Supabase
 * writes Google's picture claim into user_metadata at sign-in under both
 * `avatar_url` and `picture`; neither is present for email/password accounts.
 * Only a plain https URL is accepted, since the value lands in a CSS url().
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
  // A circle everywhere except where the caller asks for another radius (the
  // topbar draws a rounded rectangle). Tested rather than merged: two radius
  // utilities on one element are settled by their order in the stylesheet, not
  // by the order they are written here, so rounded-full would quietly win.
  const radius = className.split(' ').some((c) => c === 'rounded' || c.startsWith('rounded-'))
    ? ''
    : 'rounded-full'
  const initial = (email.trim()[0] ?? '?').toUpperCase()
  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center overflow-hidden bg-cyan-500 bg-cover bg-center bg-no-repeat font-semibold leading-none text-sand-950 ${radius} ${className}`}
      style={photoUrl ? { backgroundImage: `url("${photoUrl}")` } : undefined}
    >
      {/* Hidden behind the photo when there is one; drawn on the cyan tile when
          there is not. Sized from the caller's text-* class so one glyph works
          from the 24px topbar badge up to the 64px account header. */}
      {photoUrl ? null : initial}
    </span>
  )
}
