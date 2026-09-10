import { Lightning } from '@phosphor-icons/react'
import { Button } from '../../../lib/andromeda-pro.generated'
import { CONTROL_STATES, type MatrixSpec } from './types'

export const button: MatrixSpec = {
  slug: 'button',
  Component: Button,
  sizes: ['sm', 'md', 'lg'],
  children: 'Deploy',
  variants: [
    { label: 'Default', props: { variant: 'default' } },
    { label: 'Outline', props: { variant: 'outline' } },
    { label: 'Ghost', props: { variant: 'ghost' } },
    { label: 'Destructive', props: { variant: 'destructive' } },
    { label: 'Link', props: { variant: 'link' } },
    // The icon slot is orthogonal to variant, so it is its own case rather than
    // a fifth copy of the ladder.
    { label: 'With icon', props: { icon: Lightning } },
  ],
  states: [
    ...CONTROL_STATES,
    { label: 'Destructive focus', props: { variant: 'destructive' }, force: 'focus' },
    // Pressed is declared on the two variants whose active: colours actually
    // differ from their own rest colours. default and destructive carry active:
    // utilities too, but they repaint the same accent-400 / danger-400 they already
    // sit on, so a Pressed cell for them would be a copy of its baseline.
    { label: 'Pressed (outline)', props: { variant: 'outline' }, force: 'active' },
    { label: 'Pressed (ghost)', props: { variant: 'ghost' }, force: 'active' },
  ],
  gaps: {
    'Hover lift': 'the -1px rise and brightness bump are framer whileHover, JS, with no CSS rule to force',
    'Pressed scale': 'the 0.98 press scale is framer whileTap, JS; only the active: colour half is forced here',
  },
}
