import { pageMetadata } from '../lib/page-metadata'

const description =
  'The AI Canvas site design tokens: color scales, typography, spacing, and semantic mappings, read live from the stylesheet so they always match the site.'

export const metadata = pageMetadata({
  title: 'Design System',
  social: 'AI Canvas Design System',
  description,
  url: '/designsystem',
})

export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return children
}
