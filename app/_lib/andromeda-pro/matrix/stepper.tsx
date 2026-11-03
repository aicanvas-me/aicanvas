// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
// v2 component: imported through the build-time shim.
import { Stepper, StepperItem, StepperMeta, StepperTitle } from '../../../lib/andromeda-pro.generated'
import { type MatrixSpec } from './types'

const STEPS = [
  { title: 'Amount reserved', time: '0.2 s' },
  { title: 'Recipient verified', time: '0.4 s' },
  { title: 'Rate locked', time: '0.3 s' },
  { title: 'Funds delivered', time: '0.9 s' },
]

// The state is the whole axis: one run at its start, its middle and its end.
// Nothing in a step takes a pointer, so there are no forced states.
export const stepper: MatrixSpec = {
  slug: 'stepper',
  sizes: null,
  render: (_size, props) => (
    <div style={{ width: 320, maxWidth: '100%' }}>
      <Stepper activeStep={props.activeStep} aria-label="Transfer">
        {STEPS.map((step) => (
          <StepperItem key={step.title}>
            <StepperTitle>{step.title}</StepperTitle>
            <StepperMeta>{step.time}</StepperMeta>
          </StepperItem>
        ))}
      </Stepper>
    </div>
  ),
  variants: [
    { label: 'All pending', props: { activeStep: -1 } },
    { label: 'Mid-way', props: { activeStep: 1 } },
    { label: 'All complete', props: { activeStep: STEPS.length } },
  ],
  states: [],
  gaps: {
    'Active glyph': 'the active step runs the Spinner, perpetual motion with no rest frame, so a still cell shows an arbitrary point in its loop',
  },
}
