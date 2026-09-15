// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from '../../../lib/andromeda-pro.generated'
import { Badge } from '../../../lib/andromeda-pro.generated'
import { Button } from '../../../lib/andromeda-pro.generated'
import type { MatrixSpec } from './types'

const body = (title: string, description: string, badge: string, badgeVariant: string) => (
  <>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {/* md, not the sm defaults. A card has no size axis of its own, so the
          demo's scale is set entirely by what sits inside it, and at sm the
          whole thing read as a thumbnail nobody bothers to read. */}
      <Badge variant={badgeVariant} size="md">{badge}</Badge>
    </CardHeader>
    <CardContent>
      <CardDescription>{description}</CardDescription>
    </CardContent>
    <CardFooter>
      <Button size="md" variant="outline">
        Configure
      </Button>
    </CardFooter>
  </>
)

export const card: MatrixSpec = {
  slug: 'card',
  Component: Card,
  sizes: null,
  wide: true,
  // wide gives the demo the full row (one card per line instead of two
  // squeezed side by side), but the Card itself has no width class of its
  // own, so a block box with no constraint fills 100% of that row — a card
  // stretched edge to edge instead of reading as a card. Cap it and centre
  // it inside the room `wide` granted.
  baseProps: { style: { maxWidth: 480, margin: '0 auto' } },
  variants: [
    {
      label: 'Default',
      props: {},
      children: body('Default card', 'Corner brackets are the frame — no perimeter stroke.', 'Idle', 'default'),
    },
    {
      label: 'Glow',
      props: { variant: 'glow' },
      children: body('Highlight card', 'Tinted accent gradient surface with corner markers.', 'Live', 'accent'),
    },
    {
      // bordered and markers are independent booleans, not members of the cva
      // variant axis, so they are their own cases rather than variant values.
      label: 'Bordered',
      props: { bordered: true },
      children: body('Bordered card', 'A continuous 1px border instead of the bracket frame.', 'Idle', 'default'),
    },
    {
      label: 'No markers',
      props: { markers: false },
      children: body('Unframed card', 'Markers off — for a card nested inside another frame.', 'Idle', 'default'),
    },
  ],
  // A card is a surface, not a control: no hover, focus or pressed treatment
  // exists in the source to force.
  states: [],
}
