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
  ],
  states: [
    ...CONTROL_STATES,
    { label: 'Destructive hover', props: { variant: 'destructive' }, force: 'hover' },
    // Same reasoning as Button: pressed is declared on the variants whose
    // active: colours differ from their own rest colours.
    { label: 'Pressed (outline)', props: { variant: 'outline' }, force: 'active' },
    { label: 'Pressed (ghost)', props: { variant: 'ghost' }, force: 'active' },
  ],
  gaps: {
    'Hover lift': 'the rise and brightness bump are framer whileHover, JS, with no CSS rule to force',
    'Pressed scale': 'the press scale is framer whileTap, JS; only the active: colour half is forced here',
  },
}
