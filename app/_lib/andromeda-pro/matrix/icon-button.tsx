import { Lightning } from '@phosphor-icons/react'
import { IconButton } from '../../../lib/andromeda-pro.generated'
import { CONTROL_STATES, type MatrixSpec } from './types'

export const iconButton: MatrixSpec = {
  slug: 'icon-button',
  Component: IconButton,
  sizes: ['sm', 'md', 'lg'],
  // IconButton is label-less, so aria-label IS the accessible name — it has
  // to describe the icon actually shown, not a leftover from a prior one.
  baseProps: { icon: Lightning, 'aria-label': 'Quick action' },
  variants: [
    { label: 'Default', props: { variant: 'default' } },
    { label: 'Outline', props: { variant: 'outline' } },
    { label: 'Ghost', props: { variant: 'ghost' } },
    { label: 'Destructive', props: { variant: 'destructive' } },
    // Same contract as Button: `pressed` holds the surface.active fill and
    // primary glyph on the two neutral lanes; on default and destructive it
    // only sets aria-pressed, so a cell there would copy its baseline.
    { label: 'Pressed toggle (outline)', props: { variant: 'outline', pressed: true } },
    { label: 'Pressed toggle (ghost)', props: { variant: 'ghost', pressed: true } },
  ],
  states: [
    ...CONTROL_STATES,
    { label: 'Destructive hover', props: { variant: 'destructive' }, force: 'hover' },
    // The held fill stays under the pointer while the edge climbs to
    // border.bright (on ghost, the only time it has an edge). hover:
    // utilities, forced by the gated variant in globals.css.
    { label: 'Pressed toggle hover (outline)', props: { variant: 'outline', pressed: true }, force: 'hover' },
    { label: 'Pressed toggle hover (ghost)', props: { variant: 'ghost', pressed: true }, force: 'hover' },
    // Same reasoning as Button: pressed is declared on the variants whose
    // active: colours differ from their own rest colours. These are the
    // :active moment of a click, not the `pressed` toggle above.
    { label: 'Pressed (outline)', props: { variant: 'outline' }, force: 'active' },
    { label: 'Pressed (ghost)', props: { variant: 'ghost' }, force: 'active' },
  ],
  gaps: {
    'Hover lift': 'the rise and brightness bump are framer whileHover, JS, with no CSS rule to force',
    'Pressed scale': 'the press scale is framer whileTap, JS; only the active: colour half is forced here',
  },
}
