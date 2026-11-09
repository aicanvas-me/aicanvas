import { pageMetadata } from '../lib/page-metadata'

export const metadata = pageMetadata({
  title: 'Feedback',
  social: 'AI Canvas feedback',
  description:
    'Tell us what to fix or build next on AI Canvas. Pick a category, say one thing, and leave your email so we can reply.',
  url: '/feedback',
})

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return children
}
