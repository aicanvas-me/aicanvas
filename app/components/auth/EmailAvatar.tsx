// ─── EmailAvatar ─────────────────────────────────────────────────────────────
// Identity glyph for the signed-in user. When the account has a profile photo
// (Google fills one in at sign-in) it is painted on top; otherwise the badge is
// a flat olive-500 tile carrying the first letter of the address. Used in the
// top pill, the sidebar menu and the account header.
//
// The photo is a plain <img> stacked over the letter, not a CSS background: a
// picture that never arrives leaves the letter showing, with no client JS and
// no error handler — this component stays server-renderable. next/image is the
// wrong tool here (arbitrary provider hosts, 24px draws, no layout to reserve).

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
  // A circle unless the caller asks for another radius. Tested rather than
  // merged: two radius utilities on one element are settled by their order in
  // the stylesheet, not by the order they are written here, so rounded-full
  // would quietly win over anything a caller passed.
  const radius = className.split(' ').some((c) => c === 'rounded' || c.startsWith('rounded-'))
    ? ''
    : 'rounded-full'
  const initial = (email.trim()[0] ?? '?').toUpperCase()
  return (
    <span
      aria-hidden="true"
      // The olive tile belongs to the LETTER state only. Painting it behind a
      // picture too put a rim of olive around avatar art drawn as a circle on
      // transparent corners — the halo that made every avatar look ragged.
      className={`relative flex items-center justify-center overflow-hidden border border-sand-200 font-semibold leading-none dark:border-sand-800 ${
        photoUrl ? 'text-sand-700 dark:text-sand-300' : 'bg-olive-500 text-sand-950'
      } ${radius} ${className}`}
    >
      {/* Always rendered, and covered by the picture when there is one, so a
          photo that never arrives (a dead provider URL, an offline moment)
          degrades to the initial instead of an empty ring. */}
      {initial}
      {photoUrl && (
        // An arbitrary provider host drawn at 24-64px with no layout to
        // reserve: next/image buys nothing here.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          // Provider photo hosts hand back a 403 for some referrers; the avatar
          // needs no referrer to be sent at all.
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </span>
  )
}
