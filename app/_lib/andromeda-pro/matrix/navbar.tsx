// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
// v2 component: imported through the build-time shim.
import { Compass } from '@phosphor-icons/react'
import { Navbar, Button, tokens } from '../../../lib/andromeda-pro.generated'
import { type MatrixSpec } from './types'

const LINKS = [
  { label: 'Toolkit', href: '#features' },
  { label: 'Use cases', href: '#solutions' },
  { label: 'Plans', href: '#pricing' },
  { label: 'Journal', href: '#insights' },
]

const brand = (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: tokens.spacing[2],
      ...tokens.typography.role.label,
      fontWeight: tokens.typography.weight.semibold,
      color: `var(--at-text-primary, ${tokens.color.text.primary})`,
      whiteSpace: 'nowrap',
    }}
  >
    <Compass size={tokens.iconSize.xl} weight="regular" aria-hidden />
    Andromeda
  </span>
)

// Every case is static: a sticky bar would stick over the page that shows it.
// A bar needs the width of a page, so each case takes the full row.
export const navbar: MatrixSpec = {
  slug: 'navbar',
  sizes: null,
  wide: true,
  render: (_size, props) => (
    <div style={{ width: '100%' }}>
      <Navbar sticky={false} brand={brand} links={LINKS} actions={<Button>Open account</Button>} {...props} />
    </div>
  ),
  variants: [
    { label: 'Default', props: {} },
    { label: 'Without section tracking', props: { trackSections: false } },
    {
      label: 'With a quiet action',
      props: {
        secondaryActions: <Button variant="ghost">Sign in</Button>,
        menuActions: (
          <>
            <Button>Open account</Button>
            <Button variant="outline">Sign in</Button>
          </>
        ),
      },
    },
  ],
  states: [],
}
