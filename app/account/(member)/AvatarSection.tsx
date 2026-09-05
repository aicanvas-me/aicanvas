'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from '@phosphor-icons/react'
import { useSession } from '../../components/auth/SessionProvider'
import { EmailAvatar, photoFromUser } from '../../components/auth/EmailAvatar'
import { createClient } from '../../lib/supabase/client'
import { USER_AVATAR_IDS, userAvatarUrl } from '../../lib/user-avatars'

// ─── AvatarSection ────────────────────────────────────────────────────────────
// Lets a signed-in person swap the badge in the top bar for one of the
// illustrated avatars. The choice is one string on the account itself
// (user_metadata.custom_avatar), written with the user's own session, so there
// is no table, no API route and no server round trip beyond Supabase's own.
//
// The tiles are the real EmailAvatar rather than plain <img>: the picker then
// shows exactly what the top bar will show, including the tile behind art with
// transparent corners.

export function AvatarSection() {
  const { user } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  if (!user) return null
  const email = user.email ?? 'Account'
  const current = typeof user.user_metadata?.custom_avatar === 'string'
    ? (user.user_metadata.custom_avatar as string)
    : null

  // Passing the id through as null clears the pick, which falls the badge back
  // to the provider photo (or the initial) without touching Google's claim.
  async function choose(id: string | null) {
    if (saving) return
    setSaving(id ?? 'default')
    setFailed(false)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ data: { custom_avatar: id } })
    setSaving(null)
    if (error) {
      setFailed(true)
      return
    }
    // The top bar follows the session on its own (USER_UPDATED); this is for
    // the server-rendered account header one level up.
    router.refresh()
  }

  const tile = 'relative flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-olive-500/40 motion-reduce:transition-none disabled:opacity-50'
  const ring = (selected: boolean) =>
    selected ? 'ring-2 ring-olive-500 ring-offset-2 ring-offset-sand-100 dark:ring-offset-sand-900' : ''

  return (
    <section className="rounded-xl border border-sand-200 bg-sand-100 p-6 dark:border-sand-800 dark:bg-sand-900">
      <h2 className="text-lg font-bold text-sand-900 dark:text-sand-50">Avatar</h2>
      <p className="mt-2 text-sm text-sand-600 dark:text-sand-400">
        Pick one of ours, or keep the photo from your sign-in provider.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {/* The default: whatever the account already had. */}
        <button
          type="button"
          onClick={() => choose(null)}
          disabled={saving !== null}
          aria-pressed={current === null}
          aria-label="Use my sign-in photo"
          className={`${tile} ${ring(current === null)}`}
        >
          <EmailAvatar
            email={email}
            photoUrl={photoFromUser({ user_metadata: { ...user.user_metadata, custom_avatar: null } })}
            className="h-14 w-14 text-lg"
          />
          {current === null && <Selected />}
        </button>

        {USER_AVATAR_IDS.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => choose(id)}
            disabled={saving !== null}
            aria-pressed={current === id}
            aria-label={`Use avatar ${id.replace('avatar-', '')}`}
            className={`${tile} ${ring(current === id)}`}
          >
            <EmailAvatar email={email} photoUrl={userAvatarUrl(id, 128)} className="h-14 w-14" />
            {current === id && <Selected />}
          </button>
        ))}
      </div>

      {failed && (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">
          That did not save. Check your connection and try again.
        </p>
      )}
    </section>
  )
}

function Selected() {
  return (
    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-olive-500 text-sand-950">
      <Check size={12} weight="bold" />
    </span>
  )
}
