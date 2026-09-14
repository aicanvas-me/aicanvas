// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
'use client'

import { useState } from 'react'
// v2 component: imported through the build-time shim.
import { MusicPlayer } from '../../../lib/andromeda-pro.generated'
import { tokens } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

// A short queue for the page's player, led by the component's own default track
// so every case opens on the title it always has.
const DEMO_QUEUE = [
  { title: 'Signal Drift', subtitle: 'Lyra Voss', cover: null },
  { title: 'Low Orbit', subtitle: 'Kade Morrow', cover: null },
  { title: 'Carrier Wave', subtitle: 'Nell Aster', cover: null },
  { title: 'Night Relay', subtitle: 'Juno Park', cover: null },
]

// The player on this page is wired, so every transport button does what it
// shows: Previous and Next step through the queue, and stepping past either end
// wraps around, playing on with Repeat and landing paused without it. With
// Shuffle on, Next jumps to a random other track. A case's `playing`,
// `shuffle` and `repeat` are where it starts.
export function MusicPlayerDemo({ playing: startPlaying, shuffle: startShuffle, repeat: startRepeat, ...props }) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(Boolean(startPlaying))
  const [shuffle, setShuffle] = useState(Boolean(startShuffle))
  const [repeat, setRepeat] = useState(Boolean(startRepeat))
  const count = DEMO_QUEUE.length
  const step = (dir: 1 | -1) => {
    let to = (index + dir + count) % count
    let wrapped = index + dir < 0 || index + dir >= count
    if (shuffle && dir === 1) {
      do to = Math.floor(Math.random() * count); while (to === index)
      wrapped = false
    }
    setIndex(to)
    setPlaying(repeat || !wrapped)
  }
  return (
    <MusicPlayer
      {...props}
      track={DEMO_QUEUE[index]}
      playing={playing}
      shuffle={shuffle}
      repeat={repeat}
      onTogglePlay={() => setPlaying((p) => !p)}
      onNext={() => step(1)}
      onPrev={() => step(-1)}
      onShuffle={() => setShuffle((v) => !v)}
      onRepeat={() => setRepeat((v) => !v)}
    />
  )
}

// The one case that shows the player with nothing wired to its queue controls.
const UNWIRED_CASE = 'Single track'

export const musicPlayer: MatrixSpec = {
  slug: 'music-player',
  Component: MusicPlayer,
  sizes: null,
  wide: true,
  // The component page gives the player a column narrower than breakpoints.md,
  // so it renders STACKED there — meta, scrub, transport. A full-row matrix card
  // is wider than that and flipped it to the one-row bar, two surfaces showing
  // two different components. Capping the case AT the breakpoint (the container
  // query is max-width, so equal still matches) keeps them the same.
  render: (_size, props, c) => (
    <div style={{ maxWidth: tokens.breakpoints.md }}>
      {c?.label === UNWIRED_CASE ? <MusicPlayer {...props} /> : <MusicPlayerDemo {...props} />}
    </div>
  ),
  variants: [
    // No `elapsed`: passing it makes the value controlled with no `onSeek`, which
    // froze the playhead AND killed the drag. Omitted, the demo timer runs and
    // the scrub is live. The cases below stay pinned — they are painted states.
    { label: 'Playing', props: { playing: true } },
    { label: 'Paused', props: { playing: false, elapsed: 96 } },
    { label: 'Liked', props: { playing: true, elapsed: 96, liked: true } },
    { label: 'Muted', props: { playing: true, elapsed: 96, volume: 0 } },
    { label: 'At the end', props: { playing: false, elapsed: 221 } },
    { label: 'Shuffle and repeat on', props: { playing: true, elapsed: 96, shuffle: true, repeat: true } },
    // No queue handlers, so Shuffle, Previous, Next and Repeat render disabled.
    { label: UNWIRED_CASE, props: { playing: false, elapsed: 96 } },
  ],
  states: [],
  gaps: {
    Scrubbing: 'the playhead follows a pointermove on the progress track; a scrubbed player is a different elapsed value, shown above, not a different painted state',
    'Volume drag': 'same mechanism as scrubbing — the Muted case above is its endpoint',
  },
}
