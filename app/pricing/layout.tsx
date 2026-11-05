import { pageMetadata } from '../lib/page-metadata'

const description =
  'Free: every free component, one-command installs, AI remix prompts. Premium: proprietary components, blocks, design systems with AI Brain rules and templates.'

export const metadata = pageMetadata({
  title: 'Pricing',
  social: 'AI Canvas Pricing',
  description,
  url: '/pricing',
})

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
