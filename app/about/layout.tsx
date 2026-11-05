import { pageMetadata } from '../lib/page-metadata'

const description =
  'AI Canvas gives Claude Code, Cursor, and Codex reviewed components and coherent design systems, replacing AI slop and guesswork with editable React source.'

export const metadata = pageMetadata({
  title: 'About',
  social: 'About AI Canvas',
  description,
  url: '/about',
})

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children
}
