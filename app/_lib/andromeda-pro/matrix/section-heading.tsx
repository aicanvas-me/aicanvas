// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
// v2 component: imported through the build-time shim.
import { SectionHeading, Button } from '../../../lib/andromeda-pro.generated'
import { type MatrixSpec } from './types'

const COPY = {
  eyebrow: 'Plans',
  title: 'One account for every currency you hold',
  description: 'Every plan includes the multi-currency wallet and free transfers between accounts.',
}

// Each case is a full row: the split needs the width of a page column to
// show its 7:5 grid, and the centre case its own measure.
export const sectionHeading: MatrixSpec = {
  slug: 'section-heading',
  sizes: null,
  wide: true,
  render: (_size, props) => (
    <div style={{ width: '100%' }}>
      <SectionHeading {...COPY} {...props} />
    </div>
  ),
  variants: [
    { label: 'Center', props: { align: 'center' } },
    { label: 'Left', props: { align: 'left' } },
    { label: 'Split', props: { align: 'split' } },
    {
      label: 'Split with actions',
      props: { align: 'split', actions: <Button variant="outline">Compare plans</Button> },
    },
  ],
  states: [],
}
