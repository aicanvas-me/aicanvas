import type { ReactNode } from 'react'

// Server layout: carries metadata for the template route (the page itself is a
// client component and cannot export metadata). Transparent pass-through.
export const metadata = {
  title: 'AI Chat · Andromeda Template',
  description:
    'A revenue desk that works by conversation: an agent scores the Q3 pipeline, shows its steps, and hands back a live risk artifact.',
  alternates: { canonical: '/design-systems/andromeda-pro/templates/ai-chat' },
}

export default function AiChatTemplateLayout({ children }: { children: ReactNode }) {
  return children
}
