// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
// v2 component: imported through the build-time shim.
import { PaymentCard } from '../../../lib/andromeda-pro.generated'
import { type MatrixSpec } from './types'

const CARD = { brand: 'Andromeda', kind: 'Debit', label: 'Everyday', last4: '4821', expiry: '08/29' }

// A card is a fixed object, so every case is drawn at the width the fintech
// page gives it.
export const paymentCard: MatrixSpec = {
  slug: 'payment-card',
  sizes: null,
  render: (_size, props) => <PaymentCard {...CARD} width={288} {...props} />,
  variants: [
    { label: 'Graphite', props: { tone: 'graphite' } },
    { label: 'Steel', props: { tone: 'steel', kind: 'Virtual', label: 'Bills', last4: '1190', expiry: '11/27' } },
    { label: 'Ember', props: { tone: 'ember' } },
    { label: 'Brand', props: { tone: 'brand' } },
    { label: 'Raised', props: { raised: true } },
    { label: 'Dimmed', props: { dimmed: true }, note: 'a card that sits behind another' },
    { label: 'Static', props: { interactive: false }, note: 'no tilt, light or hover lift' },
  ],
  states: [],
}
