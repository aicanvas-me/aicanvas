// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
// v2 component: imported through the build-time shim.
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../../lib/andromeda-pro.generated'
import { Spinner } from '../../../lib/andromeda-pro.generated'
import { tokens } from '../../../lib/andromeda-pro.generated'
import { CONTROL_STATES, type MatrixSpec } from './types'

const body = {
  margin: 0,
  // Custom properties, not token paths: the section sits inside the root that
  // writes them, and a module-level token path would throw on a degraded
  // build whose fallback tokens lack it.
  fontFamily: 'var(--andromeda-font-sans)',
  fontSize: 'var(--andromeda-text-sm)',
  lineHeight: 'var(--andromeda-leading-text-sm)',
  color: `var(--andromeda-text-secondary, ${tokens.color.text.secondary})`,
}

// Uncontrolled, so every case toggles on the page: `defaultOpen` is only where
// it starts. The row fills its column, so it needs a width of its own; in the
// centred canvas it would otherwise shrink to its label.
export const collapsible: MatrixSpec = {
  slug: 'collapsible',
  sizes: ['sm', 'md'],
  // Two 260px rungs side by side do not fit half a row.
  wide: true,
  statePairColumns: true,
  render: (size, props) => {
    const { defaultOpen, disabled, guide, meta, indicator } = props
    return (
      <div style={{ width: 260, maxWidth: '100%' }}>
        <Collapsible defaultOpen={defaultOpen} disabled={disabled}>
          <CollapsibleTrigger size={size ?? 'sm'} meta={meta} indicator={indicator}>
            Searched the web
          </CollapsibleTrigger>
          <CollapsibleContent guide={guide}>
            <p style={body}>Read 3 sources on Q3 renewals and kept the two with dated figures.</p>
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  },
  // Collapsible paints hover and focus from its own scoped stylesheet, not
  // from Tailwind variants, so these are the at-rest twins of those two
  // rules, declaration for declaration.
  forcedStateCss: `
    :where([data-andromeda-matrix]) [data-force~="hover"] .andromeda-collapsible-trigger:not(:disabled) {
      color: var(--andromeda-text-primary, ${tokens.color.text.primary}) !important;
    }

    :where([data-andromeda-matrix]) [data-force~="focus"] .andromeda-collapsible-trigger {
      outline: none;
      box-shadow: inset 0 0 0 var(--andromeda-border-width, ${tokens.border.width[1]}) var(--andromeda-focus-ring, ${tokens.color.focus.ring});
    }
  `,
  // Configurations, not variants: open or shut, with or without the branch
  // rule, and what the trailing and leading slots hold.
  variants: [
    { label: 'Closed', props: {} },
    { label: 'Open', props: { defaultOpen: true } },
    { label: 'Guide', props: { defaultOpen: true, guide: true } },
    { label: 'With meta', props: { meta: '1.2 s' } },
    { label: 'Indicator override', props: { indicator: <Spinner size="sm" />, meta: 'Running' } },
  ],
  states: [...CONTROL_STATES],
  gaps: {
    'Caret turn': 'the quarter turn is framer animate keyed off open, JS, with no CSS rule to force; the Open case shows where it lands',
    'Height motion': 'the section grows through framer AnimatePresence on mount, so a still cell has no in-between frame',
  },
}
