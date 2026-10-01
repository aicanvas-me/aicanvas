// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
// v2 component: imported through the build-time shim.
import { Tool } from '../../../lib/andromeda-pro.generated'
import { tokens } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

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

// What each status says underneath: a done step shows what it found, a
// failed one the error detail. Running and stopped steps have nothing in them.
const BODY = {
  done: 'Found 412 open deals, 37 flagged as at risk.',
  error: 'The CRM returned 429 Too Many Requests. Nothing was read.',
}

export const tool: MatrixSpec = {
  slug: 'tool',
  sizes: ['sm', 'md'],
  // Two 280px rungs side by side do not fit half a row.
  wide: true,
  // The hero centres the case: its own width is fixed, so a wide
  // cell would lay it from the left edge.
  soloCentered: true,
  statePairColumns: true,
  // A step row fills its message column, so it needs a width of its own.
  // Uncontrolled: a done or failed case opens and shuts on the page.
  render: (size, props) => {
    const { status = 'done', title = 'Read the pipeline', ...rest } = props
    const text = BODY[status]
    return (
      <div style={{ width: 280, maxWidth: '100%' }}>
        <Tool size={size ?? 'sm'} status={status} title={title} {...rest}>
          {text ? <p style={body}>{text}</p> : null}
        </Tool>
      </div>
    )
  },
  // The row is a CollapsibleTrigger, which paints hover and focus from its
  // own scoped stylesheet; Tool adds one rule that keeps a row that cannot
  // open at its resting ink. These are the at-rest twins of all three.
  forcedStateCss: `
    :where([data-andromeda-matrix]) [data-force~="hover"] .andromeda-collapsible-trigger:not(:disabled) {
      color: var(--andromeda-text-primary, ${tokens.color.text.primary}) !important;
    }

    :where([data-andromeda-matrix]) [data-force~="hover"] .andromeda-tool-trigger.andromeda-tool-trigger[aria-disabled="true"] {
      color: var(--andromeda-text-secondary, ${tokens.color.text.secondary}) !important;
    }

    :where([data-andromeda-matrix]) [data-force~="focus"] .andromeda-collapsible-trigger {
      outline: none;
      box-shadow: inset 0 0 0 var(--andromeda-border-width, ${tokens.border.width[1]}) var(--andromeda-focus-ring, ${tokens.color.focus.ring});
    }
  `,
  // The status axis. Done is shown shut and open, since opening is what a
  // done step with a body is for.
  variants: [
    { label: 'Done', props: { status: 'done', duration: 1240 } },
    { label: 'Done open', props: { status: 'done', duration: 1240, defaultOpen: true } },
    { label: 'Running', props: { status: 'running', title: 'Scoring each deal' } },
    { label: 'Stopped', props: { status: 'stopped', title: 'Drafting the summary' } },
    { label: 'Error', props: { status: 'error', title: 'Queried the CRM', defaultOpen: true } },
  ],
  // No Disabled: a step is busy or finished, never unavailable, so Tool
  // never takes Collapsible's disabled.
  states: [
    { label: 'Hover', force: 'hover' },
    { label: 'Focus visible', force: 'focus' },
  ],
  gaps: {
    'Running to done':
      'openOnDone opens the row when status turns done after mount, a transition between two renders that a still cell cannot hold',
    Spinner: 'the running glyph is a perpetual animation with no rest frame',
  },
}
