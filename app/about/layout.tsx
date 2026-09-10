import { pageMetadata } from '../lib/page-metadata'

const description =
  'Why AI Canvas exists: real, reviewed components with every state built, instead of an AI guessing an interface from nothing.'

export const metadata = pageMetadata({
  title: 'About',
  social: 'About AI Canvas',
  description,
  url: '/about',
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
