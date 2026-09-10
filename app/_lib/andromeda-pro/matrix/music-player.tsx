// v2 component: imported through the build-time shim.
import { MusicPlayer } from '../../../lib/andromeda-pro.generated'
import { tokens } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

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
  render: (_size, props) => (
    <div style={{ maxWidth: tokens.breakpoints.md }}>
      <MusicPlayer {...props} />
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
  ],
  states: [],
  gaps: {
    Scrubbing: 'the playhead follows a pointermove on the progress track; a scrubbed player is a different elapsed value, shown above, not a different painted state',
    'Volume drag': 'same mechanism as scrubbing — the Muted case above is its endpoint',
  },
}
