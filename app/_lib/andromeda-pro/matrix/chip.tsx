import { Funnel, Sparkle } from '@phosphor-icons/react'
import { Chip, tokens } from '../../../lib/andromeda-pro.generated'
import { CONTROL_STATES, type MatrixSpec } from './types'

export const chip: MatrixSpec = {
  slug: 'chip',
  Component: Chip,
  sizes: ['sm', 'md'],
  children: 'Summarize',
  // Chip paints hover and focus from its own scoped stylesheet, not from
  // Tailwind variants, so these are the at-rest twins of those two rules,
  // declaration for declaration.
  forcedStateCss: `
    :where([data-andromeda-matrix]) [data-force~="hover"] .andromeda-chip:not([aria-pressed="true"]) {
      background: var(--andromeda-surface-hover, ${tokens.color.surface.hover}) !important;
      color: var(--andromeda-text-primary, ${tokens.color.text.primary}) !important;
    }

    :where([data-andromeda-matrix]) [data-force~="focus"] .andromeda-chip {
      outline: none;
      box-shadow: inset 0 0 0 var(--andromeda-border-width, 1px) var(--andromeda-focus-ring, ${tokens.color.focus.ring});
    }
  `,
  // The two variants differ only at rest (dashed vs solid frame); chosen, both
  // turn the same way. Each is shown at rest, with its icon, and selected, so
  // the rest look sits beside the chosen one it becomes.
  variants: [
    { label: 'Suggestion', props: { variant: 'suggestion' } },
    { label: 'Suggestion with icon', props: { variant: 'suggestion', icon: Sparkle } },
    { label: 'Suggestion selected', props: { variant: 'suggestion', selected: true } },
    { label: 'Filter', props: { variant: 'filter' } },
    { label: 'Filter with icon', props: { variant: 'filter', icon: Funnel } },
    { label: 'Filter selected', props: { variant: 'filter', selected: true } },
  ],
  states: [...CONTROL_STATES],
  gaps: {
    'Hover lift': 'the -1px rise is framer whileHover, JS, with no CSS rule to force; only the fill half is forced here',
    'Pressed scale': 'the 0.98 press scale is framer whileTap, JS, with no CSS rule to force',
  },
}
