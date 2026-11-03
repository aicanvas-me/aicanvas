// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
// v2 component: imported through the build-time shim.
import { BentoGrid, BentoGridItem, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../lib/andromeda-pro.generated'
import { type MatrixSpec } from './types'

const panel = (title: string, text: string, foot?: string) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <CardDescription>{text}</CardDescription>
    </CardContent>
    {foot ? (
      <CardFooter>
        <CardDescription>{foot}</CardDescription>
      </CardFooter>
    ) : null}
  </Card>
)

const LAYOUTS = {
  pairWide: (
    <BentoGrid columns={2}>
      <BentoGridItem asChild>{panel('Wallet', 'Every balance in one place.')}</BentoGridItem>
      <BentoGridItem asChild>{panel('Cards', 'A virtual card for every purpose.')}</BentoGridItem>
      <BentoGridItem asChild colSpan="full">{panel('Insights', 'Spending sorted by category, across the full row.')}</BentoGridItem>
    </BentoGrid>
  ),
  three: (
    <BentoGrid columns={3}>
      <BentoGridItem asChild>{panel('Send', 'Pay anyone in seconds.')}</BentoGridItem>
      <BentoGridItem asChild>{panel('Save', 'Set money aside in pots.')}</BentoGridItem>
      <BentoGridItem asChild>{panel('Spend', 'Cards that follow your rules.')}</BentoGridItem>
    </BentoGrid>
  ),
  // Each card's header, content and footer land on three shared rows, so the
  // footers stay level although the first description runs longer.
  aligned: (
    <BentoGrid columns={2}>
      <BentoGridItem asChild rows={3}>
        {panel('Wallet', 'Every balance in one place, in every currency you hold, updated as each payment lands.', 'Updated now')}
      </BentoGridItem>
      <BentoGridItem asChild rows={3}>
        {panel('Cards', 'A virtual card for every purpose.', '3 cards active')}
      </BentoGridItem>
    </BentoGrid>
  ),
}

// A bento needs the room of a section, so each case takes the full row.
export const bentoGrid: MatrixSpec = {
  slug: 'bento-grid',
  sizes: null,
  wide: true,
  render: (_size, props) => <div style={{ width: '100%', maxWidth: 720, margin: '0 auto' }}>{LAYOUTS[props.layout]}</div>,
  variants: [
    { label: '2 columns, full-width item', props: { layout: 'pairWide' } },
    { label: '3 columns', props: { layout: 'three' } },
    { label: 'Aligned rows', props: { layout: 'aligned' } },
  ],
  states: [],
}
