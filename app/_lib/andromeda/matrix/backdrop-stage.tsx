// @ts-nocheck — authors JSX against untyped design-system components.
//
// The shared cell for the four backdrops. A backdrop alone in a box shows
// nothing useful: the question a reviewer is actually asking is "does a panel
// still read on top of this", so every backdrop cell is the backdrop PLUS a
// hairline panel and a label sitting on it. Shared rather than copied four
// times because it is review chrome, not system surface — the components
// themselves duplicate deliberately (see the note in GridBackdrop).
import { tokens } from '../../../lib/andromeda-v2.generated'

const label = {
  fontFamily: tokens.typography.fontMono,
  fontSize: tokens.typography.size.xs,
  color: `var(--at-text-muted, ${tokens.color.text.muted})`,
  textTransform: 'uppercase' as const,
  letterSpacing: tokens.typography.tracking.wider,
}

/** children = the backdrop; caption = the mono line that proves legibility on it. */
export function BackdropStage({ children, caption = 'Sector 07' }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 360,
        height: 220,
        overflow: 'hidden',
        background: `var(--at-surface-base, ${tokens.color.surface.base})`,
        border: `1px solid var(--at-border-subtle, ${tokens.color.border.subtle})`,
      }}
    >
      {children}
      {/* z-index above the backdrop's 0, so the stack order here is the same
          one a real page gets: backdrop at 0, content above it. */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: tokens.spacing[4],
        }}
      >
        <span style={label}>{'/// '}{caption}</span>
        <div
          style={{
            alignSelf: 'flex-end',
            background: `var(--at-surface-raised, ${tokens.color.surface.raised})`,
            border: `1px solid var(--at-border-subtle, ${tokens.color.border.subtle})`,
            padding: `${tokens.spacing[2]} ${tokens.spacing[3]}`,
          }}
        >
          <span style={{ ...label, color: `var(--at-text-faint, ${tokens.color.text.faint})` }}>Panel on backdrop</span>
        </div>
      </div>
    </div>
  )
}
