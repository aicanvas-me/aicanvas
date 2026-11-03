// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
// v2 component: imported through the build-time shim.
import { PricingCard } from '../../../lib/andromeda-pro.generated'
import { type MatrixSpec } from './types'

const PLAN = {
  name: 'Plus',
  description: 'For freelancers and households.',
  price: 29,
  period: 'per month',
  cta: 'Try Plus free for 30 days',
  features: ['Everything in Starter', 'Up to 10 virtual cards', 'Lower fees abroad', 'Chat support'],
}

// A card holds a plan's full price figure and its button at full width, so
// each case gets a column of a pricing grid's width.
export const pricingCard: MatrixSpec = {
  slug: 'pricing-card',
  sizes: null,
  render: (_size, props) => (
    <div style={{ width: 320, maxWidth: '100%' }}>
      <PricingCard {...PLAN} {...props} />
    </div>
  ),
  variants: [
    { label: 'Default', props: {} },
    { label: 'Featured', props: { featured: true, featuredLabel: 'Most picked' } },
    {
      label: 'Free plan',
      props: {
        name: 'Starter',
        description: 'For one person and one wallet.',
        price: 0,
        period: 'Free for good, no card asked',
        cta: 'Open free account',
        features: ['One multi-currency wallet', 'One virtual card', 'Help by email'],
      },
    },
  ],
  states: [],
}
