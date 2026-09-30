import { pageMetadata } from '../lib/page-metadata'

const description =
  'Free forever: every free component with one-command installs and AI remix prompts. Premium adds the closed-source components, blocks, design systems and templates.'

export const metadata = pageMetadata({
  title: 'Pricing',
  social: 'AI Canvas Pricing',
  description,
  url: '/pricing',
})

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
