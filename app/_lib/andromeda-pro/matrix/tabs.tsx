// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
// v2 component: imported through the build-time shim.
import { Tabs, TabsList, TabsTrigger, tokens } from '../../../lib/andromeda-pro.generated'
import { type MatrixSpec } from './types'

const ROWS = [
  { value: 'spend', label: 'Everyday spending', text: 'One account for pay day, bills and the small things.' },
  { value: 'pay', label: 'Paying people', text: 'Friends, contractors or suppliers, checked every time.' },
  { value: 'abroad', label: 'Sending abroad', text: 'The rate and the fee before you send.' },
]

// Uncontrolled, so every case can be clicked through on the page. The list
// sets its own width: horizontal hugs its row, vertical takes a column.
export const tabs: MatrixSpec = {
  slug: 'tabs',
  sizes: ['sm', 'md', 'lg'],
  wide: true,
  render: (size, props) => {
    const { orientation = 'horizontal', leading, description } = props
    const vertical = orientation === 'vertical'
    return (
      <div style={{ width: vertical ? 420 : undefined, maxWidth: '100%' }}>
        <Tabs defaultValue="spend" orientation={orientation} size={size ?? 'md'}>
          <TabsList aria-label="Use cases">
            {ROWS.map((r, i) => (
              <TabsTrigger
                key={r.value}
                value={r.value}
                leading={leading ? String(i + 1).padStart(2, '0') : undefined}
                description={description ? r.text : undefined}
              >
                {vertical ? r.label : r.label.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    )
  },
  // Tabs paint hover and focus from their own scoped stylesheet, so these are
  // the at-rest twins of those rules, declaration for declaration.
  forcedStateCss: `
    :where([data-andromeda-matrix]) [data-force~="hover"] .andromeda-tabs-trigger {
      color: var(--andromeda-text-primary, ${tokens.color.text.primary}) !important;
    }
    :where([data-andromeda-matrix]) [data-force~="focus"] .andromeda-tabs-trigger[data-state="active"] {
      box-shadow: inset 0 0 0 1px var(--andromeda-focus-ring, ${tokens.color.focus?.ring});
    }
  `,
  variants: [
    { label: 'Horizontal', props: { orientation: 'horizontal' } },
    { label: 'Vertical', props: { orientation: 'vertical' } },
    { label: 'Vertical, index and description', props: { orientation: 'vertical', leading: true, description: true } },
  ],
  states: [
    { label: 'Hover', force: 'hover' },
    { label: 'Focus visible', force: 'focus' },
  ],
  gaps: {
    'Marker slide': 'the marker moves between tabs on a framer layoutId; click a tab to see it travel',
  },
}
