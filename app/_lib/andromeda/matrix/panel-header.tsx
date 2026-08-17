// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
import { CornersOut } from '@phosphor-icons/react'
import { PanelHeader } from '../../../lib/andromeda-v2.generated'
import { IconButton } from '../../../lib/andromeda-v2.generated'
import { CornerMarkers } from '../../../lib/andromeda-v2.generated'
import { tokens } from '../../../lib/andromeda-v2.generated'
import type { MatrixSpec } from './types'

// A block header has no intrinsic width, and its whole job is to sit on a
// framed panel — so each cell supplies the panel it heads.
const panel = (size: string | undefined, props: Record<string, unknown>) => (
  <div style={{ width: 320, maxWidth: '100%', position: 'relative', background: tokens.color.surface.raised }}>
    <CornerMarkers />
    <PanelHeader size={size} title="Requests" {...props} />
  </div>
)

export const panelHeader: MatrixSpec = {
  slug: 'panel-header',
  sizes: ['sm', 'md', 'lg'],
  // One card per row, the same shape Input and Textarea use. Two cards across
  // leaves each 320px panel about half its room, and three rungs sharing that
  // half truncate the title to "Reques…" — a width artefact reading as a
  // component behaviour.
  wide: true,
  render: panel,
  variants: [
    { label: 'Title only', props: {} },
    {
      label: 'With actions',
      // The actions control matches the header rung by name, which is the
      // pairing the component's own JSDoc prescribes.
      props: { actions: <IconButton size="md" variant="ghost" aria-label="Expand" icon={CornersOut} /> },
    },
  ],
  // The header itself is chrome; any interaction belongs to whatever control
  // sits in its actions slot, which declares its own states.
  states: [],
}
