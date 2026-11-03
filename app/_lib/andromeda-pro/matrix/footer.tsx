// @ts-nocheck — this spec AUTHORS JSX against untyped design-system
// components. Data-only specs in this directory need no such line.
// v2 component: imported through the build-time shim.
import { Footer, tokens } from '../../../lib/andromeda-pro.generated'
import { type MatrixSpec } from './types'

const MARK = [
  'M0 24L13.1483 0L14.9111 7.19476C14.4502 8.0149 14.0026 8.81944 13.5507 9.63168L9.86787 16.2221C10.7337 15.869 11.6049 15.5292 12.4707 15.1762L16.531 13.5278L0 24Z',
  'M14.7637 0L19.9727 20.3637L27.9998 24C26.8086 21.7712 25.5259 19.5191 24.3008 17.3031L17.7544 5.4295C17.5204 5.00473 14.8816 0.132369 14.7637 0Z',
].map((d) => <path key={d} d={d} />)

const COLUMNS = [
  { title: 'Accounts', links: ['Personal', 'Joint', 'Business', 'Savings pots'] },
  { title: 'Tools', links: ['Exchange', 'Virtual cards', 'Spending reports', 'Team approvals'] },
  { title: 'Company', links: ['About', 'Journal', 'Careers', 'Security'] },
  { title: 'Legal', links: ['Terms', 'Privacy', 'Legal', 'Imprint'] },
].map(({ title, links }) => ({ title, links: links.map((label) => ({ label })) }))

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
    <svg aria-hidden viewBox="0 0 28 24" width={tokens.iconSize.xl} height={(tokens.iconSize.xl * 24) / 28} fill="currentColor">
      {MARK}
    </svg>
    Andromeda
  </span>
)

// A footer needs the width of a page, so each case takes the full row.
export const footer: MatrixSpec = {
  slug: 'footer',
  sizes: null,
  wide: true,
  render: (_size, props) => (
    <div style={{ width: '100%' }}>
      <Footer
        brand={brand}
        description="Accounts, cards and transfers on one live screen."
        columns={COLUMNS}
        wordmark="Andromeda"
        wordmarkMark={MARK}
        wordmarkMarkViewBox="0 0 28 24"
        {...props}
      />
    </div>
  ),
  variants: [
    { label: 'Default', props: {} },
    { label: 'Without wordmark', props: { wordmark: false } },
    {
      label: 'With a legal line',
      props: {
        legal: (
          <>
            <span>© 2026 Andromeda Financial</span>
            <span>Amounts shown are examples.</span>
          </>
        ),
      },
    },
  ],
  states: [],
}
