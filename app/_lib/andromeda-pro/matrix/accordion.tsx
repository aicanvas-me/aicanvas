// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
// v2 component: imported through the build-time shim.
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, tokens } from '../../../lib/andromeda-pro.generated'
import { type MatrixSpec } from './types'

const QUESTIONS = [
  { q: 'How long does opening an account take?', a: 'About five minutes, with one photo ID.' },
  { q: 'When does a transfer arrive?', a: 'At once between accounts, the same day to a bank.' },
  { q: 'Can I cancel at any time?', a: 'Yes, and you keep your wallet and its history.' },
]

// Uncontrolled, so every case can be clicked through on the page. A forced
// state stamps only the first item: data-force is a descendant selector, and
// a stamp on the canvas would light every row at once.
export const accordion: MatrixSpec = {
  slug: 'accordion',
  sizes: null,
  wide: true,
  render: (_size, props) => {
    const { type = 'single', defaultValue, force } = props
    return (
      <div style={{ width: 440, maxWidth: '100%' }}>
        <Accordion as="ol" type={type} defaultValue={defaultValue}>
          {QUESTIONS.map((item, i) => (
            <AccordionItem key={item.q} value={String(i)} data-force={i === 0 ? force : undefined}>
              <AccordionTrigger leading={String(i + 1).padStart(2, '0')}>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    )
  },
  // The accordion lifts its index and sign from its own scoped stylesheet and
  // takes the focus ring from Collapsible's, so these are the at-rest twins of
  // those rules, declaration for declaration.
  forcedStateCss: `
    :where([data-andromeda-matrix]) [data-force~="hover"] .andromeda-accordion-trigger:not(:disabled) .andromeda-accordion-sign,
    :where([data-andromeda-matrix]) [data-force~="focus"] .andromeda-accordion-trigger .andromeda-accordion-sign {
      color: var(--andromeda-text-primary, ${tokens.color.text.primary});
    }
    :where([data-andromeda-matrix]) [data-force~="hover"] .andromeda-accordion-trigger:not(:disabled) .andromeda-accordion-leading,
    :where([data-andromeda-matrix]) [data-force~="focus"] .andromeda-accordion-trigger .andromeda-accordion-leading {
      color: var(--andromeda-text-muted, ${tokens.color.text.muted});
    }
    :where([data-andromeda-matrix]) [data-force~="focus"] .andromeda-collapsible-trigger {
      outline: none;
      box-shadow: inset 0 0 0 var(--andromeda-border-width, 1px) var(--andromeda-focus-ring, ${tokens.color.focus?.ring});
    }
  `,
  variants: [
    { label: 'Single', props: { type: 'single' } },
    { label: 'Multiple', props: { type: 'multiple', defaultValue: ['0', '2'] } },
    { label: 'Open by default', props: { type: 'single', defaultValue: '0' } },
  ],
  states: [
    { label: 'Hover', force: 'hover', forceSelf: true, props: { force: 'hover' } },
    { label: 'Focus visible', force: 'focus', forceSelf: true, props: { force: 'focus' } },
  ],
  gaps: {
    'Sign fold': 'the plus folds to a minus on a framer rotate keyed off open, JS, with no CSS rule to force; the open cases show where it lands',
    'Height motion': 'the answer grows through framer AnimatePresence on mount, so a still cell has no in-between frame',
  },
}
