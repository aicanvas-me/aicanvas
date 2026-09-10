'use client'

// ─── AvatarPicture ───────────────────────────────────────────────────────────
// The picture half of EmailAvatar: a plain <img> plus the one bit of state
// EmailAvatar cannot hold without going client-side, whether that image failed
// to load. While the picture is fine it fills the circle alone; the moment the
// browser reports an error (dead provider URL, offline) the olive tile with the
// initial takes its place. Nothing here ever draws the letter under a picture:
// catalogue art has transparent areas inside the circle, and a letter painted
// behind it bled straight through.

import { useState } from 'react'

type Props = {
  src: string
  initial: string
}

export function AvatarPicture({ src, initial }: Props) {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <span className="absolute inset-0 flex items-center justify-center bg-olive-500 text-sand-950">
        {initial}
      </span>
    )
  }
  return (
    // An arbitrary provider host drawn at 24-64px with no layout to reserve:
    // next/image buys nothing here.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      // Provider photo hosts hand back a 403 for some referrers; the avatar
      // needs no referrer to be sent at all.
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full object-cover"
    />
  )
}
