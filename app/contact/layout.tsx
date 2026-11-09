import { pageMetadata } from '../lib/page-metadata'

export const metadata = pageMetadata({
  title: 'Contact',
  social: 'Contact AI Canvas',
  description:
    'Get in touch with AI Canvas. Questions, bug reports, or a component request: send a message and it lands straight in our inbox.',
  url: '/contact',
})

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
