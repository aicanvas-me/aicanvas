import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with AI Canvas. Questions, bug reports, or a component request: send a message and it lands straight in our inbox.',
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
