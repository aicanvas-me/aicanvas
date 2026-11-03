// The docs table of contents, in reading order. The sidebar, the mobile menu,
// the previous / next links and the sitemap all read this one list, so a page
// added here shows up everywhere at once.

export type DocLink = { title: string; href: string; description: string }
export type DocSection = { title: string; pages: DocLink[] }

export const DOCS_NAV: DocSection[] = [
  {
    title: 'Get started',
    pages: [
      {
        title: 'Introduction',
        href: '/docs',
        description: 'What AI Canvas is, and how its parts fit together.',
      },
      {
        title: 'Installation',
        href: '/docs/installation',
        description: 'Set up a project and install your first component.',
      },
      {
        title: 'components.json',
        href: '/docs/components-json',
        description: 'Connect the @aicanvas registry with your account token.',
      },
    ],
  },
  {
    title: 'Build',
    pages: [
      {
        title: 'Design systems',
        href: '/docs/design-systems',
        description: 'Tokens, components and templates that share one look.',
      },
      {
        title: 'AI Brain',
        href: '/docs/ai-brain',
        description: 'The rule files your agent reads before it builds.',
      },
      {
        title: 'Standalone components',
        href: '/docs/components',
        description: 'Effects and widgets that fit any design system.',
      },
      {
        title: 'Remix prompts',
        href: '/docs/remix-prompts',
        description: 'Rebuild a variation of a component in any AI tool.',
      },
    ],
  },
  {
    title: 'AI agents',
    pages: [
      {
        title: 'MCP server',
        href: '/docs/mcp',
        description: 'Let your agent search, read and install from the chat.',
      },
      {
        title: 'Files for agents',
        href: '/docs/agent-files',
        description: 'llms.txt, the registry index and the props file.',
      },
    ],
  },
  {
    title: 'Reference',
    pages: [
      {
        title: 'Licences and plans',
        href: '/docs/licensing',
        description: 'What is MIT, what is Premium, and what each lets you do.',
      },
    ],
  },
]

export const DOC_PAGES: DocLink[] = DOCS_NAV.flatMap((s) => s.pages)

/** The section a page sits in, and its neighbours in reading order. */
export function docPosition(href: string) {
  const i = DOC_PAGES.findIndex((p) => p.href === href)
  const section = DOCS_NAV.find((s) => s.pages.some((p) => p.href === href))
  return {
    page: DOC_PAGES[i],
    section: section?.title,
    prev: i > 0 ? DOC_PAGES[i - 1] : undefined,
    next: i >= 0 && i < DOC_PAGES.length - 1 ? DOC_PAGES[i + 1] : undefined,
  }
}
