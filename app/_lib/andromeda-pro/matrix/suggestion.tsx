import { Sparkle } from '@phosphor-icons/react'
import { Suggestion, tokens } from '../../../lib/andromeda-pro.generated'
import { CONTROL_STATES, type MatrixSpec } from './types'

export const suggestion: MatrixSpec = {
  slug: 'suggestion',
  Component: Suggestion,
  sizes: ['sm', 'md'],
  children: 'Summarize',
  // Suggestion paints hover and focus from its own scoped stylesheet, not
  // from Tailwind variants, so these are the at-rest twins of those two
  // rules, declaration for declaration.
  forcedStateCss: `
    :where([data-andromeda-matrix]) [data-force~="hover"] .andromeda-suggestion:not([aria-pressed="true"]) {
      background: var(--andromeda-surface-hover, ${tokens.color.surface.hover}) !important;
      color: var(--andromeda-text-primary, ${tokens.color.text.primary}) !important;
    }

    :where([data-andromeda-matrix]) [data-force~="focus"] .andromeda-suggestion {
      outline: none;
      box-shadow: inset 0 0 0 var(--andromeda-border-width, 1px) var(--andromeda-focus-ring, ${tokens.color.focus.ring});
    }
  `,
  // At rest the frame is dashed; taken, it turns solid with the selection
  // tint. Each look is shown so the rest state sits beside the one it becomes.
  variants: [
    { label: 'Default', props: {} },
    { label: 'With icon', props: { icon: Sparkle } },
    { label: 'Selected', props: { selected: true } },
  ],
  states: [...CONTROL_STATES],
  gaps: {
    'Hover lift': 'the -1px rise is framer whileHover, JS, with no CSS rule to force; only the fill half is forced here',
    'Pressed scale': 'the 0.98 press scale is framer whileTap, JS, with no CSS rule to force',
  },
}
